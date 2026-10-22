// Channel avatar options (scripts/launchkit.mjs → 03-episodes/_brand/launch-kit/avatars/): 800 × 800 squares that
// YouTube shows as a circle, so everything that matters sits inside the middle ~560 px.
//   host-01…10  the host as a shadow figure with round glasses, ten looks (Material-like, our palette, no Google marks)
//   name-01…10  «غرفة الفرص» as a wordmark, a letter, a door, a window… ten styles
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, FONT} from './theme';
import {DoorGlyph, HostGlyph, NAVY, NAVY2, SKY, Star8} from './brand-art';

type GlyphProps = React.ComponentProps<typeof HostGlyph>;

/** The host with the middle of his glasses at (x, y); `s` is the scale (the figure is 200 × 220 units). */
const Host: React.FC<{x?: number; y?: number; s?: number} & GlyphProps> = ({x = 400, y = 372, s = 3.9, bleed = 200, ...glyph}) => (
  <g transform={`translate(${x - 100 * s} ${y - 94 * s}) scale(${s})`}>
    <HostGlyph bleed={bleed} {...glyph} />
  </g>
);

const Defs: React.FC<{children: React.ReactNode}> = ({children}) => <defs>{children}</defs>;

export type AvatarDef = {id: string; group: 'host' | 'name'; name: string; idea: string; render: () => React.ReactNode};

