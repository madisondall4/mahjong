import React from 'react';
import { SUITS } from '../data/tiles.js';

// ─── SVG Suit Symbols ───────────────────────────────────────────────────────

function BamSymbol({ value, size }) {
  const s = size === 'lg' ? 32 : size === 'md' ? 22 : 14;
  if (value === 1) {
    return (
      <svg width={s} height={s} viewBox="0 0 32 32">
        <rect x="14" y="2" width="4" height="28" rx="2" fill="#2d6a4f"/>
        <ellipse cx="16" cy="8" rx="5" ry="3" fill="#27ae60"/>
        <ellipse cx="16" cy="16" rx="6" ry="3.5" fill="#27ae60"/>
        <ellipse cx="16" cy="24" rx="5" ry="3" fill="#27ae60"/>
      </svg>
    );
  }
  const stalks = [];
  const spacing = 32 / (value + 1);
  for (let i = 0; i < value; i++) {
    const x = spacing * (i + 1);
    stalks.push(
      <g key={i}>
        <rect x={x - 1.5} y="4" width="3" height="24" rx="1.5" fill="#2d6a4f"/>
        <ellipse cx={x} cy={10} rx="4" ry="2.5" fill="#27ae60"/>
        <ellipse cx={x} cy="20" rx="4" ry="2.5" fill="#27ae60"/>
      </g>
    );
  }
  return <svg width={s} height={s} viewBox="0 0 32 32">{stalks}</svg>;
}

function CrakSymbol({ value, size }) {
  const s = size === 'lg' ? 32 : size === 'md' ? 22 : 14;
  return (
    <svg width={s} height={s} viewBox="0 0 32 32">
      <text
        x="16" y="26"
        textAnchor="middle"
        fontSize={value > 9 ? '18' : '24'}
        fontWeight="700"
        fontFamily="serif"
        fill="#c0392b"
      >
        {value}
      </text>
    </svg>
  );
}

function DotSymbol({ value, size }) {
  const s = size === 'lg' ? 32 : size === 'md' ? 22 : 14;
  const dotPositions = {
    1: [[16, 16]],
    2: [[16, 10], [16, 22]],
    3: [[16, 8], [16, 16], [16, 24]],
    4: [[10, 10], [22, 10], [10, 22], [22, 22]],
    5: [[10, 10], [22, 10], [16, 16], [10, 22], [22, 22]],
    6: [[10, 9], [22, 9], [10, 16], [22, 16], [10, 23], [22, 23]],
    7: [[10, 8], [22, 8], [10, 16], [22, 16], [10, 24], [22, 24], [16, 12]],
    8: [[9, 8], [16, 8], [23, 8], [9, 16], [23, 16], [9, 24], [16, 24], [23, 24]],
    9: [[9, 8], [16, 8], [23, 8], [9, 16], [16, 16], [23, 16], [9, 24], [16, 24], [23, 24]],
  };
  const dots = (dotPositions[value] || []).map(([cx, cy], i) => (
    <circle key={i} cx={cx} cy={cy} r="4" fill="#1a5276" stroke="#1a3a5c" strokeWidth="0.5"/>
  ));
  return <svg width={s} height={s} viewBox="0 0 32 32">{dots}</svg>;
}

function WindSymbol({ value, size }) {
  const s = size === 'lg' ? 32 : size === 'md' ? 22 : 14;
  const abbr = { East: 'E', South: 'S', West: 'W', North: 'N' };
  return (
    <svg width={s} height={s} viewBox="0 0 32 32">
      <text x="16" y="24" textAnchor="middle" fontSize="22" fontWeight="700" fontFamily="serif" fill="#c9a84c">
        {abbr[value] || value}
      </text>
    </svg>
  );
}

function DragonSymbol({ value, size }) {
  const s = size === 'lg' ? 32 : size === 'md' ? 22 : 14;
  const colors = { Red: '#c0392b', Green: '#27ae60', White: '#d4cfc4' };
  const labels = { Red: 'R', Green: 'G', White: '白' };
  return (
    <svg width={s} height={s} viewBox="0 0 32 32">
      <polygon points="16,4 28,28 4,28" fill={colors[value]} opacity="0.9"/>
      <text x="16" y="26" textAnchor="middle" fontSize="11" fontWeight="700" fontFamily="serif" fill="white">
        {labels[value]}
      </text>
    </svg>
  );
}

