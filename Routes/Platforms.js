const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/platforms
router.get('/', async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT id, name, slug, website_url, logo_url
       FROM platforms
       WHERE enabled = TRUE
       ORDER BY name ASC`
    );

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
