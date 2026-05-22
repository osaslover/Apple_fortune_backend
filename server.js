require('dotenv').config();

const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {

  res.json({
    success: true,
    message: 'Backend running successfully'
  });

});

app.get('/api/platforms', (req, res) => {

  res.json({
    success: true,
    data: [
      { id: 1, name: '1xBet' },
      { id: 2, name: 'MelBet' },
      { id: 3, name: '22Bet' },
      { id: 4, name: 'BetWinner' },
      { id: 5, name: 'Linebet' }
    ]
  });

});

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

  return res.json({
    success: true,
    message: 'Connected successfully',
    data: {
      user_id,
      platform_id,
      bet_id,
      connected_at: new Date().toISOString()
    }
  });

});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

  console.log(`Server running on port ${PORT}`);

});
