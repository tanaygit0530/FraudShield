require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 5000;

// Supabase Setup
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'FraudShield API Operational', status: 'healthy' });
});

// Case Management
app.post('/api/cases', async (req, res) => {
  try {
    const { victim_id, incident_type, rail_type, amount, payload } = req.body;
    // Logic for creating cases, triggering OCR, and routing
    const { data, error } = await supabase
      .from('cases')
      .insert([{ 
        victim_id, 
        incident_type, 
        rail_type, 
        amount, 
        payload,
        status: 'CREATED' 
      }])
      .select();

    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mock OCR Endpoint
app.post('/api/ingest/ocr', (req, res) => {
  // Simulate AI processing
  setTimeout(() => {
    res.json({
      extracted_data: {
        txn_id: "TXN12984712",
        amount: 25000,
        utr: "123456789012",
        beneficiary_ups: "scammer@okaxis"
      },
      confidence: 0.98,
      status: "VERIFIED"
    });
  }, 1500);
});

app.listen(PORT, () => {
  console.log(`FraudShield backend running on port ${PORT}`);
});
