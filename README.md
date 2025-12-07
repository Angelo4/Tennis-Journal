# Tennis Journal

A tennis journal application for tracking sessions and string usage.

## Project Structure

```
Tennis-Journal/
├── backend/                 # .NET 9 API
│   ├── TennisJournal.sln   # Solution file
│   └── src/
│       ├── TennisJournal.Api/           # Web API
│       ├── TennisJournal.Application/   # Business logic & DTOs
│       ├── TennisJournal.Domain/        # Entities & enums
│       ├── TennisJournal.Infrastructure/# Cosmos DB repositories
│       └── TennisJournal.Tests/         # Unit tests
├── frontend/               # Next.js app
│   └── src/
│       ├── api/            # Generated API client
│       ├── app/            # Next.js App Router pages
│       ├── components/     # React components
│       └── hooks/          # Custom React hooks
└── infra/                  # Azure Bicep infrastructure
    ├── main.bicep          # Main template
    └── parameters.*.bicepparam
```

## Tech Stack

**Backend:**
- .NET 9 Web API
- Azure Cosmos DB (NoSQL)
- JWT Authentication
- OpenAPI/Swagger

**Frontend:**
- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- TanStack Query (React Query)
- NextAuth.js
- OpenAPI TypeScript Codegen

**Infrastructure:**
- Azure App Service (Linux)
- Azure Cosmos DB (Serverless)
- Azure Key Vault
- Application Insights
- GitHub Actions CI/CD

## Development Setup

### Prerequisites

- .NET 9 SDK
- Node.js 18+
- Azure CLI (for infrastructure)
- [Azure Cosmos DB Emulator](https://learn.microsoft.com/azure/cosmos-db/emulator) (optional, for local development)

### Backend

1. Open `backend/TennisJournal.sln` in your IDE (Rider/VS Code)
2. Run the API project:
   ```bash
   cd backend/src/TennisJournal.Api
   dotnet run
   ```
3. API runs at http://localhost:5062
4. Swagger UI available at http://localhost:5062/swagger

### Frontend

1. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```
2. Start dev server:
   ```bash
   npm run dev
   ```
3. Open http://localhost:3000

### Regenerate API Client

After making API changes, regenerate the TypeScript client:

```bash
cd frontend
npm run generate-api
```

## Infrastructure

See [infra/README.md](./infra/README.md) for details on Azure deployment.

### Quick Deploy

```bash
cd infra

# Preview changes
az deployment group what-if \
  --resource-group rg-tennisjournal-dev \
  --template-file main.bicep \
  --parameters parameters.dev.bicepparam

# Deploy
az deployment group create \
  --resource-group rg-tennisjournal-dev \
  --template-file main.bicep \
  --parameters parameters.dev.bicepparam
```

## License

MIT
