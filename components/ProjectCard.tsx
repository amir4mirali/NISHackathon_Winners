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

export default function ProjectCard({ project }: ProjectCardProps) {
  const { role } = useRole();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [draft, setDraft] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const analysis = useMemo(() => {
    if (!project) return null;
    return analyzeDistrict(project.district, project.type);
  }, [project]);

  useEffect(() => {
    const fetchComplaints = async () => {
      if (!project) {
        setComplaints([]);
        return;
      }

      const response = await fetch(`/api/complaints?projectId=${project.id}`);
      const data = (await response.json()) as Complaint[];
      setComplaints(data);
    };

    void fetchComplaints();
  }, [project]);

  if (!project || !analysis) {
    return (
      <aside className="rounded-2xl border border-white/60 bg-white/90 p-5 shadow-lg">
        <p className="text-sm text-[color:var(--muted)]">
          Select a marker on the map to see construction details and AI analysis.
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
        throw new Error("Could not save complaint");
      }

      const created = (await response.json()) as Complaint;
      setComplaints((prev) => [created, ...prev]);
      setDraft("");
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
          {project.status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <p>
          <span className="font-semibold">Type:</span> {project.type}
        </p>
        <p>
          <span className="font-semibold">Developer:</span> {project.developerName}
        </p>
      </div>

      <p className="text-sm leading-6 text-[color:var(--foreground)]/80">{project.description}</p>

      <div className="rounded-xl bg-[color:var(--accent-soft)] p-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-[color:var(--accent)]">AI analysis</h3>
        <p className="mt-2 text-sm">
          Score: <span className="font-bold">{analysis.score}/10</span> · {analysis.recommendation}
        </p>
        <p className="mt-1 text-sm text-[color:var(--foreground)]/75">{analysis.explanation}</p>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide">Resident comments</h3>
        {role === "resident" && (
          <form onSubmit={submitComplaint} className="space-y-2">
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Leave a complaint or comment"
              className="min-h-20 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none focus:ring-2 focus:ring-[color:var(--accent)]/30"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-[color:var(--accent)] px-4 py-2 text-sm font-semibold text-white transition hover:brightness-95 disabled:opacity-60"
            >
              {isSubmitting ? "Saving..." : "Submit comment"}
            </button>
          </form>
        )}

        <ul className="space-y-2">
          {complaints.length === 0 && (
            <li className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600">No comments yet.</li>
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
