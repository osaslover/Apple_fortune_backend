const express = require("express");
const crypto = require("crypto");

const app = express();
app.use(express.json());

// In-memory storage (use Redis later for production)
const rounds = {};

/**
 * Generate secure random grid
 */
function generateGrid(rows, cols) {
    const grid = [];

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {

            const rand = Math.random();
            let type = "grass";

            // Game logic distribution
            if (rand < 0.18) type = "apple";
            else if (rand < 0.28) type = "bad";

            grid.push({
                row: r,
                col: c,
                type,
                opened: false
            });
        }
    }

    return grid;
}

/**
 * SHA256 helper
 */
function sha256(data) {
    return crypto.createHash("sha256").update(data).digest("hex");
}

/**
 * CREATE ROUND
 */
app.post("/createRound", (req, res) => {
    const roundId = crypto.randomBytes(6).toString("hex");

    const grid = generateGrid(5, 5);
    const serverSeed = crypto.randomBytes(16).toString("hex");

    const commitPayload = JSON.stringify(grid) + serverSeed;
    const commitHash = sha256(commitPayload);

    rounds[roundId] = {
        grid,
        serverSeed,
        commitHash,
        startedAt: Date.now()
    };

    res.json({
        roundId,
        gridSize: 5,
        commitHash
    });
});

/**
 * CLICK CELL
 */
app.post("/clickCell", (req, res) => {
    const { roundId, row, col } = req.body;

    const round = rounds[roundId];

    if (!round) {
        return res.status(404).json({ error: "Invalid round" });
    }

    const cell = round.grid.find(
        c => c.row === row && c.col === col
    );

    if (!cell) {
        return res.status(400).json({ error: "Invalid cell" });
    }

    if (cell.opened) {
        return res.json({
            result: "ALREADY_OPENED",
            type: cell.type
        });
    }

    cell.opened = true;

    let result = "GRASS";
    if (cell.type === "apple") result = "APPLE";
    if (cell.type === "bad") result = "BAD_APPLE";

    res.json({
        result,
        row,
        col
    });
});

/**
 * REVEAL ROUND (END GAME)
 */
app.get("/revealRound", (req, res) => {
    const { roundId } = req.query;

    const round = rounds[roundId];

    if (!round) {
        return res.status(404).json({ error: "Round not found" });
    }

    const verify = sha256(JSON.stringify(round.grid) + round.serverSeed);

    const isValid = verify === round.commitHash;

    res.json({
        roundId,
        grid: round.grid,
        serverSeed: round.serverSeed,
        commitHash: round.commitHash,
        verified: isValid
    });
});

/**
 * CLEANUP OLD ROUNDS (optional)
 */
setInterval(() => {
    const now = Date.now();

    for (const id in rounds) {
        if (now - rounds[id].startedAt > 1000 * 60 * 10) {
            delete rounds[id];
        }
    }
}, 60000);

/**
 * START SERVER
 */
const PORT = process.env.PORT || 3000;
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: Date.now()
  });
});

app.listen(PORT, () => {
    console.log("Apple Fortune backend running on port " + PORT);
});
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true
});

app.use(limiter);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

