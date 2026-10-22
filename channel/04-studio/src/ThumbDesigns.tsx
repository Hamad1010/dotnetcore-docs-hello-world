// Ten thumbnail designs for the publish kit (framework §3.13): the texts live in 03-episodes/EP00N/thumbs.json
// ("layout": "design"), the pictures are drawn here from our palette and silhouettes. 1280 × 720.
// Rules they follow: at most 5 words of headline (+ a pill or two), one strong picture, high contrast so it still reads at
// 168 × 94 px, the bottom corners left empty (the video length sits there), no other brand's logo, and every picture
// matches something the video really shows.
import React from 'react';
import {AbsoluteFill, continueRender, delayRender} from 'remotion';
import {C, FONT} from './theme';
import {Crowd, PeopleGrid, Person} from './components/Silhouettes';
import {HouseGlyph, NAVY, Padlock} from './brand-art';

export type DesignName = 'story' | 'scale' | 'time' | 'income' | 'phone' | 'repeat' | 'versus' | 'trap' | 'platform' | 'puzzle';
export type DesignSpec = {layout: 'design'; design: DesignName; lines: string[]; tag?: string; tag2?: string; extra?: string};

const Ltr: React.FC<{children: React.ReactNode}> = ({children}) => <span style={{direction: 'ltr', unicodeBidi: 'isolate'}}>{children}</span>;

const Badge: React.FC<{text: string; dark?: boolean}> = ({text, dark}) => (
  <div style={{position: 'absolute', right: 48, top: 38, background: dark ? '#fff' : C.ink, color: dark ? C.ink : '#fff', fontSize: 32, fontWeight: 700, padding: '6px 24px', borderRadius: 999}}>{text}</div>
);

