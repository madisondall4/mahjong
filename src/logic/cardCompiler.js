/**
 * Card notation compiler — turns card-style hand lines into the variant
 * engine's format. This powers "My Card": players who own a physical card
 * can enter its hands for private play. The compiler is generic notation,
 * ships with no card content, and works for any American-style card.
 *
 * NOTATION (groups separated by spaces):
 *   F FF FFF…       flowers (all interchangeable)
 *   222  4444a      a number group — same digit repeated; optional suit
 *                   class a/b/c. Same letter = same suit, different letters
 *                   = DIFFERENT suits (like the card's colors). No letter = a.
 *   123  2026b      mixed digits — one single per digit (0 = the White
 *                   dragon "soap"), same optional suit class
 *   NEWS  NN EEE    winds — NEWS (any mix of distinct letters) = one single
 *                   each; a repeated letter = pair/pung/kong/quint
 *   RRR GG 000      dragons by name — R=Red, G=Green, 0=White soap
 *   DD DDDa         "matching dragon" — the dragon tied to its class's suit
 *                   (bam→Green, crak→Red, dot→Soap)
 *
 * Per-hand flags: points, closed, anyRun ("these numbers can slide" — every
 * digit group shifts together, as consecutive-run sections do on real cards).
 */

const NSUITS = ['bam', 'crak', 'dot'];
const WIND_LETTERS = { N: 'North', E: 'East', W: 'West', S: 'South' };
const DRAGON_LETTERS = { R: 'Red', G: 'Green', 0: 'White' };
const SUIT_DRAGON = { bam: 'Green', crak: 'Red', dot: 'White' };

const tid = (s, v) => `${s}-${v}`;

// ─── Tokenizer ────────────────────────────────────────────────────────────────

/**
 * Parse one whitespace token into an abstract group.
 * Returns { kind, ... } or { error }.
 */
function parseToken(raw) {
  const m = raw.match(/^([A-Za-z0-9]+?)([abc])?$/);
  if (!m) return { error: `Can't read "${raw}"` };
  const body = m[1];
  const cls = m[2] || 'a';

  // Flowers
  if (/^F+$/i.test(body)) {
    return { kind: 'flower', n: body.length };
  }

  // Winds
  if (/^[NEWS]+$/.test(body) && !/^[0-9]+$/.test(body)) {
    const letters = [...body];
    if (letters.every(l => l === letters[0])) {
      return { kind: 'wind', value: WIND_LETTERS[letters[0]], n: letters.length };
    }
    if (new Set(letters).size === letters.length) {
      return { kind: 'windSingles', letters: letters.map(l => WIND_LETTERS[l]) };
    }
    return { error: `"${raw}": repeat one wind (NNN) or list distinct winds (NEWS)` };
  }

  // Named dragons (R / G / 0 repeated)
  if (/^[RG]+$/.test(body)) {
    const letters = [...body];
    if (!letters.every(l => l === letters[0])) {
      if (new Set(letters).size === letters.length) {
        return { kind: 'dragonSingles', names: letters.map(l => DRAGON_LETTERS[l]) };
      }
      return { error: `"${raw}": repeat one dragon (RRR) or list distinct (RG)` };
    }
    return { kind: 'dragon', value: DRAGON_LETTERS[letters[0]], n: letters.length };
  }
  if (/^0+$/.test(body)) {
    return { kind: 'dragon', value: 'White', n: body.length };
  }

  // Matching dragon for a suit class
  if (/^D+$/.test(body)) {
    return { kind: 'classDragon', cls, n: body.length };
  }

  // Digits
  if (/^[0-9]+$/.test(body)) {
    const digits = [...body].map(Number);
    if (digits.every(d => d === digits[0])) {
      const d = digits[0];
      if (d === 0) return { kind: 'dragon', value: 'White', n: digits.length };
      return { kind: 'number', value: d, n: digits.length, cls };
    }
    // Mixed digits: singles run (0 = soap single)
    return {
      kind: 'digitSingles',
      digits,
      cls,
    };
  }

  return { error: `Can't read "${raw}"` };
}

// ─── Compiler ─────────────────────────────────────────────────────────────────

function injectiveAssignments(classes) {
  // classes: unique list like ['a','b'] → map each to a DIFFERENT suit
  const out = [];
  const pick = (i, used, acc) => {
    if (i === classes.length) { out.push({ ...acc }); return; }
    for (const s of NSUITS) {
      if (used.has(s)) continue;
      used.add(s);
      acc[classes[i]] = s;
      pick(i + 1, used, acc);
      used.delete(s);
    }
  };
  pick(0, new Set(), {});
  return out;
}

/**
 * Compile a pattern line into a hand definition for the matcher engine.
 * @param {string} pattern
 * @param {Object} opts - { name, points, closed, anyRun, id, category }
 * @returns {{ ok: true, def } | { ok: false, error }}
 */
