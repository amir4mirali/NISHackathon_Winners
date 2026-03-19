"use client";

import Link from "next/link";
import AlatauDistrictShowcase from "@/components/AlatauDistrictShowcase";
import { useRole } from "@/components/RoleProvider";

export default function Home() {
  const { role, isAuthenticated } = useRole();

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-6 md:px-8">
      <section className="relative overflow-hidden rounded-3xl border border-white/70 bg-white/85 p-6 shadow-xl md:p-10">
        <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-[#ccecd6] blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-20 h-72 w-72 rounded-full bg-[#efe7c8] blur-3xl" />

        <div className="relative grid grid-cols-1 gap-8 lg:grid-cols-[1.25fr_1fr] lg:items-center">
          <div>
            <p className="mb-3 inline-flex rounded-full bg-[color:var(--accent-soft)] px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[color:var(--accent)]">
              MVP хакатона
            </p>
            <h1 className="text-4xl font-bold leading-tight tracking-tight md:text-6xl">
              Alatau City
              <br />
              Платформа прозрачности
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[color:var(--muted)] md:text-lg">
              Добро пожаловать. Здесь жители, подрядчики и администрация видят строительство по дистриктам,
              статусы объектов и AI-рекомендации по развитию территорий Алатау.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              {!isAuthenticated ? (
                <>
                  <Link
                    href="/login"
                    className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:brightness-95"
                  >
                    Войти
                  </Link>
                  <Link
                    href="/register"
                    className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
                  >
                    Регистрация
                  </Link>
                </>
              ) : null}
              <Link
                href="/platform"
                className="rounded-xl bg-[color:var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:brightness-95"
              >
                Перейти к карте и деталям
              </Link>
              {isAuthenticated && role === "admin" && (
                <Link
                  href="/dashboard/admin"
                  className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
                >
                  Панель администратора
                </Link>
              )}
              {isAuthenticated && role === "developer" && (
                <Link
                  href="/dashboard/developer"
                  className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
                >
                  Панель подрядчика
                </Link>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-white/60 bg-white/90 p-5 shadow-lg">
            <h2 className="text-xl font-semibold">Что внутри</h2>
            <ul className="mt-4 space-y-3 text-sm text-[color:var(--foreground)]/80">
              <li className="rounded-lg bg-slate-50 px-3 py-2">Карта дистриктов и объекты строительства</li>
              <li className="rounded-lg bg-slate-50 px-3 py-2">Карточка объекта + AI анализ</li>
              <li className="rounded-lg bg-slate-50 px-3 py-2">Роли: Житель / Подрядчик / Администратор</li>
              <li className="rounded-lg bg-slate-50 px-3 py-2">Комментарии жителей и управление проектами</li>
            </ul>

            <p className="mt-4 text-xs text-[color:var(--muted)]">
              Для карты используется чистая светлая подложка и логика по четырем дистриктам Alatau.
            </p>
          </div>
        </div>
      </section>

      <AlatauDistrictShowcase />
    </main>
  );
}
