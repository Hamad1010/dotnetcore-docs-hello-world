// Story thumbnails (framework v5 §3.13, from EP002 on): one picture from the video's story on the left, the headline and a
// pill on the right, in one of our tones. The texts live in 03-episodes/EP00N/thumbs.json ("layout": "design"), like the
// ten designs in ThumbDesigns.tsx. Plain shapes and our silhouettes only: no photos, no logos, never a face.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {geoMercator, geoPath, type GeoPermissibleObjects} from 'd3-geo';
import {feature} from 'topojson-client';
import world from 'world-atlas/countries-110m.json';
import {C, FONT} from './theme';
import {PeopleGrid, Person, Skyline} from './components/Silhouettes';
import {HouseGlyph, Star8} from './brand-art';
import {Badge, Headline, Pill} from './thumb-kit';
import type {DesignSpec} from './ThumbDesigns';

export type StoryDesign =
  | 'doors'
  | 'scissors'
  | 'dinner'
  | 'growth'
  | 'seven'
  | 'factory'
  | 'thobe'
  | 'branches'
  | 'calendar'
  | 'blog'
  | 'equal'
  | 'people4'
  | 'desks'
  | 'asks'
  | 'fork'
  | 'graph'
  | 'giant'
  | 'address';
export type Tone = 'navy' | 'blue' | 'green' | 'red' | 'yellow' | 'light';

type P = {s: DesignSpec; badge: string};

const TONES: Record<Tone, {bg: string; a: string; b: string; pillBg: string; pillInk: string; dark: boolean}> = {
  navy: {bg: 'radial-gradient(ellipse at 24% 62%, #2C3B66 0%, #141B2B 64%)', a: '#fff', b: C.yellow, pillBg: C.yellow, pillInk: C.ink, dark: true},
  blue: {bg: 'linear-gradient(135deg, #2A66DE 0%, #3B7DF6 55%, #5B9BFF 100%)', a: '#fff', b: C.yellow, pillBg: '#fff', pillInk: '#2A66DE', dark: true},
  green: {bg: 'linear-gradient(140deg, #1F9468 0%, #146B4A 100%)', a: '#fff', b: C.yellow, pillBg: '#fff', pillInk: '#146B4A', dark: true},
  red: {bg: 'linear-gradient(150deg, #D8483A 0%, #A92F25 100%)', a: '#fff', b: C.yellow, pillBg: '#fff', pillInk: '#A92F25', dark: true},
  yellow: {bg: C.yellow, a: C.ink, b: C.ink, pillBg: C.ink, pillInk: '#fff', dark: false},
  light: {bg: '#F5F7FB', a: C.ink, b: C.red, pillBg: C.ink, pillInk: '#fff', dark: false},
};

/** Background, picture (children, drawn in the left 640 px), the file badge, the headline and its pills. */
const Frame: React.FC<P & {tone: Tone; sizes: [number, number]; width?: number; pill?: number; children: React.ReactNode}> = ({s, badge, tone, sizes, width = 600, pill = 62, children}) => {
  const t = TONES[s.tone ?? tone];
  return (
    <AbsoluteFill style={{background: t.bg, fontFamily: FONT, direction: 'rtl', overflow: 'hidden'}}>
      {children}
      <Badge text={badge} dark={t.dark} />
      <Headline width={width} lines={[{t: s.lines[0], size: sizes[0], color: t.a}, {t: s.lines[1] ?? '', size: sizes[1], color: t.b}]} gap={6}>
        <div style={{display: 'flex', gap: 16, marginTop: 26, flexWrap: 'wrap'}}>
          {s.tag ? <Pill text={s.tag} size={pill} bg={t.pillBg} color={t.pillInk} max={width} /> : null}
          {s.tag2 ? <Pill text={s.tag2} size={pill * 0.84} bg="transparent" color={t.a} border={t.a} max={width} /> : null}
        </div>
      </Headline>
    </AbsoluteFill>
  );
};

const Pic: React.FC<{children: React.ReactNode; shadow?: string}> = ({children, shadow = 'rgba(0,0,0,0.45)'}) => (
  <svg width={640} height={720} viewBox="0 0 640 720" style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', filter: `drop-shadow(0 24px 32px ${shadow})`}}>
    {children}
  </svg>
);

