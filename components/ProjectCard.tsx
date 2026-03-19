"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { analyzeDistrict } from "@/lib/ai";
import { Complaint, Project } from "@/lib/shared";
import { useRole } from "@/components/RoleProvider";

type ProjectCardProps = {
  project: Project | null;
};

const statusBadgeClasses: Record<Project["status"], string> = {
  completed: "bg-emerald-100 text-emerald-700",
  "in progress": "bg-amber-100 text-amber-700",
  planned: "bg-red-100 text-red-700",
};

const statusLabelMap: Record<Project["status"], string> = {
  completed: "завершено",
  "in progress": "в процессе",
  planned: "запланировано",
};

const typeLabelMap: Record<Project["type"], string> = {
  residential: "жилой",
  school: "школа",
  commercial: "коммерческий",
};

export default function ProjectCard({ project }: ProjectCardProps) {
  const { role, isAuthenticated } = useRole();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [draft, setDraft] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const analysis = useMemo(() => {
    if (!project) return null;
    return analyzeDistrict(project.district, project.type);
  }, [project]);

  useEffect(() => {
    const controller = new AbortController();

    const fetchComplaints = async () => {
      if (!project) {
        setComplaints([]);
        return;
      }

      try {
        const response = await fetch(`/api/complaints?projectId=${project.id}`, {
          signal: controller.signal,
          cache: "no-store",
        });
        if (!response.ok) {
          setComplaints([]);
          return;
        }

        const data = (await response.json()) as Complaint[];
        setComplaints(data);
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        console.error("Не удалось загрузить комментарии", error);
        setComplaints([]);
      }
    };

    void fetchComplaints();

    return () => {
      controller.abort();
    };
  }, [project]);

  if (!project || !analysis) {
    return (
      <aside className="rounded-2xl border border-white/60 bg-white/90 p-5 shadow-lg">
        <p className="text-sm text-[color:var(--muted)]">
          Выберите маркер на карте, чтобы увидеть детали проекта и AI-анализ.
        </p>
      </aside>
    );
  }

  const submitComplaint = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!draft.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: project.id, text: draft.trim() }),
      });

      if (!response.ok) {
        throw new Error("Не удалось сохранить комментарий");
      }

      const created = (await response.json()) as Complaint;
      setComplaints((prev) => [created, ...prev]);
      setDraft("");
    } catch (error) {
      console.error("Не удалось отправить комментарий", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <aside className="space-y-4 rounded-2xl border border-white/60 bg-white/95 p-5 shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">{project.name}</h2>
          <p className="text-sm text-[color:var(--muted)]">{project.district}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusBadgeClasses[project.status]}`}>
          {statusLabelMap[project.status]}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <p>
          <span className="font-semibold">Тип:</span> {typeLabelMap[project.type]}
        </p>
        <p>
          <span className="font-semibold">Подрядчик:</span> {project.developerName}
        </p>
      </div>

      <p className="text-sm leading-6 text-[color:var(--foreground)]/80">{project.description}</p>

      <div className="rounded-xl bg-[color:var(--accent-soft)] p-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-[color:var(--accent)]">AI-анализ</h3>
        <p className="mt-2 text-sm">
          Оценка: <span className="font-bold">{analysis.score}/10</span> · {analysis.recommendation}
        </p>
        <p className="mt-1 text-sm text-[color:var(--foreground)]/75">{analysis.explanation}</p>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide">Комментарии жителей</h3>
        {isAuthenticated && role === "resident" && (
          <form onSubmit={submitComplaint} className="space-y-2">
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Оставьте жалобу или комментарий"
              className="min-h-20 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none focus:ring-2 focus:ring-[color:var(--accent)]/30"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-[color:var(--accent)] px-4 py-2 text-sm font-semibold text-white transition hover:brightness-95 disabled:opacity-60"
            >
              {isSubmitting ? "Сохраняем..." : "Отправить комментарий"}
            </button>
          </form>
        )}

        <ul className="space-y-2">
          {complaints.length === 0 && (
            <li className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600">Комментариев пока нет.</li>
          )}
          {complaints.map((complaint) => (
            <li key={complaint.id} className="rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
              {complaint.text}
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
