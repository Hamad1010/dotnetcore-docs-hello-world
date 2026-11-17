// The five presenter options for the owner to choose from (framework v7, EP006): option 0 is the line-up, 1–5 show each
// one standing beside a page drawn in the «sketchbook» look, as he would in the video. Rendered by scripts/presenters.mjs.
import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {ensureFonts} from './fonts';
import {Banner, Bubble, FatArrow, HAND, LATIN_HAND, RUQAA, SK, SketchDoor, SketchFilters, SketchPaper, StickPerson, WashBlob} from './components/Sketchbook';
import {Presenter, PRESENTER_OPTIONS} from './components/Presenter';

export type PresenterSheetProps = {option: number};

const Avatar: React.FC = () => (
  <Img src={staticFile('_assets/brand/avatar.png')} style={{position: 'absolute', top: 30, right: 34, width: 86, height: 86, borderRadius: '50%'}} />
);

const Label: React.FC<{n: number; x: number; y: number; big?: boolean}> = ({n, x, y, big = false}) => {
  const o = PRESENTER_OPTIONS[n - 1];
  const r = big ? 38 : 30;
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle cx={0} cy={0} r={r} fill={SK.yellowSolid} opacity={0.85} />
      <circle cx={0} cy={0} r={r} fill="none" stroke={SK.graphite} strokeWidth={4} filter="url(#sheet-ink)" />
      <text x={0} y={r * 0.42} textAnchor="middle" fontFamily={HAND} fontWeight={600} fontSize={r * 1.25} fill={SK.graphite}>
        {n}
      </text>
      <text x={0} y={r + (big ? 70 : 58)} textAnchor="middle" direction="rtl" fontFamily={HAND} fontWeight={600} fontSize={big ? 64 : 50} fill={SK.graphite}>
        {o.ar}
      </text>
      <text x={0} y={r + (big ? 116 : 98)} textAnchor="middle" fontFamily={LATIN_HAND} fontWeight={700} fontSize={big ? 40 : 34} fill={SK.graphite2}>
        {o.en}
      </text>
    </g>
  );
};

const LineUp: React.FC = () => {
  const xs = [1690, 1330, 960, 590, 230]; // right to left: option 1 starts where an Arabic reader starts
  return (
    <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
      <SketchFilters id="sheet" seed={5} />
      <Banner id="sheet" x={560} y={34} w={800} text="مين يمثّلك في الفيديو؟" mark="يمثّلك" size={60} />
      {PRESENTER_OPTIONS.map((o, i) => (
        <g key={o.look}>
          <WashBlob id="sheet" d={`M${xs[i] - 150} 830 Q${xs[i]} 790 ${xs[i] + 150} 832 Q${xs[i] + 170} 870 ${xs[i]} 875 Q${xs[i] - 170} 870 ${xs[i] - 150} 830 Z`} color={[SK.blueWash, SK.roseWash, SK.greenWash, SK.yellowSolid, SK.roseWash][i]} opacity={0.35} />
          <Presenter id={`p${i}`} look={o.look} pose="open" x={xs[i]} y={850} height={600} />
          <Label n={i + 1} x={xs[i]} y={915} />
        </g>
      ))}
    </svg>
  );
};

/** One option on a page from EP006: a question between two stick people, a fat arrow to a door, a note in yellow. */
const InContext: React.FC<{n: number}> = ({n}) => {
  const o = PRESENTER_OPTIONS[n - 1];
  return (
    <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
      <SketchFilters id="sheet" seed={9} />
      <Banner id="sheet" x={330} y={60} w={760} text="الملف 06 · سر السؤال" mark="السؤال" size={62} />
      {/* the question, between two stick people */}
      <WashBlob id="sheet" d="M120 610 Q330 520 560 600 Q640 760 470 820 Q250 860 150 780 Q80 700 120 610 Z" color={SK.blueWash} opacity={0.42} />
      <StickPerson id="sheet" x={250} y={860} size={300} pose="answer" />
      <StickPerson id="sheet" x={470} y={860} size={300} pose="ask" accent={SK.coral} flip />
      <Bubble id="sheet" x={420} y={360} w={330} h={120} text="كيف بديت؟" tail="left" size={60} />
      <Bubble id="sheet" x={40} y={300} w={300} h={110} text="…قصة طويلة" tail="right" size={46} />
      {/* the fat arrow to the door it opens */}
      <FatArrow id="sheet" from={[760, 420]} to={[960, 560]} bend={-0.25} />
      <SketchDoor id="sheet" x={980} y={480} w={180} h={320} color={SK.greenWash} open={0.45} />
      {/* the one thing that matters, on yellow */}
      <g transform="translate(560 950)">
        <rect x={-10} y={-62} width={600} height={78} fill={SK.yellow} filter="url(#sheet-marker)" style={{mixBlendMode: 'multiply'}} />
        <text x={290} y={0} textAnchor="middle" direction="rtl" fontFamily={RUQAA} fontWeight={700} fontSize={58} fill={SK.graphite}>
          سؤال واحد… قبل أي طلب
        </text>
      </g>
      <path d="M560 976 Q850 994 1150 972" stroke={SK.coral} strokeWidth={6} fill="none" strokeLinecap="round" filter="url(#sheet-ink)" />
      {/* the presenter, beside the page */}
      <WashBlob id="sheet" d="M1380 1010 Q1560 970 1760 1012 Q1790 1050 1560 1058 Q1350 1052 1380 1010 Z" color={SK.roseWash} opacity={0.3} />
      <Presenter id="host" look={o.look} pose="point" x={1590} y={1040} height={820} />
      <g transform="translate(140 1000)">
        <text x={0} y={0} fontFamily={LATIN_HAND} fontWeight={700} fontSize={34} fill={SK.graphite2}>
          {`option ${n} · ${o.en}`}
        </text>
      </g>
      <g transform="translate(1770 150)">
        <text x={0} y={0} textAnchor="start" direction="rtl" fontFamily={HAND} fontWeight={600} fontSize={46} fill={SK.graphite}>
          {`الخيار ${n}: ${o.ar}`}
        </text>
        <text x={0} y={46} textAnchor="start" direction="rtl" fontFamily={RUQAA} fontSize={34} fill={SK.graphite2}>
          {o.note}
        </text>
      </g>
    </svg>
  );
};

export const PresenterSheet: React.FC<PresenterSheetProps> = ({option}) => {
  ensureFonts();
  return (
    <AbsoluteFill>
      <SketchPaper />
      {option === 0 ? <LineUp /> : <InContext n={option} />}
      <Avatar />
    </AbsoluteFill>
  );
};
