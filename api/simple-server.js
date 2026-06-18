const express = require('express');
const app = express();

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running!' });
});

app.listen(3000, '0.0.0.0', () => {
  console.log('Backend running on http://0.0.0.0:3000');
});
