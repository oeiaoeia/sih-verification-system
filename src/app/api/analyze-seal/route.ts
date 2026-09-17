import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { image } = body;

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY.includes('your-groq')) {
      return NextResponse.json({ seal_status: 'Intact' });
    }

    const base64Url = image.startsWith('data:image') ? image : `data:image/jpeg;base64,${image}`;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Analyze this physical lead seal and wire. Is it "Intact" or "Tampered"? Reply with ONLY ONE WORD: either "Intact" or "Tampered". Do not include any other text.' },
            { type: 'image_url', image_url: { url: base64Url } }
          ] as any
        }
      ],
      model: 'qwen/qwen3.8-27b',
      temperature: 0.1,
      max_tokens: 10,
    });

    let status = completion.choices[0]?.message?.content?.trim() || 'Intact';
    
    // Clean up output just in case the model is chatty
    if (status.toLowerCase().includes('tampered') || status.toLowerCase().includes('broken') || status.toLowerCase().includes('cut')) {
      status = 'Tampered';
    } else {
      status = 'Intact';
    }
    
    return NextResponse.json({ seal_status: status });
    
  } catch (error: any) {
    console.error('Groq Vision Seal Error:', error);
    return NextResponse.json({ error: error.message, seal_status: 'Error' }, { status: 500 });
  }
}
