// server/src/routes/demandLetter.ts
import { Router } from 'express';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { PDFDocument } from 'pdf-lib';
import { getCaseWithParties } from '../db/queries.js';
import { buildDemandLetterData } from '../services/caseToFormData.js';
import { generateDemandNarrative } from '../services/ragService.js';
import { authenticate } from '../middleware/authenticate.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

// ---------------------------------------------------------------------------
// POST /api/generate-demand-letter/narrative
// Returns ONLY the Groq-authored narrative body, as JSON, for the review/edit
// screen. This is the single source of truth the frontend should render into
// its editable textarea — no more guessing at response shape.
// ---------------------------------------------------------------------------
router.post('/generate-demand-letter/narrative', authenticate, async (req, res) => {
  try {
    const { case_id } = req.body;
    if (!case_id) {
      return res.status(400).json({ error: 'case_id is required' });
    }

    const caseData = await getCaseWithParties(case_id);
    const demandData = buildDemandLetterData(caseData);
    const narrative = await generateDemandNarrative(demandData);

    return res.status(200).json({ narrative });
  } catch (err: any) {
    console.error('[demandLetter route] Error generating narrative:', err);
    return res.status(500).json({ error: err.message || 'Failed to generate demand narrative' });
  }
});

// ---------------------------------------------------------------------------
// POST /api/generate-demand-letter/pdf
// Fills and returns the demand letter PDF.
//
// If `narrative` is present in the body (the user's edited text from the
// review screen), it is used VERBATIM as the demandNarrative field — Groq is
// NOT called again. This is what makes edits actually show up in the PDF.
// If `narrative` is omitted, it falls back to generating fresh via Groq
// (e.g. for a "download without reviewing" shortcut).
// ---------------------------------------------------------------------------
router.post('/generate-demand-letter/pdf', authenticate, async (req, res) => {
  try {
    const { case_id, narrative: editedNarrative } = req.body;
    if (!case_id) {
      return res.status(400).json({ error: 'case_id is required' });
    }

    const caseData = await getCaseWithParties(case_id);
    const demandData = buildDemandLetterData(caseData);

    const narrativeText =
      typeof editedNarrative === 'string' && editedNarrative.trim().length > 0
        ? editedNarrative
        : await generateDemandNarrative(demandData);

    const templatePath = path.resolve(__dirname, '../../templates/demand-letter.pdf');
    const templateBytes = await fs.readFile(templatePath);
    const pdfDoc = await PDFDocument.load(templateBytes);
    const form = pdfDoc.getForm();

    const pdfFillPayload: Record<string, string> = {
      ...demandData,
      demandNarrative: narrativeText,
      plaintiffSignature: demandData.plaintiffName,
    };

    for (const [fieldName, value] of Object.entries(pdfFillPayload)) {
      try {
        const field = form.getTextField(fieldName);
        if (field && value !== undefined && value !== null) {
          field.setText(String(value));
        }
      } catch {
        // Ignore non-matching fields
      }
    }

    form.updateFieldAppearances();
    const pdfBytes = await pdfDoc.save();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Demand_Letter_${case_id}.pdf`);
    return res.send(Buffer.from(pdfBytes));
  } catch (err: any) {
    console.error('[demandLetter route] Error generating demand letter PDF:', err);
    return res.status(500).json({ error: err.message || 'Failed to generate demand letter' });
  }
});

export default router;