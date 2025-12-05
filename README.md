# Tennis Journal

A tennis journal application for tracking sessions and string usage.

## Project Structure

```
Tennis-Journal/
├── backend/                 # .NET API (open with Rider)
│   ├── TennisJournal.sln   # Solution file
│   └── api/                # Web API project
└── frontend/               # Next.js app (open with VS Code)
    └── src/
```

## Development Setup

### Backend (Rider)

1. Open `backend/TennisJournal.sln` in JetBrains Rider
2. Run the API project (default: http://localhost:5062)
3. Swagger UI available at http://localhost:5062/swagger

### Frontend (VS Code)

1. Open the `frontend/` folder in VS Code
2. Install dependencies: `npm install`
3. Start dev server: `npm run dev`
4. Open http://localhost:3000

### Regenerate API Client

After making API changes, regenerate the TypeScript client:

```bash
cd frontend
npm run generate-api
```

## Tech Stack

**Backend:**
- .NET 9 Web API
- OpenAPI/Swagger

**Frontend:**
- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- TanStack Query (React Query)
- OpenAPI TypeScript Codegen
