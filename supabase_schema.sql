-- Supabase SQL Schema for Verification System

-- Instruments Table
CREATE TABLE instruments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    qr_code_id VARCHAR(255) UNIQUE NOT NULL,
    instrument_type VARCHAR(100) NOT NULL,
    location_name VARCHAR(255),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    calibration_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'Valid',
    owner_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Inspections Table
CREATE TABLE inspections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    instrument_id UUID REFERENCES instruments(id),
    inspector_id UUID,
    inspection_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    seal_status VARCHAR(50),
    display_reading DECIMAL(10, 2),
    notes TEXT,
    location_verified BOOLEAN,
    image_url TEXT
);

-- Discrepancy Reports Table (Public)
CREATE TABLE discrepancy_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    instrument_id UUID REFERENCES instruments(id),
    reporter_phone VARCHAR(20) NOT NULL,
    report_reason TEXT,
    reported_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'Pending'
);

-- Insert dummy data
INSERT INTO instruments (qr_code_id, instrument_type, location_name, calibration_date, expiry_date, status, owner_name)
VALUES 
('QR-WB-001', 'Weighbridge', 'Highway Checkpoint Alpha', '2025-01-15', '2026-01-15', 'Valid', 'Alpha Logistics'),
('QR-FD-002', 'Fuel Dispenser', 'City Station Beta', '2023-05-10', '2024-05-10', 'Expired', 'Beta Fuels');
