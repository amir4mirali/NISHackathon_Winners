"use client";

import { useMemo, useRef, useState } from "react";
import { DISTRICT_PATHS } from "@/lib/districtPaths";
import { District, Project } from "@/lib/shared";

type MapProps = {
  projects: Project[];
  selectedProjectId: string | null;
  onSelectProject: (projectId: string) => void;
};

type DistrictKey = "green" | "orange" | "yellow" | "blue";

const districtKeyByName: Record<District, DistrictKey> = {
  "Green District": "green",
  "Growing District": "orange",
  "Golden District": "yellow",
  "Gate District": "blue",
};

const districtColorMap: Record<DistrictKey, string> = {
  green: "#2e6955",
  orange: "#f36f36",
  yellow: "#f6d333",
  blue: "#2f62ad",
};

const districtLabelMap: Record<DistrictKey, string> = {
  green: "Green District",
  orange: "Growing District",
  yellow: "Golden District",
  blue: "Gate District",
};

const districtAnchorMap: Record<DistrictKey, { x: number; y: number }> = {
  green: { x: 260, y: 230 },
  orange: { x: 230, y: 380 },
  yellow: { x: 190, y: 540 },
  blue: { x: 170, y: 661 },
};

const markerOffsetPattern = [
  { x: 0, y: 0 },
  { x: 24, y: -14 },
  { x: -24, y: 14 },
  { x: 18, y: 18 },
  { x: -18, y: -18 },
];

const statusColorMap: Record<Project["status"], string> = {
  completed: "#22c55e",
  "in progress": "#eab308",
  planned: "#ef4444",
};

const MIN_ZOOM = 1;
const MAX_ZOOM = 2.2;
const ZOOM_STEP = 0.2;

type PanOffset = {
  x: number;
  y: number;
};

type DragState = {
  startX: number;
  startY: number;
  panX: number;
  panY: number;
};

type ProjectMarker = {
  id: string;
  name: string;
  districtKey: DistrictKey;
  x: number;
  y: number;
  status: Project["status"];
};

