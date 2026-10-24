// Shared pieces of the thumbnail designs (ThumbDesigns.tsx, ThumbStories.tsx): the file badge, a line of text fitted to
// its column, the right-aligned headline and the pill.
import React from 'react';
import {continueRender, delayRender} from 'remotion';
import {C} from './theme';

export const Ltr: React.FC<{children: React.ReactNode}> = ({children}) => <span style={{direction: 'ltr', unicodeBidi: 'isolate'}}>{children}</span>;

export const Badge: React.FC<{text: string; dark?: boolean}> = ({text, dark}) => (
  <div style={{position: 'absolute', right: 48, top: 38, background: dark ? '#fff' : C.ink, color: dark ? C.ink : '#fff', fontSize: 32, fontWeight: 700, padding: '6px 24px', borderRadius: 999}}>{text}</div>
);

/** One line of text that never wraps: it is drawn at `size`, or smaller when that is wider than `max` px. */
export const FitText: React.FC<{t: string; size: number; max: number; color: string; weight?: number}> = ({t, size, max, color, weight = 700}) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const [fs, setFs] = React.useState(size);
  React.useLayoutEffect(() => {
    const handle = delayRender('fit text');
    const measure = () => {
      const el = ref.current;
      if (el) {
        el.style.fontSize = `${size}px`;
        const w = el.getBoundingClientRect().width;
        setFs(w > max ? Math.floor((size * max) / w) : size);
      }
      continueRender(handle);
    };
    document.fonts.ready.then(measure, measure);
  }, [t, size, max]);
  return (
    <div ref={ref} style={{fontSize: fs, fontWeight: weight, color, lineHeight: 1.12, whiteSpace: 'nowrap', width: 'max-content'}}>
      {t}
    </div>
  );
};

export type Run = {t: string; size: number; color: string};
/** The headline: right-aligned lines, each with its own size and colour, each fitted to the column. */
export const Headline: React.FC<{lines: Run[]; width?: number; right?: number; top?: number; bottom?: number; gap?: number; children?: React.ReactNode}> = ({
  lines,
  width = 620,
  right = 56,
  top = 96,
  bottom = 70,
  gap = 22,
  children,
}) => (
  <div style={{position: 'absolute', right, top, bottom, width, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', gap}}>
    {lines.filter((l) => l.t).map((l, i) => (
      <FitText key={i} t={l.t} size={l.size} max={width} color={l.color} />
    ))}
    {children}
  </div>
);

export const Pill: React.FC<{text: string; size?: number; bg: string; color: string; border?: string; max?: number}> = ({text, size = 60, bg, color, border, max = 620}) => (
  <div style={{display: 'inline-flex', alignSelf: 'flex-start', background: bg, padding: `${size * 0.14}px ${size * 0.5}px`, borderRadius: 999, border: border ? `5px solid ${border}` : undefined}}>
    <FitText t={text} size={size} max={max - size - 10} color={color} />
  </div>
);
