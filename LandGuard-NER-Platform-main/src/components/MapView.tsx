import { useState, type ReactNode } from 'react';
import type { RiskLevel } from '@/lib/supabase';

export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  label?: string;
  riskLevel?: RiskLevel;
  type?: 'risk' | 'report' | 'road' | 'landslide';
}

interface MapViewProps {
  markers: MapMarker[];
  onMarkerClick?: (marker: MapMarker) => void;
  selectedId?: string;
  height?: string;
  children?: ReactNode;
}

// NER bounding box
const MIN_LAT = 21.9;
const MAX_LAT = 28.4;
const MIN_LNG = 89.5;
const MAX_LNG = 97.5;

function project(lat: number, lng: number, w: number, h: number) {
  const x = ((lng - MIN_LNG) / (MAX_LNG - MIN_LNG)) * w;
  const y = ((MAX_LAT - lat) / (MAX_LAT - MIN_LAT)) * h;
  return { x, y };
}

const RISK_COLORS: Record<RiskLevel, string> = {
  safe: '#10b981',
  moderate: '#f59e0b',
  critical: '#ef4444',
};

const TYPE_COLORS = {
  risk: { safe: '#10b981', moderate: '#f59e0b', critical: '#ef4444' },
  report: { safe: '#3b82f6', moderate: '#3b82f6', critical: '#3b82f6' },
  road: { safe: '#6366f1', moderate: '#6366f1', critical: '#6366f1' },
  landslide: { safe: '#8b5cf6', moderate: '#8b5cf6', critical: '#8b5cf6' },
};

export default function MapView({ markers, onMarkerClick, selectedId, height = '400px', children }: MapViewProps) {
  const [hovered, setHovered] = useState<string | null>(null);
  const W = 800;
  const H = 600;

  const states = [
    { name: 'Arunachal Pradesh', d: 'M580,50 L720,80 L750,200 L680,280 L600,250 L570,150 Z' },
    { name: 'Assam', d: 'M300,250 L580,250 L600,350 L500,400 L350,380 L280,320 Z' },
    { name: 'Nagaland', d: 'M620,270 L720,280 L730,360 L660,370 L630,320 Z' },
    { name: 'Manipur', d: 'M520,380 L630,370 L640,440 L540,450 L500,420 Z' },
    { name: 'Mizoram', d: 'M400,440 L540,450 L550,520 L420,530 L380,480 Z' },
    { name: 'Meghalaya', d: 'M180,300 L300,290 L320,370 L250,390 L170,360 Z' },
    { name: 'Tripura', d: 'M250,460 L340,450 L350,510 L270,520 L240,490 Z' },
  ];

  return (
    <div className="relative w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-50" style={{ height }}>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-full w-full" preserveAspectRatio="xMidYMid meet">
        {/* Background */}
        <defs>
          <radialGradient id="mapBg" cx="50%" cy="40%" r="80%">
            <stop offset="0%" stopColor="#f1f5f9" />
            <stop offset="100%" stopColor="#e2e8f0" />
          </radialGradient>
        </defs>
        <rect width={W} height={H} fill="url(#mapBg)" />

        {/* State shapes */}
        {states.map((s) => (
          <path
            key={s.name}
            d={s.d}
            fill="#cbd5e1"
            fillOpacity={0.4}
            stroke="#64748b"
            strokeWidth={1.5}
            className="transition-colors hover:fill-slate-400/40"
          />
        ))}

        {/* State labels */}
        {states.map((s) => {
          const match = s.d.match(/M([\d.]+),([\d.]+)/);
          if (!match) return null;
          return (
            <text
              key={s.name + '-label'}
              x={parseFloat(match[1]) + 20}
              y={parseFloat(match[2]) + 20}
              fill="#475569"
              fontSize={11}
              className="font-medium"
            >
              {s.name}
            </text>
          );
        })}

        {/* Markers */}
        {markers.map((m) => {
          const { x, y } = project(m.lat, m.lng, W, H);
          const color = m.riskLevel
            ? (TYPE_COLORS[m.type || 'risk'] as Record<string, string>)[m.riskLevel] || RISK_COLORS[m.riskLevel]
            : '#3b82f6';
          const isSelected = selectedId === m.id;
          const isHovered = hovered === m.id;
          const r = isSelected ? 10 : isHovered ? 8 : 6;

          return (
            <g
              key={m.id}
              onClick={() => onMarkerClick?.(m)}
              onMouseEnter={() => setHovered(m.id)}
              onMouseLeave={() => setHovered(null)}
              className="cursor-pointer"
            >
              {isSelected && <circle cx={x} cy={y} r={16} fill={color} fillOpacity={0.2} />}
              <circle cx={x} cy={y} r={r} fill={color} stroke="white" strokeWidth={2} className="transition-all" />
              {(isHovered || isSelected) && m.label && (
                <g>
                  <rect x={x + 12} y={y - 22} width={m.label.length * 7 + 16} height={24} rx={4} fill="white" stroke={color} strokeWidth={1} />
                  <text x={x + 20} y={y - 6} fontSize={11} fill="#1e293b" className="font-semibold">
                    {m.label}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="absolute bottom-3 left-3 flex flex-wrap gap-3 rounded-lg bg-white/90 px-3 py-2 shadow-sm backdrop-blur">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
          <span className="text-xs font-medium text-slate-700">Safe</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
          <span className="text-xs font-medium text-slate-700">Moderate</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
          <span className="text-xs font-medium text-slate-700">Critical</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
          <span className="text-xs font-medium text-slate-700">Reports</span>
        </div>
      </div>

      {children}
    </div>
  );
}
