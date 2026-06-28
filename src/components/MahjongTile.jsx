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

  // 2–9 Bam render exactly `value` segmented bamboo stalks in a countable grid.
  function Stick({ cx, cy, h, color }) {
    const w = 4.2;
    const x = cx - w / 2;
    const y = cy - h / 2;
    const n1 = y + h * 0.34;
    const n2 = y + h * 0.67;
    return (
      <g>
        {/* stalk */}
        <rect x={x} y={y} width={w} height={h} rx={w / 2} fill={color}/>
        {/* node rings (slightly wider than the stalk for the bamboo joint look) */}
        <rect x={x - 0.5} y={n1 - 0.7} width={w + 1} height={1.4} rx={0.7} fill={color}/>
        <rect x={x - 0.5} y={n2 - 0.7} width={w + 1} height={1.4} rx={0.7} fill={color}/>
        {/* shading line between nodes */}
        <line x1={cx} y1={y + 1} x2={cx} y2={n1 - 1} stroke="#1B5E32" strokeWidth="0.5" opacity="0.45"/>
        <line x1={cx} y1={n1 + 1} x2={cx} y2={n2 - 1} stroke="#1B5E32" strokeWidth="0.5" opacity="0.45"/>
        <line x1={cx} y1={n2 + 1} x2={cx} y2={y + h - 1} stroke="#1B5E32" strokeWidth="0.5" opacity="0.45"/>
        {/* glossy highlight */}
        <rect x={x + 0.7} y={y + 1} width={0.9} height={h - 2} rx={0.45} fill="white" opacity="0.4"/>
      </g>
    );
  }

  const G = '#2E7D43'; // bamboo green
  const A = '#C5302B'; // accent stalk (traditional red)
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

// Standard Chinese numerals 1–9 used on the character (萬 / "crak") suit.
const CRAK_NUMERALS = ['一', '二', '三', '四', '五', '六', '七', '八', '九'];
const CJK_SERIF = "'Noto Serif SC','Songti SC','SimSun','STSong',serif";

