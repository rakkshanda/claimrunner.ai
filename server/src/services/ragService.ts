// server/src/services/ragService.ts
import { ChatGroq } from '@langchain/groq';
import { PromptTemplate } from '@langchain/core/prompts';
import { DemandLetterData } from './caseToFormData.js';

export async function generateDemandNarrative(data: DemandLetterData): Promise<string> {
  if (!data.explanation.trim()) {
    throw new Error('Case lacks an explanation in pdf_extra_fields to generate demand narrative.');
  }

  const model = new ChatGroq({
    model: 'llama-3.3-70b-versatile',
    temperature: 0.2,
    apiKey: process.env.GROQ_API_KEY,
  });

  const prompt = PromptTemplate.fromTemplate(`
You are an expert legal assistant drafting the narrative body paragraph of a formal Demand Letter [cite: 36, 147-150].

CASE DETAILS:
- Plaintiff: {plaintiffName} ({plaintiffCityStateZip})
- Defendant: {defendantName} ({defendantCityStateZip})
- Date of Incident: {incidentDate}
- Primary Reason: {claimReason}
- Amount Owed: \${claimAmount}

USER EXPLANATION OF WHAT HAPPENED:
"{explanation}"

INSTRUCTIONS:
1. Write a calm, neutral, clear, and factual summary of the incident based strictly on the user's explanation [cite: 35-37, 69].
2. State clearly why the defendant is legally and financially responsible for the damage or breach[cite: 83, 88].
3. State the exact amount owed (\${claimAmount})[cite: 85].
4. Conclude by demanding payment or resolution within 14 days before legal action (small claims court) is initiated[cite: 93, 104, 173].
5. Do NOT include greetings, header information, or signature lines — return ONLY the narrative paragraphs.
  `);

  const chain = prompt.pipe(model);

  const response = await chain.invoke({
    plaintiffName: data.plaintiffName,
    plaintiffCityStateZip: data.plaintiffCityStateZip,
    defendantName: data.defendantName,
    defendantCityStateZip: data.defendantCityStateZip,
    claimAmount: data.claimAmount,
    incidentDate: data.incidentDate,
    claimReason: data.claimReason,
    explanation: data.explanation,
  });

  return response.content.toString();
}