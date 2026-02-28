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

const fs = require('fs');
const path = require('path');

// Request Logging Middleware
app.use((req, res, next) => {
  const log = `[${new Date().toISOString()}] ${req.method} ${req.url} - Body: ${JSON.stringify(req.body)}\n`;
  console.log(log.trim());
  fs.appendFileSync(path.join(__dirname, 'server.log'), log);
  next();
});

// Routes
app.use('/api/cases', caseRoutes);
app.use('/api', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', legalRoutes);

app.listen(PORT, () => console.log(`FraudShield backend running on port ${PORT}`));