function CrakSymbol({ value, size }) {
  const s = size === 'lg' ? 36 : size === 'md' ? 28 : 18;
  const ch = CRAK_NUMERALS[value - 1] || String(value);
  const numSize = size === 'sm' ? '13' : '18';
  const wanSize = size === 'sm' ? '7' : '11';
  const numY = size === 'sm' ? '14' : '16';
  const wanY = size === 'sm' ? '22' : '28';
  return (
    <svg width={s} height={s} viewBox="0 0 32 32">
      {/* numeral in ink (authentic), 萬 below in red */}
      <text x="16" y={numY} textAnchor="middle" fontSize={numSize} fontWeight="700" fontFamily={CJK_SERIF} fill="#2C3E50">
        {ch}
      </text>
      <text x="16" y={wanY} textAnchor="middle" fontSize={wanSize} fontWeight="700" fontFamily={CJK_SERIF} fill="#C5302B">
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
  // 1 Dot is the large ornate flower-wheel — green petals, blue ring, red core.
  if (value === 1) {
    const petals = [0, 45, 90, 135, 180, 225, 270, 315].map(deg => {
      const rad = (deg * Math.PI) / 180;
      const px = 16 + Math.cos(rad) * 5.2;
      const py = 16 + Math.sin(rad) * 5.2;
      return <circle key={deg} cx={px} cy={py} r="1.5" fill="#2E7D43"/>;
    });
    return (
      <svg width={s} height={s} viewBox="0 0 32 32">
        <circle cx="16" cy="16" r="10" fill="#1E6FA8"/>
        <circle cx="16" cy="16" r="10" fill="none" stroke="#C5302B" strokeWidth="1"/>
        <circle cx="16" cy="16" r="8" fill="white"/>
        {petals}
        <circle cx="16" cy="16" r="3.4" fill="#C5302B"/>
        <circle cx="16" cy="16" r="1.5" fill="white"/>
      </svg>
    );
  }
  // 2–9 Dots: ringed "wheel" circles (the circles suit) — blue ring, white gap, red pip.
  const dots = (dotPositions[value] || []).map(([cx, cy], i) => (
    <g key={i}>
      <circle cx={cx} cy={cy} r="3.7" fill="#1E6FA8"/>
      <circle cx={cx} cy={cy} r="2.6" fill="white"/>
      <circle cx={cx} cy={cy} r="1.7" fill="#1E6FA8"/>
      <circle cx={cx} cy={cy} r="0.85" fill="#C5302B"/>
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

function DragonPaths({ color, light }) {
  // Iconic vertical "dragon medallion" pose: profile head crowned with horns at
  // the top, two clawed front arms spreading outward, a serpentine coiling body
  // with a dorsal fin, hind leg, and a flame-tipped tail.
  return (
    <g strokeLinejoin="round" strokeLinecap="round">
      {/* ── Coiling serpent body (neck → tail) ── */}
      <path d="M16,9.5 C19.4,12 19.6,16 16.4,18.2 C13.2,20.4 13,23.4 16,25.4 C17.6,26.5 17.2,28 15.4,29"
        fill="none" stroke={color} strokeWidth="3"/>
      {/* belly scale ticks */}
      <path d="M17,11.4 q1.4,1.3 1.5,2.9 M15.6,18.8 q-1.5,1.1 -1.6,2.7 M16.6,25 q1.2,0.9 1.2,2.2"
        fill="none" stroke={light} strokeWidth="0.6" opacity="0.6"/>
      {/* dorsal fin spikes along the back of each curve */}
      <path d="M18.8,11.4 l1.9,-0.7 M19,15 l2,0.3 M13.4,19.2 l-2,-0.4 M13.7,23.6 l-1.8,0.9"
        fill="none" stroke={color} strokeWidth="1.1"/>

      {/* ── Two front arms spreading outward below the head ── */}
      <path d="M14.2,9.8 C11,10.2 8.6,11.8 7.4,14" fill="none" stroke={color} strokeWidth="1.7"/>
      <path d="M7.4,14 l-0.5,1.4 M7.4,14 l1.4,0.5 M7.4,14 l-1.3,0.6" fill="none" stroke={color} strokeWidth="0.85"/>
      <path d="M17.8,9.8 C21,10.2 23.4,11.8 24.6,14" fill="none" stroke={color} strokeWidth="1.7"/>
      <path d="M24.6,14 l0.5,1.4 M24.6,14 l-1.4,0.5 M24.6,14 l1.3,0.6" fill="none" stroke={color} strokeWidth="0.85"/>

      {/* ── Hind leg from the lower coil ── */}
      <path d="M14.6,24.2 C12.2,24.8 10.8,25.8 10.4,27.4" fill="none" stroke={color} strokeWidth="1.4"/>
      <path d="M10.4,27.4 l-0.4,1.3 M10.4,27.4 l1.3,0.4 M10.4,27.4 l-1.1,0.9" fill="none" stroke={color} strokeWidth="0.75"/>

      {/* ── Flame-tipped tail ── */}
      <path d="M15.4,29 C13.8,30.4 12.4,29.4 13,27.9 M15.4,29 C16.9,30.5 18.4,29.6 17.7,27.9"
        fill="none" stroke={color} strokeWidth="0.95"/>

      {/* ── Head (profile, crowned, facing up toward the pearl) ── */}
      <path d="M13.4,7.2 C13.2,4.2 14.8,2.4 17,2.7 C19.2,3 20.3,5 19.2,6.9 C18.3,8.3 15,8.6 13.4,7.2 Z"
        fill={color}/>
      {/* open snout/jaw reaching toward the pearl */}
      <path d="M19,5 C20.9,4.3 22.3,4.8 22.6,5.9 M19.3,6.7 C20.8,6.7 21.9,7.2 22.1,8"
        fill="none" stroke={color} strokeWidth="1.1"/>
      {/* eye */}
      <circle cx="16" cy="5.2" r="1.15" fill="white"/>
      <circle cx="16.4" cy="5.2" r="0.55" fill="#1a1a1a"/>
      {/* two horns sweeping back over the crown */}
      <path d="M14.6,3.2 C13.4,1.2 14.6,0.5 15.7,1 M13.7,4.2 C11.9,3.1 11.8,1.7 13.1,1.5"
        fill="none" stroke={color} strokeWidth="1"/>
      {/* mane tufts flowing down the neck */}
      <path d="M12.8,7.6 c-1.9,0.4 -2.3,1.9 -1.2,3 M13.4,9.6 c-1.9,0.5 -2.2,2 -1,3"
        fill="none" stroke={color} strokeWidth="0.85" opacity="0.9"/>
      {/* whisker */}
      <path d="M21.8,8 C23.8,9 24.4,10.6 23.3,12" fill="none" stroke={color} strokeWidth="0.7" opacity="0.85"/>

      {/* ── Flaming pearl by the jaws ── */}
      <path d="M24.8,2.6 C23.6,3.6 23.6,5.1 24.8,6 C26,5.1 26,3.6 24.8,2.6 Z" fill={color} opacity="0.3"/>
      <circle cx="24.8" cy="4.7" r="1.6" fill={color}/>
      <circle cx="24.3" cy="4.2" r="0.6" fill="white"/>
    </g>
  );
}

function DragonSymbol({ value, size }) {
  const s = size === 'lg' ? 36 : size === 'md' ? 28 : 18;
  const colors = { Red: '#C5302B', Green: '#2E7D43', White: '#5A6E7A' };
  const lights = { Red: '#F2A39E', Green: '#8FC79E', White: '#C3D0D8' };
  const color = colors[value] || '#2C3E50';
  const light = lights[value] || '#cccccc';

  if (value === 'White') {
    // White dragon ("soap") — the classic blue double frame with a bold B.
    return (
      <svg width={s} height={s} viewBox="0 0 32 32">
        <rect x="4.5" y="4.5" width="23" height="23" rx="3.5" fill="none" stroke="#1E6FA8" strokeWidth="2"/>
        <rect x="7.5" y="7.5" width="17" height="17" rx="2.5" fill="none" stroke="#1E6FA8" strokeWidth="1" opacity="0.55"/>
        <text x="16" y="22" textAnchor="middle" fontSize="15" fontWeight="800" fontFamily="Georgia, serif" fill="#1E6FA8">
          B
        </text>
      </svg>
    );
  }

  return (
    <svg width={s} height={s} viewBox="0 0 32 32">
      <DragonPaths color={color} light={light}/>
    </svg>
  );
}

// The four "flowers" map to the four seasons, each a distinct bloom & color
// so they read apart instantly: Spring cherry (pink), Summer aster (blue),
// Autumn chrysanthemum (amber), Winter lily (plum).
const FLOWER_SEASONS = { 1: 'SPRING', 2: 'SUMMER', 3: 'AUTUMN', 4: 'WINTER' };
const FLOWER_HUES = { 1: '#C95E83', 2: '#1E6FA8', 3: '#D98A3D', 4: '#8E5BA6' };

function FlowerSymbol({ value, size }) {
  const s = size === 'lg' ? 36 : size === 'md' ? 28 : 18;
  const cy = 12; // bloom center, leaving room for the season label

  const SeasonLabel = () => size === 'sm' ? null : (
    <text x="16" y="30" textAnchor="middle" fontSize="4.5" fontWeight="800"
      fontFamily="Nunito, sans-serif" letterSpacing="0.4" fill={FLOWER_HUES[value]}>
      {FLOWER_SEASONS[value]}
    </text>
  );

  // F1 — Spring cherry blossom (pink): five rounded notched petals + stamens.
  if (value === 1) {
    const petal = `M16,${cy} C12.9,${cy - 1.4} 12.9,${cy - 6.6} 15.1,${cy - 8.8} C15.5,${cy - 7.8} 16.5,${cy - 7.8} 16.9,${cy - 8.8} C19.1,${cy - 6.6} 19.1,${cy - 1.4} 16,${cy} Z`;
    return (
      <svg width={s} height={s} viewBox="0 0 32 32">
        {[0, 72, 144, 216, 288].map(deg => (
          <path key={deg} d={petal} fill="#E87AA4" stroke="#C95E83" strokeWidth="0.4"
            transform={`rotate(${deg},16,${cy})`}/>
        ))}
        <circle cx="16" cy={cy} r="2.3" fill="#F2C14E"/>
        {[0, 60, 120, 180, 240, 300].map(deg => {
          const rad = (deg * Math.PI) / 180;
          return <circle key={deg} cx={16 + Math.cos(rad) * 2.3} cy={cy + Math.sin(rad) * 2.3} r="0.5" fill="#C5302B"/>;
        })}
        <SeasonLabel/>
      </svg>
    );
  }

  // F2 — Summer aster / cornflower (blue): two rings of slim petals.
  if (value === 2) {
    return (
      <svg width={s} height={s} viewBox="0 0 32 32">
        {Array.from({ length: 16 }).map((_, i) => {
          const deg = i * 22.5; const rad = (deg * Math.PI) / 180;
          const px = 16 + Math.cos(rad) * 6; const py = cy + Math.sin(rad) * 6;
          return <ellipse key={'o' + i} cx={px} cy={py} rx="1.1" ry="4" transform={`rotate(${deg + 90},${px},${py})`} fill="#1E6FA8"/>;
        })}
        {Array.from({ length: 10 }).map((_, i) => {
          const deg = i * 36 + 18; const rad = (deg * Math.PI) / 180;
          const px = 16 + Math.cos(rad) * 3.3; const py = cy + Math.sin(rad) * 3.3;
          return <ellipse key={'i' + i} cx={px} cy={py} rx="1" ry="2.6" transform={`rotate(${deg + 90},${px},${py})`} fill="#4A9FD4"/>;
        })}
        <circle cx="16" cy={cy} r="2" fill="#15486E"/>
        <circle cx="16" cy={cy} r="0.9" fill="#F2C14E"/>
        <SeasonLabel/>
      </svg>
    );
  }

  // F3 — Autumn chrysanthemum (amber): three dense layers of curved petals.
  if (value === 3) {
    const layer = (n, r, ry, rx, fill, off = 0) => Array.from({ length: n }).map((_, i) => {
      const deg = i * (360 / n) + off; const rad = (deg * Math.PI) / 180;
      const px = 16 + Math.cos(rad) * r; const py = cy + Math.sin(rad) * r;
      return <ellipse key={fill + i} cx={px} cy={py} rx={rx} ry={ry} transform={`rotate(${deg + 90},${px},${py})`} fill={fill}/>;
    });
    return (
      <svg width={s} height={s} viewBox="0 0 32 32">
        {layer(12, 6, 4.4, 1.5, '#D98A3D')}
        {layer(12, 4, 3.2, 1.3, '#E8A54D', 15)}
        {layer(8, 2, 1.9, 1, '#F2C14E')}
        <circle cx="16" cy={cy} r="1.5" fill="#B5651D"/>
        <SeasonLabel/>
      </svg>
    );
  }

  // F4 — Winter lily (plum): six pointed petals + golden stamens.
  const lilyPetal = `M16,${cy} C14.3,${cy - 3.5} 14.6,${cy - 7.5} 16,${cy - 10} C17.4,${cy - 7.5} 17.7,${cy - 3.5} 16,${cy} Z`;
  return (
    <svg width={s} height={s} viewBox="0 0 32 32">
      {[30, 90, 150, 210, 270, 330].map(deg => (
        <path key={deg} d={lilyPetal} fill="#A574C0" stroke="#8E5BA6" strokeWidth="0.35"
          transform={`rotate(${deg},16,${cy})`} opacity="0.95"/>
      ))}
      {[0, 72, 144, 216, 288].map(deg => {
        const rad = (deg * Math.PI) / 180;
        const ex = 16 + Math.cos(rad - Math.PI / 2) * 2.6;
        const ey = cy + Math.sin(rad - Math.PI / 2) * 2.6;
        return <g key={deg}>
          <line x1="16" y1={cy} x2={ex} y2={ey} stroke="#7E4F9B" strokeWidth="0.45"/>
          <circle cx={ex} cy={ey} r="0.7" fill="#F2C14E"/>
        </g>;
      })}
      <circle cx="16" cy={cy} r="1.6" fill="#5E3A78"/>
      <SeasonLabel/>
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

// Standalone suit-symbol renderer (returns the inner <svg>). Reused by the
// share-card generator so it can rasterize tile art without the DOM chrome.
export function TileSymbol({ tile, size = 'md' }) {
  switch (tile.suit) {
    case SUITS.BAM: return <BamSymbol value={tile.value} size={size}/>;
    case SUITS.CRAK: return <CrakSymbol value={tile.value} size={size}/>;
    case SUITS.DOT: return <DotSymbol value={tile.value} size={size}/>;
    case SUITS.WIND: return <WindSymbol value={tile.value} size={size}/>;
    case SUITS.DRAGON: return <DragonSymbol value={tile.value} size={size}/>;
    case SUITS.FLOWER: return <FlowerSymbol value={tile.value} size={size}/>;
    case SUITS.JOKER: return <JokerSymbol size={size}/>;
    default: return null;
  }
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

  const renderSymbol = () => <TileSymbol tile={tile} size={symbolSize}/>;

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
