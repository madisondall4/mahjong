import { renderToStaticMarkup } from 'react-dom/server';
import React from 'react';
import { TileSymbol } from '../components/MahjongTile.jsx';
import { SUITS } from '../data/tiles.js';

// ── Layout constants (logical units; rasterized at SCALE for crispness) ──
const SCALE = 3;
const W = 390;
const FACE_W = 42;
const FACE_H = 54;
const GAP = 5;
const PER_ROW = 7;
const SYMBOL = 28; // 'md' symbol px inside the 42×54 face

const INK = '#33302A';
const MATCHA = '#5F7D4F';
const ROSE = '#C95E83';
const CREAM = '#FBF7EF';

const SUIT_ORDER = { dot: 0, bam: 1, crak: 2, wind: 3, dragon: 4, flower: 5, joker: 6 };
const NAMED_ORDER = {
  East: 0, South: 1, West: 2, North: 3,
  Red: 0, Green: 1, White: 2,
};

function sortTiles(tiles) {
  return [...tiles].sort((a, b) => {
    if (SUIT_ORDER[a.suit] !== SUIT_ORDER[b.suit]) return SUIT_ORDER[a.suit] - SUIT_ORDER[b.suit];
    const av = typeof a.value === 'number' ? a.value : (NAMED_ORDER[a.value] ?? 99);
    const bv = typeof b.value === 'number' ? b.value : (NAMED_ORDER[b.value] ?? 99);
    return av - bv;
  });
}

const SUIT_LETTER = { bam: 'B', crak: 'C', dot: 'D', flower: 'F' };
const LABEL_COLOR = { bam: '#2E7D43', crak: '#C5302B', dot: '#1E6FA8', flower: '#C95E83' };

// One tile face as an SVG string: rounded card + centered symbol + corner label.
function tileFaceSVG(tile, x, y) {
  const symbol = renderToStaticMarkup(
    React.createElement(TileSymbol, { tile, size: 'md' })
  );
  const sx = x + (FACE_W - SYMBOL) / 2;
  const sy = y + (FACE_H - SYMBOL) / 2;
  const isNumbered = tile.suit === SUITS.BAM || tile.suit === SUITS.CRAK || tile.suit === SUITS.DOT;
  const label = isNumbered
    ? `<text x="${x + 4}" y="${y + 11}" font-family="Nunito, sans-serif" font-size="9" font-weight="700" fill="${LABEL_COLOR[tile.suit]}">${tile.value}${SUIT_LETTER[tile.suit]}</text>`
    : '';
  return `
    <g>
      <rect x="${x}" y="${y}" width="${FACE_W}" height="${FACE_H}" rx="6"
        fill="#ffffff" stroke="rgba(60,82,54,0.18)" stroke-width="1"/>
      <svg x="${sx}" y="${sy}" width="${SYMBOL}" height="${SYMBOL}" viewBox="0 0 32 32">${stripOuterSvg(symbol)}</svg>
      ${label}
    </g>`;
}

// renderToStaticMarkup wraps in <svg width=.. height=.. viewBox>…</svg>; keep the
// inner content only so we can re-wrap with our own positioned <svg>.
function stripOuterSvg(markup) {
  const open = markup.indexOf('>');
  const close = markup.lastIndexOf('</svg>');
  return open >= 0 && close >= 0 ? markup.slice(open + 1, close) : markup;
}

function rowsLayout(tiles, topY) {
  const out = [];
  const rows = [];
  for (let i = 0; i < tiles.length; i += PER_ROW) rows.push(tiles.slice(i, i + PER_ROW));
  rows.forEach((row, r) => {
    const rowW = row.length * FACE_W + (row.length - 1) * GAP;
    const startX = (W - rowW) / 2;
    const y = topY + r * (FACE_H + 8);
    row.forEach((t, c) => {
      out.push(tileFaceSVG(t, startX + c * (FACE_W + GAP), y));
    });
  });
  const height = rows.length * FACE_H + (rows.length - 1) * 8;
  return { svg: out.join(''), bottom: topY + height };
}

/**
 * Build a shareable PNG of a winning hand.
 * @returns {Promise<Blob>}
 */
