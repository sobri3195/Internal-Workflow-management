const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const documentRoutes = require('./routes/documents');
const reviewRoutes = require('./routes/review');
const approveRoutes = require('./routes/approve');
const signRoutes = require('./routes/sign');
const archiveRoutes = require('./routes/archive');
const attachmentRoutes = require('./routes/attachments');

const app = express();

app.use(helmet());
app.use(cors());
app.use(compression());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/review', reviewRoutes);
app.use('/api/approve', approveRoutes);
app.use('/api/sign', signRoutes);
app.use('/api/archive', archiveRoutes);
app.use('/api/attachments', attachmentRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Workflow Management API is running' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