function FlowerSymbol({ value, size }) {
  const s = size === 'lg' ? 32 : size === 'md' ? 22 : 14;
  const petalColors = ['#e74c3c', '#e67e22', '#9b59b6', '#3498db'];
  const color = petalColors[(value - 1) % 4];
  return (
    <svg width={s} height={s} viewBox="0 0 32 32">
      {[0, 60, 120, 180, 240, 300].map((deg, i) => {
        const rad = (deg * Math.PI) / 180;
        const cx = 16 + Math.cos(rad) * 7;
        const cy = 16 + Math.sin(rad) * 7;
        return <ellipse key={i} cx={cx} cy={cy} rx="4" ry="5.5"
          transform={`rotate(${deg}, ${cx}, ${cy})`} fill={color} opacity="0.85"/>;
      })}
      <circle cx="16" cy="16" r="4" fill="#f9ca24"/>
      <text x="16" y="20" textAnchor="middle" fontSize="7" fontWeight="700" fill="#333">{value}</text>
    </svg>
  );
}

function JokerSymbol({ size }) {
  const s = size === 'lg' ? 32 : size === 'md' ? 22 : 14;
  return (
    <svg width={s} height={s} viewBox="0 0 32 32">
      <defs>
        <linearGradient id="rainbowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#e74c3c"/>
          <stop offset="33%" stopColor="#f39c12"/>
          <stop offset="66%" stopColor="#27ae60"/>
          <stop offset="100%" stopColor="#9b59b6"/>
        </linearGradient>
      </defs>
      <polygon points="16,2 20,12 30,12 22,18 25,28 16,22 7,28 10,18 2,12 12,12"
        fill="url(#rainbowGrad)" stroke="#c9a84c" strokeWidth="1"/>
    </svg>
  );
}

// ─── Tile Back ───────────────────────────────────────────────────────────────

function TileBack({ size }) {
  const dims = {
    sm: { w: 28, h: 36 },
    md: { w: 40, h: 52 },
    lg: { w: 56, h: 72 },
  };
  const { w, h } = dims[size] || dims.md;
  return (
    <div
      className="rounded-sm flex items-center justify-center"
      style={{
        width: w, height: h,
        background: 'linear-gradient(135deg, #1a3a2a 0%, #0d1f17 50%, #1a3a2a 100%)',
        border: '1px solid #2d6a4f',
        boxShadow: '1px 1px 3px rgba(0,0,0,0.4)',
      }}
    >
      <div style={{
        width: w - 8, height: h - 8,
        border: '1px solid rgba(201,168,76,0.3)',
        borderRadius: 2,
        backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(201,168,76,0.05) 3px, rgba(201,168,76,0.05) 6px)',
      }}/>
    </div>
  );
}

// ─── Main MahjongTile Component ──────────────────────────────────────────────

/**
 * @param {Object} props
 * @param {Object} props.tile - tile object {suit, value, id, uid}
 * @param {'sm'|'md'|'lg'} props.size - tile size
 * @param {boolean} props.faceDown - render tile back
 * @param {boolean} props.selected - tile is selected (rises up)
 * @param {boolean} props.winning - tile is part of winning hand (gold glow)
 * @param {boolean} props.disabled - reduced opacity
 * @param {function} props.onClick - click handler
 * @param {boolean} props.animateIn - play deal animation
 * @param {number} props.animDelay - animation delay in ms
 */
