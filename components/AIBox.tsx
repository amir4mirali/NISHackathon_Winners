"use client";

import { useMemo, useState } from "react";
import {
  analyzeDistrict,
  recommendDistrictsForResident,
  ResidentProfile,
  ResidentRequestType,
} from "@/lib/ai";
import { District, DISTRICTS, Project } from "@/lib/shared";

type AIBoxProps = {
  projects: Project[];
};

export default function AIBox({ projects }: AIBoxProps) {
  const [district, setDistrict] = useState<District>("Green District");
  const [type, setType] = useState<ResidentRequestType>("house");
  const [profile, setProfile] = useState<ResidentProfile>({
    hasChildren: true,
    budget: "medium",
    preferredHomeType: "residential complex",
    prioritizeSafety: true,
    prioritizeSchools: true,
    prioritizeTransport: false,
  });

  const districtLabelMap: Record<District, string> = {
    "Green District": "Green District",
    "Growing District": "Growing District",
    "Golden District": "Golden District",
    "Gate District": "Gate District",
  };
  const districtRuMap: Record<District, string> = {
    "Green District": "Green District (зеленый)",
    "Growing District": "Growing District (растущий)",
    "Golden District": "Golden District (золотой)",
    "Gate District": "Gate District (въездной)",
  };

  const result = useMemo(() => analyzeDistrict(district, type), [district, type]);
  const recommendations = useMemo(
    () => recommendDistrictsForResident(projects, profile),
    [projects, profile],
  );

  const best = recommendations[0];

  return (
    <section className="space-y-4 rounded-2xl border border-white/70 bg-white/90 p-5 shadow-lg">
      <header>
        <h2 className="text-lg font-semibold">AI-рекомендация для жителя</h2>
        <p className="text-sm text-[color:var(--muted)]">
          Подберите район под свою ситуацию: дети, бюджет и приоритеты безопасности.
        </p>
      </header>

      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <p className="mb-3 text-sm font-semibold">Ваш профиль</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="space-y-1 text-sm">
            <span className="font-medium">Есть дети</span>
            <select
              value={profile.hasChildren ? "yes" : "no"}
              onChange={(event) =>
                setProfile((prev) => ({ ...prev, hasChildren: event.target.value === "yes" }))
              }
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-[color:var(--accent)]/30"
            >
              <option value="yes">Да</option>
              <option value="no">Нет</option>
            </select>
          </label>

          <label className="space-y-1 text-sm">
            <span className="font-medium">Бюджет</span>
            <select
              value={profile.budget}
              onChange={(event) =>
                setProfile((prev) => ({
                  ...prev,
                  budget: event.target.value as ResidentProfile["budget"],
                }))
              }
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-[color:var(--accent)]/30"
            >
              <option value="low">Ограниченный</option>
              <option value="medium">Средний</option>
              <option value="high">Высокий</option>
            </select>
          </label>

          <label className="space-y-1 text-sm">
            <span className="font-medium">Желаемый формат жилья</span>
            <select
              value={profile.preferredHomeType}
              onChange={(event) =>
                setProfile((prev) => ({
                  ...prev,
                  preferredHomeType: event.target.value as ResidentRequestType,
                }))
              }
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-[color:var(--accent)]/30"
            >
              <option value="house">Частный дом</option>
              <option value="residential complex">Жилой комплекс</option>
            </select>
          </label>

          <label className="space-y-1 text-sm">
            <span className="font-medium">Главный приоритет</span>
            <select
              value={profile.prioritizeSafety ? "safety" : profile.prioritizeSchools ? "schools" : profile.prioritizeTransport ? "transport" : "balanced"}
              onChange={(event) => {
                const value = event.target.value;
                setProfile((prev) => ({
                  ...prev,
                  prioritizeSafety: value === "safety" || value === "balanced",
                  prioritizeSchools: value === "schools" || value === "balanced",
                  prioritizeTransport: value === "transport",
                }));
              }}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-[color:var(--accent)]/30"
            >
              <option value="balanced">Баланс: безопасность + школы</option>
              <option value="safety">Безопасность</option>
              <option value="schools">Школы и дети</option>
              <option value="transport">Транспортная доступность</option>
            </select>
          </label>
        </div>
      </div>

      {best && (
        <div className="rounded-xl bg-[color:var(--accent-soft)] p-4">
          <p className="text-sm font-semibold">Рекомендуемый район: {districtRuMap[best.district]}</p>
          <p className="mt-1 text-sm">
            Итоговая оценка: <span className="font-bold">{best.score}/10</span>
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-[color:var(--foreground)]/80">
            {best.reasons.slice(0, 3).map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="space-y-1 text-sm">
          <span className="font-medium">Быстрая проверка по району</span>
          <select
            value={district}
            onChange={(event) => setDistrict(event.target.value as District)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-[color:var(--accent)]/30"
          >
            {DISTRICTS.map((value) => (
              <option key={value} value={value}>
                {districtLabelMap[value]}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1 text-sm">
          <span className="font-medium">Формат жилья</span>
          <select
            value={type}
            onChange={(event) => setType(event.target.value as ResidentRequestType)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-[color:var(--accent)]/30"
          >
            <option value="house">Частный дом</option>
            <option value="residential complex">Жилой комплекс</option>
          </select>
        </label>
      </div>

      <div className="rounded-xl bg-[color:var(--accent-soft)] p-4">
        <p className="text-sm">
          Оценка района: <span className="font-bold">{result.score}/10</span>
        </p>
        <p className="mt-1 text-sm font-semibold text-[color:var(--accent)]">{result.recommendation}</p>
        <p className="mt-1 text-sm text-[color:var(--foreground)]/75">{result.explanation}</p>
      </div>

      {recommendations.length > 1 && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm">
          <p className="font-semibold">Топ районов по вашему профилю</p>
          <ul className="mt-2 space-y-1 text-[color:var(--foreground)]/80">
            {recommendations.slice(0, 3).map((item) => (
              <li key={item.district}>
                {districtRuMap[item.district]} - {item.score}/10
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
