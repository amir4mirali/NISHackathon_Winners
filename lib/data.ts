import { getMongoDb } from "@/lib/mongodb";

export type District =
  | "Green District"
  | "Growing District"
  | "Golden District"
  | "Gate District";

export type ProjectType = "residential" | "school" | "commercial";
export type ProjectStatus = "planned" | "in progress" | "completed";
export type UserRole = "resident" | "developer" | "admin";

export type Coordinates = {
  lat: number;
  lng: number;
};

export type Project = {
  id: string;
  name: string;
  district: District;
  type: ProjectType;
  status: ProjectStatus;
  developerId: string;
  developerName: string;
  description: string;
  coordinates: Coordinates;
};

export type User = {
  id: string;
  name: string;
  role: UserRole;
};

export type Complaint = {
  id: string;
  projectId: string;
  text: string;
};

export const DISTRICTS: District[] = [
  "Green District",
  "Growing District",
  "Golden District",
  "Gate District",
];

export const DEVELOPERS: User[] = [
  { id: "dev-1", name: "Alatau Build", role: "developer" },
  { id: "dev-2", name: "Skyline Nova", role: "developer" },
];

export const USERS: User[] = [
  { id: "resident-1", name: "Aruzhan", role: "resident" },
  ...DEVELOPERS,
  { id: "admin-1", name: "City Admin", role: "admin" },
];

const seedProjects: Project[] = [
  {
    id: "p-1",
    name: "Green Villas",
    district: "Green District",
    type: "residential",
    status: "in progress",
    developerId: "dev-1",
    developerName: "Alatau Build",
    description: "Low-density family housing with park access.",
    coordinates: { lat: 43.2608, lng: 76.8901 },
  },
  {
    id: "p-2",
    name: "Growth Hub Complex",
    district: "Growing District",
    type: "residential",
    status: "planned",
    developerId: "dev-2",
    developerName: "Skyline Nova",
    description: "High-rise residential complex near new transport line.",
    coordinates: { lat: 43.2388, lng: 76.9402 },
  },
  {
    id: "p-3",
    name: "Golden Mall Quarter",
    district: "Golden District",
    type: "commercial",
    status: "completed",
    developerId: "dev-1",
    developerName: "Alatau Build",
    description: "Retail and mixed-use center for local businesses.",
    coordinates: { lat: 43.2472, lng: 76.9039 },
  },
  {
    id: "p-4",
    name: "Gate Logistics Center",
    district: "Gate District",
    type: "commercial",
    status: "in progress",
    developerId: "dev-2",
    developerName: "Skyline Nova",
    description: "Commercial and logistics-focused construction zone.",
    coordinates: { lat: 43.2178, lng: 76.9774 },
  },
  {
    id: "p-5",
    name: "Green Valley School",
    district: "Green District",
    type: "school",
    status: "planned",
    developerId: "dev-1",
    developerName: "Alatau Build",
    description: "Public school with sports and arts classrooms.",
    coordinates: { lat: 43.2701, lng: 76.9154 },
  },
];

const seedComplaints: Complaint[] = [
  {
    id: "c-1",
    projectId: "p-2",
    text: "Please improve noise management near nearby homes.",
  },
];

type ProjectDocument = Project & { createdAt: Date };
type ComplaintDocument = Complaint & { createdAt: Date };

const toProject = (doc: ProjectDocument): Project => ({
  id: doc.id,
  name: doc.name,
  district: doc.district,
  type: doc.type,
  status: doc.status,
  developerId: doc.developerId,
  developerName: doc.developerName,
  description: doc.description,
  coordinates: doc.coordinates,
});

const toComplaint = (doc: ComplaintDocument): Complaint => ({
  id: doc.id,
  projectId: doc.projectId,
  text: doc.text,
});

let projects: Project[] = [...seedProjects];
let complaints: Complaint[] = [...seedComplaints];
let mongoPrepared = false;

