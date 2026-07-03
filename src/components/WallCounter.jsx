import React from 'react';

export default function WallCounter({ remaining, total = 160 }) {
  const pct = total > 0 ? remaining / total : 0;
  const color = pct > 0.5 ? 'var(--matcha)' : pct > 0.25 ? 'var(--rose)' : '#C5302B';

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 3,
      padding: '4px 10px',
      background: 'rgba(var(--paper-rgb),0.85)',
      borderRadius: 10,
      border: '1px solid rgba(var(--matcha-rgb),0.2)',
    }}>
      <div style={{
        fontSize: 10,
        color: 'var(--sky)',
        fontFamily: 'Nunito',
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
      }}>Wall</div>

      <div style={{
        fontSize: 18,
        fontWeight: 700,
        fontFamily: 'Nunito',
        color,
        lineHeight: 1,
      }}>
        {remaining}
      </div>

      {/* Progress bar */}
      <div style={{
        width: 50, height: 4,
        background: 'rgba(var(--shadow-rgb),0.14)',
        borderRadius: 2,
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${pct * 100}%`,
          background: color,
          borderRadius: 2,
          transition: 'width 0.3s ease',
        }}/>
      </div>
    </div>
  );
}
