// server/src/routes/demandLetter.ts
import { Router } from 'express';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { PDFDocument } from 'pdf-lib';
import { getCaseWithParties } from '../db/queries.js';
import { buildDemandLetterData } from '../services/caseToFormData.js';
import { generateDemandNarrative } from '../services/ragService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

router.post('/generate-demand-letter', async (req, res) => {
  try {
    const { case_id } = req.body;
    if (!case_id) {
      return res.status(400).json({ error: 'case_id is required' });
    }

    // 1. Fetch case and party details from Supabase using existing query helper
    const caseData = await getCaseWithParties(case_id);

    // 2. Format case data into structured demand letter input
    const demandData = buildDemandLetterData(caseData);

    // 3. Generate formal narrative using LangChain
    const narrativeText = await generateDemandNarrative(demandData);

    // 4. Resolve path to your PDF template in server/templates/
    const templatePath = path.resolve(__dirname, '../../templates/demand-letter.pdf');

    // 5. Read PDF template and fill fields directly with pdf-lib
    const templateBytes = await fs.readFile(templatePath);
    const pdfDoc = await PDFDocument.load(templateBytes);
    const form = pdfDoc.getForm();

    const pdfFillPayload: Record<string, string> = {
      ...demandData,
      demandNarrative: narrativeText,
      plaintiffSignature: demandData.plaintiffName, // Automatically uses plaintiff's name
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

    // 6. Return PDF stream in HTTP response
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=Demand_Letter_${case_id}.pdf`);
    return res.send(Buffer.from(pdfBytes));

  } catch (err: any) {
    console.error('[demandLetter route] Error generating demand letter:', err);
    return res.status(500).json({ error: err.message || 'Failed to generate demand letter' });
  }
});

export default router;