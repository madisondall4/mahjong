import React from 'react';
import { SUITS } from '../data/tiles.js';

// ─── SVG Suit Symbols ───────────────────────────────────────────────────────

function BamSymbol({ value, size }) {
  const s = size === 'lg' ? 36 : size === 'md' ? 28 : 18;

  if (value === 1) {
    // 1 Bam is traditionally the bird (peacock/sparrow), not bamboo.
    // Colorful peacock: blue body, green/blue/pink tail fan.
    return (
      <svg width={s} height={s} viewBox="0 0 32 32">
        {/* Tail fan — peacock feathers */}
        <ellipse cx="9"  cy="13" rx="4.5" ry="2.3" transform="rotate(-58,9,13)"  fill="#2E7D43"/>
        <ellipse cx="7.5" cy="19" rx="5"  ry="2.6" transform="rotate(-18,7.5,19)" fill="#1E6FA8"/>
        <ellipse cx="9"  cy="25" rx="4.5" ry="2.3" transform="rotate(18,9,25)"   fill="#C5302B"/>
        {/* Body */}
        <ellipse cx="17" cy="20" rx="6" ry="5" fill="#1E6FA8"/>
        <ellipse cx="16" cy="20" rx="3" ry="3.6" fill="#2E7D43" opacity="0.45"/>
        {/* Head + crest */}
        <circle cx="23" cy="13" r="3.4" fill="#1E6FA8"/>
        <line x1="23" y1="10" x2="23" y2="7" stroke="#C5302B" strokeWidth="1.2"/>
        <circle cx="23" cy="6.4" r="1" fill="#C5302B"/>
        {/* Beak + eye */}
        <polygon points="26,12 30,13 26,14.5" fill="#D98A3D"/>
        <circle cx="24" cy="12.5" r="1" fill="#2C3E50"/>
        {/* Legs */}
        <line x1="16" y1="24.5" x2="15" y2="28" stroke="#D98A3D" strokeWidth="1"/>
        <line x1="19" y1="24.5" x2="20" y2="28" stroke="#D98A3D" strokeWidth="1"/>
      </svg>
    );
  }

  // 2–9 Bam render exactly `value` bamboo sticks in a countable grid.
  function Stick({ cx, cy, h, color }) {
    const w = 4;
    const x = cx - w / 2;
    const y = cy - h / 2;
    return (
      <g>
        <rect x={x} y={y} width={w} height={h} rx={w / 2} fill={color}/>
        <line x1={x} y1={y + h * 0.34} x2={x + w} y2={y + h * 0.34} stroke="#2C3E50" strokeWidth="0.6" opacity="0.45"/>
        <line x1={x} y1={y + h * 0.66} x2={x + w} y2={y + h * 0.66} stroke="#2C3E50" strokeWidth="0.6" opacity="0.45"/>
      </g>
    );
  }

  const G = '#2E7D43'; // bamboo green
  const A = '#C5302B'; // accent stick (traditional red) → pink
  // [cx, cy, height, accent?]
  const layouts = {
    2: [[11,16,15],[21,16,15]],
    3: [[16,8,11],[11,22,11],[21,22,11]],
    4: [[11,10,10],[21,10,10],[11,22,10],[21,22,10]],
    5: [[10,9,9],[22,9,9],[16,16,9,true],[10,23,9],[22,23,9]],
    6: [[9,10,10],[16,10,10],[23,10,10],[9,22,10],[16,22,10],[23,22,10]],
    7: [[16,7,7,true],[9,16,7],[16,16,7],[23,16,7],[9,25,7],[16,25,7],[23,25,7]],
    8: [[6,11,10],[13,11,10],[20,11,10],[27,11,10],[6,22,10],[13,22,10],[20,22,10],[27,22,10]],
    9: [[9,8,7],[16,8,7],[23,8,7],[9,16,7],[16,16,7,true],[23,16,7],[9,24,7],[16,24,7],[23,24,7]],
  };
  const sticks = layouts[value] || layouts[2];
  return (
    <svg width={s} height={s} viewBox="0 0 32 32">
      {sticks.map(([cx, cy, h, accent], i) => (
        <Stick key={i} cx={cx} cy={cy} h={h} color={accent ? A : G}/>
      ))}
    </svg>
  );
}

