"use client";

import { Circle, CircleMarker, MapContainer, TileLayer, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Project } from "@/lib/data";

type MapProps = {
  projects: Project[];
  selectedProjectId: string | null;
  onSelectProject: (projectId: string) => void;
};

const districtZones = [
  {
    name: "Green District",
    center: [43.264, 76.898] as [number, number],
    color: "#1f9d55",
  },
  {
    name: "Growing District",
    center: [43.238, 76.947] as [number, number],
    color: "#e9b949",
  },
  {
    name: "Golden District",
    center: [43.247, 76.91] as [number, number],
    color: "#f08c00",
  },
  {
    name: "Gate District",
    center: [43.221, 76.973] as [number, number],
    color: "#d64545",
  },
];

const statusColorMap: Record<Project["status"], string> = {
  completed: "#22c55e",
  "in progress": "#eab308",
  planned: "#ef4444",
};

export default function Map({ projects, selectedProjectId, onSelectProject }: MapProps) {
  return (
    <MapContainer
      center={[43.244, 76.921]}
      zoom={12}
      className="h-[420px] w-full rounded-2xl border border-white/70 shadow-lg"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />

      {districtZones.map((zone) => (
        <Circle
          key={zone.name}
          center={zone.center}
          radius={1450}
          pathOptions={{ color: zone.color, fillOpacity: 0.08 }}
        >
          <Tooltip direction="top" sticky>
            {zone.name}
          </Tooltip>
        </Circle>
      ))}

      {projects.map((project) => {
        const isActive = selectedProjectId === project.id;
        return (
          <CircleMarker
            key={project.id}
            center={[project.coordinates.lat, project.coordinates.lng]}
            radius={isActive ? 12 : 9}
            pathOptions={{
              color: statusColorMap[project.status],
              fillColor: statusColorMap[project.status],
              fillOpacity: isActive ? 0.9 : 0.7,
              weight: 2,
            }}
            eventHandlers={{
              click: () => onSelectProject(project.id),
            }}
          >
            <Tooltip direction="top" offset={[0, -8]}>
              {project.name}
            </Tooltip>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
