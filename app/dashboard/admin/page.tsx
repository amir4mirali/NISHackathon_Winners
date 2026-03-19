"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useRole } from "@/components/RoleProvider";
import {
  optimizeHousingLayout,
  recommendContractorsForProject,
  recommendUrbanProjectPlacement,
} from "@/lib/ai";
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

type AiPanelKey = "contractors" | "housing" | "urban";
type DashboardWorkspace = "projects" | "ai";

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
  const formSectionRef = useRef<HTMLElement | null>(null);
  const aiSectionRefs = useRef<Record<AiPanelKey, HTMLDivElement | null>>({
    contractors: null,
    housing: null,
    urban: null,
  });
  const [projects, setProjects] = useState<Project[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [form, setForm] = useState<FormState>(defaultForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [recommendType, setRecommendType] = useState<ProjectType>("school");
  const [recommendDistrict, setRecommendDistrict] = useState<District | "all">("all");
  const [housingTarget, setHousingTarget] = useState("1800");
  const [housingDistrict, setHousingDistrict] = useState<District | "all">("all");
  const [urbanTargetType, setUrbanTargetType] = useState<ProjectType>("school");
  const [strictZoning, setStrictZoning] = useState(true);
  const [openAiPanel, setOpenAiPanel] = useState<AiPanelKey>("contractors");
  const [workspace, setWorkspace] = useState<DashboardWorkspace>("projects");
  const [showProjectList, setShowProjectList] = useState(false);

  const openPanel = (panel: AiPanelKey) => {
    setWorkspace("ai");
    setOpenAiPanel(panel);
    requestAnimationFrame(() => {
      aiSectionRefs.current[panel]?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

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

  const housingPlan = useMemo(
    () =>
      optimizeHousingLayout(projects, {
        targetUnits: Number(housingTarget) || 0,
        preferredDistrict: housingDistrict === "all" ? undefined : housingDistrict,
      }),
    [projects, housingTarget, housingDistrict],
  );

  const urbanPlacementPlan = useMemo(
    () => recommendUrbanProjectPlacement(projects, urbanTargetType, { strictZoning }),
    [projects, urbanTargetType, strictZoning],
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

    // Bring the edit form into view so the action feels immediate.
    requestAnimationFrame(() => {
      formSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
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
          <section className="rounded-2xl border border-white/70 bg-white/95 p-4 shadow">
            <h2 className="text-base font-semibold">Рабочая область</h2>
            <p className="mt-1 text-sm text-[color:var(--muted)]">
              Показываем только один сценарий за раз, чтобы панель не была перегружена.
            </p>
            <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
              <button
                type="button"
                onClick={() => setWorkspace("projects")}
                className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                  workspace === "projects" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-800 hover:bg-slate-200"
                }`}
              >
                Управление проектами
              </button>
              <button
                type="button"
                onClick={() => setWorkspace("ai")}
                className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                  workspace === "ai" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-800 hover:bg-slate-200"
                }`}
              >
                AI-инструменты
              </button>
            </div>
          </section>

          {workspace === "projects" && (
            <>
              <section
                ref={formSectionRef}
                className={`rounded-2xl border bg-white/95 p-5 shadow ${
                  editingId ? "border-[color:var(--accent)]/60 ring-2 ring-[color:var(--accent)]/20" : "border-white/70"
                }`}
              >
                <h2 className="mb-4 text-lg font-semibold">
                  {editingId ? "Редактирование проекта" : "Создание нового проекта"}
                </h2>

                {editingId && (
                  <p className="mb-3 rounded-lg bg-[color:var(--accent-soft)] px-3 py-2 text-sm text-[color:var(--foreground)]/85">
                    Вы редактируете выбранный проект. Измените поля и нажмите «Сохранить изменения».
                  </p>
                )}

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

              <section className="rounded-2xl border border-white/70 bg-white/95 p-4 shadow">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-base font-semibold">Список проектов</h2>
                  <button
                    type="button"
                    onClick={() => setShowProjectList((prev) => !prev)}
                    className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-200"
                  >
                    {showProjectList ? "Скрыть список" : `Показать список (${projects.length})`}
                  </button>
                </div>
              </section>

              {showProjectList && (
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
                            type="button"
                            onClick={() => editProject(project)}
                            className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white"
                          >
                            Редактировать
                          </button>
                          <button
                            type="button"
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
              )}
            </>
          )}

          {workspace === "ai" && (
          <section className="rounded-2xl border border-white/70 bg-white/95 p-4 shadow">
            <h2 className="text-base font-semibold">AI инструменты администрации</h2>
            <p className="mt-1 text-sm text-[color:var(--muted)]">
              Выберите нужный модуль. Полный функционал откроется ниже с плавной анимацией.
            </p>
            <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-3">
              <button
                type="button"
                onClick={() => openPanel("contractors")}
                className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                  openAiPanel === "contractors"
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-800 hover:bg-slate-200"
                }`}
              >
                AI рекомендация подрядчиков
              </button>
              <button
                type="button"
                onClick={() => openPanel("housing")}
                className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                  openAiPanel === "housing"
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-800 hover:bg-slate-200"
                }`}
              >
                AI выбор участков и планировка
              </button>
              <button
                type="button"
                onClick={() => openPanel("urban")}
                className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                  openAiPanel === "urban"
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-800 hover:bg-slate-200"
                }`}
              >
                AI функциональный планировщик
              </button>
            </div>
          </section>
          )}

          {workspace === "ai" && (
          <>
          <div
            ref={(node) => {
              aiSectionRefs.current.contractors = node;
            }}
            className={`overflow-hidden transition-all duration-500 ease-in-out ${
              openAiPanel === "contractors" ? "max-h-[2200px] opacity-100" : "max-h-0 opacity-0"
            }`}
          >
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
          </div>

          <div
            ref={(node) => {
              aiSectionRefs.current.housing = node;
            }}
            className={`overflow-hidden transition-all duration-500 ease-in-out ${
              openAiPanel === "housing" ? "max-h-[3200px] opacity-100" : "max-h-0 opacity-0"
            }`}
          >
          <section className="rounded-2xl border border-white/70 bg-white/95 p-5 shadow">
            <div className="mb-4">
              <h2 className="text-lg font-semibold">AI выбор участков и оптимизация планировки</h2>
              <p className="text-sm text-[color:var(--muted)]">
                Система сначала проверяет юридические ограничения, затем оптимизирует набор участков под целевой объем жилья.
              </p>
            </div>

            <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3">
              <label className="text-sm text-slate-700">
                Целевой объем жилья (ед.)
                <input
                  type="number"
                  min={100}
                  max={20000}
                  value={housingTarget}
                  onChange={(event) => setHousingTarget(event.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[color:var(--accent)]/30"
                />
              </label>

              <label className="text-sm text-slate-700">
                Приоритетный район
                <select
                  value={housingDistrict}
                  onChange={(event) => setHousingDistrict(event.target.value as District | "all")}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[color:var(--accent)]/30"
                >
                  <option value="all">Сбалансированно по городу</option>
                  {DISTRICTS.map((district) => (
                    <option key={district} value={district}>
                      {district}
                    </option>
                  ))}
                </select>
              </label>

              <button
                type="button"
                onClick={() => {
                  const best = housingPlan.selectedPlan[0];
                  if (!best) return;
                  setForm((prev) => ({
                    ...prev,
                    district: best.district,
                    type: "residential",
                    status: "planned",
                    name: `Housing Program · ${best.plotName}`,
                    description: `AI рекомендует участок ${best.plotName}. План: ${best.plannedUnits} ед. жилья.`,
                  }));
                }}
                className="self-end rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
              >
                Применить лучший участок в форму
              </button>
            </div>

            <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs uppercase tracking-wide text-slate-500">Цель</p>
                <p className="text-lg font-semibold">{housingPlan.targetUnits}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs uppercase tracking-wide text-slate-500">Покрыто</p>
                <p className="text-lg font-semibold">{housingPlan.totalPlannedUnits}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs uppercase tracking-wide text-slate-500">Дефицит</p>
                <p className="text-lg font-semibold">{housingPlan.uncoveredUnits}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs uppercase tracking-wide text-slate-500">Отклонено по юр-фильтру</p>
                <p className="text-lg font-semibold">{housingPlan.legalRejectedCount}</p>
              </div>
            </div>

            <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide">Оптимальный набор участков</h3>
              <ul className="space-y-2">
                {housingPlan.selectedPlan.length === 0 && (
                  <li className="text-sm text-slate-600">Нет юридически допустимых участков для текущего сценария.</li>
                )}
                {housingPlan.selectedPlan.map((item) => (
                  <li key={item.plotId} className="rounded-lg border border-slate-200 bg-white p-2 text-sm">
                    {item.plotName} ({item.district}) · {item.plannedUnits} ед. · score {item.score}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide">Инсайты</h3>
              <ul className="space-y-1 text-sm text-slate-700">
                {housingPlan.insights.map((insight) => (
                  <li key={insight}>• {insight}</li>
                ))}
              </ul>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-semibold uppercase tracking-wide">Все кандидаты по участкам</h3>
              {housingPlan.recommendations.map((item) => (
                <article key={item.plotId} className="rounded-xl border border-slate-200 bg-white p-3">
                  <p className="text-sm font-semibold">
                    {item.plotName} · {item.district} · score {item.score}
                  </p>
                  <p className="text-sm text-[color:var(--muted)]">
                    Емкость: {item.capacityUnits} ед. · риск: {item.riskLevel} · юридический статус: {item.legalPassed ? "проходит" : "не проходит"}
                  </p>
                  <p className="text-sm text-slate-700">{item.reasons.join("; ")}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Юр-проверки: {item.legalChecks.map((check) => `${check.passed ? "OK" : "FAIL"} ${check.code}`).join(" | ")}
                  </p>
                </article>
              ))}
            </div>
          </section>
          </div>

          <div
            ref={(node) => {
              aiSectionRefs.current.urban = node;
            }}
            className={`overflow-hidden transition-all duration-500 ease-in-out ${
              openAiPanel === "urban" ? "max-h-[2200px] opacity-100" : "max-h-0 opacity-0"
            }`}
          >
          <section className="rounded-2xl border border-white/70 bg-white/95 p-5 shadow">
            <div className="mb-4">
              <h2 className="text-lg font-semibold">AI функциональный планировщик города</h2>
              <p className="text-sm text-[color:var(--muted)]">
                Балансирует функциональный профиль районов и доступность инфраструктуры, чтобы жители не ездили через весь город каждый день.
              </p>
            </div>

            <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3">
              <label className="text-sm text-slate-700">
                Тип нового объекта
                <select
                  value={urbanTargetType}
                  onChange={(event) => setUrbanTargetType(event.target.value as ProjectType)}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[color:var(--accent)]/30"
                >
                  {projectTypes.map((type) => (
                    <option key={type} value={type}>
                      {typeLabelMap[type]}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex items-end gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={strictZoning}
                  onChange={(event) => setStrictZoning(event.target.checked)}
                />
                Строго соблюдать функциональное зонирование
              </label>

              <button
                type="button"
                onClick={() => {
                  if (!urbanPlacementPlan.recommendedDistrict) return;
                  setForm((prev) => ({
                    ...prev,
                    district: urbanPlacementPlan.recommendedDistrict ?? prev.district,
                    type: urbanTargetType,
                    status: "planned",
                  }));
                }}
                className="self-end rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
              >
                Применить рекомендованный район
              </button>
            </div>

            <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs uppercase tracking-wide text-slate-500">Рекомендованный район</p>
                <p className="text-lg font-semibold">{urbanPlacementPlan.recommendedDistrict ?? "-"}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs uppercase tracking-wide text-slate-500">Снижение межрайонных поездок / день</p>
                <p className="text-lg font-semibold">{urbanPlacementPlan.estimatedDailyTripReduction}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs uppercase tracking-wide text-slate-500">Оценка снижения CO2 (кг/день)</p>
                <p className="text-lg font-semibold">{urbanPlacementPlan.estimatedDailyCo2ReductionKg}</p>
              </div>
            </div>

            <div className="space-y-2">
              {urbanPlacementPlan.ranking.map((item, index) => (
                <article key={item.district} className="rounded-xl border border-slate-200 bg-white p-3">
                  <p className="text-sm font-semibold">
                    #{index + 1} {item.district} · score {item.score}
                  </p>
                  <p className="text-sm text-[color:var(--muted)]">
                    Зонирование: {item.zoningFit} · локальная потребность: {item.localNeed} · транспортный эффект: {item.mobilityImpact}
                  </p>
                  <p className="text-sm text-slate-700">{item.reasons.join("; ")}</p>
                </article>
              ))}
            </div>
          </section>
          </div>
          </>
          )}
        </>
      )}
    </main>
  );
}
