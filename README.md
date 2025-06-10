# Secure Player Data

A web app utilizing decentralized storage with SOLID to enhance privacy and secutiry of football players and their player data.

## Stack

- React
- Tailwind (Styles)
- Shadcn (UI)
- Tanstack Router (Routing)
- Tanstack Query (Data fetching)

## Repo Structure

This project contains a React-based single-page application. The code is organized for clarity, with components grouped into the following sub-directories:

```
├── public/              # Static assets (images, fonts)
└── src/
    ├── main.tsx         # Application entry point
    ├── api/	         # Solid pod communication logic
    ├── components/
    │   ├── ui/	         # Shadcn UI components
    │   └── ...rest/     # Custom UI components
    ├── context/         # Global state providers
    ├── db/	         # Dev-only pod data seeding
    ├── entities/        # Data model types
    ├── exceptions/      # Custom error classes
    ├── hooks/           # Reusable React logic
    ├── lib/             # Third-party library integrations
    ├── routes/          # Application pages
    ├── schemas/         # RDF schema definitions
    └── use-cases/       # Application actions (e.g., useGetProfile)
```

## Getting Started

### Prerequisite

- Node 20.x.x
- pnpm

### Step 1: Install dependencies

```
pnpm install
```

### Step 2: Add env variables

Use [.env.example](./.env.example) for reference.

### Step 3: Run local dev server

```
pnpm dev
```

## License

MIT License — see [LICENSE](LICENSE)

## Contact

Have any questions or want to reach out? Take contact with us using the information below:

| Joakim Edvardsen              | Torstein Eide             |
| ----------------------------- | ------------------------- |
| joakimedvardsen2000@gmail.com | torstein_eide@hotmail.com |