const Word: React.FC<{x: number; y: number; size: number; fill: string; children: React.ReactNode; weight?: number}> = ({x, y, size, fill, children, weight = 700}) => (
  <text x={x} y={y} textAnchor="middle" fontFamily={FONT} fontWeight={weight} fontSize={size} fill={fill} style={{direction: 'rtl'}}>
    {children}
  </text>
);

// ------------------------------------------------------------------------------------------- doors: «لا» on every door
const Doors: React.FC<P> = (p) => {
  const yes = p.s.extra;
  const doors = [
    {x: 26, y: 236, w: 118, h: 300},
    {x: 172, y: 214, w: 118, h: 300},
    {x: 318, y: 192, w: 118, h: 300},
    {x: 464, y: 170, w: 118, h: 300},
  ];
  return (
    <Frame {...p} tone="navy" sizes={[150, 150]}>
      <Pic>
        {doors.map((d, i) => {
          const open = yes && i === doors.length - 1;
          return (
            <g key={i} transform={`translate(${d.x} ${d.y})`}>
              {open ? <polygon points={`0,${d.h} ${d.w},${d.h} ${d.w + 60},${d.h + 80} ${-70},${d.h + 80}`} fill={C.yellow} opacity={0.35} /> : null}
              <rect x={-10} y={-12} width={d.w + 20} height={d.h + 12} rx={16} fill="#fff" />
              <rect width={d.w} height={d.h} rx={8} fill={open ? C.yellow : '#3A4870'} />
              {open ? <path d={`M0 0 L${d.w * 0.42} ${-18} L${d.w * 0.42} ${d.h + 18} L0 ${d.h} Z`} fill="#3A4870" /> : <circle cx={d.w - 22} cy={d.h * 0.55} r={8} fill={C.yellow} />}
              <g transform={`translate(${d.w / 2} ${d.h * 0.42}) rotate(-14)`}>
                <rect x={-58} y={-40} width={116} height={80} rx={14} fill="rgba(20,27,43,0.9)" stroke={open ? C.green : '#FF6B5B'} strokeWidth={9} />
                <Word x={0} y={22} size={60} fill={open ? C.green : '#FF6B5B'}>
                  {open ? yes : 'لا'}
                </Word>
              </g>
            </g>
          );
        })}
        <g transform="translate(40 470)">
          <Person size={230} color="#0E1424" />
        </g>
      </Pic>
    </Frame>
  );
};

// ------------------------------------------------------------------------------------------- scissors: the idea, one night
const Scissors: React.FC<P> = (p) => (
  <Frame {...p} tone="navy" sizes={[132, 190]}>
    <Pic>
      <g transform="translate(110 70)">
        <circle cx={60} cy={60} r={86} fill={C.yellow} opacity={0.18} />
        <circle cx={60} cy={56} r={46} fill={C.yellow} />
        <rect x={40} y={98} width={40} height={30} rx={8} fill="#E9EEF6" />
        <rect x={46} y={132} width={28} height={10} rx={5} fill="#E9EEF6" />
      </g>
      <g transform="translate(330 420) rotate(-8)">
        <polygon points="0,-14 250,-170 270,-150 10,16" fill="#E9EEF6" />
        <polygon points="0,14 280,-60 284,-34 -6,30" fill="#C9D3E3" />
        <path d="M-6 6 C-60 40 -100 90 -120 140" stroke={C.red} strokeWidth={30} strokeLinecap="round" fill="none" />
        <path d="M6 10 C-10 70 -20 130 -10 190" stroke={C.red} strokeWidth={30} strokeLinecap="round" fill="none" />
        <circle cx={-150} cy={180} r={60} fill="none" stroke={C.red} strokeWidth={28} />
        <circle cx={-6} cy={250} r={60} fill="none" stroke={C.red} strokeWidth={28} />
        <circle r={16} fill={C.ink} stroke="#fff" strokeWidth={5} />
      </g>
      <path d="M380 690 L620 600" stroke="#fff" strokeWidth={6} strokeDasharray="18 16" opacity={0.6} />
      <Star8 cx={560} cy={150} r={22} fill={C.yellow} />
      <Star8 cx={500} cy={80} r={12} fill="#fff" opacity={0.8} />
      <Star8 cx={604} cy={250} r={10} fill="#fff" opacity={0.6} />
    </Pic>
  </Frame>
);

