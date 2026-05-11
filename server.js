require('dotenv').config();

const express = require('express');
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');

const app = express();
app.use(express.json());

/**
 * ------------------------------------------------------------------
 * Rate limiting
 * ------------------------------------------------------------------
 */
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 120,            // 120 requests per minute per IP
  standardHeaders: true,
  legacyHeaders: false
});

app.use(limiter);

/**
 * ------------------------------------------------------------------
 * In-memory round storage
 * NOTE: This is suitable for development and small deployments.
 * For production scale, move this to Redis.
 * ------------------------------------------------------------------
 */
const rounds = {};

/**
 * ------------------------------------------------------------------
 * Helpers
 * ------------------------------------------------------------------
 */
function sha256(data) {
  return crypto
    .createHash('sha256')
    .update(data)
    .digest('hex');
}

function randomHex(bytes = 16) {
  return crypto.randomBytes(bytes).toString('hex');
}

/**
 * Generate a deterministic 5x5 board.
 * Each cell is one of:
 * - grass
 * - apple
 * - bad
 */
function generateGrid(rows = 5, cols = 5) {
  const grid = [];

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const rand = Math.random();

      let type = 'grass';

      // ~18% apple, ~10% bad, rest grass
      if (rand < 0.18) {
        type = 'apple';
      } else if (rand < 0.28) {
        type = 'bad';
      }

      grid.push({
        row,
        col,
        type,
        opened: false
      });
    }
  }

  return grid;
}

function findCell(grid, row, col) {
  return grid.find(
    (cell) => cell.row === row && cell.col === col
  );
}

/**
 * ------------------------------------------------------------------
 * Health endpoints
 * Render can use /healthy for deployment health checks.
 * ------------------------------------------------------------------
 */
app.get('/healthy', (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: Date.now()
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: Date.now()
  });
});

/**
 * Root endpoint
 */
app.get('/', (req, res) => {
  res.json({
    service: 'Apple Fortune Backend',
    status: 'running',
    endpoints: [
      'GET /healthy',
      'GET /health',
      'POST /createRound',
      'POST /clickCell',
      'GET /revealRound?roundId=<id>'
    ]
  });
});

/**
 * ------------------------------------------------------------------
 * Create Round
 * ------------------------------------------------------------------
 * POST /createRound
 */
app.post('/createRound', (req, res) => {
  try {
    const roundId = randomHex(6);
    const serverSeed = randomHex(16);
    const grid = generateGrid(5, 5);

    const commitPayload =
      JSON.stringify(grid) + serverSeed;

    const commitHash = sha256(commitPayload);

    rounds[roundId] = {
      roundId,
      grid,
      serverSeed,
      commitHash,
      status: 'active',
      createdAt: Date.now()
    };

    res.json({
      roundId,
      gridSize: 5,
      commitHash,
      createdAt: rounds[roundId].createdAt
    });
  } catch (error) {
    console.error('createRound error:', error);
    res.status(500).json({
      error: 'Failed to create round'
    });
  }
});

/**
 * ------------------------------------------------------------------
 * Click Cell
 * ------------------------------------------------------------------
 * POST /clickCell
 * Body:
 * {
 *   "roundId": "abc123",
 *   "row": 1,
 *   "col": 2
 * }
 */
app.post('/clickCell', (req, res) => {
  try {
    const { roundId, row, col } = req.body;

    if (
      typeof roundId !== 'string' ||
      typeof row !== 'number' ||
      typeof col !== 'number'
    ) {
      return res.status(400).json({
        error: 'roundId, row and col are required'
      });
    }

    const round = rounds[roundId];

    if (!round) {
      return res.status(404).json({
        error: 'Invalid round'
      });
    }

    if (round.status !== 'active') {
      return res.status(400).json({
        error: 'Round is no longer active'
      });
    }

    const cell = findCell(round.grid, row, col);

    if (!cell) {
      return res.status(400).json({
        error: 'Invalid cell'
      });
    }

    if (cell.opened) {
      return res.json({
        result: 'ALREADY_OPENED',
        type: cell.type,
        row,
        col
      });
    }

    // Mark as opened
    cell.opened = true;

    // Determine result
    let result = 'GRASS';

    if (cell.type === 'apple') {
      result = 'APPLE';
    } else if (cell.type === 'bad') {
      result = 'BAD_APPLE';
      round.status = 'finished';
      round.finishedAt = Date.now();
    }

    res.json({
      result,
      type: cell.type,
      row,
      col,
      roundStatus: round.status
    });
  } catch (error) {
    console.error('clickCell error:', error);
    res.status(500).json({
      error: 'Failed to process click'
    });
  }
});

/**
 * ------------------------------------------------------------------
 * Reveal Round
 * ------------------------------------------------------------------
 * GET /revealRound?roundId=<id>
 */
app.get('/revealRound', (req, res) => {
  try {
    const { roundId } = req.query;

    if (!roundId) {
      return res.status(400).json({
        error: 'roundId is required'
      });
    }

    const round = rounds[roundId];

    if (!round) {
      return res.status(404).json({
        error: 'Round not found'
      });
    }

    // Verify commit integrity
    const recalculatedHash = sha256(
      JSON.stringify(round.grid) + round.serverSeed
    );

    res.json({
      roundId,
      status: round.status,
      grid: round.grid,
      serverSeed: round.serverSeed,
      commitHash: round.commitHash,
      verified:
        recalculatedHash === round.commitHash,
      createdAt: round.createdAt,
      finishedAt: round.finishedAt || null
    });
  } catch (error) {
    console.error('revealRound error:', error);
    res.status(500).json({
      error: 'Failed to reveal round'
    });
  }
});

/**
 * ------------------------------------------------------------------
 * Cleanup old rounds
 * Remove rounds older than 30 minutes.
 * ------------------------------------------------------------------
 */
setInterval(() => {
  const now = Date.now();
  const THIRTY_MINUTES = 30 * 60 * 1000;

  for (const roundId of Object.keys(rounds)) {
    const round = rounds[roundId];

    if (now - round.createdAt > THIRTY_MINUTES) {
      delete rounds[roundId];
    }
  }
}, 60 * 1000);

/**
 * ------------------------------------------------------------------
 * Global error handler
 * ------------------------------------------------------------------
 */
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);

  res.status(500).json({
    error: 'Internal server error'
  });
});

/**
 * ------------------------------------------------------------------
 * Start server
 * ------------------------------------------------------------------
 */
const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(
    `Apple Fortune backend running on port ${PORT}`
  );
});