function CrakSymbol({ value, size }) {
  const s = size === 'lg' ? 36 : size === 'md' ? 28 : 18;
  const chars = ['一','二','三','四','五','六','七','八','九'];
  const ch = chars[value - 1] || String(value);
  const numSize = size === 'sm' ? '13' : '19';
  const wanSize = size === 'sm' ? '7' : '10';
  const numY = size === 'sm' ? '14' : '17';
  const wanY = size === 'sm' ? '22' : '27';
  return (
    <svg width={s} height={s} viewBox="0 0 32 32">
      <text x="16" y={numY} textAnchor="middle" fontSize={numSize} fontWeight="700" fontFamily="serif" fill="#2E7D43">
        {ch}
      </text>
      <text x="16" y={wanY} textAnchor="middle" fontSize={wanSize} fontWeight="600" fontFamily="serif" fill="#C5302B">
        萬
      </text>
    </svg>
  );
}

function DotSymbol({ value, size }) {
  const s = size === 'lg' ? 36 : size === 'md' ? 28 : 18;
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
  // 1 Dot is the large ornate circle — concentric green / pink / blue rings.
  if (value === 1) {
    return (
      <svg width={s} height={s} viewBox="0 0 32 32">
        <circle cx="16" cy="16" r="8.5" fill="#2E7D43"/>
        <circle cx="16" cy="16" r="6.5" fill="white"/>
        <circle cx="16" cy="16" r="4.8" fill="#C5302B"/>
        <circle cx="16" cy="16" r="2.9" fill="white"/>
        <circle cx="16" cy="16" r="1.6" fill="#1E6FA8"/>
      </svg>
    );
  }
  // 2–9 Dots: blue rings (the "circles" suit) with pink centers.
  const dots = (dotPositions[value] || []).map(([cx, cy], i) => (
    <g key={i}>
      <circle cx={cx} cy={cy} r="3.6" fill="#1E6FA8"/>
      <circle cx={cx} cy={cy} r="2.1" fill="white"/>
      <circle cx={cx} cy={cy} r="0.9" fill="#C5302B"/>
    </g>
  ));
  return <svg width={s} height={s} viewBox="0 0 32 32">{dots}</svg>;
}

function WindSymbol({ value, size }) {
  const s = size === 'lg' ? 36 : size === 'md' ? 28 : 18;
  const chars = { East: '東', South: '南', West: '西', North: '北' };
  const abbr = { East: 'EAST', South: 'SOUTH', West: 'WEST', North: 'NORTH' };
  const chSize = size === 'sm' ? '14' : '20';
  const chY = size === 'sm' ? '15' : '19';
  const labelSize = size === 'sm' ? '5' : '7';
  const labelY = size === 'sm' ? '22' : '28';
  return (
    <svg width={s} height={s} viewBox="0 0 32 32">
      <text x="16" y={chY} textAnchor="middle" fontSize={chSize} fontWeight="700" fontFamily="serif" fill="#2C3E50">
        {chars[value] || value}
      </text>
      {size !== 'sm' && (
        <text x="16" y={labelY} textAnchor="middle" fontSize={labelSize} fontWeight="600" fontFamily="sans-serif" fill="#2E7D43">
          {abbr[value] || value}
        </text>
      )}
    </svg>
  );
}