export async function buildShareImage({ tiles = [], handName = 'Mahjong!', points = 0 }) {
  const hand = sortTiles(tiles);

  // Vertical flow
  const HAND_TOP = 156;
  const handRows = rowsLayout(hand, HAND_TOP);
  const taglineY = handRows.bottom + 34;
  const H = taglineY + 22;

  const tilesSVG =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W * SCALE}" height="${H * SCALE}" viewBox="0 0 ${W} ${H}">` +
    handRows.svg +
    `</svg>`;

  // Rasterize the tile art (transparent background)
  const tileImg = await svgToImage(tilesSVG, W * SCALE, H * SCALE);

  // Compose final canvas: background + text + tiles
  const canvas = document.createElement('canvas');
  canvas.width = W * SCALE;
  canvas.height = H * SCALE;
  const ctx = canvas.getContext('2d');
  ctx.scale(SCALE, SCALE);

  try { await document.fonts.ready; } catch { /* fall back to system fonts */ }

  // Background
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#FDFBF6');
  bg.addColorStop(1, '#EFE7D7');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);
  // Inner border frame
  ctx.strokeStyle = 'rgba(95,125,79,0.30)';
  ctx.lineWidth = 1.5;
  roundRect(ctx, 10, 10, W - 20, H - 20, 14);
  ctx.stroke();

  ctx.textAlign = 'center';

  // Eyebrow
  ctx.fillStyle = 'rgba(51,48,42,0.5)';
  ctx.font = '800 12px Nunito, sans-serif';
  ctx.fillText('A M E R I C A N   M A H J O N G', W / 2, 44);

  // Hand name (wraps to 2 lines)
  ctx.fillStyle = MATCHA;
  ctx.font = '700 27px "Playfair Display", serif';
  const lines = wrapText(ctx, handName, W - 56, 2);
  let nameY = lines.length > 1 ? 78 : 86;
  lines.forEach(line => { ctx.fillText(line, W / 2, nameY); nameY += 30; });

  // Points pill
  const pillText = `${points} POINT${points === 1 ? '' : 'S'}`;
  ctx.font = '800 13px Nunito, sans-serif';
  const pillW = ctx.measureText(pillText).width + 28;
  const pillY = lines.length > 1 ? 122 : 116;
  ctx.fillStyle = ROSE;
  roundRect(ctx, (W - pillW) / 2, pillY, pillW, 24, 12);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.fillText(pillText, W / 2, pillY + 16.5);

  // Tiles
  ctx.drawImage(tileImg, 0, 0, W, H);

  // Tagline / branding
  ctx.fillStyle = INK;
  ctx.font = '700 14px "Playfair Display", serif';
  ctx.fillText('I won with American Mahjong ✦', W / 2, taglineY);

  return await new Promise((resolve, reject) =>
    canvas.toBlob(b => b ? resolve(b) : reject(new Error('toBlob failed')), 'image/png')
  );
}

function svgToImage(svgString, w, h) {
  return new Promise((resolve, reject) => {
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.width = w; img.height = h;
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = (e) => { URL.revokeObjectURL(url); reject(e); };
    img.src = url;
  });
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function wrapText(ctx, text, maxWidth, maxLines) {
  const words = text.split(' ');
  const lines = [];
  let line = '';
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
      if (lines.length === maxLines - 1) break;
    } else {
      line = test;
    }
  }
  // remaining words onto the last line
  const used = lines.join(' ').split(' ').filter(Boolean).length;
  line = words.slice(used).join(' ');
  if (line) lines.push(line);
  return lines.slice(0, maxLines);
}

/**
 * Share the blob via the Web Share API if available (with image file),
 * otherwise download it. Returns 'shared' | 'downloaded'.
 */
export async function shareOrDownload(blob, filename = 'mahjong-win.png') {
  const file = new File([blob], filename, { type: 'image/png' });
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        files: [file],
        title: 'American Mahjong',
        text: 'I won with American Mahjong! 🀄',
      });
      return 'shared';
    } catch (err) {
      if (err && err.name === 'AbortError') return 'cancelled';
      // fall through to download
    }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return 'downloaded';
}
