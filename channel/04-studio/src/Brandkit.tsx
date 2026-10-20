// Concepts for the channel logo and the EP001 thumbnail, drawn from our palette, font and silhouettes
// (no photos, no other brands' logos). Rendered by scripts/brandkit.mjs into 03-episodes/_brand/out/.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, FONT} from './theme';
import {Crowd, Lever, PeopleGrid, Person, Phone} from './components/Silhouettes';

export const LOGOS = [
  {name: 'الباب المفتوح', idea: 'غرفة… ومن بابها يطلع نور الفرصة'},
  {name: 'مفتاح الفرص', idea: 'قفل ينفتح… وداخله سهم صاعد'},
  {name: 'دبوس الخريطة', idea: 'كل حلقة رحلة… وآخرها باب'},
  {name: 'الرافعة', idea: 'جهد صغير… يرفع حمل كبير'},
  {name: 'ملف القضية', idea: 'كل حلقة ملف… والعدسة تكشف النمو'},
];

/** One logo mark, drawn on a 200 × 200 square. */
export const LogoMark: React.FC<{n: number; size: number}> = ({n, size}) => {
  const box = {width: size, height: size, viewBox: '0 0 200 200'};
  switch (n) {
    case 1:
      return (
        <svg {...box}>
          <rect width="200" height="200" rx="48" fill={C.blue} />
          <polygon points="66,158 134,158 176,200 24,200" fill="#FCE29A" />
          <rect x="66" y="42" width="68" height="116" fill={C.yellow} />
          <polygon points="98,42 134,30 134,170 98,158" fill={C.ink} />
          <circle cx="106" cy="104" r="4" fill={C.yellow} />
          <rect x="62" y="38" width="76" height="124" rx="4" fill="none" stroke="#fff" strokeWidth="8" />
        </svg>
      );
    case 2:
      return (
        <svg {...box}>
          <circle cx="100" cy="100" r="100" fill={C.ink} />
          <circle cx="100" cy="80" r="30" fill="#fff" />
          <path d="M100 96 L138 160 H62 Z" fill="#fff" />
          <path d="M100 58 L124 90 H110 V148 H90 V90 H76 Z" fill={C.yellow} />
        </svg>
      );
    case 3:
      return (
        <svg {...box}>
          <rect width="200" height="200" rx="48" fill={C.blueSoft} />
          <path d="M26 176 C56 166 66 150 96 152" fill="none" stroke={C.ink} strokeWidth="7" strokeDasharray="1 14" strokeLinecap="round" />
          <path d="M100 20 C68 20 46 44 46 74 C46 112 100 160 100 160 C100 160 154 112 154 74 C154 44 132 20 100 20 Z" fill={C.blue} />
          <rect x="84" y="46" width="32" height="46" rx="3" fill="#fff" />
          <circle cx="109" cy="70" r="3" fill={C.blue} />
        </svg>
      );
    case 4:
      return (
        <svg {...box}>
          <circle cx="100" cy="100" r="100" fill={C.yellow} />
          <foreignObject x="8" y="50" width="184" height="100">
            <Lever width={184} tilt={1} color={C.ink} accent={C.blue} />
          </foreignObject>
        </svg>
      );
    default:
      return (
        <svg {...box}>
          <rect width="200" height="200" rx="48" fill={C.ink} />
          <path d="M34 62 a8 8 0 0 1 8 -8 h36 l12 12 h68 a8 8 0 0 1 8 8 v76 a8 8 0 0 1 -8 8 H42 a8 8 0 0 1 -8 -8 Z" fill={C.yellow} />
          <circle cx="110" cy="112" r="32" fill={C.ink} stroke="#fff" strokeWidth="9" />
          <path d="M134 136 L160 162" stroke="#fff" strokeWidth="13" strokeLinecap="round" />
          <path d="M110 92 L126 112 H117 V130 H103 V112 H94 Z" fill={C.blue} />
        </svg>
      );
  }
};

