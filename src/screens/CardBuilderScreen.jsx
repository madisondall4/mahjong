import React, { useState } from 'react';
import { compileHand } from '../logic/cardCompiler.js';
import { getCustomCardSource, saveCustomCardSource } from '../logic/customCard.js';
import { setActiveCardKey } from '../data/card.js';
import { HandExample } from '../components/HandTiles.jsx';

const EMPTY_ROW = { pattern: '', points: 25, closed: false, anyRun: false };

const inputStyle = {
  padding: '8px 10px', borderRadius: 8,
  border: '1px solid rgba(var(--matcha-rgb),0.3)',
  background: 'rgba(var(--paper-rgb),0.9)',
  color: 'var(--ink)', fontSize: 13,
  fontFamily: 'Nunito, sans-serif', fontWeight: 600,
  outline: 'none', minWidth: 0,
};

function HandRow({ row, index, onChange, onRemove }) {
  const compiled = row.pattern.trim()
    ? compileHand(row.pattern, { points: row.points, closed: row.closed, anyRun: row.anyRun, id: index + 1, category: 'My Card' })
    : null;

  return (
    <div style={{
      background: 'rgba(var(--paper-rgb),0.85)',
      border: `1.5px solid ${compiled && !compiled.ok ? 'rgba(200,80,80,0.5)' : 'rgba(var(--matcha-rgb),0.25)'}`,
      borderRadius: 12, padding: '10px 12px',
      display: 'flex', flexDirection: 'column', gap: 8,
    }}>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <span style={{ fontSize: 11, fontFamily: 'Nunito', fontWeight: 800, color: 'rgba(var(--ink-rgb),0.4)', flexShrink: 0, width: 20 }}>
          {index + 1}.
        </span>
        <input
          value={row.pattern}
          placeholder="e.g. FF 2222 4444a 66b 88b"
          onChange={e => onChange({ ...row, pattern: e.target.value })}
          style={{ ...inputStyle, flex: 1, fontFamily: 'ui-monospace, monospace', letterSpacing: '0.03em' }}
          spellCheck={false}
          autoCapitalize="characters"
        />
        <button
          onClick={onRemove}
          aria-label="Remove hand"
          style={{ background: 'none', border: 'none', color: 'var(--rose)', fontSize: 18, cursor: 'pointer', padding: 2, flexShrink: 0 }}
        >
          ×
        </button>
      </div>

      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontFamily: 'Nunito', fontWeight: 700, color: 'rgba(var(--ink-rgb),0.65)' }}>
          Points
          <input
            type="number" min="10" max="100" step="5"
            value={row.points}
            onChange={e => onChange({ ...row, points: Number(e.target.value) })}
            style={{ ...inputStyle, width: 62, padding: '5px 8px' }}
          />
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontFamily: 'Nunito', fontWeight: 700, color: 'rgba(var(--ink-rgb),0.65)', cursor: 'pointer' }}>
          <input type="checkbox" checked={row.closed} onChange={e => onChange({ ...row, closed: e.target.checked })}/>
          Closed
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontFamily: 'Nunito', fontWeight: 700, color: 'rgba(var(--ink-rgb),0.65)', cursor: 'pointer' }}>
          <input type="checkbox" checked={row.anyRun} onChange={e => onChange({ ...row, anyRun: e.target.checked })}/>
          Numbers slide (runs)
        </label>
      </div>

      {compiled && !compiled.ok && (
        <div style={{ fontSize: 12, fontFamily: 'Nunito', fontWeight: 700, color: '#B04040' }}>
          ⚠ {compiled.error}
        </div>
      )}
      {compiled && compiled.ok && (
        <div style={{
          background: 'rgba(255,255,255,0.6)', borderRadius: 8,
          border: '1px solid rgba(var(--matcha-rgb),0.15)', padding: '8px 8px 6px',
        }}>
          <HandExample hand={compiled.def}/>
          <div style={{ fontSize: 10, fontFamily: 'Nunito', color: 'rgba(var(--ink-rgb),0.45)', marginTop: 5 }}>
            {compiled.def.variants().length} arrangement{compiled.def.variants().length !== 1 ? 's' : ''}
            {row.anyRun ? ' (numbers slide)' : ''}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * "My Card" builder — players transcribe a card THEY OWN for private play.
 * Ships empty; everything stays in localStorage on this device.
 */
export default function CardBuilderScreen({ onClose }) {
  const saved = getCustomCardSource();
  const [name, setName] = useState(saved?.name || 'My Card');
  const [rows, setRows] = useState(saved?.hands?.length ? saved.hands : [{ ...EMPTY_ROW }]);
  const [showHelp, setShowHelp] = useState(!saved);
  const [savedFlash, setSavedFlash] = useState(false);

  const validCount = rows.filter(r =>
    r.pattern.trim() && compileHand(r.pattern, r).ok
  ).length;

  function save(activate) {
    const hands = rows.filter(r => r.pattern.trim());
    saveCustomCardSource({ name: name.trim() || 'My Card', hands });
    if (activate) setActiveCardKey('custom');
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1500);
    if (activate) onClose();
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg)', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '14px 16px 12px',
        background: 'rgba(var(--paper-rgb),0.9)', borderBottom: '1px solid rgba(var(--matcha-rgb),0.18)',
        flexShrink: 0,
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontFamily: 'Playfair Display, serif', color: 'var(--matcha-deep)', fontWeight: 700 }}>
            Build My Card
          </h1>
          <p style={{ margin: 0, fontSize: 11, color: 'rgba(var(--ink-rgb),0.5)', fontFamily: 'Nunito' }}>
            {validCount} hand{validCount !== 1 ? 's' : ''} ready · stays on this device
          </p>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'rgba(var(--matcha-rgb),0.1)', border: '1px solid rgba(var(--matcha-rgb),0.3)',
            borderRadius: 999, padding: '7px 16px',
            color: 'var(--matcha)', fontSize: 13, fontFamily: 'Nunito', fontWeight: 800, cursor: 'pointer',
          }}
        >
          Done
        </button>
      </div>

      <div className="no-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '14px 14px 30px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Legal framing */}
        <div style={{
          background: 'rgba(var(--sky-rgb),0.08)', border: '1px solid rgba(var(--sky-rgb),0.3)',
          borderRadius: 12, padding: '10px 12px',
          fontSize: 12, fontFamily: 'Nunito', color: 'rgba(var(--ink-rgb),0.7)', lineHeight: 1.5,
        }}>
          Enter hands from a card <strong>you own</strong> for your own practice.
          Your card is stored only on this device — never uploaded or shared.
        </div>

        {/* Card name */}
        <input
          value={name}
          maxLength={24}
          placeholder="Card name"
          onChange={e => setName(e.target.value)}
          style={{ ...inputStyle, fontSize: 15, fontWeight: 700 }}
        />

        {/* Notation help */}
        <button
          onClick={() => setShowHelp(v => !v)}
          style={{
            background: 'none', border: '1px solid rgba(var(--matcha-rgb),0.25)',
            borderRadius: 8, padding: '7px 0',
            color: 'rgba(var(--ink-rgb),0.6)', fontSize: 12.5, fontFamily: 'Nunito', fontWeight: 700, cursor: 'pointer',
          }}
        >
          {showHelp ? 'Hide notation guide' : '📖 Notation guide'}
        </button>
        {showHelp && (
          <div style={{
            background: 'rgba(var(--paper-rgb),0.85)', border: '1px solid rgba(var(--matcha-rgb),0.2)',
            borderRadius: 12, padding: '12px 14px',
            fontSize: 12, fontFamily: 'Nunito', color: 'rgba(var(--ink-rgb),0.75)', lineHeight: 1.7,
          }}>
            Groups are separated by spaces; each hand must total <strong>14 tiles</strong>.<br/>
            <code>FF</code> — flowers (any designs) · <code>2222</code> — four 2s<br/>
            <code>a b c</code> after numbers pick suits: same letter = same suit,
            different letters = <em>different</em> suits. <code>111a 222a 333b</code><br/>
            <code>123</code> / <code>2026</code> — one tile per digit (<code>0</code> = soap)<br/>
            <code>NEWS</code> — one of each wind · <code>NNN</code> — three Norths<br/>
            <code>RRR GG 00</code> — Red, Green, soap dragons ·
            <code>DDa</code> — the dragon matching suit <code>a</code><br/>
            <strong>Numbers slide</strong> = the whole line can shift up or down
            (like consecutive-run sections). <strong>Closed</strong> = self-drawn
            wins only, no exposures.
          </div>
        )}

        {/* Hand rows */}
        {rows.map((row, i) => (
          <HandRow
            key={i}
            row={row}
            index={i}
            onChange={next => setRows(rows.map((r, j) => j === i ? next : r))}
            onRemove={() => setRows(rows.length > 1 ? rows.filter((_, j) => j !== i) : [{ ...EMPTY_ROW }])}
          />
        ))}

        <button
          onClick={() => setRows([...rows, { ...EMPTY_ROW }])}
          style={{
            background: 'rgba(var(--matcha-rgb),0.08)', border: '1.5px dashed rgba(var(--matcha-rgb),0.4)',
            borderRadius: 12, padding: '12px 0',
            color: 'var(--matcha)', fontSize: 13.5, fontFamily: 'Nunito', fontWeight: 800, cursor: 'pointer',
          }}
        >
          + Add hand
        </button>

        {/* Save actions */}
        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          <button
            onClick={() => save(false)}
            disabled={validCount === 0}
            style={{
              flex: 1, padding: '13px 0', borderRadius: 12,
              border: '1.5px solid rgba(var(--matcha-rgb),0.4)',
              background: 'rgba(var(--matcha-rgb),0.06)',
              color: validCount ? 'var(--matcha)' : 'rgba(var(--ink-rgb),0.3)',
              fontSize: 14, fontWeight: 800, fontFamily: 'Nunito', cursor: validCount ? 'pointer' : 'not-allowed',
            }}
          >
            {savedFlash ? '✓ Saved' : 'Save draft'}
          </button>
          <button
            onClick={() => save(true)}
            disabled={validCount === 0}
            style={{
              flex: 2, padding: '13px 0', borderRadius: 12, border: 'none',
              background: validCount ? 'var(--matcha)' : 'rgba(var(--ink-rgb),0.1)',
              color: 'white',
              fontSize: 14, fontWeight: 800, fontFamily: 'Playfair Display, serif',
              cursor: validCount ? 'pointer' : 'not-allowed',
              boxShadow: validCount ? '0 4px 14px rgba(var(--matcha-rgb),0.35)' : 'none',
            }}
          >
            Save & play this card
          </button>
        </div>
      </div>
    </div>
  );
}