// ------------------------------------------------------------------------------------------- dinner: the father's question
const Dinner: React.FC<P> = (p) => (
  <Frame {...p} tone="navy" sizes={[150, 110]}>
    <Pic>
      <line x1={470} y1={0} x2={470} y2={170} stroke="#8EA0C0" strokeWidth={6} />
      <polygon points="420,170 520,170 556,240 384,240" fill={C.yellow} />
      <polygon points="384,240 556,240 640,560 300,560" fill={C.yellow} opacity={0.14} />
      <g transform="translate(250 330)">
        <Person size={330} color="#5A6A92" />
      </g>
      <g transform="translate(70 410)">
        <Person size={240} color="#46557C" />
      </g>
      <g transform="translate(440 410)">
        <Person size={240} color="#46557C" />
      </g>
      <rect x={30} y={600} width={600} height={34} rx={12} fill="#E9EEF6" />
      <rect x={70} y={634} width={20} height={86} fill="#C9D3E3" />
      <rect x={570} y={634} width={20} height={86} fill="#C9D3E3" />
      {[140, 330, 520].map((x) => (
        <ellipse key={x} cx={x} cy={600} rx={62} ry={14} fill="#fff" stroke="#C9D3E3" strokeWidth={4} />
      ))}
    </Pic>
    {p.s.extra ? (
      <div style={{position: 'absolute', left: 30, top: 70, width: 400, background: '#fff', color: C.ink, borderRadius: 30, padding: '20px 26px', fontSize: 46, fontWeight: 700, lineHeight: 1.3, boxShadow: '0 18px 30px rgba(0,0,0,0.35)'}}>
        {p.s.extra}
        <div style={{position: 'absolute', bottom: -26, right: 120, width: 0, height: 0, borderLeft: '22px solid transparent', borderRight: '22px solid transparent', borderTop: '30px solid #fff'}} />
      </div>
    ) : null}
  </Frame>
);

// ------------------------------------------------------------------------------------------- growth: a small stack → a tall one
const Coin: React.FC<{x: number; y: number}> = ({x, y}) => (
  <g>
    <ellipse cx={x} cy={y + 22} rx={92} ry={26} fill="#A97400" />
    <rect x={x - 92} y={y} width={184} height={22} fill="#C98A00" />
    <ellipse cx={x} cy={y} rx={92} ry={26} fill={C.yellow} stroke="#C98A00" strokeWidth={4} />
  </g>
);
const Growth: React.FC<P> = (p) => {
  const [a, b] = p.s.labels ?? ['', ''];
  return (
    <Frame {...p} tone="green" sizes={[118, 150]}>
      <Pic>
        {Array.from({length: 3}, (_, k) => <Coin key={k} x={130} y={610 - k * 30} />)}
        {Array.from({length: 13}, (_, k) => <Coin key={k} x={420} y={610 - k * 34} />)}
        <path d="M150 470 C170 300 260 180 340 150" stroke="#fff" strokeWidth={12} fill="none" strokeLinecap="round" strokeDasharray="2 24" />
        <polygon points="336,126 370,146 334,170" fill="#fff" />
        {a ? (
          <g transform="translate(130 676)">
            <rect x={-80} y={-30} width={160} height={56} rx={28} fill="#fff" />
            <Word x={0} y={14} size={40} fill={C.ink}>
              {a}
            </Word>
          </g>
        ) : null}
        {b ? (
          <g transform="translate(420 676)">
            <rect x={-80} y={-30} width={160} height={56} rx={28} fill={C.ink} />
            <Word x={0} y={14} size={40} fill="#fff">
              {b}
            </Word>
          </g>
        ) : null}
      </Pic>
    </Frame>
  );
};

// ------------------------------------------------------------------------------------------- seven: the 7-year mystery
const Folder: React.FC<{x: number; y: number; r: number; n: string}> = ({x, y, r, n}) => (
  <g transform={`translate(${x} ${y}) rotate(${r})`}>
    <rect x={0} y={-22} width={90} height={30} rx={10} fill={C.yellow} />
    <rect x={0} y={0} width={200} height={140} rx={18} fill="#fff" />
    <Word x={100} y={98} size={76} fill={C.ink}>
      {n}
    </Word>
  </g>
);
const Seven: React.FC<P> = (p) => (
  <Frame {...p} tone="navy" sizes={[160, 140]}>
    <Pic>
      <text x={300} y={590} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={640} fill={C.yellow} style={{direction: 'ltr'}}>
        7
      </text>
      <Folder x={20} y={520} r={-10} n="1" />
      <Folder x={220} y={560} r={4} n="2" />
      <Folder x={420} y={526} r={12} n="3" />
    </Pic>
  </Frame>
);

