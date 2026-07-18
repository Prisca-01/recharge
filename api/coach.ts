import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const google = createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY ?? '',
  });

  const { sessionDuration, sessionCount, todayMinutes, mood } = req.body;

  const prompt = `You are a calm, supportive productivity coach inside an app called Recharge.
A user just completed a focus session. Here is their data:
- Session duration: ${sessionDuration} minutes
- Sessions completed today: ${sessionCount}
- Total focus time today: ${todayMinutes} minutes
- Mood after session: ${mood ?? 'not specified'}

Write a short, warm, personalised message (2–3 sentences max) that:
1. Acknowledges what they just did
2. Gives one practical suggestion based on their data
3. Sounds human, not robotic

Do not use bullet points. Do not use phrases like "As your AI coach". Just speak directly.`;

  try {
    const { text } = await generateText({
      model: google('gemini-1.5-flash'),
      prompt,
    maxOutputTokens: 120,
    });

    return res.status(200).json({ message: text });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('COACH ERROR:', message);
    return res.status(500).json({ message: null, error: message });
  }
}