function DragonPaths({ color }) {
  return (
    <g>
      <path d="M14,28 C10,28 8,26 9,23 C10,20 13,21 12,23 C11,25 9,24 10,23"
        fill="none" stroke={color} strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M14,28 C16,26 20,25 19,21 C18,17 13,18 14,14 C15,10 19,9 20,7"
        fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round"/>
      <path d="M18,23 C19,22 19,21 18,20" fill="none" stroke={color} strokeWidth="0.7" opacity="0.6"/>
      <path d="M15,19 C16,18 16,17 15,16" fill="none" stroke={color} strokeWidth="0.7" opacity="0.6"/>
      <path d="M16,15 C17,14 17,13 16,12" fill="none" stroke={color} strokeWidth="0.7" opacity="0.6"/>
      <ellipse cx="20" cy="6" rx="4" ry="3" fill={color}/>
      <circle cx="21.5" cy="5.5" r="0.9" fill="white"/>
      <circle cx="21.8" cy="5.5" r="0.45" fill="#1a1a1a"/>
      <path d="M24,5.5 L27,4.5 L27,6 L24,6.5" fill={color}/>
      <path d="M27,4.5 L28.5,3.5" fill="none" stroke={color} strokeWidth="0.8" strokeLinecap="round"/>
      <path d="M19,4 C18,2 20,1 21,2" fill="none" stroke={color} strokeWidth="1" strokeLinecap="round"/>
      <path d="M17,5 C15,4 14,5 15,7" fill="none" stroke={color} strokeWidth="0.8" opacity="0.7"/>
      <path d="M18,7 C16,7 15,8 16,9" fill="none" stroke={color} strokeWidth="0.8" opacity="0.7"/>
      <path d="M18,13 C20,14 21,15 20,16 L21,16.5" fill="none" stroke={color} strokeWidth="1" strokeLinecap="round"/>
      <path d="M16,22 C18,23 19,24 18,25 L19,25.5" fill="none" stroke={color} strokeWidth="1" strokeLinecap="round"/>
      <path d="M16,24 C15,23 15,22 16,21" fill="none" stroke={color} strokeWidth="0.6" opacity="0.5"/>
    </g>
  );
}

function DragonSymbol({ value, size }) {
  const s = size === 'lg' ? 36 : size === 'md' ? 28 : 18;
  const colors = { Red: '#C5302B', Green: '#2E7D43', White: '#5A6E7A' };
  const color = colors[value] || '#2C3E50';

  if (value === 'White') {
    return (
      <svg width={s} height={s} viewBox="0 0 32 32">
        <rect x="4" y="4" width="24" height="24" rx="3" fill="none" stroke="#1E6FA8" strokeWidth="1.8"/>
        <rect x="7" y="7" width="18" height="18" rx="2" fill="none" stroke="#1E6FA8" strokeWidth="0.8" opacity="0.5"/>
        <g transform="translate(16,16) scale(0.7) translate(-16,-16)">
          <DragonPaths color="#7A8FA0"/>
        </g>
      </svg>
    );
  }

  return (
    <svg width={s} height={s} viewBox="0 0 32 32">
      <DragonPaths color={color}/>
    </svg>
  );
}