// ------------------------------------------------------------------------------------------- factory: one tailor → 250
const Factory: React.FC<P> = (p) => (
  <Frame {...p} tone="blue" sizes={[124, 150]}>
    <Pic shadow="rgba(8,28,80,0.35)">
      <g transform="translate(36 40) scale(2.1)">
        <HouseGlyph fill="#fff" door={C.yellow} />
      </g>
      <g transform="translate(118 196)">
        <Person size={64} color={C.ink} />
      </g>
      <g transform="translate(240 70)">
        <circle r={42} fill={C.yellow} />
        <Word x={0} y={18} size={52} fill={C.ink}>
          1
        </Word>
      </g>
      <path d="M300 220 C420 220 470 270 480 340" stroke="#fff" strokeWidth={12} fill="none" strokeLinecap="round" strokeDasharray="2 22" />
      <polygon points="458,336 504,336 482,374" fill="#fff" />
      <path d="M40 700 V470 L140 410 V470 L240 410 V470 L340 410 V470 L440 410 V470 L540 410 V470 L620 430 V700 Z" fill="#fff" />
      <g transform="translate(76 500)">
        <PeopleGrid count={45} cols={15} cell={33} color="#2A66DE" />
      </g>
      <g transform="translate(110 420)">
        <circle r={62} fill={C.yellow} stroke="#fff" strokeWidth={8} />
        <text y={20} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={56} fill={C.ink} style={{direction: 'ltr'}}>
          250
        </text>
      </g>
    </Pic>
  </Frame>
);

// ------------------------------------------------------------------------------------------- thobe: the everyday thing
const Thobe: React.FC<P> = (p) => (
  <Frame {...p} tone="navy" sizes={[170, 120]}>
    <Pic>
      <path d="M282 128 L196 166 L104 452 L168 474 L214 296 L186 706 L454 706 L426 296 L472 474 L536 452 L444 166 L358 128 Z" fill="#F7F9FC" />
      <path d="M214 296 L186 706 L320 706 Z" fill="#E4EAF3" />
      <rect x={284} y={104} width={72} height={34} rx={12} fill="#fff" stroke="#C9D3E3" strokeWidth={5} />
      <line x1={320} y1={138} x2={320} y2={318} stroke="#C9D3E3" strokeWidth={6} />
      {[176, 226, 276].map((y) => (
        <circle key={y} cx={320} cy={y} r={8} fill="#8EA0C0" />
      ))}
      <path d="M150 210 C230 250 300 200 360 238 C420 276 470 230 540 270" stroke={C.yellow} strokeWidth={22} fill="none" strokeLinecap="round" />
      {Array.from({length: 12}, (_, k) => (
        <line key={k} x1={170 + k * 30} y1={218 + Math.sin(k) * 8} x2={170 + k * 30} y2={232 + Math.sin(k) * 8} stroke={C.ink} strokeWidth={3} />
      ))}
      <line x1={520} y1={560} x2={600} y2={470} stroke="#C9D3E3" strokeWidth={6} strokeLinecap="round" />
      <path d="M600 470 C640 520 560 560 590 610 C610 640 640 620 630 660" stroke={C.red} strokeWidth={5} fill="none" />
      <Star8 cx={110} cy={120} r={18} fill={C.yellow} />
      <Star8 cx={560} cy={120} r={11} fill="#fff" opacity={0.7} />
    </Pic>
  </Frame>
);

