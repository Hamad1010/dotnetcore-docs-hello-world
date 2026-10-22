// The thumbnails that come with every full script (framework §3.13). Their texts live in
// 03-episodes/EP00N/thumbs.json; `npm run thumbs -- EP00N` renders out/thumb-1.png … thumb-N.png.
// `layout: "design"` = the ten designs in ThumbDesigns.tsx (story, scale, time, income, phone, repeat, versus, trap,
// platform, puzzle); the three first layouts below (a stamp on a person, a big number, an object) are the earlier ones.
import React from 'react';
import {AbsoluteFill, staticFile, type CalculateMetadataFunction} from 'remotion';
import {C, FONT} from './theme';
import type {Brand, Episode} from './types';
import {episodeTag} from './scenes/common';
import {Crowd, Lever, PeopleGrid, Person, Phone} from './components/Silhouettes';
import {ThumbDesign, type DesignSpec} from './ThumbDesigns';

export type ThumbSpec =
  | DesignSpec
  | {layout: 'stamp'; headline: string; line2?: string; tag?: string; stamp: string}
  | {layout: 'numbers'; big: string; unit?: string; line2?: string; grid?: number}
  | {layout: 'object'; headline: string; line2?: string; tag?: string; blockTag?: string; visual?: 'person' | 'phone'};

export type ThumbVariantProps = {episodeId: string; index: number; spec?: ThumbSpec; badge?: string};

export const thumbVariantMeta: CalculateMetadataFunction<ThumbVariantProps> = async ({props}) => {
  const [specs, brand] = (await Promise.all([
    fetch(staticFile(`${props.episodeId}/thumbs.json`)).then((r) => r.json()),
    fetch(staticFile('channel.json')).then((r) => r.json()),
  ])) as [ThumbSpec[], Brand];
  return {props: {...props, spec: specs[props.index], badge: episodeTag({id: props.episodeId} as Episode, brand)}};
};

const Badge: React.FC<{text: string}> = ({text}) => (
  <div style={{position: 'absolute', right: 48, top: 40, background: C.ink, color: '#fff', fontSize: 34, fontWeight: 700, padding: '8px 26px', borderRadius: 999}}>{text}</div>
);

const Ltr: React.FC<{children: React.ReactNode}> = ({children}) => <span style={{direction: 'ltr', unicodeBidi: 'isolate'}}>{children}</span>;

export const ThumbVariant: React.FC<ThumbVariantProps> = ({spec, badge = ''}) => {
  const page: React.CSSProperties = {background: '#fff', fontFamily: FONT, direction: 'rtl', overflow: 'hidden'};
  if (!spec) return <AbsoluteFill style={page} />;
  if (spec.layout === 'design') return <ThumbDesign spec={spec} badge={badge} />;
  if (spec.layout === 'numbers') {
    return (
      <AbsoluteFill style={page}>
        <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: 600, background: C.ink}} />
        <div style={{position: 'absolute', left: 30, top: 70, opacity: 0.55}}>
          <Crowd id="thumb-crowd" width={540} height={600} color="#8EA0C0" />
        </div>
        <div style={{position: 'absolute', left: 190, top: 150, filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.45))', transform: 'rotate(-8deg)'}}>
          <Phone size={420} color={C.green} bubbles={3} />
        </div>
        <Badge text={badge} />
        <div style={{position: 'absolute', right: 56, top: 112, width: 600}}>
          <div style={{display: 'flex', alignItems: 'baseline', gap: 18, color: C.blue}}>
            <span style={{fontSize: 210, fontWeight: 700, lineHeight: 0.95}}>
              <Ltr>{spec.big}</Ltr>
            </span>
            {spec.unit ? <span style={{fontSize: 74, fontWeight: 700}}>{spec.unit}</span> : null}
          </div>
          {spec.line2 ? <div style={{fontSize: 66, fontWeight: 700, color: C.ink, lineHeight: 1.25, marginTop: 14}}>{spec.line2}</div> : null}
          {spec.grid ? (
            <div style={{marginTop: 22}}>
              <PeopleGrid count={spec.grid} cols={11} cell={36} color={C.blue} />
            </div>
          ) : null}
        </div>
      </AbsoluteFill>
    );
  }
  if (spec.layout === 'stamp') {
    return (
      <AbsoluteFill style={page}>
        <div style={{position: 'absolute', left: -120, top: -60, width: 760, height: 840, borderRadius: '50%', background: C.redSoft}} />
        <div style={{position: 'absolute', left: 110, bottom: -10, filter: 'drop-shadow(0 24px 30px rgba(28,35,51,0.30))'}}>
          <Person size={560} color={C.ink} />
        </div>
        <div style={{position: 'absolute', left: 60, top: 430, transform: 'rotate(-12deg)', border: `12px solid ${C.red}`, borderRadius: 26, padding: '4px 34px', color: C.red, fontSize: 104, fontWeight: 700, background: '#fff'}}>
          {spec.stamp}
        </div>
        <Badge text={badge} />
        <div style={{position: 'absolute', right: 56, top: 140, width: 640}}>
          <div style={{fontSize: 124, fontWeight: 700, color: C.red, lineHeight: 1.12}}>{spec.headline}</div>
          {spec.line2 ? <div style={{fontSize: 84, fontWeight: 700, color: C.ink, lineHeight: 1.25}}>{spec.line2}</div> : null}
          {spec.tag ? <div style={{display: 'inline-flex', marginTop: 34, background: C.green, color: '#fff', fontSize: 74, fontWeight: 700, padding: '10px 34px', borderRadius: 24}}>{spec.tag}</div> : null}
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
      {spec.blockTag ? (
        <div style={{position: 'absolute', left: 52, top: 168, background: C.green, color: '#fff', fontSize: 40, fontWeight: 700, padding: '6px 18px', borderRadius: 14, transform: 'rotate(-10deg)'}}>
          {spec.blockTag}
        </div>
      ) : null}
      {spec.visual === 'phone' ? (
        <div style={{position: 'absolute', left: 500, top: 236, transform: 'rotate(12deg)', filter: 'drop-shadow(0 16px 20px rgba(28,35,51,0.30))'}}>
          <Phone size={230} color={C.green} bubbles={3} />
        </div>
      ) : (
        <div style={{position: 'absolute', left: 520, top: 300, transform: 'scaleX(-1)'}}>
          <Person size={170} color={C.blue} />
        </div>
      )}
      <Badge text={badge} />
      <div style={{position: 'absolute', right: 56, top: 150, width: 560}}>
        <div style={{fontSize: 150, fontWeight: 700, color: C.blue, lineHeight: 1.05}}>{spec.headline}</div>
        {spec.line2 ? <div style={{fontSize: 84, fontWeight: 700, color: C.ink, lineHeight: 1.2, marginTop: 14}}>{spec.line2}</div> : null}
        {spec.tag ? <div style={{display: 'inline-flex', marginTop: 30, background: C.yellow, color: C.ink, fontSize: 50, fontWeight: 700, padding: '10px 30px', borderRadius: 22}}>{spec.tag}</div> : null}
      </div>
    </AbsoluteFill>
  );
};
