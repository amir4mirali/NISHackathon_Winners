import { getMongoDb } from "@/lib/mongodb";
import { createHash, timingSafeEqual } from "crypto";

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
  acceptanceRequested?: boolean;
  developerId: string;
  developerName: string;
  description: string;
  coordinates: Coordinates;
};

export type User = {
  id: string;
  name: string;
  role: UserRole;
  email?: string;
};

export type AuthUser = {
  id: string;
  name: string;
  role: UserRole;
  email: string;
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
  { id: "resident-1", name: "Aruzhan", role: "resident", email: "resident@alatau.local" },
  ...DEVELOPERS,
  { id: "admin-1", name: "City Admin", role: "admin", email: "admin@alatau.local" },
];

const seedAuthUsers: Array<AuthUser & { passwordHash: string }> = [
  {
    id: "resident-1",
    name: "Aruzhan",
    role: "resident",
    email: "resident@alatau.local",
    passwordHash: hashPassword("resident123"),
  },
  {
    id: "dev-1",
    name: "Alatau Build",
    role: "developer",
    email: "developer1@alatau.local",
    passwordHash: hashPassword("developer123"),
  },
  {
    id: "dev-2",
    name: "Skyline Nova",
    role: "developer",
    email: "developer2@alatau.local",
    passwordHash: hashPassword("developer123"),
  },
  {
    id: "admin-1",
    name: "City Admin",
    role: "admin",
    email: "admin@alatau.local",
    passwordHash: hashPassword("admin123"),
  },
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
  {
    id: "p-6",
    name: "Growing STEM Academy",
    district: "Growing District",
    type: "school",
    status: "in progress",
    developerId: "dev-2",
    developerName: "Skyline Nova",
    description:
      "A modern 1200-seat school campus with robotics labs, inclusive classrooms, a digital library, and safe pedestrian drop-off zones.",
    coordinates: { lat: 43.2464, lng: 76.9528 },
  },
  {
    id: "p-7",
    name: "Golden Business Atrium",
    district: "Golden District",
    type: "commercial",
    status: "in progress",
    developerId: "dev-1",
    developerName: "Alatau Build",
    description:
      "Mixed commercial center with office floors, local service units, underground parking, and energy-efficient facade systems for low operating costs.",
    coordinates: { lat: 43.2558, lng: 76.9118 },
  },
  {
    id: "p-8",
    name: "Gate Transit Residences",
    district: "Gate District",
    type: "residential",
    status: "planned",
    developerId: "dev-2",
    developerName: "Skyline Nova",
    description:
      "Transit-oriented residential quarter with family blocks, green courtyards, noise-shield solutions, and first-floor public amenities.",
    coordinates: { lat: 43.2259, lng: 76.9694 },
  },
  {
    id: "p-9",
    name: "Green Care Neighborhood Center",
    district: "Green District",
    type: "commercial",
    status: "planned",
    developerId: "dev-1",
    developerName: "Alatau Build",
    description:
      "Community-scale center focused on everyday services: pharmacy, diagnostics, childcare studios, and local retail within a walkable radius.",
    coordinates: { lat: 43.2663, lng: 76.9019 },
  },
  {
    id: "p-10",
    name: "Growing Family Homes Phase II",
    district: "Growing District",
    type: "residential",
    status: "in progress",
    developerId: "dev-1",
    developerName: "Alatau Build",
    description:
      "Second phase of mid-rise housing with daycare-ready courtyards, school bus pockets, barrier-free access, and district heating optimization.",
    coordinates: { lat: 43.2411, lng: 76.9461 },
  },
  {
    id: "p-11",
    name: "Golden District Education Annex",
    district: "Golden District",
    type: "school",
    status: "planned",
    developerId: "dev-2",
    developerName: "Skyline Nova",
    description:
      "Compact education annex designed for high-density business area workers' families, with after-school programs and protected walking routes.",
    coordinates: { lat: 43.2514, lng: 76.9062 },
  },
];

const seedComplaints: Complaint[] = [
  {
    id: "c-1",
    projectId: "p-2",
    text: "Please improve noise management near nearby homes.",
  },
  {
    id: "c-2",
    projectId: "p-6",
    text: "Great progress overall, but please add clearer temporary pedestrian signs near the school perimeter.",
  },
  {
    id: "c-3",
    projectId: "p-7",
    text: "Evening logistics vehicles are blocking a local street, please adjust delivery windows.",
  },
  {
    id: "c-4",
    projectId: "p-8",
    text: "Concern about peak-hour traffic load, request an updated transport impact report.",
  },
  {
    id: "c-5",
    projectId: "p-10",
    text: "Construction team is responsive, but dust control on windy days should be stronger.",
  },
  {
    id: "c-6",
    projectId: "p-11",
    text: "Support this school project, please keep safe crossing zones in final design.",
  },
  {
    id: "c-7",
    projectId: "p-9",
    text: "Useful local services concept, but we need more public parking and bike racks.",
  },
];

type ProjectDocument = Project & { createdAt: Date };
type ComplaintDocument = Complaint & { createdAt: Date };
type AuthUserDocument = AuthUser & { passwordHash: string; createdAt: Date };