// ------------------------------------------------------------------------------------------- branches: from Jeddah, across the Kingdom
const topo = world as any;
const SaudiMap: React.FC<{w: number; h: number; pin: [number, number]}> = ({w, h, pin}) => {
  const land = feature(topo, topo.objects.countries) as any;
  const sa = land.features.find((f: any) => f.id === '682' || f.properties?.name === 'Saudi Arabia') as GeoPermissibleObjects;
  const proj = geoMercator().fitSize([w, h], sa);
  const d = geoPath(proj)(sa) ?? '';
  const [x, y] = proj([pin[1], pin[0]]) ?? [0, 0];
  return (
    <g>
      <path d={d} fill="#fff" stroke="#C9D3E3" strokeWidth={4} />
      <g transform={`translate(${x + 46} ${y - 70}) scale(0.8)`}>
        <HouseGlyph fill={C.ink} door={C.yellow} />
      </g>
      <g transform={`translate(${x} ${y})`}>
        <circle r={40} fill={C.red} opacity={0.22} />
        <path d="M0 0 C-30 -40 -30 -78 0 -86 C30 -78 30 -40 0 0 Z" fill={C.red} />
        <circle cy={-58} r={13} fill="#fff" />
      </g>
    </g>
  );
};
const Branches: React.FC<P> = (p) => (
  <Frame {...p} tone="green" sizes={[130, 130]}>
    <Pic>
      <g transform="translate(30 120)">
        <SaudiMap w={580} h={520} pin={[21.54, 39.17]} />
      </g>
    </Pic>
  </Frame>
);

// ------------------------------------------------------------------------------------------- calendar: 4 years before quitting
const Page: React.FC<{x: number; y: number; year: string; head: string; r: number}> = ({x, y, year, head, r}) => (
  <g transform={`translate(${x} ${y}) rotate(${r})`}>
    <rect width={250} height={290} rx={30} fill="#fff" />
    <path d="M0 30 a30 30 0 0 1 30 -30 h190 a30 30 0 0 1 30 30 v54 h-250 Z" fill={head} />
    <rect x={56} y={-16} width={16} height={40} rx={8} fill={C.ink} />
    <rect x={178} y={-16} width={16} height={40} rx={8} fill={C.ink} />
    <text x={125} y={220} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={96} fill={C.ink} style={{direction: 'ltr'}}>
      {year}
    </text>
  </g>
);
const Calendar: React.FC<P> = (p) => {
  const [a, b] = p.s.labels ?? ['2001', '2005'];
  return (
    <Frame {...p} tone="red" sizes={[136, 190]}>
      <Pic>
        <Page x={360} y={110} year={b} head={C.green} r={6} />
        <Page x={20} y={170} year={a} head={C.ink} r={-6} />
        <g transform="translate(250 560)">
          <rect x={-110} y={-70} width={220} height={150} rx={22} fill="#3A2A1E" />
          <rect x={-46} y={-100} width={92} height={40} rx={12} fill="none" stroke="#3A2A1E" strokeWidth={14} />
          <rect x={-110} y={-10} width={220} height={14} fill="#2A1E15" />
          <rect x={-18} y={-22} width={36} height={36} rx={6} fill={C.yellow} />
        </g>
      </Pic>
    </Frame>
  );
};

// ------------------------------------------------------------------------------------------- blog: free content first
const Blog: React.FC<P> = (p) => (
  <Frame {...p} tone="blue" sizes={[118, 140]}>
    <Pic shadow="rgba(8,28,80,0.4)">
      <g transform="translate(40 150)">
        <rect width={540} height={350} rx={26} fill={C.ink} />
        <rect x={18} y={18} width={504} height={314} rx={14} fill="#fff" />
        <rect x={18} y={18} width={504} height={44} rx={14} fill="#E7EFFE" />
        {[42, 70, 98].map((x) => (
          <circle key={x} cx={x} cy={40} r={9} fill="#8EA0C0" />
        ))}
        <rect x={50} y={88} width={190} height={200} rx={20} fill={C.blueSoft} />
        <path d="M80 200 C110 160 180 160 210 200" stroke={C.ink} strokeWidth={9} fill="none" strokeLinecap="round" />
        {[0, 1, 2, 3, 4].map((k) => (
          <line key={k} x1={92 + k * 26} y1={186 - Math.sin((k / 4) * Math.PI) * 18} x2={86 + k * 28} y2={160 - Math.sin((k / 4) * Math.PI) * 30} stroke={C.ink} strokeWidth={6} strokeLinecap="round" />
        ))}
        {[100, 140, 180, 220, 260].map((y, k) => (
          <rect key={y} x={270} y={y} width={k % 2 ? 160 : 210} height={18} rx={9} fill={C.line} />
        ))}
        <path d="M-30 350 H570 L600 400 H-60 Z" fill="#C9D3E3" />
      </g>
      {p.s.extra ? (
        <g transform="translate(470 120) rotate(12)">
          <rect x={-104} y={-44} width={208} height={88} rx={20} fill={C.green} stroke="#fff" strokeWidth={6} />
          <Word x={0} y={20} size={56} fill="#fff">
            {p.s.extra}
          </Word>
        </g>
      ) : null}
    </Pic>
  </Frame>
);

