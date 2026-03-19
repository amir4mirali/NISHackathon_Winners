"use client";

import { useState } from "react";
import { DISTRICT_PATHS } from "@/lib/districtPaths";

type DistrictKey = "green" | "orange" | "yellow" | "blue";

type DistrictInfo = {
  key: DistrictKey;
  name: string;
  subtitle: string;
  color: string;
  shortGeo: string;
  points: string[];
};

const districts: DistrictInfo[] = [
  {
    key: "green",
    name: "Green District",
    subtitle: "Природа, туризм и отдых",
    color: "#2e6955",
    shortGeo:
      "Южнее Конаева, с восточной границей вдоль Капчагайского водохранилища и коридора реки Каскелен.",
    points: [
      "Живописные природные ландшафты и благоприятный климат.",
      "Сценарии для отдыха, туризма и семейного досуга.",
      "База для гостиничной и рекреационной инфраструктуры.",
    ],
  },
  {
    key: "orange",
    name: "Growing District",
    subtitle: "Производство и логистика нового поколения",
    color: "#f36f36",
    shortGeo:
      "Расположен вдоль стратегических транспортных маршрутов, включая трассу Алматы-Капчагай и железнодорожные связи.",
    points: [
      "Опора для промышленных инвестиций и создания рабочих мест.",
      "Фокус на экологичное и технологичное производство.",
      "Сильный логистический потенциал и экспортная ориентация.",
    ],
  },
  {
    key: "yellow",
    name: "Golden District",
    subtitle: "Центр знаний, здоровья и инноваций",
    color: "#f6d333",
    shortGeo:
      "Центральная часть Alatau с удобной связью с остальными районами города.",
    points: [
      "Концентрация образовательных и исследовательских учреждений.",
      "Развитие медицины и социальных сервисов высокого уровня.",
      "Городская среда для науки, культуры и человеческого капитала.",
    ],
  },
  {
    key: "blue",
    name: "Gate District",
    subtitle: "Деловой центр и ворота в Alatau",
    color: "#2f62ad",
    shortGeo:
      "Граничит с южной частью Алматы и обеспечивает быстрый доступ к ключевым транспортным артериям.",
    points: [
      "Финансово-административный контур и бизнес-инфраструктура.",
      "Привлекательность для международных компаний и партнеров.",
      "Высокая транспортная доступность для деловой активности.",
    ],
  },
];

const pathMap: Record<DistrictKey, string> = DISTRICT_PATHS;

const pinMap: Record<DistrictKey, { x: number; y: number }> = {
  green: { x: 260, y: 230 },
  orange: { x: 230, y: 380 },
  yellow: { x: 190, y: 540 },
  blue: { x: 170, y: 661 },
};

const labelCenterMap: Record<DistrictKey, { x: number; y: number }> = {
  green: { x: 260, y: 208 },
  orange: { x: 230, y: 334 },
  yellow: { x: 190, y: 510 },
  blue: { x: 170, y: 639 },
};

