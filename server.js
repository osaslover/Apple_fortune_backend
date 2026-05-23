require('dotenv').config();

const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

/*
========================================
HOME
========================================
*/

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Apple Fortune Backend Running'
  });
});

/*
========================================
HEALTH CHECK
========================================
*/

app.get('/healthy', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'healthy'
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'healthy'
  });
});

/*
========================================
BETTING PLATFORMS
========================================
*/

const platforms = [
  {
    id: 1,
    name: '1xBet',
    url: 'https://1xbet.com'
  },

  {
    id: 2,
    name: 'MelBet',
    url: 'https://melbet.com'
  },

  {
    id: 3,
    name: '22Bet',
    url: 'https://22bet.com'
  },

  {
    id: 4,
    name: 'BetWinner',
    url: 'https://betwinner.com'
  },

  {
    id: 5,
    name: 'Linebet',
    url: 'https://linebet.com'
  },

  {
    id: 6,
    name: 'Mostbet',
    url: 'https://mostbet.com'
  },

  {
    id: 7,
    name: 'Betway',
    url: 'https://betway.com'
  },

  {
    id: 8,
    name: '1win',
    url: 'https://1win.com'
  },

  {
    id: 9,
    name: 'Parimatch',
    url: 'https://parimatch.com'
  },

  {
    id: 10,
    name: 'Megapari',
    url: 'https://megapari.com'
  }
];

/*
========================================
GET ALL PLATFORMS
========================================
*/

app.get('/api/platforms', (req, res) => {
  res.json({
    success: true,
    count: platforms.length,
    data: platforms
  });
});

/*
========================================
OPEN PLATFORM
========================================
*/

app.get('/open/:id', (req, res) => {

  const id = parseInt(req.params.id);

  const platform = platforms.find(
    p => p.id === id
  );

  if (!platform) {
    return res.status(404).json({
      success: false,
      error: 'Platform not found'
    });
  }

  return res.redirect(platform.url);
});

/*
========================================
START SERVER
========================================
*/

const PORT = process.env.PORT || 10000;

app.listen(PORT, '0.0.0.0', () => {

  console.log(
    `Apple Fortune Backend running on port ${PORT}`
  );

});
