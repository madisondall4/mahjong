import React, { useState } from 'react';
import MahjongTile from '../components/MahjongTile.jsx';

/**
 * Pass-and-play privacy screens.
 *
 * mode="handoff":   "Hand the device to <player>" — hides all hands until the
 *                   receiving player taps to reveal.
 * mode="call":      Neutral post-discard window — shows the discard, lets any
 *                   other player claim Mahjong on it, or play continues.
 */
const MELD_NAMES = { 3: 'Pung', 4: 'Kong', 5: 'Quint' };

export default function PassHandoffScreen({
  mode = 'handoff',
  toName,
  subtitle,
  lastDiscard = null,
  discarderName = null,
  players = [],
  discarderIdx = null,
  onReveal,
  onContinue,
  onCallMahjong, // (callerIdx) => boolean — false = invalid call
  getExposeOptions = () => [], // (callerIdx) => [{n, jokersUsed}]
  onExpose, // (callerIdx, option) => boolean
}) {
  const [choosing, setChoosing] = useState(false);
  const [caller, setCaller] = useState(null); // selected caller idx
  const [invalidFor, setInvalidFor] = useState(null);

  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(160deg, var(--matcha-deep) 0%, var(--surface-deep) 100%)',
      padding: 28, gap: 20, textAlign: 'center',
    }}>
      {mode !== 'call' && <div style={{ fontSize: 46 }}>🤝</div>}

      {mode === 'call' ? (
        <>
          <div>
            <div className="eyebrow" style={{ color: 'rgba(var(--paper-rgb),0.55)', marginBottom: 8 }}>
              {discarderName} discarded
            </div>
            {lastDiscard && (
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <MahjongTile tile={lastDiscard} size="lg"/>
              </div>
            )}
          </div>

          {!choosing ? (
            <>
              <p style={{ margin: 0, fontSize: 14, color: 'rgba(var(--paper-rgb),0.8)', fontFamily: 'Nunito', lineHeight: 1.5, maxWidth: 280 }}>
                Does this tile complete anyone&apos;s hand?
              </p>
              <button
                onClick={() => setChoosing(true)}
                style={{
                  width: '100%', maxWidth: 280, padding: '13px 0', borderRadius: 999,
                  border: '1.5px solid rgba(var(--paper-rgb),0.4)', background: 'transparent',
                  color: 'var(--paper)', fontSize: 15, fontWeight: 700,
                  fontFamily: 'Playfair Display, serif', cursor: 'pointer',
                }}
              >
                Call Mahjong!
              </button>
              <button
                onClick={onContinue}
                style={{
                  width: '100%', maxWidth: 280, padding: '15px 0', borderRadius: 999,
                  border: 'none', background: 'var(--paper)', color: 'var(--matcha-deep)',
                  fontSize: 16, fontWeight: 800, fontFamily: 'Playfair Display, serif',
                  cursor: 'pointer', boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                }}
              >
                No one — continue → {toName}
              </button>
            </>
          ) : caller === null ? (
            <>
              <p style={{ margin: 0, fontSize: 14, color: 'rgba(var(--paper-rgb),0.8)', fontFamily: 'Nunito' }}>
                Who is calling?
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%', maxWidth: 280 }}>
                {players.map((p, i) => i === discarderIdx ? null : (
                  <button
                    key={p.id}
                    onClick={() => { setCaller(i); setInvalidFor(null); }}
                    style={{
                      padding: '12px 0', borderRadius: 12,
                      border: '1.5px solid rgba(var(--paper-rgb),0.35)',
                      background: 'rgba(var(--paper-rgb),0.08)',
                      color: 'var(--paper)',
                      fontSize: 14, fontWeight: 700, fontFamily: 'Nunito', cursor: 'pointer',
                    }}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
              <button
                onClick={() => { setChoosing(false); setInvalidFor(null); }}
                style={{
                  background: 'none', border: 'none', color: 'rgba(var(--paper-rgb),0.6)',
                  fontSize: 13, fontFamily: 'Nunito', cursor: 'pointer', textDecoration: 'underline',
                }}
              >
                Back
              </button>
            </>
          ) : (
            <>
              <p style={{ margin: 0, fontSize: 14, color: 'rgba(var(--paper-rgb),0.8)', fontFamily: 'Nunito' }}>
                {players[caller]?.name} calls the tile for…
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%', maxWidth: 280 }}>
                <button
                  onClick={() => {
                    const ok = onCallMahjong(caller);
                    if (!ok) setInvalidFor('mahjong');
                  }}
                  style={{
                    padding: '12px 0', borderRadius: 12,
                    border: invalidFor === 'mahjong' ? '1.5px solid #E88' : '1.5px solid rgba(var(--paper-rgb),0.5)',
                    background: 'rgba(var(--paper-rgb),0.14)',
                    color: invalidFor === 'mahjong' ? '#F5B8B8' : 'var(--paper)',
                    fontSize: 14, fontWeight: 800, fontFamily: 'Playfair Display, serif', cursor: 'pointer',
                  }}
                >
                  {invalidFor === 'mahjong' ? 'Not a winning hand' : '🏆 Mahjong!'}
                </button>
                {getExposeOptions(caller).map(opt => (
                  <button
                    key={opt.n}
                    onClick={() => onExpose?.(caller, opt)}
                    style={{
                      padding: '11px 0', borderRadius: 12,
                      border: '1.5px solid rgba(var(--paper-rgb),0.35)',
                      background: 'rgba(var(--paper-rgb),0.08)',
                      color: 'var(--paper)',
                      fontSize: 13.5, fontWeight: 700, fontFamily: 'Nunito', cursor: 'pointer',
                    }}
                  >
                    Expose {MELD_NAMES[opt.n]} ×{opt.n}{opt.jokersUsed > 0 ? ` (${opt.jokersUsed} joker${opt.jokersUsed > 1 ? 's' : ''})` : ''}
                  </button>
                ))}
                {getExposeOptions(caller).length === 0 && (
                  <p style={{ margin: 0, fontSize: 11.5, color: 'rgba(var(--paper-rgb),0.55)', fontFamily: 'Nunito' }}>
                    No legal pung/kong/quint with this hand.
                  </p>
                )}
              </div>
              <button
                onClick={() => { setCaller(null); setInvalidFor(null); }}
                style={{
                  background: 'none', border: 'none', color: 'rgba(var(--paper-rgb),0.6)',
                  fontSize: 13, fontFamily: 'Nunito', cursor: 'pointer', textDecoration: 'underline',
                }}
              >
                Back
              </button>
            </>
          )}
        </>
      ) : (
        <>
          <div>
            <div className="eyebrow" style={{ color: 'rgba(var(--paper-rgb),0.55)', marginBottom: 10 }}>
              Pass the device to
            </div>
            <h1 style={{ margin: 0, fontSize: 38, fontFamily: 'Playfair Display, serif', color: 'var(--paper)', fontWeight: 700 }}>
              {toName}
            </h1>
            {subtitle && (
              <p style={{ margin: '10px 0 0', fontSize: 13, color: 'rgba(var(--paper-rgb),0.65)', fontFamily: 'Nunito' }}>
                {subtitle}
              </p>
            )}
          </div>
          <button
            onClick={onReveal}
            style={{
              width: '100%', maxWidth: 280, padding: '16px 0', borderRadius: 999,
              border: 'none', background: 'var(--paper)', color: 'var(--matcha-deep)',
              fontSize: 16, fontWeight: 800, fontFamily: 'Playfair Display, serif',
              cursor: 'pointer', boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
              letterSpacing: '0.03em',
            }}
          >
            I&apos;m {toName} — show my tiles
          </button>
          <p style={{ margin: 0, fontSize: 11, color: 'rgba(var(--paper-rgb),0.45)', fontFamily: 'Nunito' }}>
            Only look when the device is yours 👀
          </p>
        </>
      )}
    </div>
  );
}