// ------------------------------------------------------------------------------------------- equal: the same number twice
const Equal: React.FC<P> = (p) => {
  const card = (x: number, r: number, icon: React.ReactNode) => (
    <g transform={`translate(${x} 210) rotate(${r})`}>
      <rect width={250} height={330} rx={32} fill="#fff" />
      <g transform="translate(125 86)">{icon}</g>
      <text x={125} y={236} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={120} fill={C.ink} style={{direction: 'ltr'}}>
        1.2
      </text>
      <Word x={125} y={296} size={40} fill={C.ink2} weight={600}>
        مليار $
      </Word>
    </g>
  );
  return (
    <Frame {...p} tone="navy" sizes={[156, 120]}>
      <Pic>
        {card(14, -6, (
          <g>
            <circle cx={-26} cy={20} r={20} fill="none" stroke={C.red} strokeWidth={10} />
            <circle cx={26} cy={20} r={20} fill="none" stroke={C.red} strokeWidth={10} />
            <path d="M-16 4 L30 -46 M16 4 L-30 -46" stroke="#8EA0C0" strokeWidth={10} strokeLinecap="round" />
          </g>
        ))}
        {card(372, 6, (
          <g>
            <rect x={-48} y={-40} width={96} height={64} rx={8} fill={C.ink} />
            <rect x={-40} y={-32} width={80} height={48} rx={4} fill={C.blueSoft} />
            <path d="M-62 26 H62 L70 40 H-70 Z" fill="#8EA0C0" />
          </g>
        ))}
        <g transform="translate(318 380)">
          <circle r={58} fill={C.yellow} stroke="#141B2B" strokeWidth={8} />
          <rect x={-36} y={-22} width={72} height={14} rx={7} fill={C.ink} />
          <rect x={-36} y={8} width={72} height={14} rx={7} fill={C.ink} />
        </g>
      </Pic>
    </Frame>
  );
};

// ------------------------------------------------------------------------------------------- people4: a few of many, lit
// `labels: [total, lit]` (default 4 and 1): up to 4 people stand in a row; more stand in two rows of five.
const People4: React.FC<P> = (p) => {
  const [total, lit] = (p.s.labels ?? ['4', '1']).map(Number);
  if (total > 4) {
    const cols = 5;
    return (
      <Frame {...p} tone="navy" sizes={[176, 130]}>
        <Pic>
          {Array.from({length: total}, (_, k) => {
            const row = Math.floor(k / cols);
            const col = k % cols;
            const on = k >= total - lit;
            return (
              <g key={k} transform={`translate(${20 + col * 118} ${200 + row * 250})`}>
                {on ? <circle cx={60} cy={110} r={92} fill={C.yellow} opacity={0.2} /> : null}
                <Person size={210} color={on ? C.yellow : '#4A5A82'} />
              </g>
            );
          })}
        </Pic>
      </Frame>
    );
  }
  return (
    <Frame {...p} tone="navy" sizes={[176, 130]}>
      <Pic>
        <circle cx={478} cy={500} r={140} fill={C.yellow} opacity={0.2} />
        {[0, 1, 2].map((k) => (
          <g key={k} transform={`translate(${k * 118} ${400 + (k % 2) * 20})`}>
            <Person size={300} color="#4A5A82" />
          </g>
        ))}
        <g transform="translate(360 380)">
          <Person size={330} color={C.yellow} />
        </g>
      </Pic>
    </Frame>
  );
};

// ------------------------------------------------------------------------------------------- desks: same salary, ×6
const Desk: React.FC<{x: number; lit: boolean}> = ({x, lit}) => {
  const tone = lit ? C.yellow : '#4A5A82';
  return (
    <g transform={`translate(${x} 0)`}>
      {lit ? <circle cx={140} cy={460} r={170} fill={C.yellow} opacity={0.16} /> : null}
      <g transform="translate(62 330)">
        <Person size={240} color={tone} />
      </g>
      <rect x={70} y={420} width={150} height={100} rx={12} fill={lit ? '#fff' : '#2E3A5C'} />
      <rect x={130} y={520} width={30} height={40} fill={lit ? '#fff' : '#2E3A5C'} />
      <rect x={0} y={556} width={290} height={26} rx={10} fill={lit ? '#fff' : '#3A4870'} />
      <rect x={20} y={582} width={16} height={130} fill={lit ? '#E9EEF6' : '#2E3A5C'} />
      <rect x={254} y={582} width={16} height={130} fill={lit ? '#E9EEF6' : '#2E3A5C'} />
    </g>
  );
};
const Desks: React.FC<P> = (p) => (
  <Frame {...p} tone="navy" sizes={[124, 170]}>
    <Pic>
      <Desk x={10} lit={false} />
      <Desk x={330} lit />
      <g transform="translate(486 250)">
        <circle r={66} fill={C.red} stroke="#fff" strokeWidth={9} />
        <text y={28} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={80} fill="#fff" style={{direction: 'ltr'}}>
          ×6
        </text>
      </g>
    </Pic>
  </Frame>
);

