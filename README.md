# Alatau City Construction Transparency Platform

Hackathon MVP built with Next.js App Router, TypeScript, Tailwind CSS, and Leaflet.

## MVP Scope

- Interactive map with 4 districts and color-coded construction markers
- Object detail card with AI analysis
- Simplified role switching (Resident, Developer, Admin)
- Resident comments/complaints (in-memory)
- Resident AI recommendation block
- Developer panel for status updates on assigned projects
- Admin panel for create/edit/delete and assignment
- Next.js API routes only, no external backend

## Tech

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- Leaflet + React Leaflet
- In-memory mock store (`lib/data.ts`)

## Run Locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Main Structure

```text
app/
	page.tsx
	dashboard/admin/page.tsx
	dashboard/developer/page.tsx
	api/projects/route.ts
	api/projects/[id]/route.ts
	api/complaints/route.ts
components/
	Map.tsx
	ProjectCard.tsx
	AIBox.tsx
	RoleProvider.tsx
lib/
	ai.ts
	data.ts
```

## Notes for Vercel Deployment

- This MVP keeps data in process memory.
- On Vercel, serverless functions are stateless, so data resets between cold starts/redeploys.
- For demo/hackathon this is often acceptable, but for persistence use a real DB.

## Optional Next Step: MongoDB

- Your idea is good for post-MVP.
- For hackathon demo first deploy this in-memory version (fastest path).
- Then migrate `lib/data.ts` helpers to MongoDB-backed implementations while keeping the same API route contracts.