function FlowerSymbol({ value, size }) {
  const s = size === 'lg' ? 36 : size === 'md' ? 28 : 18;

  if (value === 1) {
    // Tulip — pink
    return (
      <svg width={s} height={s} viewBox="0 0 32 32">
        <path d="M16,24 L16,14" stroke="#2E7D43" strokeWidth="1.5"/>
        <path d="M13,20 C11,18 12,16 14,17" stroke="#2E7D43" strokeWidth="1" fill="none"/>
        <path d="M19,21 C21,19 20,17 18,18" stroke="#2E7D43" strokeWidth="1" fill="none"/>
        <path d="M12,14 C12,8 16,5 16,5 C16,5 20,8 20,14 C20,16 18,16 16,15 C14,16 12,16 12,14Z" fill="#C95E83"/>
        <path d="M14,13 C14,9 16,7 16,7 C16,7 18,9 18,13 C18,14.5 17,14.5 16,14 C15,14.5 14,14.5 14,13Z" fill="#E87AA4" opacity="0.7"/>
      </svg>
    );
  }

  if (value === 2) {
    // Chrysanthemum — blue
    return (
      <svg width={s} height={s} viewBox="0 0 32 32">
        <path d="M16,26 L16,16" stroke="#2E7D43" strokeWidth="1.5"/>
        <path d="M14,22 C12,20 11,18 13,19" stroke="#2E7D43" strokeWidth="0.8" fill="none"/>
        {[0,30,60,90,120,150,180,210,240,270,300,330].map(deg => {
          const rad = (deg * Math.PI) / 180;
          const cx = 16 + Math.cos(rad) * 5.5;
          const cy = 13 + Math.sin(rad) * 5.5;
          return <ellipse key={deg} cx={cx} cy={cy} rx="1.8" ry="4.2"
            transform={`rotate(${deg},${cx},${cy})`} fill="#1E6FA8" opacity="0.85"/>;
        })}
        {[15,75,135,195,255,315].map(deg => {
          const rad = (deg * Math.PI) / 180;
          const cx = 16 + Math.cos(rad) * 3;
          const cy = 13 + Math.sin(rad) * 3;
          return <ellipse key={deg} cx={cx} cy={cy} rx="1.3" ry="3"
            transform={`rotate(${deg},${cx},${cy})`} fill="#4A9FD4" opacity="0.7"/>;
        })}
        <circle cx="16" cy="13" r="2" fill="#D98A3D"/>
      </svg>
    );
  }

  if (value === 3) {
    // Orchid — orange/amber
    return (
      <svg width={s} height={s} viewBox="0 0 32 32">
        <path d="M16,27 C16,27 15,20 16,16" stroke="#2E7D43" strokeWidth="1.5"/>
        <path d="M12,25 C10,22 11,19 14,18" stroke="#2E7D43" strokeWidth="1" fill="none"/>
        <path d="M20,24 C22,21 21,18 18,17" stroke="#2E7D43" strokeWidth="1" fill="none"/>
        <ellipse cx="16" cy="10" rx="3" ry="5" fill="#D98A3D" opacity="0.85"/>
        <ellipse cx="11" cy="12" rx="2.5" ry="4" transform="rotate(-30,11,12)" fill="#D98A3D" opacity="0.8"/>
        <ellipse cx="21" cy="12" rx="2.5" ry="4" transform="rotate(30,21,12)" fill="#D98A3D" opacity="0.8"/>
        <ellipse cx="13" cy="16" rx="2" ry="3" transform="rotate(-15,13,16)" fill="#E8A54D" opacity="0.6"/>
        <ellipse cx="19" cy="16" rx="2" ry="3" transform="rotate(15,19,16)" fill="#E8A54D" opacity="0.6"/>
        <circle cx="16" cy="12" r="1.8" fill="#C5302B"/>
        <circle cx="16" cy="12" r="0.8" fill="#D98A3D"/>
      </svg>
    );
  }

  // value === 4: Lotus — green
  return (
    <svg width={s} height={s} viewBox="0 0 32 32">
      <path d="M16,27 L16,18" stroke="#2E7D43" strokeWidth="1.5"/>
      <ellipse cx="16" cy="14" rx="3.5" ry="6" fill="#2E7D43" opacity="0.85"/>
      <ellipse cx="11" cy="15" rx="3" ry="5" transform="rotate(-20,11,15)" fill="#2E7D43" opacity="0.7"/>
      <ellipse cx="21" cy="15" rx="3" ry="5" transform="rotate(20,21,15)" fill="#2E7D43" opacity="0.7"/>
      <ellipse cx="8" cy="17" rx="2.5" ry="4" transform="rotate(-40,8,17)" fill="#5FA04F" opacity="0.5"/>
      <ellipse cx="24" cy="17" rx="2.5" ry="4" transform="rotate(40,24,17)" fill="#5FA04F" opacity="0.5"/>
      <ellipse cx="16" cy="13" rx="2" ry="4" fill="#C95E83"/>
      <ellipse cx="14" cy="14" rx="1.5" ry="3" transform="rotate(-10,14,14)" fill="#C95E83" opacity="0.7"/>
      <ellipse cx="18" cy="14" rx="1.5" ry="3" transform="rotate(10,18,14)" fill="#C95E83" opacity="0.7"/>
      <circle cx="16" cy="12" r="1.2" fill="#D98A3D"/>
    </svg>
  );
}

