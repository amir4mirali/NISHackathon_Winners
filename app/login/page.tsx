"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { useRole } from "@/components/RoleProvider";

type DemoAccount = {
  role: string;
  email: string;
  password: string;
};

const demoAccounts: DemoAccount[] = [
  { role: "Житель", email: "resident@alatau.local", password: "resident123" },
  { role: "Подрядчик", email: "developer1@alatau.local", password: "developer123" },
  { role: "Администратор", email: "admin@alatau.local", password: "admin123" },
];

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, currentUser, isLoading } = useRole();
  const [email, setEmail] = useState("resident@alatau.local");
  const [password, setPassword] = useState("resident123");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const statusText = useMemo(() => {
    const roleLabels = {
      resident: "Житель",
      developer: "Подрядчик",
      admin: "Администратор",
    };

    if (isLoading) return "Проверяем сессию...";
    if (isAuthenticated && currentUser) {
      return `Вы вошли как ${currentUser.name} (${roleLabels[currentUser.role]})`;
    }
    return "Вы не вошли в систему";
  }, [isAuthenticated, currentUser, isLoading]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const result = await login(email, password);
    setSubmitting(false);

    if (!result.ok) {
      setError(result.error ?? "Не удалось выполнить вход");
      return;
    }

    router.push("/platform");
  };

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-4 py-8 md:px-8">
      <header className="rounded-2xl border border-white/70 bg-white/90 p-5 shadow-lg">
        <h1 className="text-2xl font-bold">Вход</h1>
        <p className="mt-2 text-sm text-[color:var(--muted)]">
          Используйте один из демо-аккаунтов или свои учетные данные из Mongo.
        </p>
        <p className="mt-3 text-sm font-medium text-slate-700">{statusText}</p>
      </header>

      <section className="rounded-2xl border border-white/70 bg-white/95 p-5 shadow">
        <form onSubmit={onSubmit} className="space-y-3">
          <input
            required
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Почта"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[color:var(--accent)]/30"
          />
          <input
            required
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Пароль"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[color:var(--accent)]/30"
          />

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-[color:var(--accent)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {submitting ? "Входим..." : "Войти"}
          </button>
        </form>

        <div className="mt-4 rounded-xl bg-slate-50 p-3 text-sm">
          <p className="font-semibold">Демо-аккаунты</p>
          <ul className="mt-2 space-y-1 text-slate-700">
            {demoAccounts.map((account) => (
              <li key={account.email}>
                {account.role}: {account.email} / {account.password}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-4 flex gap-2">
          <Link
            href="/register"
            className="rounded-lg bg-[color:var(--accent)] px-3 py-2 text-sm font-semibold text-white"
          >
            Регистрация
          </Link>
          <Link
            href="/platform"
            className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white"
          >
            На платформу
          </Link>
          <Link
            href="/"
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700"
          >
            Главная
          </Link>
        </div>
      </section>
    </main>
  );
}