export const AVATARS: AvatarDef[] = [
  // ------------------------------------------------------------------ the host, ten looks
  {
    id: 'host-01',
    group: 'host',
    name: 'أزرق هادئ',
    idea: 'خلفية فاتحة ناعمة، وضوء أصفر صغير: الأوضح بين الصور الصغيرة',
    render: () => (
      <>
        <rect width="800" height="800" fill={SKY} />
        <circle cx="170" cy="640" r="190" fill="#fff" opacity="0.45" />
        <circle cx="640" cy="200" r="110" fill="#fff" opacity="0.7" />
        <circle cx="630" cy="190" r="40" fill={C.yellow} />
        <Host />
      </>
    ),
  },
  {
    id: 'host-02',
    group: 'host',
    name: 'شروق',
    idea: 'هالة ضوء خلف الرأس على أصفر دافئ',
    render: () => (
      <>
        <rect width="800" height="800" fill={C.yellow} />
        <circle cx="400" cy="380" r="340" fill="#fff" opacity="0.28" />
        <circle cx="400" cy="380" r="270" fill="#fff" opacity="0.92" />
        <Host glass={C.yellow} lens="rgba(245,183,36,0.12)" glint={C.yellow} />
      </>
    ),
  },
  {
    id: 'host-03',
    group: 'host',
    name: 'ليلي',
    idea: 'خلفية داكنة وإضاءة زرقاء على حافة الظل، ونظارة تلمع',
    render: () => (
      <>
        <Defs>
          <radialGradient id="h3" cx="0.78" cy="0.18" r="0.8">
            <stop offset="0" stopColor="#2E5BD6" stopOpacity="0.9" />
            <stop offset="1" stopColor={NAVY} stopOpacity="0" />
          </radialGradient>
        </Defs>
        <rect width="800" height="800" fill={NAVY} />
        <rect width="800" height="800" fill="url(#h3)" />
        <Host body={NAVY2} rim="#5B9BFF" rimOffset={[4, -4]} glass="#8DB8FF" lens="rgba(141,184,255,0.1)" glint="#E6F0FF" glow="#5B9BFF" />
      </>
    ),
  },
  {
    id: 'host-04',
    group: 'host',
    name: 'كتل ألوان',
    idea: 'شريط قطري أصفر على أزرق: جريء وواضح من بعيد',
    render: () => (
      <>
        <rect width="800" height="800" fill={C.blue} />
        <polygon points="0,540 800,220 800,800 0,800" fill={C.yellow} />
        <circle cx="150" cy="150" r="64" fill={C.red} />
        <circle cx="660" cy="140" r="26" fill="#fff" opacity="0.9" />
        <Host />
      </>
    ),
  },
  {
    id: 'host-05',
    group: 'host',
    name: 'كشّاف',
    idea: 'ضوء من فوق عليك: الفرصة تبدأ من عندك',
    render: () => (
      <>
        <Defs>
          <linearGradient id="h5" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#FFF3CC" stopOpacity="0.95" />
            <stop offset="1" stopColor="#FFF3CC" stopOpacity="0.1" />
          </linearGradient>
        </Defs>
        <rect width="800" height="800" fill={NAVY} />
        <polygon points="330,0 470,0 770,800 30,800" fill="url(#h5)" />
        <Host body="#0A0F1C" glass={C.yellow} lens="rgba(245,183,36,0.14)" glint="#fff" />
      </>
    ),
  },
  {
    id: 'host-06',
    group: 'host',
    name: 'الباب',
    idea: 'واقف عند باب فيه ضوء: غرفة الفرص',
    render: () => (
      <>
        <Defs>
          <radialGradient id="h6" cx="0.5" cy="0.55" r="0.6">
            <stop offset="0" stopColor="#FFFFFF" />
            <stop offset="1" stopColor="#FFE08A" />
          </radialGradient>
        </Defs>
        <rect width="800" height="800" fill={C.blue} />
        <path d="M170 800 V340 a230 230 0 0 1 460 0 V800 Z" fill="#fff" opacity="0.28" />
        <path d="M200 800 V340 a200 200 0 0 1 400 0 V800 Z" fill="url(#h6)" />
        <Host y={505} s={2.75} />
      </>
    ),
  },
  {
    id: 'host-07',
    group: 'host',
    name: 'ستيكر',
    idea: 'حافة بيضاء وظل خفيف على أحمر: مرح من غير إزعاج',
    render: () => (
      <>
        <rect width="800" height="800" fill={C.red} />
        <circle cx="400" cy="400" r="300" fill="#fff" opacity="0.1" />
        <circle cx="400" cy="400" r="190" fill="#fff" opacity="0.1" />
        <g transform="translate(14 18)" opacity="0.28">
          <g stroke="#000" strokeWidth="34" strokeLinejoin="round">
            <Host body="#000" glass="none" lens="none" glint="none" />
          </g>
        </g>
        <g stroke="#fff" strokeWidth="34" strokeLinejoin="round">
          <Host body="#fff" glass="none" lens="none" glint="none" />
        </g>
        <Host glass={C.yellow} lens="rgba(245,183,36,0.12)" glint="#fff" />
      </>
    ),
  },
  {
    id: 'host-08',
    group: 'host',
    name: 'تدرّج ناعم',
    idea: 'ألوان ناعمة متداخلة خلف الظل',
    render: () => (
      <>
        <Defs>
          <filter id="h8" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="70" />
          </filter>
        </Defs>
        <rect width="800" height="800" fill="#F5F7FB" />
        <g filter="url(#h8)">
          <circle cx="190" cy="200" r="250" fill={C.blue} opacity="0.55" />
          <circle cx="650" cy="170" r="190" fill={C.yellow} opacity="0.7" />
          <circle cx="620" cy="650" r="230" fill={C.green} opacity="0.5" />
          <circle cx="150" cy="660" r="170" fill={C.red} opacity="0.4" />
        </g>
        <Host />
      </>
    ),
  },
  {
    id: 'host-09',
    group: 'host',
    name: 'ظل الجدار',
    idea: 'ظلّه يمتد على جدار فيه نافذة ضوء',
    render: () => (
      <>
        <Defs>
          <filter id="h9" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="9" />
          </filter>
        </Defs>
        <rect width="800" height="800" fill="#EEF2F8" />
        <polygon points="470,0 800,0 800,560 330,800 120,800" fill="#fff" opacity="0.7" />
        <g filter="url(#h9)" opacity="0.2">
          <g transform="translate(130 22)">
            <Host body={C.ink} glass="none" lens="none" glint="none" />
          </g>
        </g>
        <Host body={C.blue} glass="#fff" lens="rgba(255,255,255,0.2)" />
      </>
    ),
  },
  {
    id: 'host-10',
    group: 'host',
    name: 'أشكال هندسية',
    idea: 'دائرة ونصف دائرة وحلقتين: رمز مبسّط يصلح لأي حجم',
    render: () => (
      <>
        <rect width="800" height="800" fill={C.yellowSoft} />
        <circle cx="800" cy="800" r="360" fill={C.blue} />
        <circle cx="140" cy="150" r="72" fill={C.green} />
        <circle cx="690" cy="130" r="30" fill={C.red} />
        <path d="M110 800 A290 290 0 0 1 690 800 Z" fill={C.ink} />
        <rect x="350" y="450" width="100" height="150" fill={C.ink} />
        <circle cx="400" cy="360" r="160" fill={C.ink} />
        <circle cx="336" cy="368" r="46" fill="none" stroke={C.yellow} strokeWidth="22" />
        <circle cx="464" cy="368" r="46" fill="none" stroke="#fff" strokeWidth="22" />
        <path d="M392 360 C398 346 402 346 408 360" fill="none" stroke="#fff" strokeWidth="16" strokeLinecap="round" />
      </>
    ),
  },

  // ------------------------------------------------------------------ the name, ten styles
  {
    id: 'name-01',
    group: 'name',
    name: 'الاسم مرصوص',
    idea: 'كلمتان بخط كبير على أزرق: يُقرأ حتى لو صغُر',
    render: () => (
      <>
        <rect width="800" height="800" fill={C.blue} />
        <text x="400" y="385" textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize="205" fill="#fff" direction="rtl">
          غرفة
        </text>
        <text x="400" y="585" textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize="205" fill="#fff" direction="rtl">
          الفرص
        </text>
        <rect x="290" y="628" width="220" height="24" rx="12" fill={C.yellow} />
      </>
    ),
  },
  {
    id: 'name-02',
    group: 'name',
    name: 'حرف الغين',
    idea: 'الحرف الأول على مربع مدوّر: أبسط شكل وأثبته',
    render: () => (
      <>
        <rect width="800" height="800" fill={NAVY} />
        <rect x="150" y="150" width="500" height="500" rx="150" fill={C.blue} />
        <text x="400" y="535" textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize="380" fill="#fff" direction="rtl">
          غ
        </text>
        <circle cx="600" cy="200" r="36" fill={C.yellow} />
      </>
    ),
  },
  {
    id: 'name-03',
    group: 'name',
    name: 'الباب المفتوح',
    idea: 'باب شبه مفتوح والنور يطلع منه: «غرفة» و«فرصة»',
    render: () => (
      <>
        <rect width="800" height="800" fill={C.blue} />
        <circle cx="400" cy="420" r="300" fill="#fff" opacity="0.12" />
        <g transform="translate(120 95) scale(2.8)">
          <DoorGlyph />
        </g>
      </>
    ),
  },
  {
    id: 'name-04',
    group: 'name',
    name: 'نافذة الشروق',
    idea: 'نافذة دائرية وشمس تطلع: بداية جديدة',
    render: () => (
      <>
        <Defs>
          <clipPath id="n4">
            <circle cx="400" cy="400" r="215" />
          </clipPath>
          <linearGradient id="n4s" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#5B9BFF" />
            <stop offset="0.7" stopColor="#BFD6FA" />
            <stop offset="1" stopColor="#FFE08A" />
          </linearGradient>
        </Defs>
        <rect width="800" height="800" fill={NAVY} />
        <g clipPath="url(#n4)">
          <rect x="150" y="150" width="500" height="500" fill="url(#n4s)" />
          {Array.from({length: 9}, (_, k) => {
            const a = (Math.PI * (k + 0.5)) / 9 + Math.PI;
            return <line key={k} x1={400 + Math.cos(a) * 110} y1={560 + Math.sin(a) * 110} x2={400 + Math.cos(a) * 330} y2={560 + Math.sin(a) * 330} stroke="#fff" strokeWidth="10" opacity="0.5" strokeLinecap="round" />;
          })}
          <circle cx="400" cy="560" r="105" fill={C.yellow} />
          <rect x="150" y="560" width="500" height="120" fill={NAVY2} />
        </g>
        <circle cx="400" cy="400" r="215" fill="none" stroke="#fff" strokeWidth="26" />
        <rect x="391" y="185" width="18" height="430" fill="#fff" />
        <rect x="185" y="391" width="430" height="18" fill="#fff" />
      </>
    ),
  },
  {
    id: 'name-05',
    group: 'name',
    name: 'مفتاح الفرص',
    idea: 'مفتاح وسهم صاعد داخل رأسه',
    render: () => (
      <>
        <rect width="800" height="800" fill={C.yellow} />
        <g transform="translate(400 400) rotate(-42)">
          <circle cx="-150" cy="0" r="150" fill={C.ink} />
          <circle cx="-150" cy="0" r="88" fill={C.yellow} />
          <g transform="rotate(42 -150 0)">
            <polygon points="-150,-56 -104,2 -131,2 -131,48 -169,48 -169,2 -196,2" fill={C.blue} />
          </g>
          <rect x="-20" y="-30" width="470" height="60" rx="14" fill={C.ink} />
          <rect x="330" y="30" width="44" height="96" rx="10" fill={C.ink} />
          <rect x="410" y="30" width="44" height="64" rx="10" fill={C.ink} />
        </g>
      </>
    ),
  },
  {
    id: 'name-06',
    group: 'name',
    name: 'فقاعة الحوار',
    idea: 'شعار القناة الحالي (فقاعة حوار) بحجم كبير',
    render: () => (
      <>
        <rect width="800" height="800" fill="#fff" />
        <circle cx="400" cy="400" r="330" fill={C.blueSoft} />
        <g transform="translate(130 150) scale(8.4)">
          <path d="M14 8h36a10 10 0 0 1 10 10v20a10 10 0 0 1-10 10H30l-12 10v-10h-4A10 10 0 0 1 4 38V18A10 10 0 0 1 14 8z" fill={C.blue} />
          <path d="M32 40c-7-5-12-9-12-14a6 6 0 0 1 12-2 6 6 0 0 1 12 2c0 5-5 9-12 14z" fill="#fff" />
          <circle cx="50" cy="16" r="4" fill={C.yellow} />
        </g>
      </>
    ),
  },
  {
    id: 'name-07',
    group: 'name',
    name: 'الغرفة',
    idea: 'زاوية غرفة بثلاثة أبعاد وباب مضيء في الجدار',
    render: () => (
      <>
        <rect width="800" height="800" fill={SKY} />
        <g transform="translate(400 470) scale(1.22) translate(-400 -470)">
        <polygon points="400,215 150,360 150,560 400,415" fill="#FFFFFF" />
        <polygon points="400,215 650,360 650,560 400,415" fill="#EAF1FD" />
        <polygon points="150,560 400,415 650,560 400,705" fill="#B9CDEE" />
        <polygon points="478,372 562,420 562,540 478,492" fill={C.yellow} />
        <polygon points="478,492 562,540 640,640 520,640" fill="#FFE08A" opacity="0.8" />
        <polygon points="478,372 520,396 520,516 478,492" fill={C.ink} />
        <polygon points="200,402 276,446 276,520 200,476" fill={C.blueSoft} />
        </g>
        <circle cx="640" cy="170" r="40" fill={C.yellow} opacity="0.9" />
      </>
    ),
  },
  {
    id: 'name-08',
    group: 'name',
    name: 'الفاء والسهم',
    idea: 'حرف «ف» من «الفرص» وسهم صاعد',
    render: () => (
      <>
        <rect width="800" height="800" fill={C.green} />
        <text x="380" y="580" textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize="560" fill="#fff" direction="rtl">
          ف
        </text>
        <polygon points="610,140 710,260 650,260 650,410 570,410 570,260 510,260" fill={C.yellow} stroke={C.green} strokeWidth="14" strokeLinejoin="round" />
      </>
    ),
  },
  {
    id: 'name-09',
    group: 'name',
    name: 'طبقات الباب',
    idea: 'أبواب متداخلة بدرجات الأزرق وضوء أصفر في الوسط',
    render: () => (
      <>
        <rect width="800" height="800" fill={C.blue} />
        {[
          {w: 520, top: 110, fill: '#2F6FE8'},
          {w: 430, top: 190, fill: '#5B9BFF'},
          {w: 340, top: 270, fill: '#9CC1FF'},
          {w: 250, top: 350, fill: '#FFE08A'},
        ].map((d, k) => (
          <g key={k}>
            <path d={`M${400 - d.w / 2} 740 V${d.top + d.w / 2} a${d.w / 2} ${d.w / 2} 0 0 1 ${d.w} 0 V740 Z`} fill="#000" opacity="0.12" transform="translate(0 10)" />
            <path d={`M${400 - d.w / 2} 740 V${d.top + d.w / 2} a${d.w / 2} ${d.w / 2} 0 0 1 ${d.w} 0 V740 Z`} fill={d.fill} />
          </g>
        ))}
      </>
    ),
  },
  {
    id: 'name-10',
    group: 'name',
    name: 'زخرفة + الاسم',
    idea: 'نجمة ثمانية خفيفة، والاسم داخل قرص أبيض',
    render: () => (
      <>
        <rect width="800" height="800" fill={C.blue} />
        {Array.from({length: 7}, (_, i) =>
          Array.from({length: 7}, (_, j) => <Star8 key={`${i}-${j}`} cx={i * 150 - 25 + (j % 2) * 75} cy={j * 130 - 10} r={36} opacity={0.12} />),
        )}
        <circle cx="400" cy="250" r="96" fill={C.yellow} />
        <g transform="translate(335 160) scale(0.66)">
          <DoorGlyph frame="#fff" light="#fff" leaf={C.ink} glow="none" />
        </g>
        <rect x="95" y="400" width="610" height="230" rx="115" fill="#fff" />
        <text x="400" y="545" textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize="104" fill={C.ink} direction="rtl">
          غرفة الفرص
        </text>
      </>
    ),
  },
];

export const AvatarStill: React.FC<{id: string}> = ({id}) => {
  const a = AVATARS.find((x) => x.id === id) ?? AVATARS[0];
  return (
    <AbsoluteFill style={{background: '#fff'}}>
      <svg width={800} height={800} viewBox="0 0 800 800">
        {a.render()}
      </svg>
    </AbsoluteFill>
  );
};
