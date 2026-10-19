import React from "react";
import { DEFAULT_BLOCK_TYPES, DEFAULT_BREAKPOINTS } from "./homePageLayout.js";
import "./ResponsiveLayoutMap.css";

const GAP = 56; // space between device frames, px
const FRAME = 8; // 4px shell border on each side

const PlayIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M7 4v16l13-8z" />
  </svg>
);
const StopIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <rect x="6" y="6" width="12" height="12" />
  </svg>
);

function useContainerWidth(ref, enabled) {
  const [width, setWidth] = React.useState(null);
  React.useLayoutEffect(() => {
    if (!enabled || !ref.current || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, [enabled, ref]);
  return width;
}

/**
 * Draws a page's layout at several breakpoints side by side, to the same
 * scale. Pick a block type (or hover a block) to highlight it in every frame,
 * or press Play to step through them all.
 */
export function ResponsiveLayoutMap({
  breakpoints = DEFAULT_BREAKPOINTS,
  blockTypes = DEFAULT_BLOCK_TYPES,
  scale = 0.4,
  fit = true,
  focus,
  defaultFocus = null,
  onFocusChange,
  playInterval = 1800,
  showControls = true,
  showPlay = true,
  minRowScale = 0.2,
  className,
  ...rest
}) {
  const rowRef = React.useRef(null);
  const containerWidth = useContainerWidth(rowRef, fit);

  const [innerFocus, setInnerFocus] = React.useState(defaultFocus);
  const selected = focus !== undefined ? focus : innerFocus;
  const [hovered, setHovered] = React.useState(null);
  const [step, setStep] = React.useState(-1); // -1 = not playing
  const playing = step >= 0;
  const active = playing ? selected : hovered ?? selected;

  const order = Object.keys(blockTypes);

  const select = React.useCallback(
    (id) => {
      if (focus === undefined) setInnerFocus(id);
      onFocusChange?.(id);
    },
    [focus, onFocusChange]
  );

  // Playback: highlight each block type in turn, then clear.
  React.useEffect(() => {
    if (!playing) return;
    if (step >= order.length) {
      setStep(-1);
      select(null);
      return;
    }
    select(order[step]);
    const t = setTimeout(() => setStep((s) => s + 1), playInterval);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const stopPlay = () => {
    setStep(-1);
    select(null);
  };

  // Shrink to fit the container, never growing past `scale`. When side by
  // side would get too small (phones), stack the frames vertically instead.
  const naturalWidth = breakpoints.reduce((sum, bp) => sum + bp.width, 0);
  const widest = Math.max(...breakpoints.map((bp) => bp.width));
  const chrome = (breakpoints.length - 1) * GAP + breakpoints.length * FRAME;
  let s = scale;
  let stacked = false;
  if (fit && containerWidth) {
    const rowScale = Math.min(scale, (containerWidth - chrome) / naturalWidth);
    stacked = rowScale < minRowScale;
    s = stacked ? Math.min(scale, (containerWidth - FRAME) / widest) : rowScale;
  }

  return (
    <div className={"rlm" + (className ? " " + className : "")} {...rest}>
      {showControls && (
        <div className="rlm-seg" role="group" aria-label="Highlight a block">
          {order.map((id) => (
            <button
              key={id}
              type="button"
              aria-pressed={selected === id}
              data-on={selected === id}
              onClick={() => {
                if (playing) setStep(-1);
                select(selected === id && !playing ? null : id);
              }}
            >
              {blockTypes[id].label}
            </button>
          ))}
        </div>
      )}

      <div className="rlm-row-wrap" ref={rowRef}>
        <div className="rlm-row" data-focus={active || undefined} data-stacked={stacked || undefined}>
          {breakpoints.map((bp) => {
            const { blocks = [], columns = [], gutters = [] } = bp.layout;
            return (
              <figure
                key={bp.name}
                className="rlm-dev"
                style={{ width: bp.width * s + FRAME }}
              >
                <div className="rlm-shell">
                  <div
                    className="rlm-vp"
                    style={{ width: bp.width * s, height: bp.height * s }}
                    role="img"
                    aria-label={`${bp.name} layout${bp.range ? `, ${bp.range}` : ""}, shown at ${bp.width}px wide`}
                  >
                    <div
                      className="rlm-scr"
                      style={{ width: bp.width, height: bp.height, transform: `scale(${s})` }}
                    >
                      {columns.map((c, i) => (
                        <div
                          key={"c" + i}
                          className="rlm-col"
                          data-alt={c.alt || undefined}
                          style={{ left: c.x, width: c.w }}
                        />
                      ))}
                      {gutters.map((g, i) => (
                        <div key={"g" + i} className="rlm-gut" style={{ left: g.x, width: g.w }} />
                      ))}
                      {blocks.map((b, i) => {
                        const t = blockTypes[b.type] || {};
                        const cls = [
                          "rlm-blk",
                          b.type === "nav" && "rlm-nav",
                          t.darkText && "rlm-dk",
                          b.popover && "rlm-pop",
                          active === b.type && "rlm-f",
                        ]
                          .filter(Boolean)
                          .join(" ");
                        return (
                          <div
                            key={i}
                            className={cls}
                            data-type={b.type}
                            style={{
                              left: b.x,
                              top: b.y,
                              width: b.w,
                              height: b.h,
                              background: b.popover ? undefined : t.color,
                            }}
                            onMouseEnter={() => setHovered(b.type)}
                            onMouseLeave={() => setHovered(null)}
                          >
                            {b.label}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
                <figcaption className="rlm-cap">
                  <b>{bp.name}</b>
                  {bp.range && <span>{bp.range}</span>}
                </figcaption>
              </figure>
            );
          })}
        </div>
      </div>

      {showPlay && (
        <button
          type="button"
          className="rlm-play"
          data-on={playing}
          onClick={() => (playing ? stopPlay() : setStep(0))}
          aria-label={playing ? "Stop walkthrough" : "Play walkthrough of each block"}
        >
          {playing ? <StopIcon /> : <PlayIcon />}
          {playing ? (
            <>
              <b>{blockTypes[order[Math.min(step, order.length - 1)]]?.label}</b>
              <small>
                {Math.min(step + 1, order.length)}/{order.length}
              </small>
            </>
          ) : (
            "Play"
          )}
        </button>
      )}
    </div>
  );
}

export default ResponsiveLayoutMap;