// ------------------------------------------------------------------------------------------- asks: what people always ask you for
const ASKS = ['تكفى…', 'صوّر لي', 'رتّب لنا', 'ساعدني', 'علّمني'];
const Asks: React.FC<P> = (p) => {
  const spots: [number, number, number][] = [
    [24, 60, -6],
    [300, 36, 5],
    [390, 200, -4],
    [14, 290, 4],
    [392, 372, 6],
  ];
  return (
    <Frame {...p} tone="yellow" sizes={[180, 180]}>
      <Pic shadow="rgba(28,35,51,0.25)">
        <circle cx={300} cy={470} r={210} fill="#fff" opacity={0.35} />
        <g transform="translate(176 360)">
          <Person size={360} color={C.ink} />
        </g>
      </Pic>
      {spots.map(([x, y, r], i) => (
        <div key={i} style={{position: 'absolute', left: x, top: y, transform: `rotate(${r}deg)`, background: '#fff', color: C.ink, fontSize: 44, fontWeight: 700, padding: '12px 26px', borderRadius: 28, boxShadow: '0 12px 22px rgba(28,35,51,0.22)', whiteSpace: 'nowrap'}}>
          {ASKS[i]}
        </div>
      ))}
    </Frame>
  );
};

// ------------------------------------------------------------------------------------------- fork: quit, or keep going?
const Fork: React.FC<P> = (p) => (
  <Frame {...p} tone="green" sizes={[150, 150]}>
    <Pic>
      <path d="M250 720 L290 430 L80 150 L170 130 L320 360 L470 130 L560 150 L350 430 L390 720 Z" fill="#2E3A5C" />
      <path d="M320 700 L320 450 M300 400 L140 170 M340 400 L500 170" stroke="#fff" strokeWidth={8} strokeDasharray="24 22" opacity={0.75} />
      <rect x={312} y={250} width={16} height={260} fill="#E9EEF6" />
      <g transform="translate(320 270)">
        <path d="M0 0 H200 L240 40 L200 80 H0 Z" fill={C.green} stroke="#fff" strokeWidth={5} />
        <Word x={110} y={56} size={46} fill="#fff">
          أكمّل
        </Word>
      </g>
      <g transform="translate(320 370)">
        <path d="M0 0 H-200 L-240 40 L-200 80 H0 Z" fill={C.red} stroke="#fff" strokeWidth={5} />
        <Word x={-110} y={56} size={46} fill="#fff">
          أستقيل
        </Word>
      </g>
      <g transform="translate(276 560)">
        <Person size={150} color={C.ink} />
      </g>
    </Pic>
  </Frame>
);

// ------------------------------------------------------------------------------------------- graph: interest drops when it gets hard
const Graph: React.FC<P> = (p) => (
  <Frame {...p} tone="navy" sizes={[132, 170]}>
    <Pic>
      <path d="M60 90 V640 H600" stroke="#8EA0C0" strokeWidth={10} fill="none" strokeLinecap="round" />
      <path d="M80 590 C180 560 260 420 360 260" stroke={C.yellow} strokeWidth={22} fill="none" strokeLinecap="round" />
      <rect x={380} y={200} width={46} height={440} rx={10} fill={C.red} />
      <g transform="translate(403 150)">
        <rect x={-74} y={-44} width={148} height={80} rx={20} fill={C.red} />
        <Word x={0} y={16} size={50} fill="#fff">
          صعب
        </Word>
      </g>
      <path d="M362 262 C400 330 440 460 520 590" stroke="#FF8A7A" strokeWidth={18} fill="none" strokeLinecap="round" strokeDasharray="2 30" />
      <polygon points="500,600 552,622 546,566" fill="#FF8A7A" />
    </Pic>
  </Frame>
);

