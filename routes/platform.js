const express = require('express');

const router = express.Router();

// GET /api/platforms
router.get('/', async (req, res) => {
  res.json({
    success: true,
    count: 5,
    data: [
      {
        id: 1,
        name: '1xBet',
        slug: '1xbet',
        website_url: 'https://1xbet.com',
        logo_url: ''
      },
      {
        id: 2,
        name: '22Bet',
        slug: '22bet',
        website_url: 'https://22bet.com',
        logo_url: ''
      },
      {
        id: 3,
        name: 'BetWinner',
        slug: 'betwinner',
        website_url: 'https://betwinner.com',
        logo_url: ''
      },
      {
        id: 4,
        name: 'LineBet',
        slug: 'linebet',
        website_url: 'https://linebet.com',
        logo_url: ''
      },
      {
        id: 5,
        name: 'Bet365',
        slug: 'bet365',
        website_url: 'https://bet365.com',
        logo_url: ''
      }
    ]
  });
});

module.exports = router;
