import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { instrument_id, reporter_phone = 'Anonymous', report_reason = 'User reported via OTP' } = body;

    if (!instrument_id) {
      return NextResponse.json({ error: 'No instrument ID provided' }, { status: 400 });
    }

    const { error: insertError } = await supabase
      .from('discrepancy_reports')
      .insert({
        instrument_id,
        reporter_phone,
        report_reason
      });

    if (insertError) throw insertError;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Report API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
