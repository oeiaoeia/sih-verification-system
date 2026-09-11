const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'; // Default to localhost

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("❌ Missing Supabase credentials in .env.local!");
  console.log("Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const instrumentsData = [
  { qr_code_id: 'WB-DEL-01', instrument_type: 'Weighbridge', location_name: 'Delhi-Gurgaon Highway Checkpoint 1', status: 'Valid', owner_name: 'NHAI Logistics' },
  { qr_code_id: 'FD-NH48-02', instrument_type: 'Fuel Dispenser', location_name: 'NH48 Fuel Station (IndianOil)', status: 'Valid', owner_name: 'IndianOil Corp' },
  { qr_code_id: 'WB-MUM-03', instrument_type: 'Weighbridge', location_name: 'Mumbai Port Trust Entry', status: 'Valid', owner_name: 'JNPT Freight' },
  { qr_code_id: 'FD-BLR-04', instrument_type: 'Fuel Dispenser', location_name: 'Bangalore City Center HP', status: 'Expired', owner_name: 'HPCL' },
  { qr_code_id: 'WB-CHN-05', instrument_type: 'Weighbridge', location_name: 'Chennai Logistics Park', status: 'Valid', owner_name: 'South Freight Movers' },
  { qr_code_id: 'FD-HYD-06', instrument_type: 'Fuel Dispenser', location_name: 'Hyderabad Outer Ring Road BPCL', status: 'Valid', owner_name: 'BPCL' },
  { qr_code_id: 'WB-KOL-07', instrument_type: 'Weighbridge', location_name: 'Kolkata Dock System', status: 'Valid', owner_name: 'Kolkata Port Trust' },
  { qr_code_id: 'FD-PUN-08', instrument_type: 'Fuel Dispenser', location_name: 'Pune-Mumbai Expressway Reliance', status: 'Valid', owner_name: 'Reliance Petroleum' },
];

async function seed() {
  console.log('🌱 Seeding Instruments...\n');
  const outDir = path.resolve(__dirname, '../qrcodes');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir);
  }

  for (const item of instrumentsData) {
    // 1. Generate a random unguessable token
    const token = crypto.randomBytes(16).toString('hex');
    
    // Dates
    const today = new Date();
    const isExpired = item.status === 'Expired';
    const calibrationDate = new Date(today);
    calibrationDate.setFullYear(today.getFullYear() - (isExpired ? 2 : 0));
    calibrationDate.setMonth(today.getMonth() - (isExpired ? 0 : 2));
    
    const expiryDate = new Date(calibrationDate);
    expiryDate.setFullYear(calibrationDate.getFullYear() + 1);

    const record = {
      qr_code_id: item.qr_code_id,
      qr_token: token,
      instrument_type: item.instrument_type,
      location_name: item.location_name,
      calibration_date: calibrationDate.toISOString().split('T')[0],
      expiry_date: expiryDate.toISOString().split('T')[0],
      status: item.status,
      owner_name: item.owner_name,
    };

    // 2. Insert into Supabase
    const { data, error } = await supabase
      .from('instruments')
      .upsert(record, { onConflict: 'qr_code_id' }) // Prevent duplicates if run multiple times
      .select();

    if (error) {
      console.error(`❌ Error inserting ${item.qr_code_id}:`, error.message);
      continue;
    }

    // 3. Generate QR Code
    const verificationUrl = `${BASE_URL}/public/scan?token=${token}`;
    const qrFilePath = path.join(outDir, `${item.qr_code_id}.png`);
    
    await QRCode.toFile(qrFilePath, verificationUrl, {
      color: { dark: '#000000', light: '#ffffff' },
      width: 400
    });

    console.log(`✅ Seeded: ${item.qr_code_id}`);
    console.log(`   Token: ${token}`);
    console.log(`   QR: saved to ${qrFilePath}`);
    console.log(`   URL: ${verificationUrl}\n`);
  }
  console.log('🎉 Seeding Complete!');
}

seed();
