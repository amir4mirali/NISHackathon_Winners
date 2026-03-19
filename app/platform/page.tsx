"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import AIBox from "@/components/AIBox";
import ProjectCard from "@/components/ProjectCard";
import { useRole } from "@/components/RoleProvider";
import { Project } from "@/lib/shared";

const Map = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => (
    <div className="h-[420px] animate-pulse rounded-2xl bg-slate-200" />
  ),
});

export default function PlatformPage() {
  const { role, currentUser, isAuthenticated, isLoading, logout } = useRole();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const roleLabelMap: Record<typeof role, string> = {
    resident: "Житель",
    developer: "Подрядчик",
    admin: "Администратор",
  };

  const selectedProject = useMemo(
    () => projects.find((project) => project.id === selectedProjectId) ?? null,
    [projects, selectedProjectId],
  );

  useEffect(() => {
    let active = true;
    fetch("/api/projects", { cache: "no-store" })
      .then((response) => response.json() as Promise<Project[]>)
      .then((data) => {
        if (!active) return;
        setProjects(data);
        if (data.length > 0) {
          setSelectedProjectId((current) => current ?? data[0].id);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 md:px-8">
      <header className="rounded-2xl border border-white/70 bg-white/85 p-5 shadow-lg backdrop-blur">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              Платформа прозрачного строительства Alatau City
            </h1>
            <p className="text-sm text-[color:var(--muted)]">
              Активная роль: <span className="font-semibold">{roleLabelMap[role]}</span>
              {currentUser ? ` (${currentUser.name})` : " (гостевой режим)"}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {!isAuthenticated ? (
              <Link
                href="/login"
                className="rounded-full bg-[color:var(--accent)] px-4 py-2 text-sm font-semibold text-white"
              >
                Войти
              </Link>
            ) : (
              <button
                onClick={() => void logout()}
                className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200"
              >
                Выйти
              </button>
            )}
          </div>
        </div>

        {isLoading && (
          <p className="mt-3 text-sm text-[color:var(--muted)]">Проверяем сессию...</p>
        )}

        {!isLoading && !isAuthenticated && (
          <p className="mt-3 text-sm text-amber-700">
            Вы в гостевом режиме. Войдите, чтобы использовать действия с ограничением по ролям.
          </p>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-700">Зеленый: завершено</span>
          <span className="rounded-full bg-amber-100 px-3 py-1 text-amber-700">Желтый: в процессе</span>
          <span className="rounded-full bg-red-100 px-3 py-1 text-red-700">Красный: запланировано</span>
          <Link href="/" className="ml-auto rounded-lg border border-slate-200 bg-white px-3 py-2 font-semibold text-slate-800">
            Главная
          </Link>
          {!isAuthenticated && (
            <Link
              href="/register"
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 font-semibold text-slate-800"
            >
              Регистрация
            </Link>
          )}
          {isAuthenticated && role === "developer" && (
            <Link href="/dashboard/developer" className="rounded-lg bg-slate-900 px-3 py-2 font-semibold text-white">
              Панель подрядчика
            </Link>
          )}
          {isAuthenticated && role === "admin" && (
            <Link href="/dashboard/admin" className="rounded-lg bg-[color:var(--accent)] px-3 py-2 font-semibold text-white">
              Панель администратора
            </Link>
          )}
        </div>
      </header>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-4">
          <Map
            projects={projects}
            selectedProjectId={selectedProjectId}
            onSelectProject={setSelectedProjectId}
          />
          {role === "resident" && <AIBox projects={projects} />}
        </div>
        <ProjectCard project={selectedProject} />
      </section>
    </main>
  );
}