const nextId = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 8)}`;

async function prepareMongoIfNeeded() {
  if (mongoPrepared) return;

  const db = await getMongoDb();
  if (!db) return;

  const projectsCol = db.collection<ProjectDocument>("projects");
  const complaintsCol = db.collection<ComplaintDocument>("complaints");

  await projectsCol.createIndex({ id: 1 }, { unique: true });
  await complaintsCol.createIndex({ id: 1 }, { unique: true });

  const projectCount = await projectsCol.countDocuments();
  if (projectCount === 0) {
    await projectsCol.insertMany(
      seedProjects.map((project, index) => ({
        ...project,
        createdAt: new Date(Date.now() - (seedProjects.length - index) * 1000),
      })),
    );
  }

  const complaintCount = await complaintsCol.countDocuments();
  if (complaintCount === 0) {
    await complaintsCol.insertMany(
      seedComplaints.map((complaint, index) => ({
        ...complaint,
        createdAt: new Date(Date.now() - (seedComplaints.length - index) * 1000),
      })),
    );
  }

  mongoPrepared = true;
}

export async function getProjects(): Promise<Project[]> {
  const db = await getMongoDb();
  if (!db) return projects;

  await prepareMongoIfNeeded();
  const docs = await db
    .collection<ProjectDocument>("projects")
    .find({}, { projection: { _id: 0 } })
    .sort({ createdAt: -1 })
    .toArray();

  return docs.map(toProject);
}

export async function getProjectById(id: string): Promise<Project | undefined> {
  const db = await getMongoDb();
  if (!db) return projects.find((project) => project.id === id);

  await prepareMongoIfNeeded();
  const doc = await db
    .collection<ProjectDocument>("projects")
    .findOne({ id }, { projection: { _id: 0 } });

  if (!doc) return undefined;

  return toProject(doc);
}

export async function createProject(input: Omit<Project, "id" | "developerName">): Promise<Project> {
  const developer = DEVELOPERS.find((dev) => dev.id === input.developerId);
  const project: Project = {
    ...input,
    id: nextId("p"),
    developerName: developer?.name ?? "Unknown Developer",
  };

  const db = await getMongoDb();
  if (!db) {
    projects = [project, ...projects];
    return project;
  }

  await prepareMongoIfNeeded();
  await db.collection<ProjectDocument>("projects").insertOne({
    ...project,
    createdAt: new Date(),
  });

  return project;
}

export async function updateProject(
  id: string,
  changes: Partial<Omit<Project, "id">>,
): Promise<Project | null> {
  const db = await getMongoDb();
  if (!db) {
    const existing = projects.find((project) => project.id === id);
    if (!existing) return null;

    const nextDeveloperId = changes.developerId ?? existing.developerId;
    const nextDeveloperName =
      DEVELOPERS.find((dev) => dev.id === nextDeveloperId)?.name ?? existing.developerName;

    const updated: Project = {
      ...existing,
      ...changes,
      developerId: nextDeveloperId,
      developerName: nextDeveloperName,
    };

    projects = projects.map((project) => (project.id === id ? updated : project));
    return updated;
  }

  await prepareMongoIfNeeded();
  const existingDoc = await db.collection<ProjectDocument>("projects").findOne({ id });
  if (!existingDoc) return null;

  const existing = toProject(existingDoc);
  const nextDeveloperId = changes.developerId ?? existing.developerId;
  const nextDeveloperName =
    DEVELOPERS.find((dev) => dev.id === nextDeveloperId)?.name ?? existing.developerName;

  const updated: Project = {
    ...existing,
    ...changes,
    developerId: nextDeveloperId,
    developerName: nextDeveloperName,
  };

  await db.collection<ProjectDocument>("projects").updateOne({ id }, { $set: updated });
  return updated;
}

export async function deleteProject(id: string): Promise<boolean> {
  const db = await getMongoDb();
  if (!db) {
    const before = projects.length;
    projects = projects.filter((project) => project.id !== id);
    complaints = complaints.filter((complaint) => complaint.projectId !== id);
    return before !== projects.length;
  }

  await prepareMongoIfNeeded();
  const result = await db.collection<ProjectDocument>("projects").deleteOne({ id });
  if (result.deletedCount === 0) return false;

  await db.collection<ComplaintDocument>("complaints").deleteMany({ projectId: id });
  return true;
}

export async function getComplaints(projectId?: string): Promise<Complaint[]> {
  const db = await getMongoDb();
  if (!db) {
    if (!projectId) return complaints;
    return complaints.filter((complaint) => complaint.projectId === projectId);
  }

  await prepareMongoIfNeeded();
  const query = projectId ? { projectId } : {};
  const docs = await db
    .collection<ComplaintDocument>("complaints")
    .find(query, { projection: { _id: 0 } })
    .sort({ createdAt: -1 })
    .toArray();

  return docs.map(toComplaint);
}

export async function addComplaint(projectId: string, text: string): Promise<Complaint> {
  const complaint: Complaint = {
    id: nextId("c"),
    projectId,
    text,
  };

  const db = await getMongoDb();
  if (!db) {
    complaints = [complaint, ...complaints];
    return complaint;
  }

  await prepareMongoIfNeeded();
  await db.collection<ComplaintDocument>("complaints").insertOne({
    ...complaint,
    createdAt: new Date(),
  });

  return complaint;
}