export default function Map({ projects, selectedProjectId, onSelectProject }: MapProps) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState<PanOffset>({ x: 0, y: 0 });
  const [drag, setDrag] = useState<DragState | null>(null);
  const dragDistanceRef = useRef(0);

  const markers = useMemo<ProjectMarker[]>(() => {
    const districtCounters: Record<DistrictKey, number> = {
      green: 0,
      orange: 0,
      yellow: 0,
      blue: 0,
    };

    return projects.map((project) => {
      const districtKey = districtKeyByName[project.district];
      const index = districtCounters[districtKey] ?? 0;
      districtCounters[districtKey] = index + 1;

      const anchor = districtAnchorMap[districtKey];
      const offset = markerOffsetPattern[index % markerOffsetPattern.length];
      const ringOffset = Math.floor(index / markerOffsetPattern.length) * 12;

      return {
        id: project.id,
        name: project.name,
        districtKey,
        x: anchor.x + offset.x + ringOffset,
        y: anchor.y + offset.y - ringOffset,
        status: project.status,
      };
    });
  }, [projects]);

  const getPanBounds = (nextZoom: number) => {
    const zoomDelta = Math.max(0, nextZoom - 1);
    return {
      maxX: zoomDelta * 220,
      maxY: zoomDelta * 260,
    };
  };

  const clampPan = (nextPan: PanOffset, nextZoom: number): PanOffset => {
    const bounds = getPanBounds(nextZoom);
    return {
      x: Math.max(-bounds.maxX, Math.min(bounds.maxX, nextPan.x)),
      y: Math.max(-bounds.maxY, Math.min(bounds.maxY, nextPan.y)),
    };
  };

  const applyZoom = (nextZoom: number) => {
    setZoom(nextZoom);
    setPan((prevPan) => clampPan(prevPan, nextZoom));
  };

  const zoomIn = () => {
    const nextZoom = Math.min(MAX_ZOOM, Number((zoom + ZOOM_STEP).toFixed(2)));
    applyZoom(nextZoom);
  };

  const zoomOut = () => {
    const nextZoom = Math.max(MIN_ZOOM, Number((zoom - ZOOM_STEP).toFixed(2)));
    applyZoom(nextZoom);
  };

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    if (zoom <= MIN_ZOOM) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragDistanceRef.current = 0;
    setDrag({
      startX: event.clientX,
      startY: event.clientY,
      panX: pan.x,
      panY: pan.y,
    });
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!drag) return;
    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;
    dragDistanceRef.current = Math.hypot(dx, dy);

    const nextPan = {
      x: drag.panX + dx,
      y: drag.panY + dy,
    };
    setPan(clampPan(nextPan, zoom));
  };

  const onPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setDrag(null);
  };

  const onWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    const delta = event.deltaY;
    if (delta === 0) return;

    if (delta < 0) {
      const nextZoom = Math.min(MAX_ZOOM, Number((zoom + ZOOM_STEP).toFixed(2)));
      applyZoom(nextZoom);
    } else {
      const nextZoom = Math.max(MIN_ZOOM, Number((zoom - ZOOM_STEP).toFixed(2)));
      applyZoom(nextZoom);
    }
  };

  return (
    <div className="relative h-[420px] w-full overflow-hidden rounded-2xl border border-white/70 bg-[#e3e3e3] shadow-lg">
      <div className="absolute left-3 top-3 z-10 flex flex-col overflow-hidden rounded-lg border border-slate-300 bg-white/95 shadow">
        <button
          type="button"
          onClick={zoomIn}
          className="h-9 w-9 text-xl font-semibold text-slate-800 transition hover:bg-slate-100 disabled:opacity-40"
          disabled={zoom >= MAX_ZOOM}
          aria-label="Увеличить карту"
          title="Увеличить"
        >
          +
        </button>
        <button
          type="button"
          onClick={zoomOut}
          className="h-9 w-9 border-t border-slate-300 text-xl font-semibold text-slate-800 transition hover:bg-slate-100 disabled:opacity-40"
          disabled={zoom <= MIN_ZOOM}
          aria-label="Уменьшить карту"
          title="Уменьшить"
        >
          -
        </button>
      </div>

      <div
        className={`h-full w-full select-none ${
          drag ? "cursor-grabbing" : zoom > MIN_ZOOM ? "cursor-grab" : "cursor-default"
        }`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onWheel={onWheel}
      >
      <svg
        viewBox="0 0 630 760"
        className="h-full w-full"
        role="img"
        aria-label="Карта Alatau с проектами"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: "50% 50%",
          transition: drag ? "none" : "transform 180ms ease",
          touchAction: "none",
          userSelect: "none",
        }}
      >
        <path d="M56 44 L252 0 L302 122 L168 172 L76 142 Z" fill="#ececec" />
        <path d="M292 0 L630 0 L630 86 L592 148 L512 116 L430 126 L356 112 L324 68 Z" fill="#ececec" />
        <path d="M0 212 L162 180 L180 282 L102 356 L0 344 Z" fill="#ececec" />
        <path d="M504 292 L630 262 L630 534 L498 592 L426 558 L430 458 L486 398 Z" fill="#ececec" />
        <path d="M18 446 L138 392 L150 488 L118 612 L20 582 Z" fill="#ececec" />
        <path d="M360 460 L488 418 L426 558 L358 564 L324 522 Z" fill="#ececec" />
        <path d="M128 620 L210 572 L196 700 L124 734 L80 692 Z" fill="#ececec" />

        {Object.entries(DISTRICT_PATHS).map(([districtKey, path]) => (
          <path
            key={districtKey}
            d={path}
            fill={districtColorMap[districtKey as DistrictKey]}
            opacity={0.92}
            stroke="#ffffff"
            strokeWidth={1.8}
          />
        ))}

        {(Object.keys(districtAnchorMap) as DistrictKey[]).map((districtKey) => {
          const anchor = districtAnchorMap[districtKey];
          return (
            <text
              key={`${districtKey}-label`}
              x={anchor.x}
              y={anchor.y - 28}
              textAnchor="middle"
              fill={districtKey === "yellow" || districtKey === "blue" ? "#173054" : "#ffffff"}
              fontSize="12"
              fontWeight="600"
              style={{ pointerEvents: "none" }}
            >
              {districtLabelMap[districtKey]}
            </text>
          );
        })}

        {markers.map((marker) => {
          const isActive = selectedProjectId === marker.id;
          const color = statusColorMap[marker.status];
          return (
            <g
              key={marker.id}
              onClick={() => {
                if (dragDistanceRef.current > 6) return;
                onSelectProject(marker.id);
              }}
              className="cursor-pointer"
            >
              {isActive && <circle cx={marker.x} cy={marker.y} r={15} fill="none" stroke="#0f172a" strokeWidth={2.2} />}
              <circle cx={marker.x} cy={marker.y} r={11} fill={color} fillOpacity={0.92} stroke="#ffffff" strokeWidth={2.6} />
              <circle cx={marker.x} cy={marker.y} r={4.8} fill="#f8fafc" />
              {isActive && (
                <text
                  x={marker.x}
                  y={marker.y - 18}
                  textAnchor="middle"
                  fill="#0f172a"
                  fontSize="11"
                  fontWeight="700"
                  style={{ pointerEvents: "none" }}
                >
                  {marker.name}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      </div>
    </div>
  );
}
