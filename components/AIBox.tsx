"use client";

import { useMemo, useState } from "react";
import { analyzeDistrict, ResidentRequestType } from "@/lib/ai";
import { District, DISTRICTS } from "@/lib/shared";

export default function AIBox() {
  const [district, setDistrict] = useState<District>("Green District");
  const [type, setType] = useState<ResidentRequestType>("house");
  const districtLabelMap: Record<District, string> = {
    "Green District": "Green District",
    "Growing District": "Growing District",
    "Golden District": "Golden District",
    "Gate District": "Gate District",
  };

  const result = useMemo(() => analyzeDistrict(district, type), [district, type]);

  return (
    <section className="space-y-4 rounded-2xl border border-white/70 bg-white/90 p-5 shadow-lg">
      <header>
        <h2 className="text-lg font-semibold">AI-рекомендация</h2>
        <p className="text-sm text-[color:var(--muted)]">Выберите район и формат жилья.</p>
      </header>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="space-y-1 text-sm">
          <span className="font-medium">Район</span>
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
          <span className="font-medium">Формат</span>
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
          Оценка: <span className="font-bold">{result.score}/10</span>
        </p>
        <p className="mt-1 text-sm font-semibold text-[color:var(--accent)]">{result.recommendation}</p>
        <p className="mt-1 text-sm text-[color:var(--foreground)]/75">{result.explanation}</p>
      </div>
    </section>
  );
}
