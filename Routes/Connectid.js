const express = require('express');

const router = express.Router();

// POST /api/connect-id
router.post('/', async (req, res) => {
  try {
    const {
      user_id,
      platform_id,
      game_id = null,
      bet_id
    } = req.body;

    if (!user_id || !platform_id || !bet_id) {
      return res.status(400).json({
        success: false,
        error:
          'user_id, platform_id and bet_id are required'
      });
    }

    // Fake successful response for now
    return res.json({
      success: true,
      message: 'Bet ID connected successfully',
      data: {
        user_id,
        platform_id,
        game_id,
        bet_id,
        status: 'connected',
        connected_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

module.exports = router;
