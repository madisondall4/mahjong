import React from 'react';
import { SUITS } from '../data/tiles.js';

// ─── SVG Suit Symbols ───────────────────────────────────────────────────────

function BamSymbol({ value, size }) {
  const s = size === 'lg' ? 32 : size === 'md' ? 22 : 14;

  if (value === 1) {
    // Stylized peacock/bird silhouette
    return (
      <svg width={s} height={s} viewBox="0 0 32 32">
        {/* Body */}
        <ellipse cx="16" cy="20" rx="6" ry="5" fill="#2B3A2A"/>
        {/* Head */}
        <circle cx="22" cy="13" r="3.5" fill="#2B3A2A"/>
        {/* Beak */}
        <polygon points="25,12 29,13 25,14" fill="#A4D65E"/>
        {/* Eye */}
        <circle cx="23" cy="12.5" r="1" fill="white"/>
        {/* Tail fan */}
        <ellipse cx="10" cy="18" rx="5" ry="3" transform="rotate(-30,10,18)" fill="#A4D65E" opacity="0.85"/>
        <ellipse cx="9" cy="22" rx="5" ry="2.5" transform="rotate(10,9,22)" fill="#A4D65E" opacity="0.7"/>
        <ellipse cx="11" cy="14" rx="4.5" ry="2.5" transform="rotate(-60,11,14)" fill="#A4D65E" opacity="0.6"/>
      </svg>
    );
  }

  // Segmented bamboo stalks
  function Stalk({ x, segments }) {
    const segH = 6;
    const segW = 5;
    const gap = 1;
    const totalH = segments * (segH + gap) - gap;
    const startY = (32 - totalH) / 2;
    return (
      <g>
        {Array.from({ length: segments }).map((_, i) => {
          const y = startY + i * (segH + gap);
          return (
            <g key={i}>
              <rect x={x - segW / 2} y={y} width={segW} height={segH} rx="2.5" fill="#A4D65E"/>
              {i < segments - 1 && (
                <rect x={x - segW / 2 - 0.5} y={y + segH} width={segW + 1} height={gap} rx="0.5" fill="#2B3A2A" opacity="0.6"/>
              )}
            </g>
          );
        })}
      </g>
    );
  }

  const layouts = {
    2: [{ x: 12, segs: 4 }, { x: 20, segs: 4 }],
    3: [{ x: 9,  segs: 4 }, { x: 16, segs: 4 }, { x: 23, segs: 4 }],
    4: [{ x: 12, segs: 5 }, { x: 20, segs: 5 }],
    5: [{ x: 9,  segs: 4 }, { x: 16, segs: 5 }, { x: 23, segs: 4 }],
    6: [{ x: 9,  segs: 5 }, { x: 16, segs: 5 }, { x: 23, segs: 5 }],
    7: [{ x: 9,  segs: 5 }, { x: 16, segs: 6 }, { x: 23, segs: 5 }],
    8: [{ x: 9,  segs: 6 }, { x: 16, segs: 6 }, { x: 23, segs: 6 }],
    9: [{ x: 8,  segs: 5 }, { x: 14, segs: 6 }, { x: 20, segs: 5 }, { x: 26, segs: 4 }],
  };

  const stalks = layouts[value] || layouts[2];
  return (
    <svg width={s} height={s} viewBox="0 0 32 32">
      {stalks.map((st, i) => <Stalk key={i} x={st.x} segments={st.segs}/>)}
    </svg>
  );
}

