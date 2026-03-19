"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRole } from "@/components/RoleProvider";
import {
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

export default function AdminDashboardPage() {
  const { role } = useRole();
  const [projects, setProjects] = useState<Project[]>([]);
  const [form, setForm] = useState<FormState>(defaultForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const refreshProjects = async () => {
    const response = await fetch("/api/projects", { cache: "no-store" });
    const data = (await response.json()) as Project[];
    setProjects(data);
  };

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
    await refreshProjects();
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
    await refreshProjects();
  };

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-6 md:px-8">
      <header className="rounded-2xl border border-white/70 bg-white/90 p-5 shadow-lg">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Admin Panel</h1>
            <p className="text-sm text-[color:var(--muted)]">
              Create, assign, edit, and delete construction projects.
            </p>
          </div>
          <Link href="/platform" className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white">
            Back to Map
          </Link>
        </div>
      </header>

      {role !== "admin" ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-800">
          Switch role to Admin on the main page to use this panel.
        </div>
      ) : (
        <>
          <section className="rounded-2xl border border-white/70 bg-white/95 p-5 shadow">
            <h2 className="mb-4 text-lg font-semibold">
              {editingId ? "Edit Project" : "Create New Project"}
            </h2>

            <form onSubmit={onSubmit} className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <input
                required
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                placeholder="Project name"
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[color:var(--accent)]/30"
              />
              <input
                required
                value={form.description}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, description: event.target.value }))
                }
                placeholder="Short description"
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
                    {type}
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
                    {status}
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
                placeholder="Latitude"
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[color:var(--accent)]/30"
              />
              <input
                required
                value={form.lng}
                onChange={(event) => setForm((prev) => ({ ...prev, lng: event.target.value }))}
                placeholder="Longitude"
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[color:var(--accent)]/30"
              />

              <div className="md:col-span-2 flex flex-wrap gap-2">
                <button
                  type="submit"
                  className="rounded-lg bg-[color:var(--accent)] px-4 py-2 text-sm font-semibold text-white"
                >
                  {editingId ? "Save changes" : "Create project"}
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
                    Cancel edit
                  </button>
                )}
              </div>
            </form>
          </section>

          <section className="space-y-3">
            {projects.map((project) => (
              <article key={project.id} className="rounded-2xl border border-white/70 bg-white/95 p-4 shadow">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{project.name}</h3>
                    <p className="text-sm text-[color:var(--muted)]">
                      {project.district} · {project.type} · {project.status} · {project.developerName}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => editProject(project)}
                      className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => removeProject(project.id)}
                      className="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white"
                    >
                      Delete
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
