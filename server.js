const express = require('express');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 8080;
const DIST_DIR = path.join(__dirname, 'dist');

// Serve static files from the 'dist' directory
app.use(express.static(DIST_DIR));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// For any other request, serve the index.html (SPA support)
app.get('*', (req, res) => {
  res.sendFile(path.join(DIST_DIR, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Production server running at http://0.0.0.0:${PORT}`);
});
