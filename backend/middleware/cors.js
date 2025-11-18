const cors = require('cors');

const corsOptions = {
  origin: ['http://localhost:5173', 'http://localhost:5175', 'https://syavuzselim72-gif.github.io'],
  credentials: true,
  optionsSuccessStatus: 200
};

module.exports = cors(corsOptions);