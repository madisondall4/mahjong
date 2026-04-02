import React from 'react';

export default function WallCounter({ remaining, total = 160 }) {
  const pct = total > 0 ? remaining / total : 0;
  const color = pct > 0.5 ? '#27ae60' : pct > 0.25 ? '#f39c12' : '#c0392b';

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 3,
      padding: '4px 10px',
      background: 'rgba(13,31,23,0.7)',
      borderRadius: 8,
      border: '1px solid rgba(201,168,76,0.2)',
    }}>
      <div style={{
        fontSize: 10,
        color: 'rgba(247,242,232,0.6)',
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
        background: 'rgba(255,255,255,0.1)',
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