export function compileHand(pattern, opts = {}) {
  const raw = (pattern || '').trim();
  if (!raw) return { ok: false, error: 'Empty hand' };
  const tokens = raw.split(/\s+/).map(parseToken);
  const bad = tokens.find(t => t.error);
  if (bad) return { ok: false, error: bad.error };

  // Tile-count check
  const count = tokens.reduce((a, t) => {
    if (t.kind === 'windSingles') return a + t.letters.length;
    if (t.kind === 'dragonSingles') return a + t.names.length;
    if (t.kind === 'digitSingles') return a + t.digits.length;
    return a + t.n;
  }, 0);
  if (count !== 14) return { ok: false, error: `Hand has ${count} tiles — needs exactly 14` };

  const classes = [...new Set(tokens.filter(t => t.cls && (t.kind === 'number' || t.kind === 'digitSingles' || t.kind === 'classDragon')).map(t => t.cls))];
  if (classes.length > 3) return { ok: false, error: 'At most three suit classes (a, b, c)' };

  // Slide range for anyRun: shift all number values together
  const numberVals = [];
  for (const t of tokens) {
    if (t.kind === 'number') numberVals.push(t.value);
    if (t.kind === 'digitSingles') numberVals.push(...t.digits.filter(d => d >= 1));
  }
  let offsets = [0];
  if (opts.anyRun && numberVals.length > 0) {
    const lo = Math.min(...numberVals);
    const hi = Math.max(...numberVals);
    offsets = [];
    for (let k = 1 - lo; k <= 9 - hi; k++) offsets.push(k);
    if (offsets.length === 0) return { ok: false, error: 'Numbers span too far to slide' };
  }

  // Build concrete variants
  const assignments = classes.length > 0 ? injectiveAssignments(classes) : [{}];
  const variantsArr = [];
  for (const off of offsets) {
    for (const asg of assignments) {
      const groups = [];
      let feasible = true;
      for (const t of tokens) {
        if (t.kind === 'flower') {
          groups.push({ id: 'flower', suit: 'flower', value: 'any', n: t.n, isFlower: true });
        } else if (t.kind === 'wind') {
          groups.push({ id: tid('wind', t.value), suit: 'wind', value: t.value, n: t.n });
        } else if (t.kind === 'windSingles') {
          for (const w of t.letters) groups.push({ id: tid('wind', w), suit: 'wind', value: w, n: 1 });
        } else if (t.kind === 'dragon') {
          groups.push({ id: tid('dragon', t.value), suit: 'dragon', value: t.value, n: t.n });
        } else if (t.kind === 'dragonSingles') {
          for (const d of t.names) groups.push({ id: tid('dragon', d), suit: 'dragon', value: d, n: 1 });
        } else if (t.kind === 'classDragon') {
          const suit = asg[t.cls] || NSUITS[0];
          const d = SUIT_DRAGON[suit];
          groups.push({ id: tid('dragon', d), suit: 'dragon', value: d, n: t.n });
        } else if (t.kind === 'number') {
          const v = t.value + off;
          if (v < 1 || v > 9) { feasible = false; break; }
          const suit = asg[t.cls] || NSUITS[0];
          groups.push({ id: tid(suit, v), suit, value: v, n: t.n });
        } else if (t.kind === 'digitSingles') {
          const suit = asg[t.cls] || NSUITS[0];
          for (const d of t.digits) {
            if (d === 0) {
              groups.push({ id: tid('dragon', 'White'), suit: 'dragon', value: 'White', n: 1 });
            } else {
              const v = d + off;
              if (v < 1 || v > 9) { feasible = false; break; }
              groups.push({ id: tid(suit, v), suit, value: v, n: 1 });
            }
          }
          if (!feasible) break;
        }
      }
      if (!feasible) continue;

      // Physical feasibility, order-independent: pairs/singles must be real
      // tiles (strict); groups of 3+ may absorb copy-overflow with jokers.
      const strictNeed = {};
      const flexNeed = {};
      for (const g of groups) {
        const bucket = g.n < 3 ? strictNeed : flexNeed;
        bucket[g.id] = (bucket[g.id] || 0) + g.n;
      }
      let jokersNeeded = 0;
      let ok = true;
      const ids = new Set([...Object.keys(strictNeed), ...Object.keys(flexNeed)]);
      for (const id of ids) {
        const cap = id === 'flower' ? 8 : 4;
        const s = strictNeed[id] || 0;
        const f = flexNeed[id] || 0;
        if (s > cap) { ok = false; break; }
        jokersNeeded += Math.max(0, s + f - cap);
      }
      if (!ok || jokersNeeded > 8) continue;
      variantsArr.push(groups);
    }
  }

  if (variantsArr.length === 0) {
    return { ok: false, error: 'No physically buildable arrangement (check copies per tile)' };
  }

  const def = {
    id: opts.id ?? 0,
    category: opts.category || 'My Card',
    name: opts.name || raw,
    pattern: raw,
    points: Number(opts.points) || 25,
    closed: !!opts.closed,
    anyRun: !!opts.anyRun,
    variants: () => variantsArr,
    example: variantsArr[0],
  };
  return { ok: true, def };
}

/**
 * Compile a whole card: array of {pattern, points, closed, anyRun, name?}.
 * @returns {{ hands: Array, errors: Array<{index, error}> }}
 */
export function compileCard(handInputs, { category = 'My Card' } = {}) {
  const hands = [];
  const errors = [];
  handInputs.forEach((h, i) => {
    const res = compileHand(h.pattern, { ...h, id: i + 1, category });
    if (res.ok) hands.push(res.def);
    else errors.push({ index: i, error: res.error });
  });
  return { hands, errors };
}
