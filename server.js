require('dotenv').config();

const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

/*
===================================
HOME
===================================
*/

app.get('/', (req, res) => {

  res.json({
    success: true,
    message: 'Apple Fortune Backend Running'
  });

});

/*
===================================
PLATFORMS
===================================
*/

app.get('/api/platforms', (req, res) => {

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

  res.json({
    success: true,
    count: platforms.length,
    data: platforms
  });

});

/*
===================================
CONNECT ID
===================================
*/

app.post('/api/connect-id', (req, res) => {

  const {
    user_id,
    platform_id,
    bet_id
  } = req.body;

  if (!user_id || !platform_id || !bet_id) {

    return res.status(400).json({
      success: false,
      error: 'Missing required fields'
    });

  }

  res.json({
    success: true,
    message: 'Bet ID connected successfully',
    data: {
      user_id,
      platform_id,
      bet_id,
      connected_at: new Date().toISOString()
    }
  });

});

/*
===================================
START SERVER
===================================
*/

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

  console.log(`Apple Fortune Backend running on port ${PORT}`);

});
