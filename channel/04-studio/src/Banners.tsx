// Channel banner options (scripts/launchkit.mjs → 03-episodes/_brand/launch-kit/banners/): 2560 × 1440, the size YouTube
// recommends for every screen. What must always be seen (the name, the line under it) sits inside the 1235 × 338 box in
// the middle: phones show only that; computers show 1546 × 423; tablets 1855 × 423; TVs show everything.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, FONT} from './theme';
import {BrandMark} from './components/ui';
import {DoorGlyph, HostGlyph, NAVY, NAVY2, Star8} from './brand-art';

export const BANNER = {w: 2560, h: 1440, safe: {w: 1235, h: 338}, desktop: {w: 1546, h: 423}, tablet: {w: 1855, h: 423}};
const CX = BANNER.w / 2;
const CY = BANNER.h / 2;

export const BANNERS = [
  {n: 1, name: 'الغرفة المضيئة', idea: 'فاتح وهادئ، الاسم في الوسط وأبواب مضيئة على الأطراف'},
  {n: 2, name: 'الظل والاسم', idea: 'ظلّ المقدّم بالنظارة الدائرية على خلفية داكنة، والاسم بجانبه'},
  {n: 3, name: 'ملفات القضايا', idea: 'ثلاثة ملفات متراصّة: كل حلقة ملف'},
  {n: 4, name: 'الرحلة', idea: 'طريق منقّط بخمس محطات يمرّ خلف الاسم: خريطة كل حلقة'},
  {n: 5, name: 'الأرقام', idea: 'أرقام القصص (55 · 13 · 19) كبيرة وخافتة خلف الاسم'},
];

const Wordmark: React.FC<{size: number; color?: string; gap?: number; mark?: boolean}> = ({size, color = C.ink, gap = 0.3, mark = true}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: size * gap, direction: 'rtl', fontFamily: FONT, fontWeight: 700, fontSize: size, color, lineHeight: 1, whiteSpace: 'nowrap'}}>
    {mark ? <BrandMark size={size * 1.08} /> : null}
    <span>غرفة الفرص</span>
  </div>
);

const At: React.FC<{x: number; y: number; align?: 'center' | 'right'; children: React.ReactNode; width?: number}> = ({x, y, align = 'center', children, width}) => (
  <div
    style={{
      position: 'absolute',
      left: align === 'center' ? x : undefined,
      right: align === 'right' ? BANNER.w - x : undefined,
      top: y,
      width,
      transform: align === 'center' ? 'translate(-50%, -50%)' : 'translateY(-50%)',
      textAlign: align,
      direction: 'rtl',
      fontFamily: FONT,
    }}
  >
    {children}
  </div>
);

const Tagline: React.FC<{text: string; size?: number; color?: string; width?: number}> = ({text, size = 62, color = C.ink2, width}) => (
  <div style={{fontSize: size, fontWeight: 500, color, lineHeight: 1.3, width}}>{text}</div>
);

const Guides: React.FC = () => {
  const box = (w: number, h: number, color: string, label: string, dash = '') => (
    <g>
      <rect x={CX - w / 2} y={CY - h / 2} width={w} height={h} fill="none" stroke={color} strokeWidth={6} strokeDasharray={dash} />
      <text x={CX - w / 2 + 12} y={CY - h / 2 - 12} fontFamily="DejaVu Sans, sans-serif" fontSize={30} fontWeight={700} fill={color}>
        {label}
      </text>
    </g>
  );
  return (
    <svg width={BANNER.w} height={BANNER.h} style={{position: 'absolute', inset: 0}}>
      {box(BANNER.tablet.w, BANNER.tablet.h, '#F5B724', 'tablet 1855x423')}
      {box(BANNER.desktop.w, BANNER.desktop.h, '#3B7DF6', 'desktop 1546x423')}
      {box(BANNER.safe.w, BANNER.safe.h, '#EB5545', 'phone / safe area 1235x338 (text and logo stay inside)')}
    </svg>
  );
};

const Banner1: React.FC = () => (
  <AbsoluteFill style={{background: 'linear-gradient(180deg, #F8FAFE 0%, #E4ECFC 100%)'}}>
    <svg width={BANNER.w} height={BANNER.h} style={{position: 'absolute', inset: 0}}>
      <circle cx="140" cy="140" r="640" fill={C.blue} opacity="0.1" />
      <circle cx="2420" cy="1340" r="560" fill={C.yellow} opacity="0.2" />
      <circle cx="2330" cy="150" r="190" fill={C.green} opacity="0.12" />
      <circle cx="260" cy="1260" r="150" fill={C.red} opacity="0.1" />
      {/* a lit doorway on each side, only seen on TVs and tablets */}
      <g transform="translate(-151 360) scale(3.2)">
        <DoorGlyph />
      </g>
      <g transform="translate(2069 360) scale(3.2)">
        <DoorGlyph frame="#fff" light={C.blue} leaf={NAVY2} glow="#BFD6FA" />
      </g>
    </svg>
    <At x={CX} y={688}>
      <Wordmark size={156} />
    </At>
    <At x={CX} y={838}>
      <Tagline text="اكتشف موهبتك… وحوّلها لمشروع يكبر، بالأرقام" size={54} />
    </At>
  </AbsoluteFill>
);

