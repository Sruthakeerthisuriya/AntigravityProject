require('dotenv').config();
const fetch = require('node-fetch');
if (!global.fetch) {
  global.fetch = fetch;
  global.Headers = fetch.Headers;
  global.Request = fetch.Request;
  global.Response = fetch.Response;
}
const express = require('express');
const bodyParser = require('body-parser');
const dependencyService = require('./services/dependencyService');

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure dependencies are ready on startup
dependencyService.ensureDependencies().catch(err => {
  console.error('Critical Error: Failed to setup dependencies:', err.message);
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send('AI Unit Test Generator Platform is Running');
});

const webhookRoutes = require('./routes/webhookRoutes');
app.use('/api/webhook', webhookRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