export default function MahjongTile({
  tile,
  size = 'md',
  faceDown = false,
  selected = false,
  winning = false,
  disabled = false,
  onClick,
  animateIn = false,
  animDelay = 0,
  style = {},
}) {
  if (!tile) return null;

  if (faceDown) return <TileBack size={size} />;

  const dims = {
    sm: { w: 28, h: 36, textSize: '8px', numSize: '11px', pad: 2 },
    md: { w: 40, h: 52, textSize: '10px', numSize: '13px', pad: 3 },
    lg: { w: 56, h: 72, textSize: '12px', numSize: '16px', pad: 4 },
  };
  const d = dims[size] || dims.md;

  const isNumbered = [SUITS.BAM, SUITS.CRAK, SUITS.DOT].includes(tile.suit);
  const symbolSize = size;

  function renderSymbol() {
    switch (tile.suit) {
      case SUITS.BAM: return <BamSymbol value={tile.value} size={symbolSize}/>;
      case SUITS.CRAK: return <CrakSymbol value={tile.value} size={symbolSize}/>;
      case SUITS.DOT: return <DotSymbol value={tile.value} size={symbolSize}/>;
      case SUITS.WIND: return <WindSymbol value={tile.value} size={symbolSize}/>;
      case SUITS.DRAGON: return <DragonSymbol value={tile.value} size={symbolSize}/>;
      case SUITS.FLOWER: return <FlowerSymbol value={tile.value} size={symbolSize}/>;
      case SUITS.JOKER: return <JokerSymbol size={symbolSize}/>;
      default: return null;
    }
  }

  const bgClass = tile.suit === SUITS.JOKER
    ? 'linear-gradient(145deg, #fff8f0 0%, #fdf0e8 100%)'
    : 'linear-gradient(145deg, #fdfaf3 0%, #f7f2e8 40%, #ede5d0 100%)';

  const suitLabel = {
    [SUITS.BAM]: 'B',
    [SUITS.CRAK]: 'C',
    [SUITS.DOT]: 'D',
    [SUITS.WIND]: '',
    [SUITS.DRAGON]: '',
    [SUITS.FLOWER]: 'F',
    [SUITS.JOKER]: '',
  }[tile.suit] || '';

  const tileStyle = {
    width: d.w,
    height: d.h,
    background: bgClass,
    borderRadius: 4,
    padding: d.pad,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: onClick ? 'pointer' : 'default',
    transition: 'transform 0.15s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.15s ease',
    opacity: disabled ? 0.5 : 1,
    position: 'relative',
    flexShrink: 0,
    userSelect: 'none',
    WebkitUserSelect: 'none',
    ...(selected ? {
      transform: 'translateY(-14px) scale(1.06)',
      boxShadow: '2px 2px 0 #c8b89a, 3px 3px 0 #b8a88a, 4px 4px 8px rgba(0,0,0,0.3), 0 0 20px rgba(201,168,76,0.7)',
    } : winning ? {
      boxShadow: '0 0 16px rgba(201,168,76,0.8), 0 0 4px rgba(201,168,76,1)',
    } : {
      boxShadow: '2px 2px 0 #c8b89a, 3px 3px 0 #b8a88a, 4px 4px 6px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.9)',
    }),
    ...style,
  };

  if (animateIn) {
    tileStyle.animation = `tileDeal 0.4s ease-out ${animDelay}ms both`;
  }

  return (
    <div style={tileStyle} onClick={onClick} role={onClick ? 'button' : undefined}>
      {/* Corner label top-left */}
      {isNumbered && size !== 'sm' && (
        <div style={{
          position: 'absolute', top: 2, left: 3,
          fontSize: d.textSize, fontWeight: '700',
          color: tile.color, fontFamily: 'Nunito, sans-serif',
          lineHeight: 1,
        }}>
          {tile.value}{suitLabel}
        </div>
      )}

      {/* Main symbol */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {renderSymbol()}
      </div>

      {/* Suit label bottom (sm only) */}
      {size === 'sm' && (
        <div style={{
          fontSize: '7px', fontWeight: '700', color: tile.color,
          fontFamily: 'Nunito, sans-serif', lineHeight: 1, marginTop: 1,
        }}>
          {tile.suit === SUITS.JOKER ? 'JKR' :
           tile.suit === SUITS.WIND ? tile.value[0] :
           tile.suit === SUITS.DRAGON ? tile.value[0]+'D' :
           tile.suit === SUITS.FLOWER ? `F${tile.value}` :
           `${tile.value}${suitLabel}`}
        </div>
      )}
    </div>
  );
}
