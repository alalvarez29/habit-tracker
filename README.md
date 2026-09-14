# Habit Tracker

A full-stack habit tracker with authentication, daily check-ins, and streak calculation. Built as a technical assessment to demonstrate a complete CRUD application with a production-style architecture: a typed REST API, a relational schema, and a client that consumes it end to end.

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [1. Database](#1-database)
  - [2. Backend](#2-backend)
  - [3. Frontend](#3-frontend)
  - [Testing on a phone or another device](#testing-on-a-phone-or-another-device)
- [Environment Variables](#environment-variables)
- [Testing](#testing)
- [Deployment](#deployment)
- [Live Demo](#live-demo)

## Overview

Users sign up, log in, and manage a personal list of habits (for example, *"Read 20 minutes"* or *"Stretch"*). Each habit can be checked off for the current day, and the app tracks how many consecutive days it has been kept up, along with the longest streak ever achieved. Progress is visualized with a twelve-week heatmap, similar to a contribution graph.

## Tech Stack

| Layer          | Technology                                                  |
| -------------- | ------------------------------------------------------------ |
| Frontend       | React 19, TypeScript, Vite, Tailwind CSS v4                  |
| Routing        | React Router                                                 |
| Server state   | TanStack Query                                                |
| Forms          | React Hook Form + Zod                                        |
| Icons          | lucide-react                                                  |
| Backend        | NestJS, TypeScript                                            |
| ORM            | Prisma                                                        |
| Database       | MySQL 8                                                        |
| Authentication | JWT stored in an httpOnly cookie                              |
| API docs       | OpenAPI / Swagger, served at `/docs`                          |

## Features

- Complete authentication flow: register, log in, log out, with the session persisted in an httpOnly cookie that client-side JavaScript never has access to.
- Full CRUD for habits, each with a name, an optional description, and a color.
- A daily check-in toggle per habit, with the full history of marked days preserved.
- Streak calculation, both the current active streak and the longest streak on record. The logic lives in a pure function (`streak.util.ts`) and is covered by unit tests for the edge cases that actually matter: a gap that breaks a streak, today not yet marked but yesterday was, and duplicate dates.
- A twelve-week, GitHub-style heatmap per habit. The calculation is anchored to the date the client considers "today" in its own timezone; the server never assumes a timezone of its own and only compares calendar-date strings (`YYYY-MM-DD`), never timestamps.
- Per-user data isolation: no user can read, edit, or delete another user's habits. This is enforced at the service layer and covered by both automated tests and manual cross-account checks.
- A responsive layout, verified against a simulated mobile viewport and against a real phone on the same local network.

## Architecture

The project is a modular monolith: a single-page React client talking to a single NestJS REST API, backed by one MySQL database. There is no microservice split, no message queue, and no separate read/write model — none of that complexity is justified at this scale.

```
React SPA  --HTTPS + httpOnly cookie-->  NestJS API  --Prisma-->  MySQL
```

The backend is organized by feature module (`auth`, `users`, `habits`), each following the same shape: a controller that only handles HTTP concerns, a service that holds the business logic and talks to Prisma directly, and DTOs validated with `class-validator` at the boundary. Authentication is a cross-cutting guard, not logic duplicated inside every service.

The frontend is organized the same way, by feature (`features/auth`, `features/habits`), rather than by technical layer. State is split by kind: server state lives in TanStack Query, form state in React Hook Form, and session state in a small React Context — there is no global store, because nothing here needs one.

## Project Structure

```
habit-tracker/
├── backend/                 NestJS API
│   ├── prisma/               Schema and migrations
│   └── src/
│       ├── auth/              Registration, login, JWT strategy, guards
│       ├── users/              User lookup and creation
│       ├── habits/             Habits CRUD, check-ins, streak calculation
│       ├── prisma/             Prisma service and module
│       └── common/             Shared filters, guards, decorators
├── frontend/                React SPA
│   └── src/
│       ├── components/         Shared UI (navbar, protected routes, background)
│       ├── context/             Auth context
│       ├── features/
│       │   ├── auth/             Login and register pages
│       │   └── habits/           Habit list, form, card, heatmap, colors
│       ├── lib/                 HTTP client, date utilities
│       └── types/               Shared TypeScript types
├── mysql-init/               Privilege setup for the local MySQL container
└── docker-compose.yml         MySQL and Adminer for local development
```

## Getting Started

### Prerequisites

| Tool   | Version |
| ------ | ------- |
| Node.js | 20 or later |
| npm     | 10 or later |
| Docker  | Any recent version, for the local database |

### 1. Database

```bash
docker compose up -d mysql
```

This starts MySQL on `localhost:3306` (user `crud_user`, password `crud_password`, database `crud_app`) along with Adminer, a web-based database browser, at `http://localhost:8080`.

### 2. Backend

```bash
cd backend
cp .env.example .env
npm install
npx prisma migrate dev   # creates the schema
npm run start:dev        # http://localhost:3000  (API docs at /docs)
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev               # http://localhost:5173
```

A `frontend/.env` file is not required for local development. When `VITE_API_URL` is unset, the HTTP client (`frontend/src/lib/apiClient.ts`) derives the backend URL from whatever host served the page, on port `3000`. This means the app works unmodified whether it is opened from `localhost` or from a machine's LAN IP address. `frontend/.env.example` is still provided for cases where pinning an explicit backend URL is preferred.

### Testing on a phone or another device

To reach the app from a phone on the same Wi-Fi network:

```bash
npm run dev -- --host 0.0.0.0
```

The backend also needs to allow that origin. `CORS_ORIGIN` in `backend/.env` accepts a comma-separated list:

```
CORS_ORIGIN="http://localhost:5173,http://<your-lan-ip>:5173"
```

## Environment Variables

### Backend (`backend/.env`)

| Variable         | Description                                              | Example                                              |
| ----------------- | ---------------------------------------------------------- | ------------------------------------------------------ |
| `DATABASE_URL`     | MySQL connection string                                   | `mysql://crud_user:crud_password@localhost:3306/crud_app` |
| `JWT_SECRET`       | Secret used to sign JSON Web Tokens                        | Generate one with `openssl rand -base64 32`            |
| `JWT_EXPIRES_IN`   | JWT lifetime                                                | `1d`                                                    |
| `PORT`             | Port the API listens on                                     | `3000`                                                  |
| `CORS_ORIGIN`      | Comma-separated list of origins allowed to call the API     | `http://localhost:5173`                                 |
| `COOKIE_SECURE`    | Whether the session cookie requires HTTPS                   | `false` locally, `true` in production                  |

### Frontend (`frontend/.env`, optional)

| Variable        | Description                                                                                   |
| ---------------- | ------------------------------------------------------------------------------------------------ |
| `VITE_API_URL`    | Backend base URL. Optional locally (see above); required when frontend and backend are deployed on different domains. |

## Testing

```bash
cd backend && npm test
```

Thirteen unit tests cover authentication (password hashing, credential validation), habit ownership checks, and streak calculation, including its edge cases.

## Deployment

The app is deployed to Railway as three services inside one project: a managed MySQL database, the backend API, and the frontend, each with its own public domain.

### Steps

1. **Database.** Add Railway's MySQL plugin. It exposes its connection details as project variables, including `MYSQL_URL`, which the other services can reference directly without copying secrets around.
2. **Backend.** Deployed from `backend/`, which Railway builds using its `Dockerfile`. The container runs `prisma migrate deploy` before starting the server, so every deploy applies any pending migration automatically. Required variables: `DATABASE_URL` (referencing the MySQL plugin), `JWT_SECRET`, `JWT_EXPIRES_IN`, `CORS_ORIGIN` (the frontend's public URL), `COOKIE_SECURE=true`, and `PORT`.
3. **Frontend.** Deployed from `frontend/`. Railway detects a Node project, runs `npm run build`, and starts it with `npm start`, which serves the built files with `serve` and a single-page-app fallback. Required variable: `VITE_API_URL` (the backend's public URL). Because Vite inlines environment variables at build time, changing this value requires a redeploy, not just a variable update.

### Gotchas worth knowing about

| Problem | Cause | Fix |
| -------- | ------- | ----- |
| Backend container crash-loops on boot, with a Prisma "could not detect libssl/openssl version" warning | The `Dockerfile` uses `node:20-alpine`, and Prisma's default engine binary does not target musl libc or Alpine's OpenSSL setup | Add `binaryTargets = ["native", "linux-musl-openssl-3.0.x"]` to the Prisma `generator` block, and install `openssl` in both Docker stages |
| The session cookie never reaches the backend, and every request looks unauthenticated in production | Railway's free domains live under `up.railway.app`, which is registered on the Public Suffix List; the frontend and backend therefore count as different sites to the browser, and a `SameSite=Lax` cookie is not sent on cross-site requests | Set `sameSite: 'none'` (which requires `secure: true`) whenever `COOKIE_SECURE=true`, and keep `sameSite: 'lax'` for local HTTP development |
| A generated public domain does not reach the app | The domain's target port must match the port the app actually listens on | Pin an explicit `PORT` variable per service, matching the port used when the domain was created |

## Live Demo

| Service  | URL                                                          |
| -------- | -------------------------------------------------------------- |
| App      | https://app-production-aa81b.up.railway.app                    |
| API docs | https://api-production-06b66.up.railway.app/docs               |

Railway's free usage runs on trial credit rather than a permanent free tier, so availability of this deployment may change over time.