function JokerSymbol({ size }) {
  const s = size === 'lg' ? 36 : size === 'md' ? 28 : 18;
  // Peony: overlapping ellipses in pink/orange
  const petalAngles = [0, 45, 90, 135, 180, 225, 270, 315];
  return (
    <svg width={s} height={s} viewBox="0 0 32 32">
      {/* Peony petals */}
      {petalAngles.map((deg, i) => {
        const rad = (deg * Math.PI) / 180;
        const cx = 19 + Math.cos(rad) * 5;
        const cy = 22 + Math.sin(rad) * 4;
        const c = ['#C95E83', '#1E6FA8', '#D98A3D', '#2E7D43'][i % 4];
        return <ellipse key={i} cx={cx} cy={cy} rx="4" ry="5.5" transform={`rotate(${deg},${cx},${cy})`} fill={c} opacity="0.85"/>;
      })}
      <circle cx="19" cy="22" r="3" fill="white"/>
      {/* JOKER label */}
      <text x="16" y="10" textAnchor="middle" fontSize="7" fontWeight="800" fontFamily="sans-serif" fill="#C95E83">
        JOKER
      </text>
    </svg>
  );
}

// ─── Tile Back ───────────────────────────────────────────────────────────────

function TileBack({ size }) {
  const dims = {
    sm: { w: 32, h: 42 },
    md: { w: 46, h: 60 },
    lg: { w: 58, h: 76 },
  };
  const { w, h } = dims[size] || dims.md;
  return (
    <div
      className="flex items-center justify-center"
      style={{
        width: w, height: h,
        borderRadius: 7,
        background: 'linear-gradient(150deg, #4A6340 0%, #34472E 55%, #46603C 100%)',
        border: '1px solid rgba(251,247,239,0.2)',
        boxShadow: '0 3px 7px rgba(60,82,54,0.25)',
      }}
    >
      <div style={{
        width: w - 8, height: h - 8,
        border: '1px solid rgba(251,247,239,0.22)',
        borderRadius: 4,
        backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(251,247,239,0.05) 3px, rgba(251,247,239,0.05) 6px)',
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
 * @param {boolean} props.winning - tile is part of winning hand (mint glow)
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
    sm: { w: 32, h: 42, textSize: '8px', numSize: '11px', pad: 2 },
    md: { w: 46, h: 60, textSize: '11px', numSize: '14px', pad: 3 },
    lg: { w: 58, h: 76, textSize: '12px', numSize: '16px', pad: 4 },
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

  const suitLabel = {
    [SUITS.BAM]: 'B',
    [SUITS.CRAK]: 'C',
    [SUITS.DOT]: 'D',
    [SUITS.WIND]: '',
    [SUITS.DRAGON]: '',
    [SUITS.FLOWER]: 'F',
    [SUITS.JOKER]: '',
  }[tile.suit] || '';

  const suitLabelColor = {
    [SUITS.BAM]: '#2E7D43',
    [SUITS.CRAK]: '#C5302B',
    [SUITS.DOT]: '#1E6FA8',
    [SUITS.FLOWER]: '#C95E83',
  }[tile.suit] || '#2C3E50';

  const tileStyle = {
    width: d.w,
    height: d.h,
    background: 'linear-gradient(160deg, #ffffff 0%, #fcfaf5 70%, #f6f1e8 100%)',
    borderRadius: 7,
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
      boxShadow: '0 12px 24px rgba(60,82,54,0.28), 0 0 0 2px rgba(95,125,79,0.6)',
    } : winning ? {
      boxShadow: '0 6px 16px rgba(95,125,79,0.45), 0 0 0 2px rgba(95,125,79,0.95)',
    } : {
      boxShadow: '0 4px 10px rgba(60,82,54,0.16), 0 1px 2px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9)',
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
          color: suitLabelColor, fontFamily: 'Nunito, sans-serif',
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
          fontSize: '7px', fontWeight: '700', color: suitLabelColor,
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
