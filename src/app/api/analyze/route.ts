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
      // Mock fallback if they didn't put a real key in
      return NextResponse.json({ ocr_reading: '12450.00 kg (Mock: No API Key)' });
    }

    // Prepare image for Groq (needs base64 data url format)
    const base64Url = image.startsWith('data:image') ? image : `data:image/jpeg;base64,${image}`;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Extract just the numeric weight reading from this digital display image. Return only the number and the unit (like "12450.00 kg"). Do not include any other conversational text.' },
            { type: 'image_url', image_url: { url: base64Url } }
          ] as any
        }
      ],
      model: 'qwen/qwen3.8-27b',
      temperature: 0.1,
      max_tokens: 100,
    });

    const reading = completion.choices[0]?.message?.content?.trim() || 'Unreadable';
    
    return NextResponse.json({ ocr_reading: reading });
    
  } catch (error: any) {
    console.error('Groq Vision Error:', error);
    return NextResponse.json({ error: error.message, ocr_reading: 'Error during AI processing' }, { status: 500 });
  }
}
