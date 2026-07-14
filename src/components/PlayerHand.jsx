import React, { useRef, useState } from 'react';
import MahjongTile from './MahjongTile';
import { playDraw, playClack } from '../utils/sound.js';

const TILE_W = 58;
const TILE_H = 76;
const GAP = 6;
const LIFT_THRESHOLD = 14;   // px of upward movement that lifts a tile
const DISCARD_THRESHOLD = 90; // px above the rack that discards on release

/**
 * The player's rack.
 *
 * Interactions:
 *  - swipe horizontally  → scroll the rack (native)
 *  - tap                 → select (tap again to discard) — the classic path
 *  - drag a tile UP      → lift it; move along the row to REORDER,
 *                          release high above the rack to DISCARD
 */
export default function PlayerHand({
  tiles = [],
  selectedUids = new Set(),
  onTileClick,
  onReorder,
  onSort,
  sortAuto = false,
  onToggleAuto,
  highlightUid = null,
  canDiscard = false,
  animateIn = false,
  exposures = [],
}) {
  const scrollRef = useRef(null);
  const itemRefs = useRef({});
  const dragRef = useRef(null); // mutable drag session
  const justDraggedRef = useRef(null); // suppress the click after a drag
  const [drag, setDrag] = useState(null); // { uid, x, y, overIndex, discardArmed }

  // Latest props for the window-level listeners (registered once per drag).
  const propsRef = useRef({});
  propsRef.current = { tiles, canDiscard, onReorder, onTileClick };

  function measureOverIndex(clientX, uid) {
    const { tiles: cur } = propsRef.current;
    const order = cur.filter(t => t.uid !== uid);
    let idx = order.length;
    for (let i = 0; i < order.length; i++) {
      const el = itemRefs.current[order[i].uid];
      if (!el) continue;
      const r = el.getBoundingClientRect();
      if (clientX < r.left + r.width / 2) { idx = i; break; }
    }
    return idx;
  }

  function endDragSession() {
    const d = dragRef.current;
    if (d) {
      window.removeEventListener('pointermove', d.onMove);
      window.removeEventListener('pointerup', d.onUp);
      window.removeEventListener('pointercancel', d.onCancel);
    }
    dragRef.current = null;
    setDrag(null);
  }

  function handlePointerDown(e, tile) {
    if (!onReorder && !onTileClick) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    if (dragRef.current) endDragSession(); // stray previous session

    const session = {
      uid: tile.uid,
      startX: e.clientX,
      startY: e.clientY,
      lifted: false,
      pointerId: e.pointerId,
      lastX: e.clientX,
      lastY: e.clientY,
    };
    // Window-level listeners: robust to the pointer leaving the tile,
    // the rack, or pointer-capture quirks across browsers.
    session.onMove = (ev) => {
      if (ev.pointerId !== session.pointerId) return;
      const dx = ev.clientX - session.startX;
      const dy = ev.clientY - session.startY;
      session.lastX = ev.clientX;
      session.lastY = ev.clientY;
      if (!session.lifted) {
        // Lift on clear upward intent; horizontal motion keeps scrolling.
        if (dy < -LIFT_THRESHOLD && Math.abs(dy) > Math.abs(dx)) {
          session.lifted = true;
          playDraw();
          try { navigator.vibrate?.(8); } catch { /* unsupported */ }
        } else {
          return;
        }
      }
      if (ev.cancelable) ev.preventDefault();
      const { canDiscard: cd, onReorder: re } = propsRef.current;
      setDrag({
        uid: session.uid,
        x: ev.clientX,
        y: ev.clientY,
        overIndex: re ? measureOverIndex(ev.clientX, session.uid) : null,
        discardArmed: cd && (session.startY - ev.clientY) > DISCARD_THRESHOLD,
      });
    };
    session.onUp = (ev) => {
      if (ev.pointerId !== session.pointerId) return;
      const { tiles: cur, canDiscard: cd, onReorder: re, onTileClick: click } = propsRef.current;
      const wasLifted = session.lifted;
      const draggedTile = cur.find(t => t.uid === session.uid);
      const liftedHigh = cd && (session.startY - ev.clientY) > DISCARD_THRESHOLD;
      const overIndex = re ? measureOverIndex(ev.clientX, session.uid) : null;
      endDragSession();
      if (!wasLifted || !draggedTile) return; // plain tap — click fires normally
      justDraggedRef.current = session.uid;
      setTimeout(() => { justDraggedRef.current = null; }, 120);
      if (liftedHigh) {
        playClack();
        click?.(draggedTile, { forceDiscard: true });
        return;
      }
      if (re && overIndex !== null) {
        const rest = cur.filter(t => t.uid !== session.uid);
        rest.splice(overIndex, 0, draggedTile);
        const newOrder = rest.map(t => t.uid);
        if (newOrder.some((uid, i) => uid !== cur[i]?.uid)) {
          playDraw();
          re(newOrder);
        }
      }
    };
    session.onCancel = () => endDragSession();

    dragRef.current = session;
    window.addEventListener('pointermove', session.onMove, { passive: false });
    window.addEventListener('pointerup', session.onUp);
    window.addEventListener('pointercancel', session.onCancel);
  }

  function handleClickCapture(e, tile) {
    // Swallow the synthetic click that follows a completed drag.
    if (justDraggedRef.current === tile.uid) {
      e.stopPropagation();
      e.preventDefault();
    }
  }

  const draggingUid = drag?.uid ?? null;
  const draggedTile = draggingUid !== null ? tiles.find(t => t.uid === draggingUid) : null;
  // Row shown while dragging: dragged tile removed, gap at the insertion point.
  const rowTiles = draggingUid !== null ? tiles.filter(t => t.uid !== draggingUid) : tiles;

  return (
    <div className="relative">
      {/* Exposed melds — face-up, locked */}
      {exposures.length > 0 && (
        <div className="no-scrollbar" style={{
          display: 'flex', gap: 8, alignItems: 'center',
          padding: '6px 12px 0', overflowX: 'auto',
        }}>
          <span style={{
            fontSize: 9, fontFamily: 'Nunito', fontWeight: 800,
            color: 'rgba(var(--ink-rgb),0.4)', textTransform: 'uppercase', letterSpacing: '0.07em',
            flexShrink: 0,
          }}>
            Exposed
          </span>
          {exposures.map((meld, mi) => (
            <div key={mi} style={{
              display: 'flex', gap: 2, flexShrink: 0,
              padding: 3, borderRadius: 7,
              background: 'rgba(var(--sky-rgb),0.1)',
              border: '1px solid rgba(var(--sky-rgb),0.3)',
            }}>
              {meld.tiles.map(t => <MahjongTile key={t.uid} tile={t} size="sm"/>)}
            </div>
          ))}
        </div>
      )}

      {/* Rack controls */}
      {onSort && tiles.length > 1 && (
        <div style={{
          position: 'absolute', right: 10, top: exposures.length > 0 ? 44 : 0, zIndex: 30,
          display: 'flex', gap: 5, alignItems: 'center',
          transform: 'translateY(-50%)',
        }}>
          <button
            onClick={onSort}
            aria-label="Sort tiles"
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              background: 'rgba(var(--paper-rgb),0.95)',
              border: '1px solid rgba(var(--matcha-rgb),0.4)',
              borderRadius: 999, padding: '5px 12px',
              color: 'var(--matcha)', fontSize: 11.5,
              fontFamily: 'Nunito', fontWeight: 800, cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(var(--shadow-rgb),0.15)',
            }}
          >
            ⇅ Sort
          </button>
          {onToggleAuto && (
            <button
              onClick={onToggleAuto}
              aria-label={sortAuto ? 'Auto-sort on' : 'Auto-sort off'}
              title="Keep the rack sorted after every draw"
              style={{
                background: sortAuto ? 'var(--matcha)' : 'rgba(var(--paper-rgb),0.95)',
                border: `1px solid ${sortAuto ? 'var(--matcha)' : 'rgba(var(--ink-rgb),0.25)'}`,
                borderRadius: 999, padding: '5px 9px',
                color: sortAuto ? 'white' : 'rgba(var(--ink-rgb),0.45)',
                fontSize: 9.5, fontFamily: 'Nunito', fontWeight: 800,
                letterSpacing: '0.06em', cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(var(--shadow-rgb),0.12)',
              }}
            >
              AUTO
            </button>
          )}
        </div>
      )}

      {/* Discard drop hint while a tile is lifted */}
      {draggingUid !== null && canDiscard && (
        <div style={{
          position: 'absolute', left: 12, right: 12, top: -46, height: 40,
          borderRadius: 12,
          border: `2px dashed ${drag?.discardArmed ? 'var(--rose)' : 'rgba(var(--ink-rgb),0.25)'}`,
          background: drag?.discardArmed ? 'rgba(var(--rose-rgb),0.12)' : 'rgba(var(--paper-rgb),0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, fontFamily: 'Nunito', fontWeight: 800,
          color: drag?.discardArmed ? 'var(--rose)' : 'rgba(var(--ink-rgb),0.5)',
          pointerEvents: 'none', zIndex: 40,
          transition: 'all 0.12s ease',
        }}>
          {drag?.discardArmed ? 'Release to discard' : '↑ Drag here to discard'}
        </div>
      )}

      {/* Hand row */}
      <div
        ref={scrollRef}
        className="no-scrollbar"
        style={{
          overflowX: 'auto',
          overflowY: 'visible',
          paddingBottom: 20,
          paddingTop: 20,
          paddingLeft: 12,
          paddingRight: 12,
          display: 'flex',
          gap: GAP,
          alignItems: 'flex-end',
          minHeight: 112,
        }}
      >
        {rowTiles.map((tile, idx) => (
          <React.Fragment key={tile.uid}>
            {/* Insertion gap while dragging */}
            {draggingUid !== null && drag?.overIndex === idx && (
              <div style={{
                width: TILE_W * 0.5, height: TILE_H, flexShrink: 0,
                borderRadius: 8,
                border: '2px dashed rgba(var(--matcha-rgb),0.5)',
                background: 'rgba(var(--matcha-rgb),0.08)',
                transition: 'width 0.1s ease',
              }}/>
            )}
            <div
              ref={el => { itemRefs.current[tile.uid] = el; }}
              onPointerDown={e => handlePointerDown(e, tile)}
              onClickCapture={e => handleClickCapture(e, tile)}
              style={{
                flexShrink: 0,
                transition: 'transform 0.15s ease',
                touchAction: 'pan-x', // horizontal = scroll, vertical = drag
              }}
            >
              <div style={{ position: 'relative' }}>
                {highlightUid === tile.uid && (
                  <div aria-label="Just drawn" style={{
                    position: 'absolute', top: -9, left: '50%', transform: 'translateX(-50%)',
                    width: 7, height: 7, borderRadius: 999,
                    background: 'var(--rose)',
                    boxShadow: '0 0 6px rgba(var(--rose-rgb),0.8)',
                    zIndex: 5,
                    animation: 'pulse 1.2s ease-in-out infinite',
                  }}/>
                )}
                <MahjongTile
                  tile={tile}
                  size="lg"
                  selected={selectedUids.has(tile.uid)}
                  onClick={canDiscard || onTileClick ? () => onTileClick?.(tile) : undefined}
                  animateIn={animateIn}
                  animDelay={idx * 50}
                  style={highlightUid === tile.uid ? { boxShadow: '0 4px 10px rgba(var(--shadow-rgb),0.16), 0 0 0 2px rgba(var(--rose-rgb),0.55)' } : undefined}
                />
              </div>
            </div>
          </React.Fragment>
        ))}
        {/* Gap at the far right end */}
        {draggingUid !== null && drag?.overIndex === rowTiles.length && (
          <div style={{
            width: TILE_W * 0.5, height: TILE_H, flexShrink: 0,
            borderRadius: 8,
            border: '2px dashed rgba(var(--matcha-rgb),0.5)',
            background: 'rgba(var(--matcha-rgb),0.08)',
          }}/>
        )}
      </div>

      {/* Floating dragged tile */}
      {draggedTile && drag && (
        <div style={{
          position: 'fixed',
          left: drag.x - TILE_W / 2,
          top: drag.y - TILE_H - 14, // above the finger
          zIndex: 100,
          pointerEvents: 'none',
          transform: `scale(${drag.discardArmed ? 1.2 : 1.1}) rotate(${drag.discardArmed ? '-4deg' : '0deg'})`,
          filter: 'drop-shadow(0 12px 18px rgba(0,0,0,0.3))',
          transition: 'transform 0.12s ease',
        }}>
          <MahjongTile tile={draggedTile} size="lg"/>
        </div>
      )}

      {/* Discard hint */}
      {canDiscard && draggingUid === null && (
        <div style={{
          textAlign: 'center',
          fontSize: 11,
          color: 'rgba(var(--matcha-rgb),0.7)',
          fontFamily: 'Nunito',
          fontWeight: 700,
          marginTop: -14,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
        }}>
          Drag up to discard · drag along to arrange
        </div>
      )}
    </div>
  );
}
