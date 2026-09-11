import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Groq from 'groq-sdk';

// Initialize Supabase Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { token, display_image_base64, seal_image_base64 } = body;

    if (!token) {
      return NextResponse.json({ valid: false, message: 'No QR token provided' }, { status: 400 });
    }

    // 1. Fetch Instrument Details from Supabase using qr_token
    const { data: instrument, error } = await supabase
      .from('instruments')
      .select('*')
      .eq('qr_token', token)
      .single();
      
    if (error || !instrument) {
      return NextResponse.json({ valid: false, message: "Not a registered instrument" }, { status: 404 });
    }

    // Check expiration
    const today = new Date();
    const expiry = new Date(instrument.expiry_date);
    
    if (expiry < today || instrument.status === 'Expired') {
      return NextResponse.json({ 
        valid: false, 
        message: "Certification expired", 
        instrument: instrument 
      }, { status: 200 }); // Returning 200 so frontend can render the expired state gracefully
    }

    // Return valid result (Mocking the AI/CV parts for now as requested)
    return NextResponse.json({
      valid: true,
      message: "Valid",
      instrument: instrument,
      // Mocked AI output
      ai_verification: {
        seal_status: 'Intact',
        ocr_reading: '12450.00 kg',
        verification_passed: true
      }
    });

  } catch (error: any) {
    console.error('Verification Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
