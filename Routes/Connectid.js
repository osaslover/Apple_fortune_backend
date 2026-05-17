const express = require('express');
const router = express.Router();
const db = require('../db');

// POST /api/connect-id
router.post('/', async (req, res, next) => {
  try {
    const { user_id, platform_id, game_id = null, bet_id } = req.body;

    if (!user_id || !platform_id || !bet_id) {
      return res.status(400).json({
        success: false,
        error: 'user_id, platform_id, and bet_id are required'
      });
    }

    // Verify platform exists
    const platformCheck = await db.query(
      'SELECT id, name FROM platforms WHERE id = $1 AND enabled = TRUE',
      [platform_id]
    );

    if (platformCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Platform not found or disabled'
      });
    }

    // Insert pending connection
    const insertResult = await db.query(
      `INSERT INTO bet_connections
        (user_id, platform_id, game_id, bet_id, status, request_payload)
       VALUES
        ($1, $2, $3, $4, 'pending', $5)
       RETURNING *`,
      [
        user_id,
        platform_id,
        game_id,
        bet_id,
        JSON.stringify(req.body)
      ]
    );

    const connection = insertResult.rows[0];

    // Placeholder processing logic.
    // Replace with your approved platform integration.
    const finalStatus = 'connected';

    const updateResult = await db.query(
      `UPDATE bet_connections
       SET status = $1,
           connected_at = NOW(),
           response_payload = $2,
           updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [
        finalStatus,
        JSON.stringify({ message: 'Bet connected successfully' }),
        connection.id
      ]
    );

    res.json({
      success: true,
      message: 'Bet connection created',
      data: updateResult.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