const Banner2: React.FC = () => (
  <AbsoluteFill style={{background: NAVY}}>
    <svg width={BANNER.w} height={BANNER.h} style={{position: 'absolute', inset: 0}}>
      <defs>
        <radialGradient id="b2" cx="0.36" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#2E5BD6" stopOpacity="0.85" />
          <stop offset="1" stopColor={NAVY} stopOpacity="0" />
        </radialGradient>
        <linearGradient id="b2c" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFF3CC" stopOpacity="0.55" />
          <stop offset="1" stopColor="#FFF3CC" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width={BANNER.w} height={BANNER.h} fill="url(#b2)" />
      <polygon points="800,0 960,0 1220,1440 540,1440" fill="url(#b2c)" />
      {[...Array(18)].map((_, k) => (
        <circle key={k} cx={(k * 977) % 2560} cy={(k * 613) % 1440} r={4 + (k % 4) * 2} fill="#fff" opacity={0.12 + (k % 3) * 0.06} />
      ))}
      <g transform="translate(2110 380) scale(3)">
        <DoorGlyph frame={NAVY2} light={C.yellow} leaf={NAVY} glow="none" />
      </g>
      <g transform={`translate(${800 - 100 * 2.1} ${738 - 94 * 2.1}) scale(2.1)`}>
        <HostGlyph body="#0A0F1C" rim="#4F86F2" rimOffset={[3, -3]} glass={C.yellow} lens="rgba(245,183,36,0.12)" glint="#fff" bleed={400} />
      </g>
    </svg>
    <At x={1862} y={672} align="right">
      <Wordmark size={150} color="#fff" mark={false} />
    </At>
    <At x={1862} y={806} align="right" width={900}>
      <Tagline text="من موهبتك… إلى مشروع يكبر" size={60} color={C.yellow} />
    </At>
  </AbsoluteFill>
);

