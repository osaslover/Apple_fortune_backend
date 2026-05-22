require('dotenv').config();

const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');
const platformsRouter = require('./Routes/platforms');
const connectIdRouter = require('./Routes/connectId');

const app = express();

app.set('trust proxy', 1);

// ========================
// SECURITY MIDDLEWARE
// ========================

app.use(cors({
  origin: process.env.CORS_ORIGIN || '*'
}));

app.use(express.json({ limit: '100kb' }));

app.use(rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false
}));

// ========================
// MEMORY STORAGE
// ========================

const rounds = Object.create(null);

// ========================
// HELPERS
// ========================

function sha256(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

function randomHex(bytes = 16) {
  return crypto.randomBytes(bytes).toString('hex');
}

function generateGrid(rows = 5, cols = 5) {
  const grid = [];

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {

      const rand = Math.random();

      let type = 'grass';

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
    c => c.row === row && c.col === col
  );
}

// ========================
// ROUTES
// ========================

app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Apple Fortune Backend is running',
    env: process.env.NODE_ENV || 'development'
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: Date.now()
  });
});

app.get('/healthy', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: Date.now()
  });
});

// API routes
app.use('/api/platforms', platformsRouter);
app.use('/api/connect-id', connectIdRouter);

// ========================
// CREATE ROUND
// ========================

app.post('/createRound', (req, res) => {

  try {

    const roundId = randomHex(6);

    const serverSeed = randomHex(16);

    const grid = generateGrid(5, 5);

    const commitHash = sha256(
      JSON.stringify(grid) + serverSeed
    );

    rounds[roundId] = {
      roundId,
      grid,
      serverSeed,
      commitHash,
      status: 'active',
      createdAt: Date.now(),
      finishedAt: null
    };

    res.json({
      success: true,
      roundId,
      gridSize: 5,
      commitHash,
      createdAt: rounds[roundId].createdAt
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      error: 'Failed to create round'
    });
  }
});

// ========================
// CLICK CELL
// ========================

app.post('/clickCell', (req, res) => {

  try {

    const { roundId, row, col } = req.body;

    if (
      typeof roundId !== 'string' ||
      !Number.isInteger(row) ||
      !Number.isInteger(col)
    ) {
      return res.status(400).json({
        success: false,
        error: 'roundId, row and col are required'
      });
    }

    const round = rounds[roundId];

    if (!round) {
      return res.status(404).json({
        success: false,
        error: 'Invalid round'
      });
    }

    if (round.status !== 'active') {
      return res.status(400).json({
        success: false,
        error: 'Round is no longer active'
      });
    }

    const cell = findCell(round.grid, row, col);

    if (!cell) {
      return res.status(400).json({
        success: false,
        error: 'Invalid cell'
      });
    }

    if (cell.opened) {
      return res.json({
        success: true,
        result: 'ALREADY_OPENED',
        type: cell.type,
        row,
        col
      });
    }

    cell.opened = true;

    let result = 'GRASS';

    if (cell.type === 'apple') {

      result = 'APPLE';

    } else if (cell.type === 'bad') {

      result = 'BAD_APPLE';

      round.status = 'finished';

      round.finishedAt = Date.now();
    }

    return res.json({
      success: true,
      result,
      type: cell.type,
      row,
      col,
      roundStatus: round.status
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      error: 'Failed to process click'
    });
  }
});

// ========================
// REVEAL ROUND
// ========================

app.get('/revealRound', (req, res) => {

  try {

    const { roundId } = req.query;

    if (!roundId) {
      return res.status(400).json({
        success: false,
        error: 'roundId is required'
      });
    }

    const round = rounds[roundId];

    if (!round) {
      return res.status(404).json({
        success: false,
        error: 'Round not found'
      });
    }

    const recalculatedHash = sha256(
      JSON.stringify(round.grid) + round.serverSeed
    );

    res.json({
      success: true,
      roundId,
      status: round.status,
      grid: round.grid,
      serverSeed: round.serverSeed,
      commitHash: round.commitHash,
      verified:
        recalculatedHash === round.commitHash,
      createdAt: round.createdAt,
      finishedAt: round.finishedAt
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      error: 'Failed to reveal round'
    });
  }
});

// ========================
// CLEANUP
// ========================

setInterval(() => {

  const now = Date.now();

  const MAX_AGE = 30 * 60 * 1000;

  for (const roundId of Object.keys(rounds)) {

    if (
      now - rounds[roundId].createdAt > MAX_AGE
    ) {
      delete rounds[roundId];
    }
  }

}, 60 * 1000);

// ========================
// ERROR HANDLER
// ========================

app.use((err, req, res, next) => {

  console.error(err);

  res.status(500).json({
    success: false,
    error: err.message || 'Internal server error'
  });
});

// ========================
// START SERVER
// ========================

const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {

  console.log(
    `Server running on port ${PORT}`
  );
});
