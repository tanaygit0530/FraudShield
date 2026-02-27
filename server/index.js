require('dotenv').config();
const express = require('express');
const cors = require('cors');

const caseRoutes = require('./routes/caseRoutes');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const legalRoutes = require('./routes/legalRoutes');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/cases', caseRoutes);
app.use('/api', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', legalRoutes);

app.listen(PORT, () => console.log(`FraudShield backend running on port ${PORT}`));
