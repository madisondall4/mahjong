/**
 * Scoring logic for American Mahjong
 *
 * Self-drawn win: all 3 opponents pay handPoints each
 * Called win: thrower pays handPoints * 2, other 2 opponents pay handPoints each
 */

/**
 * Calculate payments
 * @param {number} winnerIdx - who won (0-3)
 * @param {number|null} throwerId - who threw the winning tile (null = self-draw)
 * @param {number} handPoints - point value of the winning hand
 * @returns {Array<{ from: number, to: number, amount: number }>}
 */
export function calculatePayments(winnerIdx, throwerId, handPoints) {
  const payments = [];
  const players = [0, 1, 2, 3];

  if (throwerId === null) {
    // Self-drawn: all three opponents pay full amount
    for (const p of players) {
      if (p !== winnerIdx) {
        payments.push({ from: p, to: winnerIdx, amount: handPoints });
      }
    }
  } else {
    // Called discard: thrower pays double, others pay single
    for (const p of players) {
      if (p !== winnerIdx) {
        const amount = p === throwerId ? handPoints * 2 : handPoints;
        payments.push({ from: p, to: winnerIdx, amount });
      }
    }
  }

  return payments;
}

/**
 * Apply payments to scores array
 * @param {number[]} scores - current scores [p0, p1, p2, p3]
 * @param {Array<{ from, to, amount }>} payments
 * @returns {number[]} new scores
 */
export function applyPayments(scores, payments) {
  const newScores = [...scores];
  for (const { from, to, amount } of payments) {
    newScores[from] -= amount;
    newScores[to] += amount;
  }
  return newScores;
}
