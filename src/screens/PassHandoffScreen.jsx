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
}) {
  const [choosing, setChoosing] = useState(false);
  const [invalidFor, setInvalidFor] = useState(null);

  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(160deg, #3C5236 0%, #2B3A2A 100%)',
      padding: 28, gap: 20, textAlign: 'center',
    }}>
      {mode !== 'call' && <div style={{ fontSize: 46 }}>🤝</div>}

      {mode === 'call' ? (
        <>
          <div>
            <div className="eyebrow" style={{ color: 'rgba(251,247,239,0.55)', marginBottom: 8 }}>
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
              <p style={{ margin: 0, fontSize: 14, color: 'rgba(251,247,239,0.8)', fontFamily: 'Nunito', lineHeight: 1.5, maxWidth: 280 }}>
                Does this tile complete anyone&apos;s hand?
              </p>
              <button
                onClick={() => setChoosing(true)}
                style={{
                  width: '100%', maxWidth: 280, padding: '13px 0', borderRadius: 999,
                  border: '1.5px solid rgba(251,247,239,0.4)', background: 'transparent',
                  color: '#FBF7EF', fontSize: 15, fontWeight: 700,
                  fontFamily: 'Playfair Display, serif', cursor: 'pointer',
                }}
              >
                Call Mahjong!
              </button>
              <button
                onClick={onContinue}
                style={{
                  width: '100%', maxWidth: 280, padding: '15px 0', borderRadius: 999,
                  border: 'none', background: '#FBF7EF', color: '#3C5236',
                  fontSize: 16, fontWeight: 800, fontFamily: 'Playfair Display, serif',
                  cursor: 'pointer', boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                }}
              >
                No one — continue → {toName}
              </button>
            </>
          ) : (
            <>
              <p style={{ margin: 0, fontSize: 14, color: 'rgba(251,247,239,0.8)', fontFamily: 'Nunito' }}>
                Who is calling Mahjong?
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%', maxWidth: 280 }}>
                {players.map((p, i) => i === discarderIdx ? null : (
                  <button
                    key={p.id}
                    onClick={() => {
                      const ok = onCallMahjong(i);
                      if (!ok) setInvalidFor(i);
                    }}
                    style={{
                      padding: '12px 0', borderRadius: 12,
                      border: invalidFor === i ? '1.5px solid #E88' : '1.5px solid rgba(251,247,239,0.35)',
                      background: 'rgba(251,247,239,0.08)',
                      color: invalidFor === i ? '#F5B8B8' : '#FBF7EF',
                      fontSize: 14, fontWeight: 700, fontFamily: 'Nunito', cursor: 'pointer',
                    }}
                  >
                    {invalidFor === i ? `${p.name} — not a winning hand` : p.name}
                  </button>
                ))}
              </div>
              <button
                onClick={() => { setChoosing(false); setInvalidFor(null); }}
                style={{
                  background: 'none', border: 'none', color: 'rgba(251,247,239,0.6)',
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
            <div className="eyebrow" style={{ color: 'rgba(251,247,239,0.55)', marginBottom: 10 }}>
              Pass the device to
            </div>
            <h1 style={{ margin: 0, fontSize: 38, fontFamily: 'Playfair Display, serif', color: '#FBF7EF', fontWeight: 700 }}>
              {toName}
            </h1>
            {subtitle && (
              <p style={{ margin: '10px 0 0', fontSize: 13, color: 'rgba(251,247,239,0.65)', fontFamily: 'Nunito' }}>
                {subtitle}
              </p>
            )}
          </div>
          <button
            onClick={onReveal}
            style={{
              width: '100%', maxWidth: 280, padding: '16px 0', borderRadius: 999,
              border: 'none', background: '#FBF7EF', color: '#3C5236',
              fontSize: 16, fontWeight: 800, fontFamily: 'Playfair Display, serif',
              cursor: 'pointer', boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
              letterSpacing: '0.03em',
            }}
          >
            I&apos;m {toName} — show my tiles
          </button>
          <p style={{ margin: 0, fontSize: 11, color: 'rgba(251,247,239,0.45)', fontFamily: 'Nunito' }}>
            Only look when the device is yours 👀
          </p>
        </>
      )}
    </div>
  );
}
