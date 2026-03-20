"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRole } from "@/components/RoleProvider";
import { Project, ProjectStatus } from "@/lib/shared";

const statuses: ProjectStatus[] = ["planned", "in progress", "completed"];
const statusLabelMap: Record<ProjectStatus, string> = {
  planned: "Запланировано",
  "in progress": "В процессе",
  completed: "Завершено",
};
const typeLabelMap: Record<Project["type"], string> = {
  residential: "жилой",
  school: "школа",
  commercial: "коммерческий",
};

export default function DeveloperDashboardPage() {
  const { role, currentUser, isAuthenticated, isLoading } = useRole();
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    let active = true;
    fetch("/api/projects", { cache: "no-store" })
      .then((response) => response.json() as Promise<Project[]>)
      .then((data) => {
        if (active) {
          setProjects(data);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const assignedProjects = useMemo(
    () => projects.filter((project) => project.developerId === currentUser?.id),
    [projects, currentUser?.id],
  );

  const updateStatus = async (projectId: string, status: ProjectStatus) => {
    await fetch(`/api/projects/${projectId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, acceptanceRequested: false }),
    });

    setProjects((prev) =>
      prev.map((project) =>
        project.id === projectId ? { ...project, status, acceptanceRequested: false } : project,
      ),
    );
  };

  const submitForAcceptance = async (projectId: string) => {
    await fetch(`/api/projects/${projectId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "completed", acceptanceRequested: true }),
    });

    setProjects((prev) =>
      prev.map((project) =>
        project.id === projectId
          ? { ...project, status: "completed", acceptanceRequested: true }
          : project,
      ),
    );
  };

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-6 md:px-8">
      <header className="rounded-2xl border border-white/70 bg-white/90 p-5 shadow-lg">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Панель подрядчика</h1>
            <p className="text-sm text-[color:var(--muted)]">
              {currentUser
                ? `Вы вошли как ${currentUser.name}. Управляйте только назначенными вам проектами.`
                : "Войдите как подрядчик, чтобы управлять проектами."}
            </p>
          </div>
          <Link href="/platform" className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white">
            Назад к карте
          </Link>
        </div>
      </header>

      {isLoading ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-slate-700">
          Проверяем сессию...
        </div>
      ) : !isAuthenticated ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-800">
          Сначала войдите в аккаунт, затем откройте эту панель.
        </div>
      ) : role !== "developer" ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-800">
          Ваш аккаунт не имеет роли подрядчика.
        </div>
      ) : (
        <section className="space-y-3">
          {assignedProjects.length === 0 && (
            <div className="rounded-2xl border border-white/70 bg-white/90 p-4 shadow">У вас пока нет назначенных проектов.</div>
          )}

          {assignedProjects.map((project) => (
            <article key={project.id} className="rounded-2xl border border-white/70 bg-white/95 p-4 shadow">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold">{project.name}</h2>
                  <p className="text-sm text-[color:var(--muted)]">
                    {project.district} · {typeLabelMap[project.type]}
                  </p>
                  {project.acceptanceRequested && (
                    <p className="mt-1 inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
                      Отправлено на приемку администратору
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={project.status}
                    onChange={(event) =>
                      updateStatus(project.id, event.target.value as ProjectStatus)
                    }
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[color:var(--accent)]/30"
                  >
                    {statuses.map((status) => (
                      <option key={status} value={status}>
                        {statusLabelMap[status]}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    disabled={project.acceptanceRequested}
                    onClick={() => submitForAcceptance(project.id)}
                    className="rounded-lg bg-[color:var(--accent)] px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {project.acceptanceRequested ? "На проверке" : "Сдать на проверку"}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
