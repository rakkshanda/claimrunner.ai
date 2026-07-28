// server/src/createTemplate.ts
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fs from 'fs/promises';
import path from 'path';

async function generateTemplate() {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([612, 792]); // Letter size (8.5 x 11 inches)
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const form = pdfDoc.getForm();

  const margin = 50;
  let y = 740;

  // Title
  page.drawText('FORMAL DEMAND LETTER', {
    x: margin,
    y,
    size: 18,
    font: boldFont,
    color: rgb(0, 0, 0),
  });

  y -= 35;

  // --- PLAINTIFF BLOCK (Left) ---
  page.drawText('FROM (Plaintiff):', { x: margin, y, size: 10, font: boldFont });
  
  let plaintiffY = y - 20;
  const plaintiffNameField = form.createTextField('plaintiffName');
  plaintiffNameField.addToPage(page, { x: margin, y: plaintiffY, width: 220, height: 18 });
  plaintiffNameField.setFontSize(10);

  plaintiffY -= 24;
  const plaintiffAddrField = form.createTextField('plaintiffAddress');
  plaintiffAddrField.addToPage(page, { x: margin, y: plaintiffY, width: 220, height: 18 });
  plaintiffAddrField.setFontSize(10);

  plaintiffY -= 24;
  const plaintiffCSZField = form.createTextField('plaintiffCityStateZip');
  plaintiffCSZField.addToPage(page, { x: margin, y: plaintiffY, width: 220, height: 18 });
  plaintiffCSZField.setFontSize(10);

  // --- DEFENDANT BLOCK (Right) ---
  const rightX = 320;
  page.drawText('TO (Defendant):', { x: rightX, y, size: 10, font: boldFont });

  let defY = y - 20;
  const defNameField = form.createTextField('defendantName');
  defNameField.addToPage(page, { x: rightX, y: defY, width: 220, height: 18 });
  defNameField.setFontSize(10);

  defY -= 24;
  const defAddrField = form.createTextField('defendantAddress');
  defAddrField.addToPage(page, { x: rightX, y: defY, width: 220, height: 18 });
  defAddrField.setFontSize(10);

  defY -= 24;
  const defCSZField = form.createTextField('defendantCityStateZip');
  defCSZField.addToPage(page, { x: rightX, y: defY, width: 220, height: 18 });
  defCSZField.setFontSize(10);

  // Move y below header blocks
  y = plaintiffY - 35;

  // --- CASE SUMMARY LINE ---
  page.drawText('Incident Date:', { x: margin, y, size: 10, font: boldFont });
  const dateField = form.createTextField('incidentDate');
  dateField.addToPage(page, { x: margin + 85, y: y - 3, width: 120, height: 18 });
  dateField.setFontSize(10);

  page.drawText('Amount Claimed ($):', { x: 320, y, size: 10, font: boldFont });
  const amountField = form.createTextField('claimAmount');
  amountField.addToPage(page, { x: 320 + 115, y: y - 3, width: 85, height: 18 });
  amountField.setFontSize(10);

  y -= 45;

  // --- DEMAND NARRATIVE BODY ---
  page.drawText('STATEMENT OF CLAIM & DEMAND:', { x: margin, y, size: 10, font: boldFont });
  y -= 15;

  const narrativeField = form.createTextField('demandNarrative');
  narrativeField.enableMultiline();
  narrativeField.addToPage(page, { x: margin, y: y - 400, width: 512, height: 400 });
  
  // FIX: Explicitly set readable font size for multiline block
  narrativeField.setFontSize(10);

  y -= 430;

  // --- SIGNATURE BLOCK ---
  page.drawText('Sincerely,', { x: margin, y, size: 11, font });

  y -= 25;

  const signatureField = form.createTextField('plaintiffSignature');
  signatureField.addToPage(page, { x: margin, y, width: 220, height: 18 });
  signatureField.setFontSize(10);

  // Update field appearances
  form.updateFieldAppearances(font);

  const outDir = path.resolve(process.cwd(), 'templates');
  await fs.mkdir(outDir, { recursive: true });

  const pdfBytes = await pdfDoc.save();
  await fs.writeFile(path.join(outDir, 'demand-letter.pdf'), pdfBytes);

  console.log('Updated demand-letter.pdf template created!');
}

generateTemplate().catch(console.error);