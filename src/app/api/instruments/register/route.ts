import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import QRCode from 'qrcode';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'; // Need to match whatever port user is on, typically frontend can just use relative URLs but QR needs absolute

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { qr_code_id, instrument_type, location_name, owner_name, calibration_date } = body;

    if (!qr_code_id || !instrument_type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Generate unique token
    const token = crypto.randomBytes(16).toString('hex');

    // 2. Compute dates
    const calDate = calibration_date ? new Date(calibration_date) : new Date();
    const expDate = new Date(calDate);
    expDate.setFullYear(calDate.getFullYear() + 1);

    const record = {
      qr_code_id,
      qr_token: token,
      instrument_type,
      location_name: location_name || 'Unknown Location',
      owner_name: owner_name || 'Unknown Owner',
      calibration_date: calDate.toISOString().split('T')[0],
      expiry_date: expDate.toISOString().split('T')[0],
      status: 'Valid' // Defaults to Valid until an inspection fails it
    };

    // 3. Insert into Supabase
    const { data: instrument, error } = await supabase
      .from('instruments')
      .insert(record)
      .select()
      .single();

    if (error) {
      // Check for unique constraint violation
      if (error.code === '23505') {
         return NextResponse.json({ error: `Instrument name '${qr_code_id}' already exists.` }, { status: 400 });
      }
      throw error;
    }

    // 4. Generate QR Code Data URL
    // Get the base url from the request to handle localhost:3000 vs 3001 gracefully
    const host = req.headers.get('host') || 'localhost:3000';
    const protocol = req.headers.get('x-forwarded-proto') || 'http';
    const dynamicBaseUrl = `${protocol}://${host}`;
    
    const verificationUrl = `${dynamicBaseUrl}/public/scan?token=${token}`;
    const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
      color: { dark: '#000000', light: '#ffffff' },
      width: 400
    });

    return NextResponse.json({ success: true, instrument, qrCodeDataUrl, verificationUrl });
  } catch (error: any) {
    console.error('Registration API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