// ------------------------------------------------------------------------------------------- giant: the small company in front of the giant
const Car: React.FC<{x: number; y: number; w: number; body: string; glass: string; wheel: string}> = ({x, y, w, body, glass, wheel}) => (
  <g transform={`translate(${x} ${y}) scale(${w / 404})`}>
    <path d="M10 150 Q10 112 52 104 L118 94 L168 44 Q182 30 202 30 L292 30 Q316 30 330 48 L368 94 L384 98 Q404 104 404 130 L404 150 Q404 162 392 162 L22 162 Q10 162 10 150 Z" fill={body} />
    <path d="M186 50 L150 92 L248 92 L248 50 Z" fill={glass} />
    <path d="M262 50 L262 92 L350 92 L318 56 Q312 50 302 50 Z" fill={glass} />
    {[96, 318].map((cx) => (
      <g key={cx}>
        <circle cx={cx} cy={162} r={36} fill={wheel} />
        <circle cx={cx} cy={162} r={15} fill={glass} />
      </g>
    ))}
  </g>
);
const Giant: React.FC<P> = (p) => (
  <Frame {...p} tone="navy" sizes={[150, 150]}>
    <Pic>
      <g transform="translate(-20 300)">
        <Skyline width={680} height={300} seed={3} color="#24304F" />
      </g>
      <Car x={-190} y={150} w={820} body="#3A4870" glass="#26324F" wheel="#0E1424" />
      <rect x={0} y={650} width={640} height={70} fill="#0E1424" />
      <path d="M20 684 H620" stroke="#fff" strokeWidth={6} strokeDasharray="34 26" opacity={0.5} />
      <Car x={250} y={530} w={240} body={C.yellow} glass={C.ink} wheel={C.ink} />
    </Pic>
  </Frame>
);

// ------------------------------------------------------------------------------------------- address: «وينك؟» on a street with no name
const Address: React.FC<P> = (p) => {
  const [ask, answer, answer2] = p.s.labels ?? ['وينك؟', 'جنب المسجد…', 'لف يمين'];
  return (
    <Frame {...p} tone="yellow" sizes={[150, 130]}>
      <Pic shadow="rgba(28,35,51,0.28)">
        <g transform="translate(470 120)">
          <rect x={-8} y={60} width={16} height={560} fill={C.ink} />
          <rect x={-120} y={0} width={240} height={110} rx={16} fill="#1F7A52" stroke="#fff" strokeWidth={7} />
          <Word x={0} y={84} size={96} fill="#fff">
            ؟
          </Word>
          <g transform="translate(96 -10)">
            <circle r={44} fill={C.red} opacity={0.22} />
            <path d="M0 0 C-30 -40 -30 -78 0 -86 C30 -78 30 -40 0 0 Z" fill={C.red} />
            <circle cy={-58} r={13} fill="#fff" />
          </g>
        </g>
        <g transform="translate(40 110) rotate(-6)">
          <rect width={360} height={600} rx={50} fill={C.ink} />
          <rect x={18} y={70} width={324} height={500} rx={30} fill="#fff" />
          <rect x={140} y={28} width={80} height={14} rx={7} fill="#3A4870" />
          <g transform="translate(40 120)">
            <rect width={170} height={84} rx={28} fill="#E9EEF6" />
            <Word x={85} y={56} size={46} fill={C.ink}>
              {ask}
            </Word>
          </g>
          <g transform="translate(36 240)">
            <rect width={292} height={150} rx={30} fill={C.green} />
            <Word x={146} y={64} size={40} fill="#fff">
              {answer}
            </Word>
            <Word x={146} y={118} size={40} fill="#fff">
              {answer2}
            </Word>
          </g>
        </g>
      </Pic>
    </Frame>
  );
};

export const STORY_DESIGNS: Record<StoryDesign, React.FC<P>> = {
  doors: Doors,
  scissors: Scissors,
  dinner: Dinner,
  growth: Growth,
  seven: Seven,
  factory: Factory,
  thobe: Thobe,
  branches: Branches,
  calendar: Calendar,
  blog: Blog,
  equal: Equal,
  people4: People4,
  desks: Desks,
  asks: Asks,
  fork: Fork,
  graph: Graph,
  giant: Giant,
  address: Address,
};

