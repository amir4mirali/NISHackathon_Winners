"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRole } from "@/components/RoleProvider";
import { recommendContractorsForProject } from "@/lib/ai";
import {
  Complaint,
  DEVELOPERS,
  District,
  DISTRICTS,
  Project,
  ProjectStatus,
  ProjectType,
} from "@/lib/shared";

type FormState = {
  name: string;
  district: District;
  type: ProjectType;
  status: ProjectStatus;
  developerId: string;
  description: string;
  lat: string;
  lng: string;
};

const defaultForm: FormState = {
  name: "",
  district: "Green District",
  type: "residential",
  status: "planned",
  developerId: DEVELOPERS[0].id,
  description: "",
  lat: "43.244",
  lng: "76.921",
};

const projectTypes: ProjectType[] = ["residential", "school", "commercial"];
const statuses: ProjectStatus[] = ["planned", "in progress", "completed"];
const typeLabelMap: Record<ProjectType, string> = {
  residential: "жилой",
  school: "школа",
  commercial: "коммерческий",
};
const statusLabelMap: Record<ProjectStatus, string> = {
  planned: "запланировано",
  "in progress": "в процессе",
  completed: "завершено",
};

export default function AdminDashboardPage() {
  const { role, isAuthenticated, isLoading } = useRole();
  const [projects, setProjects] = useState<Project[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [form, setForm] = useState<FormState>(defaultForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [recommendType, setRecommendType] = useState<ProjectType>("school");
  const [recommendDistrict, setRecommendDistrict] = useState<District | "all">("all");

  const refreshData = async () => {
    const [projectsResponse, complaintsResponse] = await Promise.all([
      fetch("/api/projects", { cache: "no-store" }),
      fetch("/api/complaints", { cache: "no-store" }),
    ]);

    const projectsData = projectsResponse.ok ? ((await projectsResponse.json()) as Project[]) : [];
    const complaintsData = complaintsResponse.ok ? ((await complaintsResponse.json()) as Complaint[]) : [];

    setProjects(projectsData);
    setComplaints(complaintsData);
  };

  useEffect(() => {
    let active = true;
    Promise.all([
      fetch("/api/projects", { cache: "no-store" }),
      fetch("/api/complaints", { cache: "no-store" }),
    ])
      .then(async ([projectsResponse, complaintsResponse]) => {
        const projectsData = projectsResponse.ok ? ((await projectsResponse.json()) as Project[]) : [];
        const complaintsData = complaintsResponse.ok ? ((await complaintsResponse.json()) as Complaint[]) : [];
        return { projectsData, complaintsData };
      })
      .then(({ projectsData, complaintsData }) => {
        if (active) {
          setProjects(projectsData);
          setComplaints(complaintsData);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const contractorRecommendations = useMemo(
    () =>
      recommendContractorsForProject(
        projects,
        complaints,
        recommendType,
        recommendDistrict === "all" ? undefined : recommendDistrict,
      ),
    [projects, complaints, recommendType, recommendDistrict],
  );

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const payload = {
      name: form.name,
      district: form.district,
      type: form.type,
      status: form.status,
      developerId: form.developerId,
      description: form.description,
      coordinates: {
        lat: Number(form.lat),
        lng: Number(form.lng),
      },
    };

    if (editingId) {
      await fetch(`/api/projects/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }

    setForm(defaultForm);
    setEditingId(null);
    await refreshData();
  };

  const editProject = (project: Project) => {
    setEditingId(project.id);
    setForm({
      name: project.name,
      district: project.district,
      type: project.type,
      status: project.status,
      developerId: project.developerId,
      description: project.description,
      lat: String(project.coordinates.lat),
      lng: String(project.coordinates.lng),
    });
  };

  const removeProject = async (projectId: string) => {
    await fetch(`/api/projects/${projectId}`, { method: "DELETE" });
    await refreshData();
  };

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-6 md:px-8">
      <header className="rounded-2xl border border-white/70 bg-white/90 p-5 shadow-lg">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Панель администратора</h1>
            <p className="text-sm text-[color:var(--muted)]">
              Создавайте, назначайте, редактируйте и удаляйте строительные проекты.
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
      ) : role !== "admin" ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-800">
          Ваш аккаунт не имеет роли администратора.
        </div>
      ) : (
        <>
          <section className="rounded-2xl border border-white/70 bg-white/95 p-5 shadow">
            <h2 className="mb-4 text-lg font-semibold">
              {editingId ? "Редактирование проекта" : "Создание нового проекта"}
            </h2>

            <form onSubmit={onSubmit} className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <input
                required
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                placeholder="Название проекта"
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[color:var(--accent)]/30"
              />
              <input
                required
                value={form.description}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, description: event.target.value }))
                }
                placeholder="Краткое описание"
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[color:var(--accent)]/30"
              />

              <select
                value={form.district}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, district: event.target.value as District }))
                }
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[color:var(--accent)]/30"
              >
                {DISTRICTS.map((district) => (
                  <option key={district} value={district}>
                    {district}
                  </option>
                ))}
              </select>

              <select
                value={form.type}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, type: event.target.value as ProjectType }))
                }
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[color:var(--accent)]/30"
              >
                {projectTypes.map((type) => (
                  <option key={type} value={type}>
                    {typeLabelMap[type]}
                  </option>
                ))}
              </select>

              <select
                value={form.status}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, status: event.target.value as ProjectStatus }))
                }
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[color:var(--accent)]/30"
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {statusLabelMap[status]}
                  </option>
                ))}
              </select>

              <select
                value={form.developerId}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, developerId: event.target.value }))
                }
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[color:var(--accent)]/30"
              >
                {DEVELOPERS.map((developer) => (
                  <option key={developer.id} value={developer.id}>
                    {developer.name}
                  </option>
                ))}
              </select>

              <input
                required
                value={form.lat}
                onChange={(event) => setForm((prev) => ({ ...prev, lat: event.target.value }))}
                placeholder="Широта"
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[color:var(--accent)]/30"
              />
              <input
                required
                value={form.lng}
                onChange={(event) => setForm((prev) => ({ ...prev, lng: event.target.value }))}
                placeholder="Долгота"
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[color:var(--accent)]/30"
              />

              <div className="md:col-span-2 flex flex-wrap gap-2">
                <button
                  type="submit"
                  className="rounded-lg bg-[color:var(--accent)] px-4 py-2 text-sm font-semibold text-white"
                >
                  {editingId ? "Сохранить изменения" : "Создать проект"}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(null);
                      setForm(defaultForm);
                    }}
                    className="rounded-lg bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
                  >
                    Отменить редактирование
                  </button>
                )}
              </div>
            </form>
          </section>

          <section className="rounded-2xl border border-white/70 bg-white/95 p-5 shadow">
            <div className="mb-4 flex flex-wrap items-end gap-3">
              <div>
                <h2 className="text-lg font-semibold">AI рекомендация подрядчиков</h2>
                <p className="text-sm text-[color:var(--muted)]">
                  Подбор на основе похожих завершенных проектов и истории жалоб жителей.
                </p>
              </div>
            </div>

            <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3">
              <select
                value={recommendType}
                onChange={(event) => setRecommendType(event.target.value as ProjectType)}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[color:var(--accent)]/30"
              >
                {projectTypes.map((type) => (
                  <option key={type} value={type}>
                    {typeLabelMap[type]}
                  </option>
                ))}
              </select>

              <select
                value={recommendDistrict}
                onChange={(event) => setRecommendDistrict(event.target.value as District | "all")}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[color:var(--accent)]/30"
              >
                <option value="all">Любой район</option>
                {DISTRICTS.map((district) => (
                  <option key={district} value={district}>
                    {district}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => {
                  setForm((prev) => ({ ...prev, type: recommendType }));
                }}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
              >
                Применить тип в форму проекта
              </button>
            </div>

            <div className="space-y-2">
              {contractorRecommendations.length === 0 && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
                  Пока недостаточно данных для рекомендаций.
                </div>
              )}

              {contractorRecommendations.map((item, index) => (
                <article key={item.developerId} className="rounded-xl border border-slate-200 bg-white p-3">
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h3 className="text-base font-semibold">
                        #{index + 1} {item.developerName}
                      </h3>
                      <p className="text-sm text-[color:var(--muted)]">
                        AI score: {item.score}/100 · подходящих проектов: {item.matchedTotal} · завершенных по типу: {item.matchedCompleted}
                      </p>
                      <p className="text-sm text-[color:var(--muted)]">
                        Всего проектов: {item.totalProjects} · жалоб: {item.totalComplaints} · жалоб на проект: {item.complaintRate}
                      </p>
                      <p className="mt-1 text-sm text-slate-700">{item.reasons.join("; ")}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, developerId: item.developerId }))}
                      className="rounded-lg bg-[color:var(--accent)] px-3 py-2 text-sm font-semibold text-white"
                    >
                      Выбрать подрядчика
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="space-y-3">
            {projects.map((project) => (
              <article key={project.id} className="rounded-2xl border border-white/70 bg-white/95 p-4 shadow">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{project.name}</h3>
                    <p className="text-sm text-[color:var(--muted)]">
                      {project.district} · {typeLabelMap[project.type]} · {statusLabelMap[project.status]} · {project.developerName}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => editProject(project)}
                      className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white"
                    >
                      Редактировать
                    </button>
                    <button
                      onClick={() => removeProject(project.id)}
                      className="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white"
                    >
                      Удалить
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </section>
        </>
      )}
    </main>
  );
}
