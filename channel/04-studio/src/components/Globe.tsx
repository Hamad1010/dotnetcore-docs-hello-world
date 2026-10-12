import React, {useMemo} from 'react';
import {geoDistance, geoGraticule10, geoInterpolate, geoOrthographic, geoPath} from 'd3-geo';
import {feature} from 'topojson-client';
import world from 'world-atlas/countries-110m.json';
import {interpolate, useCurrentFrame} from 'remotion';
import {C, EASE_IN_OUT, FONT} from '../theme';

type LatLon = {lat: number; lon: number};
export type CameraKey = {at: number; pos: LatLon};
export type Arc = {from: LatLon; to: LatLon; start: number; end: number};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const topo = world as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const countries = (feature(topo, topo.objects.countries) as any).features as Array<{id?: string; type: string; geometry: any}>;
const graticule = geoGraticule10();

const toXY = (p: LatLon): [number, number] => [p.lon, p.lat];

/** Camera position at frame f, moving along great circles between key positions. */
export const cameraAt = (keys: CameraKey[], f: number): [number, number] => {
  if (f <= keys[0].at) return toXY(keys[0].pos);
  for (let i = 1; i < keys.length; i++) {
    const a = keys[i - 1];
    const b = keys[i];
    if (f <= b.at) {
      const t = interpolate(f, [a.at, b.at], [0, 1], {easing: EASE_IN_OUT});
      return geoInterpolate(toXY(a.pos), toXY(b.pos))(t) as [number, number];
    }
  }
  return toXY(keys[keys.length - 1].pos);
};

export const Globe: React.FC<{
  size: number;
  keys: CameraKey[];
  accent: string;
  highlight?: string; // ISO 3166-1 numeric id, e.g. "826"
  pin?: LatLon & {label?: string; at: number};
  arcs?: Arc[];
  labels?: (LatLon & {text: string; at: number})[];
}> = ({size, keys, accent, highlight, pin, arcs = [], labels = []}) => {
  const f = useCurrentFrame();
  const center = cameraAt(keys, f);
  const r = size / 2 - 6;
  const projection = useMemo(() => geoOrthographic().clipAngle(90).translate([size / 2, size / 2]).scale(r), [size, r]);
  projection.rotate([-center[0], -center[1]]);
  const path = geoPath(projection);

  const visible = (p: LatLon) => geoDistance(toXY(p), center) < Math.PI / 2 - 0.05;
  const pulse = (Math.sin(f / 7) + 1) / 2;

  return (
    <div style={{position: 'relative', width: size, height: size}}>
      <svg width={size} height={size} style={{overflow: 'visible'}}>
        <defs>
          <radialGradient id="ocean" cx="38%" cy="32%" r="75%">
            <stop offset="0%" stopColor="#EEF4FE" />
            <stop offset="70%" stopColor={C.ocean} />
            <stop offset="100%" stopColor="#C6D6F0" />
          </radialGradient>
          <radialGradient id="shine" cx="35%" cy="25%" r="60%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity={0} />
          </radialGradient>
        </defs>
        <ellipse cx={size / 2} cy={size - 4} rx={r * 0.72} ry={18} fill="rgba(28,35,51,0.10)" style={{filter: 'blur(10px)'}} />
        <path d={path({type: 'Sphere'}) || ''} fill="url(#ocean)" stroke="#C3D1E8" strokeWidth={2} />
        <path d={path(graticule) || ''} fill="none" stroke={C.graticule} strokeWidth={1} />
        {countries.map((c, i) => {
          const isHi = highlight && c.id === highlight;
          return (
            <path
              key={i}
              d={path(c as never) || ''}
              fill={isHi ? accent : C.land}
              fillOpacity={isHi ? 0.75 + 0.25 * pulse : 1}
              stroke={isHi ? accent : C.landStroke}
              strokeWidth={isHi ? 1.6 : 0.8}
            />
          );
        })}
        {arcs.map((a, i) => {
          const p = interpolate(f, [a.start, a.end], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE_IN_OUT});
          if (p <= 0) return null;
          const interp = geoInterpolate(toXY(a.from), toXY(a.to));
          const N = 80;
          const M = Math.max(2, Math.round(N * p));
          const coords = Array.from({length: M}, (_, k) => interp((k / (M - 1)) * p));
          const d = path({type: 'LineString', coordinates: coords} as never) || '';
          const head = projection(coords[coords.length - 1] as [number, number]);
          const headVisible = geoDistance(coords[coords.length - 1] as [number, number], center) < Math.PI / 2;
          return (
            <g key={i}>
              <path d={d} fill="none" stroke={accent} strokeWidth={6} strokeLinecap="round" strokeDasharray="2 12" opacity={0.9} />
              {head && headVisible && p < 1 ? <circle cx={head[0]} cy={head[1]} r={9} fill={accent} stroke="#fff" strokeWidth={3} /> : null}
            </g>
          );
        })}
        {pin && f >= pin.at && visible(pin)
          ? (() => {
              const xy = projection(toXY(pin));
              if (!xy) return null;
              const t = (f - pin.at) % 45;
              const ring = interpolate(t, [0, 45], [10, 48]);
              const ringO = interpolate(t, [0, 45], [0.6, 0]);
              const s = interpolate(f, [pin.at, pin.at + 10], [0, 1], {extrapolateRight: 'clamp', easing: EASE_IN_OUT});
              return (
                <g>
                  <circle cx={xy[0]} cy={xy[1]} r={ring} fill="none" stroke={accent} strokeWidth={4} opacity={ringO} />
                  <circle cx={xy[0]} cy={xy[1]} r={15 * s} fill={accent} stroke="#fff" strokeWidth={5} />
                </g>
              );
            })()
          : null}
        <path d={path({type: 'Sphere'}) || ''} fill="url(#shine)" />
      </svg>
      {[...(pin && pin.label ? [{...pin, text: pin.label}] : []), ...labels].map((l, i) => {
        if (f < l.at || !visible(l)) return null;
        const xy = projection(toXY(l));
        if (!xy) return null;
        const o = interpolate(f, [l.at, l.at + 10], [0, 1], {extrapolateRight: 'clamp'});
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: xy[0],
              top: xy[1] - 64,
              transform: `translateX(-50%) scale(${0.9 + 0.1 * o})`,
              opacity: o,
              background: C.ink,
              color: '#fff',
              fontFamily: FONT,
              fontSize: 26,
              fontWeight: 600,
              padding: '6px 18px',
              borderRadius: 999,
              whiteSpace: 'nowrap',
              direction: 'rtl',
            }}
          >
            {l.text}
          </div>
        );
      })}
    </div>
  );
};