const Folder: React.FC<{label?: string; tabText: string; tab: string; rotate: number; x: number; y: number}> = ({label, tabText, tab, rotate, x, y}) => (
  <div style={{position: 'absolute', left: x, top: y, transform: `rotate(${rotate}deg)`, transformOrigin: 'center'}}>
    <div style={{width: 112, height: 36, background: tab, borderRadius: '14px 14px 0 0', marginRight: 24, color: C.ink, fontFamily: FONT, fontWeight: 700, fontSize: 24, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{tabText}</div>
    <div style={{width: 262, height: 160, background: C.ink, borderRadius: 22, boxShadow: '0 24px 50px rgba(28,35,51,0.28)', color: '#fff', fontFamily: FONT, fontWeight: 700, fontSize: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', direction: 'rtl'}}>{label}</div>
  </div>
);

const Banner3: React.FC = () => (
  <AbsoluteFill style={{background: C.bg}}>
    <svg width={BANNER.w} height={BANNER.h} style={{position: 'absolute', inset: 0}}>
      <rect x="0" y="470" width={BANNER.w} height="500" fill={C.blueSoft} />
      <circle cx="2380" cy="180" r="420" fill={C.yellow} opacity="0.18" />
      <circle cx="170" cy="1250" r="380" fill={C.blue} opacity="0.1" />
      {[...Array(9)].map((_, k) => <rect key={k} x={60 + k * 24} y={100 + k * 18} width="150" height="18" rx="9" fill={C.ink} opacity={0.05} />)}
      {[...Array(9)].map((_, k) => <rect key={k} x={2250 - k * 24} y={1180 - k * 18} width="150" height="18" rx="9" fill={C.ink} opacity={0.05} />)}
    </svg>
    <Folder tabText="03" tab={C.green} rotate={-8} x={642} y={618} />
    <Folder tabText="02" tab={C.red} rotate={-3} x={706} y={604} />
    <Folder label="الملف 01" tabText="01" tab={C.yellow} rotate={3} x={774} y={612} />
    <At x={1862} y={664} align="right">
      <Wordmark size={108} />
    </At>
    <At x={1862} y={790} align="right" width={720}>
      <Tagline text="كل ملف قصة حقيقية… وخطوة تبدأ فيها اليوم" size={50} color={C.ink2} />
    </At>
  </AbsoluteFill>
);

const Banner4: React.FC = () => {
  const stations = [
    {x: 330, y: 380},
    {x: 740, y: 1000},
    {x: 1280, y: 1120},
    {x: 1820, y: 1000},
    {x: 2230, y: 380},
  ];
  return (
    <AbsoluteFill style={{background: 'linear-gradient(180deg, #F8FAFE 0%, #DCE7F8 100%)'}}>
      <svg width={BANNER.w} height={BANNER.h} style={{position: 'absolute', inset: 0}}>
        {[...Array(13)].map((_, k) => <line key={`v${k}`} x1={k * 213} y1="0" x2={k * 213} y2="1440" stroke="#CBD8EC" strokeWidth="2" opacity="0.7" />)}
        {[...Array(8)].map((_, k) => <line key={`h${k}`} x1="0" y1={k * 205} x2="2560" y2={k * 205} stroke="#CBD8EC" strokeWidth="2" opacity="0.7" />)}
        <path d="M2230 380 C2000 640 2000 960 1820 1000 C1600 1060 1500 1160 1280 1120 C1040 1070 900 1060 740 1000 C560 940 520 560 330 380" fill="none" stroke="#fff" strokeWidth="46" strokeLinecap="round" />
        <path d="M2230 380 C2000 640 2000 960 1820 1000 C1600 1060 1500 1160 1280 1120 C1040 1070 900 1060 740 1000 C560 940 520 560 330 380" fill="none" stroke={C.blue} strokeWidth="12" strokeLinecap="round" strokeDasharray="2 34" />
        {stations.map((s, k) => (
          <g key={k} transform={`translate(${s.x} ${s.y})`}>
            <circle r="52" fill="#fff" stroke={C.blue} strokeWidth="10" />
            <text y="20" textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize="56" fill={C.ink}>
              {5 - k}
            </text>
          </g>
        ))}
        <g transform="translate(2280 250) scale(1.1)">
          <path d="M20 0c-22 0-40 17-40 38 0 28 40 62 40 62s40-34 40-62c0-21-18-38-40-38z" fill={C.red} />
          <circle cx="20" cy="38" r="14" fill="#fff" />
        </g>
        <g transform="translate(250 250)">
          <rect x="10" y="0" width="12" height="120" fill={C.ink} />
          <path d="M22 4 L100 24 L22 56 Z" fill={C.green} />
        </g>
      </svg>
      <div style={{position: 'absolute', left: CX, top: 712, width: 1180, height: 330, transform: 'translate(-50%, -50%)', background: '#fff', borderRadius: 64, boxShadow: '0 30px 80px rgba(28,35,51,0.18)'}} />
      <At x={CX} y={676}>
        <Wordmark size={142} />
      </At>
      <At x={CX} y={808}>
        <Tagline text="كل ملف رحلة: قصة حقيقية… وخطوة تطبّقها" size={54} />
      </At>
    </AbsoluteFill>
  );
};

const Banner5: React.FC = () => (
  <AbsoluteFill style={{background: NAVY}}>
    <svg width={BANNER.w} height={BANNER.h} style={{position: 'absolute', inset: 0}}>
      <defs>
        <radialGradient id="b5" cx="0.5" cy="0.5" r="0.55">
          <stop offset="0" stopColor="#2E5BD6" stopOpacity="0.5" />
          <stop offset="1" stopColor={NAVY} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width={BANNER.w} height={BANNER.h} fill="url(#b5)" />
      <g fontFamily={FONT} fontWeight={700} fill="#3256B8" opacity="0.3" style={{direction: 'ltr'}}>
        <text x="50" y="1000" fontSize="600">19</text>
        <text x="1010" y="560" fontSize="500">13</text>
        <text x="1640" y="1040" fontSize="720">55</text>
      </g>
      {[...Array(5)].map((_, k) => <Star8 key={k} cx={300 + k * 530} cy={k % 2 ? 190 : 1290} r={34} opacity={0.1} />)}
    </svg>
    <At x={CX} y={684}>
      <Wordmark size={156} color="#fff" />
    </At>
    <At x={CX} y={836}>
      <Tagline text="قصص وأرقام حقيقية… تبني منها مشروعك" size={64} color={C.yellow} />
    </At>
  </AbsoluteFill>
);

export const BannerStill: React.FC<{n: number; guides?: boolean}> = ({n, guides}) => {
  const Body = [Banner1, Banner2, Banner3, Banner4, Banner5][Math.min(5, Math.max(1, n)) - 1];
  return (
    <AbsoluteFill>
      <Body />
      {guides ? <Guides /> : null}
    </AbsoluteFill>
  );
};