export const LogoSheet: React.FC = () => (
  <AbsoluteFill style={{background: C.bg, fontFamily: FONT, direction: 'rtl', alignItems: 'center'}}>
    <div style={{marginTop: 64, fontSize: 56, fontWeight: 700, color: C.ink}}>شعار «غرفة الفرص» · 5 أفكار</div>
    <div style={{marginTop: 10, fontSize: 30, color: C.ink2}}>يوتيوب يقص الشعار دائرة: هكذا بيظهر جنب اسم القناة</div>
    <div style={{display: 'flex', gap: 28, marginTop: 70}}>
      {LOGOS.map((l, i) => (
        <div key={i} style={{width: 330, background: C.surface, borderRadius: 36, padding: '34px 20px 30px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, boxShadow: '0 2px 6px rgba(28,35,51,0.06), 0 16px 40px rgba(28,35,51,0.10)'}}>
          <div style={{alignSelf: 'flex-start', width: 52, height: 52, borderRadius: 99, background: C.ink, color: '#fff', fontSize: 30, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{i + 1}</div>
          <div style={{width: 230, height: 230, borderRadius: 999, overflow: 'hidden', boxShadow: '0 10px 26px rgba(28,35,51,0.18)'}}>
            <LogoMark n={i + 1} size={230} />
          </div>
          <div style={{fontSize: 44, fontWeight: 700, color: C.ink, marginTop: 8}}>غرفة الفرص</div>
          <div style={{fontSize: 30, fontWeight: 700, color: C.blue}}>{l.name}</div>
          <div style={{fontSize: 24, color: C.ink2, textAlign: 'center', lineHeight: 1.45}}>{l.idea}</div>
        </div>
      ))}
    </div>
  </AbsoluteFill>
);

export const LogoSingle: React.FC<{n: number}> = ({n}) => (
  <AbsoluteFill style={{background: '#fff'}}>
    <LogoMark n={n} size={800} />
  </AbsoluteFill>
);

// ---------------------------------------------------------------- thumbnails (1280 × 720)
const FileBadge: React.FC = () => (
  <div style={{position: 'absolute', right: 48, top: 40, background: C.ink, color: '#fff', fontSize: 34, fontWeight: 700, padding: '8px 26px', borderRadius: 999}}>الملف 01</div>
);

export const THUMBS = ['numbers', 'rejected', 'lever'] as const;
export type ThumbVariant = (typeof THUMBS)[number];

export const ThumbConcept: React.FC<{variant: ThumbVariant}> = ({variant}) => {
  const page: React.CSSProperties = {background: '#fff', fontFamily: FONT, direction: 'rtl', overflow: 'hidden'};
  if (variant === 'numbers') {
    return (
      <AbsoluteFill style={page}>
        <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: 600, background: C.ink}} />
        <div style={{position: 'absolute', left: 30, top: 70, opacity: 0.55}}>
          <Crowd id="th1" width={540} height={600} color="#8EA0C0" />
        </div>
        <div style={{position: 'absolute', left: 190, top: 150, filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.45))', transform: 'rotate(-8deg)'}}>
          <Phone size={420} color={C.green} bubbles={3} />
        </div>
        <FileBadge />
        <div style={{position: 'absolute', right: 56, top: 112, width: 600}}>
          <div style={{display: 'flex', alignItems: 'baseline', gap: 18, color: C.blue}}>
            <span style={{fontSize: 210, fontWeight: 700, lineHeight: 0.95}}>55</span>
            <span style={{fontSize: 74, fontWeight: 700}}>موظف</span>
          </div>
          <div style={{fontSize: 66, fontWeight: 700, color: C.ink, lineHeight: 1.25, marginTop: 14}}>خدموا 450 مليون</div>
          <div style={{marginTop: 22}}>
            <PeopleGrid count={55} cols={11} cell={36} color={C.blue} />
          </div>
        </div>
      </AbsoluteFill>
    );
  }
  if (variant === 'rejected') {
    return (
      <AbsoluteFill style={page}>
        <div style={{position: 'absolute', left: -120, top: -60, width: 760, height: 840, borderRadius: '50%', background: C.redSoft}} />
        <div style={{position: 'absolute', left: 110, bottom: -10, filter: 'drop-shadow(0 24px 30px rgba(28,35,51,0.30))'}}>
          <Person size={560} color={C.ink} />
        </div>
        <div style={{position: 'absolute', left: 60, top: 430, transform: 'rotate(-12deg)', border: `12px solid ${C.red}`, borderRadius: 26, padding: '4px 34px', color: C.red, fontSize: 104, fontWeight: 700, background: '#fff'}}>
          مرفوض
        </div>
        <FileBadge />
        <div style={{position: 'absolute', right: 56, top: 140, width: 640}}>
          <div style={{fontSize: 124, fontWeight: 700, color: C.red, lineHeight: 1.12}}>رفضوه…</div>
          <div style={{fontSize: 84, fontWeight: 700, color: C.ink, lineHeight: 1.25}}>ثم اشتروا شركته</div>
          <div style={{display: 'inline-flex', marginTop: 34, background: C.green, color: '#fff', fontSize: 74, fontWeight: 700, padding: '10px 34px', borderRadius: 24}}>
            <span style={{direction: 'ltr', unicodeBidi: 'isolate'}}>19</span>&nbsp;مليار $
          </div>
        </div>
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill style={page}>
      <div style={{position: 'absolute', left: -140, top: -120, width: 820, height: 820, borderRadius: '50%', background: C.yellowSoft}} />
      <div style={{position: 'absolute', left: 20, top: 240, filter: 'drop-shadow(0 22px 26px rgba(28,35,51,0.25))'}}>
        <Lever width={620} tilt={1} color={C.ink} accent={C.blue} />
      </div>
      <div style={{position: 'absolute', left: 60, top: 168, background: C.green, color: '#fff', fontSize: 40, fontWeight: 700, padding: '6px 18px', borderRadius: 14, transform: 'rotate(-10deg)'}}>
        <span style={{direction: 'ltr', unicodeBidi: 'isolate'}}>19</span> مليار $
      </div>
      <div style={{position: 'absolute', left: 520, top: 300, transform: 'scaleX(-1)'}}>
        <Person size={170} color={C.blue} />
      </div>
      <FileBadge />
      <div style={{position: 'absolute', right: 56, top: 150, width: 560}}>
        <div style={{fontSize: 150, fontWeight: 700, color: C.blue, lineHeight: 1.05}}>الرافعة</div>
        <div style={{fontSize: 84, fontWeight: 700, color: C.ink, lineHeight: 1.2, marginTop: 14}}>شغلك يشتغل عنك</div>
        <div style={{display: 'inline-flex', marginTop: 30, background: C.yellow, color: C.ink, fontSize: 50, fontWeight: 700, padding: '10px 30px', borderRadius: 22}}>
          55 شخص · 19 مليار
        </div>
      </div>
    </AbsoluteFill>
  );
};