/** One line of text that never wraps: it is drawn at `size`, or smaller when that is wider than `max` px. */
const FitText: React.FC<{t: string; size: number; max: number; color: string; weight?: number}> = ({t, size, max, color, weight = 700}) => {
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

type Run = {t: string; size: number; color: string};
/** The headline: right-aligned lines, each with its own size and colour, each fitted to the column. */
const Headline: React.FC<{lines: Run[]; width?: number; right?: number; top?: number; bottom?: number; gap?: number; children?: React.ReactNode}> = ({
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

const Pill: React.FC<{text: string; size?: number; bg: string; color: string; border?: string; max?: number}> = ({text, size = 60, bg, color, border, max = 620}) => (
  <div style={{display: 'inline-flex', alignSelf: 'flex-start', background: bg, padding: `${size * 0.14}px ${size * 0.5}px`, borderRadius: 999, border: border ? `5px solid ${border}` : undefined}}>
    <FitText t={text} size={size} max={max - size - 10} color={color} />
  </div>
);

const Gear: React.FC<{cx: number; cy: number; r: number; fill: string; hole: string; teeth?: number; rotate?: number}> = ({cx, cy, r, fill, hole, teeth = 10, rotate = 0}) => (
  <g transform={`translate(${cx} ${cy}) rotate(${rotate})`}>
    {Array.from({length: teeth}, (_, k) => (
      <rect key={k} x={-r * 0.17} y={-r * 1.22} width={r * 0.34} height={r * 0.4} rx={r * 0.06} fill={fill} transform={`rotate(${(360 / teeth) * k})`} />
    ))}
    <circle r={r} fill={fill} />
    <circle r={r * 0.42} fill={hole} />
  </g>
);

// ---------------------------------------------------------------------------------------------------------------- 1
const Story: React.FC<{s: DesignSpec; badge: string}> = ({s, badge}) => (
  <AbsoluteFill style={{background: 'radial-gradient(ellipse at 22% 80%, #2C3B66 0%, #141B2B 62%)', fontFamily: FONT, direction: 'rtl', overflow: 'hidden'}}>
    <div style={{position: 'absolute', left: 30, bottom: -40, filter: 'drop-shadow(0 24px 34px rgba(0,0,0,0.5))'}}>
      <Person size={720} color="#33426A" />
    </div>
    <div style={{position: 'absolute', left: 30, top: 372, transform: 'rotate(-12deg)', border: '13px solid #FF6B5B', borderRadius: 26, padding: '2px 36px 8px', color: '#FF6B5B', fontSize: 112, fontWeight: 700, background: 'rgba(20,27,43,0.94)'}}>
      {s.extra}
    </div>
    <Badge text={badge} dark />
    <Headline lines={[{t: s.lines[0], size: 160, color: '#FF7A6B'}, {t: s.lines[1], size: 96, color: '#fff'}]} gap={10}>
      {s.tag ? (
        <div style={{marginTop: 18}}>
          <Pill text={s.tag} size={86} bg={C.yellow} color={C.ink} />
        </div>
      ) : null}
    </Headline>
  </AbsoluteFill>
);

// ---------------------------------------------------------------------------------------------------------------- 2
const Scale: React.FC<{s: DesignSpec; badge: string}> = ({s, badge}) => (
  <AbsoluteFill style={{background: 'linear-gradient(135deg, #2A66DE 0%, #3B7DF6 55%, #5B9BFF 100%)', fontFamily: FONT, direction: 'rtl', overflow: 'hidden'}}>
    <div style={{position: 'absolute', left: -10, top: 40}}>
      <Crowd id="scale" width={620} height={680} color="#fff" opacity={0.42} />
    </div>
    <div style={{position: 'absolute', left: 50, bottom: 70, filter: 'drop-shadow(0 12px 18px rgba(8,28,80,0.35))'}}>
      <PeopleGrid count={55} cols={11} cell={44} color="#fff" />
    </div>
    <Badge text={badge} dark />
    <Headline lines={[{t: s.lines[0], size: 160, color: '#fff'}, {t: s.lines[1], size: 190, color: C.yellow}]} gap={8}>
      {s.tag ? (
        <div style={{marginTop: 14}}>
          <Pill text={s.tag} size={76} bg="#fff" color="#2A66DE" />
        </div>
      ) : null}
    </Headline>
  </AbsoluteFill>
);

// ---------------------------------------------------------------------------------------------------------------- 3
const Time: React.FC<{s: DesignSpec; badge: string}> = ({s, badge}) => (
  <AbsoluteFill style={{background: 'radial-gradient(ellipse at 25% 50%, #23335A 0%, #101827 70%)', fontFamily: FONT, direction: 'rtl', overflow: 'hidden'}}>
    <svg width={640} height={640} viewBox="-320 -320 640 640" style={{position: 'absolute', left: 20, top: 40, filter: 'drop-shadow(0 26px 40px rgba(0,0,0,0.5))'}}>
      <circle r="300" fill="#fff" />
      <circle r="300" fill="none" stroke={C.blue} strokeWidth="26" />
      {Array.from({length: 24}, (_, k) => {
        const a = (2 * Math.PI * k) / 24 - Math.PI / 2;
        const big = k % 6 === 0;
        return <line key={k} x1={Math.cos(a) * (big ? 214 : 236)} y1={Math.sin(a) * (big ? 214 : 236)} x2={Math.cos(a) * 262} y2={Math.sin(a) * 262} stroke={C.ink} strokeWidth={big ? 14 : 7} strokeLinecap="round" />;
      })}
      <path d="M0 0 L0 -176" stroke={C.ink} strokeWidth="22" strokeLinecap="round" />
      <path d="M0 0 L120 70" stroke={C.ink} strokeWidth="22" strokeLinecap="round" />
      <circle r="24" fill={C.red} />
      <text y="38" textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize="150" fill={C.ink} style={{direction: 'ltr'}} transform="translate(0 150)">
        24
      </text>
      <g transform="translate(190 -214)">
        <circle r="92" fill={C.red} />
        <text y="30" textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize="90" fill="#fff" style={{direction: 'ltr'}}>
          +1
        </text>
        <line x1="-74" y1="74" x2="74" y2="-74" stroke="#fff" strokeWidth="16" strokeLinecap="round" />
      </g>
    </svg>
    <Badge text={badge} dark />
    <Headline width={560} lines={[{t: s.lines[0], size: 196, color: '#fff'}, {t: s.lines[1], size: 196, color: C.yellow}]} gap={4}>
      {s.tag ? (
        <div style={{marginTop: 26}}>
          <Pill text={s.tag} size={62} bg="transparent" color="#fff" border="#fff" max={560} />
        </div>
      ) : null}
    </Headline>
  </AbsoluteFill>
);

// ---------------------------------------------------------------------------------------------------------------- 4
const Income: React.FC<{s: DesignSpec; badge: string}> = ({s, badge}) => (
  <AbsoluteFill style={{background: '#F5F7FB', fontFamily: FONT, direction: 'rtl', overflow: 'hidden'}}>
    <div style={{position: 'absolute', left: -150, top: -160, width: 760, height: 760, borderRadius: '50%', background: C.blueSoft}} />
    <div style={{position: 'absolute', left: 50, top: 110, width: 600, height: 500, background: '#fff', borderRadius: 44, boxShadow: '0 4px 10px rgba(28,35,51,0.08), 0 36px 70px rgba(28,35,51,0.2)'}}>
      <svg width={600} height={500} viewBox="0 0 600 500">
        <path d="M60 50 V430 H550" fill="none" stroke={C.line} strokeWidth="8" strokeLinecap="round" />
        {[150, 240, 330].map((y) => <line key={y} x1="60" y1={y} x2="550" y2={y} stroke={C.line} strokeWidth="3" strokeDasharray="4 12" />)}
        <path d="M80 390 C190 350 300 250 500 90" fill="none" stroke={C.red} strokeWidth="20" strokeLinecap="round" />
        <polygon points="520,70 462,84 506,126" fill={C.red} />
        <path d="M80 330 C200 326 360 332 500 326" fill="none" stroke={C.blue} strokeWidth="20" strokeLinecap="round" />
        <circle cx="500" cy="326" r="19" fill={C.blue} />
      </svg>
      <div style={{position: 'absolute', left: 78, top: 56, background: C.red, color: '#fff', fontSize: 40, fontWeight: 700, padding: '4px 22px', borderRadius: 999}}>{s.tag}</div>
      <div style={{position: 'absolute', left: 90, top: 352, background: C.blue, color: '#fff', fontSize: 40, fontWeight: 700, padding: '4px 22px', borderRadius: 999}}>{s.tag2}</div>
    </div>
    <Badge text={badge} />
    <Headline width={560} lines={[{t: s.lines[0], size: 112, color: C.ink}, {t: s.lines[1], size: 196, color: C.red}, {t: s.lines[2] ?? '', size: 196, color: C.red}]} gap={2} />
  </AbsoluteFill>
);

// ---------------------------------------------------------------------------------------------------------------- 5
const PhoneThumb: React.FC<{s: DesignSpec; badge: string}> = ({s, badge}) => (
  <AbsoluteFill style={{background: C.yellow, fontFamily: FONT, direction: 'rtl', overflow: 'hidden'}}>
    <div style={{position: 'absolute', left: -90, top: -50, width: 800, height: 800, borderRadius: '50%', background: '#fff', opacity: 0.32}} />
    <svg width={700} height={720} viewBox="0 0 700 720" style={{position: 'absolute', left: -10, top: 0}}>
      <Gear cx={130} cy={560} r={80} fill={C.ink} hole={C.yellow} rotate={8} />
      <Gear cx={560} cy={150} r={64} fill="#fff" hole={C.yellow} teeth={9} rotate={20} />
      <Gear cx={575} cy={560} r={46} fill={C.blue} hole={C.yellow} teeth={8} />
      <g transform="translate(150 60) rotate(-8 190 300)" style={{filter: 'drop-shadow(0 26px 30px rgba(28,35,51,0.35))'}}>
        <rect width="380" height="610" rx="56" fill={C.ink} />
        <rect x="18" y="22" width="344" height="566" rx="40" fill="#fff" />
        <rect x="46" y="70" width="210" height="62" rx="31" fill={C.blueSoft} />
        <rect x="124" y="156" width="210" height="62" rx="31" fill={C.green} />
        <rect x="46" y="242" width="250" height="62" rx="31" fill={C.blueSoft} />
        <rect x="124" y="328" width="190" height="62" rx="31" fill={C.green} />
        <rect x="46" y="418" width="150" height="62" rx="31" fill={C.blueSoft} />
        <circle cx="86" cy="540" r="26" fill={C.yellow} />
        <rect x="130" y="522" width="170" height="36" rx="18" fill={C.line} />
      </g>
    </svg>
    <Badge text={badge} />
    <Headline lines={[{t: s.lines[0], size: 204, color: C.ink}, {t: s.lines[1], size: 122, color: C.ink}]} gap={6}>
      <div style={{display: 'flex', gap: 16, marginTop: 28, flexWrap: 'wrap'}}>
        {s.tag ? <Pill text={s.tag} size={52} bg={C.ink} color="#fff" /> : null}
        {s.tag2 ? <Pill text={s.tag2} size={52} bg="#fff" color={C.ink} /> : null}
      </div>
    </Headline>
  </AbsoluteFill>
);

// ---------------------------------------------------------------------------------------------------------------- 6
const Repeat: React.FC<{s: DesignSpec; badge: string}> = ({s, badge}) => (
  <AbsoluteFill style={{background: 'linear-gradient(140deg, #1F9468 0%, #146B4A 100%)', fontFamily: FONT, direction: 'rtl', overflow: 'hidden'}}>
    <div style={{position: 'absolute', left: -80, top: 120, width: 640, height: 640, borderRadius: '50%', background: '#fff', opacity: 0.08}} />
    <svg width={620} height={720} viewBox="0 0 620 720" style={{position: 'absolute', left: 20, top: 0}}>
      <g transform="translate(110 46) rotate(6 200 330)" style={{filter: 'drop-shadow(0 26px 34px rgba(0,0,0,0.4))'}}>
        <rect width="400" height="660" rx="58" fill={C.ink} />
        <rect x="18" y="22" width="364" height="616" rx="42" fill="#EEF5F0" />
        {Array.from({length: 6}, (_, k) => (
          <g key={k} transform={`translate(${k % 2 ? 84 : 34} ${52 + k * 94})`} opacity={1 - k * 0.1}>
            <rect width="282" height="74" rx="37" fill="#fff" stroke="#CFE3D7" strokeWidth="3" />
            <text x="141" y="52" textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize="40" fill={C.ink}>
              كم السعر؟
            </text>
          </g>
        ))}
      </g>
      <g transform="translate(470 118)">
        <circle r="92" fill={C.red} stroke="#fff" strokeWidth="10" />
        <text y="26" textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize="84" fill="#fff" style={{direction: 'ltr'}}>
          ×40
        </text>
      </g>
    </svg>
    <Badge text={badge} dark />
    <Headline lines={[{t: s.lines[0], size: 132, color: '#fff'}, {t: s.lines[1], size: 226, color: C.yellow}]} gap={0}>
      {s.tag ? (
        <div style={{marginTop: 30}}>
          <Pill text={s.tag} size={62} bg="#fff" color="#146B4A" />
        </div>
      ) : null}
    </Headline>
  </AbsoluteFill>
);

// ---------------------------------------------------------------------------------------------------------------- 7
const Versus: React.FC<{s: DesignSpec; badge: string}> = ({s, badge}) => (
  <AbsoluteFill style={{background: 'linear-gradient(135deg, #2A66DE 0%, #3B7DF6 100%)', fontFamily: FONT, direction: 'rtl', overflow: 'hidden'}}>
    <div style={{position: 'absolute', left: 40, top: 70, width: 470, height: 470, borderRadius: '50%', background: C.yellow, boxShadow: '0 30px 60px rgba(8,28,80,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 380, fontWeight: 700, color: C.ink, lineHeight: 1}}>
      <Ltr>$</Ltr>
    </div>
    <div style={{position: 'absolute', left: 20, bottom: 66, filter: 'drop-shadow(0 12px 16px rgba(8,28,80,0.35))'}}>
      <PeopleGrid count={13} cols={13} cell={40} color="#fff" subs={2} />
    </div>
    <Badge text={badge} dark />
    <Headline lines={[{t: s.lines[0], size: 172, color: '#fff'}, {t: s.lines[1], size: 118, color: C.yellow}]} gap={6}>
      {s.tag ? (
        <div style={{marginTop: 30}}>
          <Pill text={s.tag} size={50} bg={C.red} color="#fff" />
        </div>
      ) : null}
    </Headline>
  </AbsoluteFill>
);

// ---------------------------------------------------------------------------------------------------------------- 8
const Trap: React.FC<{s: DesignSpec; badge: string}> = ({s, badge}) => (
  <AbsoluteFill style={{background: 'linear-gradient(150deg, #D8483A 0%, #A92F25 100%)', fontFamily: FONT, direction: 'rtl', overflow: 'hidden'}}>
    <div style={{position: 'absolute', left: -60, top: 100, width: 700, height: 700, borderRadius: '50%', background: '#fff', opacity: 0.08}} />
    <svg width={640} height={720} viewBox="0 0 640 720" style={{position: 'absolute', left: 10, top: 0}}>
      {[-1, 1].map((d) =>
        [0, 1, 2].map((k) => <path key={`${d}${k}`} d={`M${320 + d * (212 + k * 30)} ${240 - k * 18} q${d * 22} 100 0 200`} fill="none" stroke="#fff" strokeWidth="9" strokeLinecap="round" opacity={0.7 - k * 0.2} />),
      )}
      <g transform="translate(150 70) rotate(7 170 300)" style={{filter: 'drop-shadow(0 28px 36px rgba(0,0,0,0.45))'}}>
        <rect width="340" height="600" rx="52" fill={NAVY} />
        <rect x="16" y="20" width="308" height="560" rx="38" fill="#26324F" />
        <text x="170" y="136" textAnchor="middle" fontFamily={FONT} fontWeight={500} fontSize="98" fill="#fff" style={{direction: 'ltr'}}>
          8:07
        </text>
        <g transform="translate(36 190)">
          <rect width="268" height="250" rx="30" fill="#fff" />
          <polygon points="134,36 190,132 78,132" fill={C.red} />
          <rect x="128" y="62" width="12" height="38" rx="6" fill="#fff" />
          <circle cx="134" cy="114" r="7" fill="#fff" />
          <rect x="40" y="160" width="188" height="16" rx="8" fill={C.line} />
          <rect x="62" y="192" width="144" height="16" rx="8" fill={C.line} />
        </g>
      </g>
    </svg>
    <Badge text={badge} dark />
    <Headline width={560} lines={[{t: s.lines[0], size: 128, color: '#fff'}, {t: s.lines[1], size: 206, color: C.yellow}]} gap={4}>
      {s.tag ? (
        <div style={{marginTop: 30}}>
          <Pill text={s.tag} size={58} bg="transparent" color="#fff" border="#fff" max={560} />
        </div>
      ) : null}
    </Headline>
  </AbsoluteFill>
);

// ---------------------------------------------------------------------------------------------------------------- 9
const Platform: React.FC<{s: DesignSpec; badge: string}> = ({s, badge}) => (
  <AbsoluteFill style={{background: 'linear-gradient(180deg, #E8F0FD 0%, #C9DAF6 100%)', fontFamily: FONT, direction: 'rtl', overflow: 'hidden'}}>
    <svg width={680} height={720} viewBox="0 0 680 720" style={{position: 'absolute', left: 0, top: 0}}>
      <g transform="translate(150 150) scale(3.3)">
        <HouseGlyph fill={C.ink} door={C.yellow} />
      </g>
      <g transform="translate(24 470) rotate(-4 300 60)" style={{filter: 'drop-shadow(0 30px 34px rgba(28,35,51,0.3))'}}>
        <rect width="540" height="120" rx="38" fill="#fff" />
        <rect x="0" y="80" width="540" height="40" rx="20" fill="#DCE5F5" />
        <text x="190" y="64" textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize="50" fill="#7C879C">
          ملك المنصة
        </text>
        <path d="M400 0 l26 44 -24 20 30 56" fill="none" stroke={C.red} strokeWidth="9" strokeLinejoin="round" strokeLinecap="round" />
      </g>
      <g transform="translate(398 392) scale(1.7) rotate(-4 50 60)">
        <Padlock body={C.red} shackle={C.ink} />
      </g>
    </svg>
    <div style={{position: 'absolute', left: 60, top: 110, transform: 'rotate(-12deg)', border: `12px solid ${C.red}`, borderRadius: 24, padding: '0 34px 6px', color: C.red, fontSize: 100, fontWeight: 700, background: 'rgba(255,255,255,0.9)'}}>
      {s.extra}
    </div>
    <Badge text={badge} />
    <Headline lines={[{t: s.lines[0], size: 122, color: C.ink}, {t: s.lines[1], size: 176, color: C.red}]} gap={8} />
  </AbsoluteFill>
);

// --------------------------------------------------------------------------------------------------------------- 10
const Puzzle: React.FC<{s: DesignSpec; badge: string}> = ({s, badge}) => {
  const tile = (t: string, bg: string, color: string) => (
    <div style={{width: 168, height: 168, borderRadius: 36, background: bg, color, fontSize: 112, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 18px 30px rgba(0,0,0,0.35)'}}>
      <Ltr>{t}</Ltr>
    </div>
  );
  const op = (t: string) => <div style={{fontSize: 100, fontWeight: 700, color: '#8EA0C0', width: 70, textAlign: 'center'}}>{t}</div>;
  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 35%, #26365E 0%, #141B2B 70%)', fontFamily: FONT, direction: 'rtl', overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 96, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 14, direction: 'ltr'}}>
        <div style={{border: '8px solid rgba(255,255,255,0.35)', borderRadius: 54, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 6}}>
          {tile('55', '#fff', C.ink)}
          {op('−')}
          {tile('13', '#fff', C.ink)}
        </div>
        {op('×')}
        {tile('؟', C.yellow, C.ink)}
      </div>
      <Badge text={badge} dark />
      <div style={{position: 'absolute', left: 90, right: 90, top: 330, display: 'flex', justifyContent: 'center'}}>
        <FitText t={s.lines[0]} size={170} max={1100} color="#fff" />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 566, display: 'flex', justifyContent: 'center'}}>
        {s.tag ? <Pill text={s.tag} size={72} bg={C.yellow} color={C.ink} /> : null}
      </div>
    </AbsoluteFill>
  );
};

export const ThumbDesign: React.FC<{spec: DesignSpec; badge: string}> = ({spec, badge}) => {
  const map: Record<DesignName, React.FC<{s: DesignSpec; badge: string}>> = {
    story: Story,
    scale: Scale,
    time: Time,
    income: Income,
    phone: PhoneThumb,
    repeat: Repeat,
    versus: Versus,
    trap: Trap,
    platform: Platform,
    puzzle: Puzzle,
  };
  const D = map[spec.design];
  return <D s={spec} badge={badge} />;
};
