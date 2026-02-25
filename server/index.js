const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// Serve static files from the 'dist' directory (exported web build)
app.use(express.static(path.join(__dirname, 'dist')));

app.get('/api/status', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Glymo AI Backend is running on Google Cloud!',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// For any other request, serve the index.html for the SAP app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