export default function AlatauDistrictShowcase() {
  const [active, setActive] = useState<DistrictKey>("green");

  return (
    <section className="mt-8 rounded-3xl border border-white/70 bg-white/90 p-5 shadow-lg md:p-7">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Карта районов Alatau</h2>
          <p className="text-sm text-[color:var(--muted)]">
            Визуальный обзор 4 дистриктов и их роли в развитии города.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="overflow-hidden rounded-3xl bg-[#e3e3e3]">
          <svg viewBox="0 0 630 760" className="mx-auto w-full max-w-[640px]" role="img" aria-label="Карта районов Alatau">
            <path d="M56 44 L252 0 L302 122 L168 172 L76 142 Z" fill="#ececec" />
            <path d="M292 0 L630 0 L630 86 L592 148 L512 116 L430 126 L356 112 L324 68 Z" fill="#ececec" />
            <path d="M0 212 L162 180 L180 282 L102 356 L0 344 Z" fill="#ececec" />
            <path d="M504 292 L630 262 L630 534 L498 592 L426 558 L430 458 L486 398 Z" fill="#ececec" />
            <path d="M18 446 L138 392 L150 488 L118 612 L20 582 Z" fill="#ececec" />
            <path d="M360 460 L488 418 L426 558 L358 564 L324 522 Z" fill="#ececec" />
            <path d="M128 620 L210 572 L196 700 L124 734 L80 692 Z" fill="#ececec" />

            {districts.map((district) => {
              const isActive = district.key === active;
              const pin = pinMap[district.key];
              const labelCenter = labelCenterMap[district.key];
              return (
                <g key={district.key} onClick={() => setActive(district.key)} className="cursor-pointer">
                  <path
                    d={pathMap[district.key]}
                    fill={district.color}
                    opacity={isActive ? 1 : 0.95}
                    stroke={isActive ? "#ffffff" : "transparent"}
                    strokeWidth={isActive ? 3 : 0}
                    className="transition"
                  />

                  {district.key === "green" && (
                    <text
                      x={labelCenter.x}
                      y={labelCenter.y}
                      fill="#ffffff"
                      fontSize="14"
                      fontWeight="600"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      style={{ pointerEvents: "none" }}
                    >
                      Green District
                    </text>
                  )}

                  {district.key === "orange" && (
                    <>
                      <text
                        x={labelCenter.x}
                        y={labelCenter.y - 11}
                        fill="#ffffff"
                        fontSize="14"
                        fontWeight="600"
                        textAnchor="middle"
                        style={{ pointerEvents: "none" }}
                      >
                        Growing
                      </text>
                      <text
                        x={labelCenter.x}
                        y={labelCenter.y + 11}
                        fill="#ffffff"
                        fontSize="14"
                        fontWeight="600"
                        textAnchor="middle"
                        style={{ pointerEvents: "none" }}
                      >
                        District
                      </text>
                    </>
                  )}

                  {district.key === "yellow" && (
                    <>
                      <text
                        x={labelCenter.x}
                        y={labelCenter.y - 11}
                        fill="#20395d"
                        fontSize="14"
                        fontWeight="500"
                        textAnchor="middle"
                        style={{ pointerEvents: "none" }}
                      >
                        Golden
                      </text>
                      <text
                        x={labelCenter.x}
                        y={labelCenter.y + 11}
                        fill="#20395d"
                        fontSize="14"
                        fontWeight="500"
                        textAnchor="middle"
                        style={{ pointerEvents: "none" }}
                      >
                        District
                      </text>
                    </>
                  )}

                  {district.key === "blue" && (
                    <text
                      x={labelCenter.x}
                      y={labelCenter.y}
                      fill="#20395d"
                      fontSize="14"
                      fontWeight="500"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      style={{ pointerEvents: "none" }}
                    >
                      Gate District
                    </text>
                  )}

                  <circle cx={pin.x} cy={pin.y} r={12} fill="none" stroke="#ffffff" strokeOpacity="0.92" strokeWidth={2.7} />
                  <circle cx={pin.x} cy={pin.y} r={5} fill="#f4f6f7" />
                </g>
              );
            })}
          </svg>
        </div>

        <div className="space-y-3">
          {districts.map((district) => {
            const isActive = district.key === active;
            return (
              <article
                key={district.key}
                className={`rounded-xl border p-4 transition ${
                  isActive
                    ? "border-transparent bg-[color:var(--accent-soft)] shadow"
                    : "border-slate-200 bg-white"
                }`}
              >
                <button
                  onClick={() => setActive(district.key)}
                  className="flex w-full items-start justify-between gap-3 text-left"
                >
                  <div>
                    <h3 className="text-base font-semibold">{district.name}</h3>
                    <p className="text-sm text-[color:var(--muted)]">{district.subtitle}</p>
                  </div>
                  <span
                    className="mt-1 inline-block h-3.5 w-3.5 rounded-full"
                    style={{ backgroundColor: district.color }}
                  />
                </button>

                {isActive && (
                  <div className="mt-3 space-y-2 text-sm text-[color:var(--foreground)]/85">
                    <p>{district.shortGeo}</p>
                    <ul className="space-y-1.5">
                      {district.points.map((point) => (
                        <li key={point} className="rounded-lg bg-white/70 px-3 py-2">
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </div>

      <p className="mt-4 text-xs text-[color:var(--muted)]">
        Карта выполнена в визуальном стиле официальной презентации районов Alatau и синхронизирована с описаниями.
      </p>
    </section>
  );
}
