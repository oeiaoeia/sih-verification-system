import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { instrument_id, seal_status, display_reading, is_passed } = body;

    // Clean display_reading to be strictly numeric for Supabase if the user set it as numeric
    let numericReading = null;
    if (display_reading && display_reading !== 'N/A') {
      const match = display_reading.match(/[0-9.]+/);
      if (match) {
        numericReading = parseFloat(match[0]);
      }
    }

    // 1. Insert into inspections table
    const { error: insError } = await supabase
      .from('inspections')
      .insert({
        instrument_id,
        inspector_id: '11111111-1111-1111-1111-111111111111', // Needs to be a UUID
        inspection_date: new Date().toISOString().split('T')[0],
        seal_status,
        display_reading: numericReading,
      });

    if (insError) throw insError;

    // 2. Update instrument status if it failed
    if (!is_passed) {
      const { error: updateError } = await supabase
        .from('instruments')
        .update({ status: 'Flagged' }) // or 'Expired' / 'Invalid'
        .eq('id', instrument_id);
        
      if (updateError) throw updateError;
    } else {
      // Recertify it: Reset to Valid and extend expiry by 1 year from today
      const today = new Date();
      const nextYear = new Date();
      nextYear.setFullYear(today.getFullYear() + 1);

      const { error: updateError } = await supabase
        .from('instruments')
        .update({ 
          status: 'Valid',
          calibration_date: today.toISOString().split('T')[0],
          expiry_date: nextYear.toISOString().split('T')[0]
        })
        .eq('id', instrument_id);
        
      if (updateError) throw updateError;
      
      // Also reset any pending public flags to Resolved since the inspector verified it's good
      const { error: flagError } = await supabase
        .from('discrepancy_reports')
        .update({ status: 'Resolved' })
        .eq('instrument_id', instrument_id)
        .eq('status', 'Pending');
        
      if (flagError) throw flagError;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