function CrakSymbol({ value, size }) {
  const s = size === 'lg' ? 32 : size === 'md' ? 22 : 14;
  const chars = ['一','二','三','四','五','六','七','八','九'];
  const ch = chars[value - 1] || String(value);
  const numSize = size === 'sm' ? '13' : '19';
  const wanSize = size === 'sm' ? '7' : '10';
  const numY = size === 'sm' ? '14' : '17';
  const wanY = size === 'sm' ? '22' : '27';
  return (
    <svg width={s} height={s} viewBox="0 0 32 32">
      <text x="16" y={numY} textAnchor="middle" fontSize={numSize} fontWeight="700" fontFamily="serif" fill="#5E8C3E">
        {ch}
      </text>
      <text x="16" y={wanY} textAnchor="middle" fontSize={wanSize} fontWeight="600" fontFamily="serif" fill="#5E8C3E">
        萬
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
  const isOdd = value % 2 === 1;
  const outerColor = isOdd ? '#7FB3A4' : '#2B3A2A';
  const dots = (dotPositions[value] || []).map(([cx, cy], i) => (
    <g key={i}>
      <circle cx={cx} cy={cy} r="4" fill={outerColor}/>
      <circle cx={cx} cy={cy} r="2" fill="white"/>
    </g>
  ));
  return <svg width={s} height={s} viewBox="0 0 32 32">{dots}</svg>;
}

function WindSymbol({ value, size }) {
  const s = size === 'lg' ? 32 : size === 'md' ? 22 : 14;
  const chars = { East: '東', South: '南', West: '西', North: '北' };
  const abbr = { East: 'EAST', South: 'SOUTH', West: 'WEST', North: 'NORTH' };
  const chSize = size === 'sm' ? '14' : '20';
  const chY = size === 'sm' ? '15' : '19';
  const labelSize = size === 'sm' ? '5' : '7';
  const labelY = size === 'sm' ? '22' : '28';
  return (
    <svg width={s} height={s} viewBox="0 0 32 32">
      <text x="16" y={chY} textAnchor="middle" fontSize={chSize} fontWeight="700" fontFamily="serif" fill="#2B3A2A">
        {chars[value] || value}
      </text>
      {size !== 'sm' && (
        <text x="16" y={labelY} textAnchor="middle" fontSize={labelSize} fontWeight="600" fontFamily="sans-serif" fill="#5E8C3E">
          {abbr[value] || value}
        </text>
      )}
    </svg>
  );
}

function DragonSymbol({ value, size }) {
  const s = size === 'lg' ? 32 : size === 'md' ? 22 : 14;

  if (value === 'White') {
    // Blank soap tile look — just a rounded rect outline
    return (
      <svg width={s} height={s} viewBox="0 0 32 32">
        <rect x="6" y="6" width="20" height="20" rx="4" fill="none" stroke="#2B3A2A" strokeWidth="2"/>
        <text x="16" y="21" textAnchor="middle" fontSize="10" fontWeight="600" fontFamily="serif" fill="#2B3A2A">白</text>
      </svg>
    );
  }

  if (value === 'Red') {
    return (
      <svg width={s} height={s} viewBox="0 0 32 32">
        {/* Diamond border */}
        <polygon points="16,3 29,16 16,29 3,16" fill="none" stroke="#5E8C3E" strokeWidth="1.5"/>
        <text x="16" y="21" textAnchor="middle" fontSize="15" fontWeight="700" fontFamily="serif" fill="#5E8C3E">
          中
        </text>
      </svg>
    );
  }

  // Green dragon — 發
  return (
    <svg width={s} height={s} viewBox="0 0 32 32">
      <polygon points="16,3 29,16 16,29 3,16" fill="none" stroke="#A4D65E" strokeWidth="1.5"/>
      <text x="16" y="21" textAnchor="middle" fontSize="15" fontWeight="700" fontFamily="serif" fill="#A4D65E">
        發
      </text>
    </svg>
  );
}

function FlowerSymbol({ value, size }) {
  const s = size === 'lg' ? 32 : size === 'md' ? 22 : 14;
  const colors = ['#5E8C3E', '#E2A03F', '#A4D65E', '#7FB3A4'];
  const color = colors[(value - 1) % 4];

  // Outer ring: 8 petals
  const outerPetals = Array.from({ length: 8 }).map((_, i) => {
    const deg = i * 45;
    const rad = (deg * Math.PI) / 180;
    const cx = 16 + Math.cos(rad) * 7;
    const cy = 16 + Math.sin(rad) * 7;
    return <ellipse key={`o${i}`} cx={cx} cy={cy} rx="3.5" ry="5" transform={`rotate(${deg},${cx},${cy})`} fill={color} opacity="0.9"/>;
  });

  // Inner ring: 6 petals, lighter
  const innerPetals = Array.from({ length: 6 }).map((_, i) => {
    const deg = i * 60 + 22;
    const rad = (deg * Math.PI) / 180;
    const cx = 16 + Math.cos(rad) * 4;
    const cy = 16 + Math.sin(rad) * 4;
    return <ellipse key={`i${i}`} cx={cx} cy={cy} rx="2.5" ry="3.5" transform={`rotate(${deg},${cx},${cy})`} fill={color} opacity="0.6"/>;
  });

  return (
    <svg width={s} height={s} viewBox="0 0 32 32">
      {outerPetals}
      {innerPetals}
      <circle cx="16" cy="16" r="3" fill="white"/>
      <text x="16" y="19.5" textAnchor="middle" fontSize="5.5" fontWeight="700" fill="#2B3A2A">{value}</text>
    </svg>
  );
}

function JokerSymbol({ size }) {
  const s = size === 'lg' ? 32 : size === 'md' ? 22 : 14;
  // Peony: overlapping ellipses in pink/orange
  const petalAngles = [0, 45, 90, 135, 180, 225, 270, 315];
  return (
    <svg width={s} height={s} viewBox="0 0 32 32">
      {/* Peony petals */}
      {petalAngles.map((deg, i) => {
        const rad = (deg * Math.PI) / 180;
        const cx = 19 + Math.cos(rad) * 5;
        const cy = 22 + Math.sin(rad) * 4;
        const c = i % 2 === 0 ? '#5E8C3E' : '#E2A03F';
        return <ellipse key={i} cx={cx} cy={cy} rx="4" ry="5.5" transform={`rotate(${deg},${cx},${cy})`} fill={c} opacity="0.85"/>;
      })}
      <circle cx="19" cy="22" r="3" fill="white"/>
      {/* JOKER label */}
      <text x="16" y="10" textAnchor="middle" fontSize="7" fontWeight="800" fontFamily="sans-serif" fill="#5E8C3E">
        JOKER
      </text>
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
        background: 'linear-gradient(135deg, #2B3A2A 0%, #1e1830 50%, #2B3A2A 100%)',
        border: '1px solid #5E8C3E40',
        boxShadow: '1px 1px 3px rgba(0,0,0,0.4)',
      }}
    >
      <div style={{
        width: w - 8, height: h - 8,
        border: '1px solid rgba(94,140,62,0.25)',
        borderRadius: 2,
        backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(94,140,62,0.04) 3px, rgba(94,140,62,0.04) 6px)',
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
    [SUITS.BAM]: '#A4D65E',
    [SUITS.CRAK]: '#5E8C3E',
    [SUITS.DOT]: '#7FB3A4',
    [SUITS.FLOWER]: '#E2A03F',
  }[tile.suit] || '#2B3A2A';

  const tileStyle = {
    width: d.w,
    height: d.h,
    background: 'linear-gradient(145deg, #ffffff 0%, #fbfdf6 60%, #f2f7ea 100%)',
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
      boxShadow: '2px 2px 0 #dce8cc, 3px 3px 0 #c8d8b0, 4px 4px 8px rgba(0,0,0,0.2), 0 0 20px rgba(94,140,62,0.7)',
    } : winning ? {
      boxShadow: '0 0 16px rgba(164,214,94,0.8), 0 0 4px rgba(164,214,94,1)',
    } : {
      boxShadow: '2px 2px 0 #dce8cc, 3px 3px 0 #c8d8b0, 4px 4px 6px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.9)',
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