function hashPassword(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function secureEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

const toProject = (doc: ProjectDocument): Project => ({
  id: doc.id,
  name: doc.name,
  district: doc.district,
  type: doc.type,
  status: doc.status,
  acceptanceRequested: doc.acceptanceRequested ?? false,
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

const toAuthUser = (doc: AuthUserDocument): AuthUser => ({
  id: doc.id,
  name: doc.name,
  role: doc.role,
  email: doc.email,
});

let projects: Project[] = [...seedProjects];
let complaints: Complaint[] = [...seedComplaints];
const authUsers: Array<AuthUser & { passwordHash: string }> = [...seedAuthUsers];
let mongoPrepared = false;

const nextId = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 8)}`;

const normalizeEmail = (email: string) => email.trim().toLowerCase();

async function prepareMongoIfNeeded() {
  if (mongoPrepared) return;

  const db = await getMongoDb();
  if (!db) return;

  const projectsCol = db.collection<ProjectDocument>("projects");
  const complaintsCol = db.collection<ComplaintDocument>("complaints");
  const usersCol = db.collection<AuthUserDocument>("users");

  await projectsCol.createIndex({ id: 1 }, { unique: true });
  await complaintsCol.createIndex({ id: 1 }, { unique: true });
  await usersCol.createIndex({ id: 1 }, { unique: true });
  await usersCol.createIndex({ email: 1 }, { unique: true });

  const projectCount = await projectsCol.countDocuments();
  if (projectCount === 0) {
    await projectsCol.insertMany(
      seedProjects.map((project, index) => ({
        ...project,
        createdAt: new Date(Date.now() - (seedProjects.length - index) * 1000),
      })),
    );
  } else {
    for (const project of seedProjects) {
      await projectsCol.updateOne(
        { id: project.id },
        {
          $setOnInsert: {
            ...project,
            createdAt: new Date(),
          },
        },
        { upsert: true },
      );
    }
  }

  const complaintCount = await complaintsCol.countDocuments();
  if (complaintCount === 0) {
    await complaintsCol.insertMany(
      seedComplaints.map((complaint, index) => ({
        ...complaint,
        createdAt: new Date(Date.now() - (seedComplaints.length - index) * 1000),
      })),
    );
  } else {
    for (const complaint of seedComplaints) {
      await complaintsCol.updateOne(
        { id: complaint.id },
        {
          $setOnInsert: {
            ...complaint,
            createdAt: new Date(),
          },
        },
        { upsert: true },
      );
    }
  }

  const userCount = await usersCol.countDocuments();
  if (userCount === 0) {
    await usersCol.insertMany(
      seedAuthUsers.map((user, index) => ({
        ...user,
        createdAt: new Date(Date.now() - (seedAuthUsers.length - index) * 1000),
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
    acceptanceRequested: input.acceptanceRequested ?? false,
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

export async function authenticateUser(email: string, password: string): Promise<AuthUser | null> {
  const normalizedEmail = normalizeEmail(email);
  const passwordHash = hashPassword(password);

  const db = await getMongoDb();
  if (!db) {
    const user = authUsers.find((entry) => entry.email.toLowerCase() === normalizedEmail);
    if (!user) return null;
    if (!secureEqual(user.passwordHash, passwordHash)) return null;
    return {
      id: user.id,
      name: user.name,
      role: user.role,
      email: user.email,
    };
  }

  await prepareMongoIfNeeded();
  const doc = await db.collection<AuthUserDocument>("users").findOne({
    email: normalizedEmail,
  });

  if (!doc) return null;
  if (!secureEqual(doc.passwordHash, passwordHash)) return null;

  return toAuthUser(doc);
}

export async function registerResident(
  name: string,
  email: string,
  password: string,
): Promise<{ user: AuthUser | null; error?: string }> {
  const normalizedName = name.trim();
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedName) {
    return { user: null, error: "Имя обязательно" };
  }

  if (!normalizedEmail || !normalizedEmail.includes("@")) {
    return { user: null, error: "Укажите корректную почту" };
  }

  if (password.length < 6) {
    return { user: null, error: "Пароль должен содержать минимум 6 символов" };
  }

  const db = await getMongoDb();
  if (!db) {
    const exists = authUsers.some((entry) => entry.email.toLowerCase() === normalizedEmail);
    if (exists) {
      return { user: null, error: "Пользователь с такой почтой уже существует" };
    }

    const newUser: AuthUser & { passwordHash: string } = {
      id: nextId("resident"),
      name: normalizedName,
      role: "resident",
      email: normalizedEmail,
      passwordHash: hashPassword(password),
    };

    authUsers.push(newUser);
    return { user: { id: newUser.id, name: newUser.name, role: newUser.role, email: newUser.email } };
  }

  await prepareMongoIfNeeded();
  const usersCol = db.collection<AuthUserDocument>("users");
  const exists = await usersCol.findOne({ email: normalizedEmail }, { projection: { _id: 1 } });
  if (exists) {
    return { user: null, error: "Пользователь с такой почтой уже существует" };
  }

  const newUser: AuthUserDocument = {
    id: nextId("resident"),
    name: normalizedName,
    role: "resident",
    email: normalizedEmail,
    passwordHash: hashPassword(password),
    createdAt: new Date(),
  };

  await usersCol.insertOne(newUser);
  return { user: toAuthUser(newUser) };
}

export async function getAuthUserById(id: string): Promise<AuthUser | null> {
  const db = await getMongoDb();
  if (!db) {
    const user = authUsers.find((entry) => entry.id === id);
    if (!user) return null;
    return {
      id: user.id,
      name: user.name,
      role: user.role,
      email: user.email,
    };
  }

  await prepareMongoIfNeeded();
  const doc = await db.collection<AuthUserDocument>("users").findOne({ id });
  if (!doc) return null;

  return toAuthUser(doc);
}
