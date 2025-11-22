# Deployment Guide

This guide explains how to deploy the Inventory Management System.

## Prerequisites

- A GitHub account (to host the code)
- Accounts on deployment platforms (e.g., Render, Railway, or Vercel)

## Architecture Overview

- **Frontend**: React (Vite) - Can be deployed as a static site.
- **Backend**: Node.js (Express) + Prisma - Needs a persistent server or container.
- **Database**: SQLite (Default) - Requires a persistent disk. For scalable cloud deployment, switching to PostgreSQL is recommended.

---

## Option 1: Easiest (Render.com with SQLite)

This option keeps the current SQLite database but requires a persistent disk.

### 1. Backend Deployment (Render)

1.  Create a new **Web Service** on Render connected to your GitHub repo.
2.  **Root Directory**: `server`
3.  **Build Command**: `npm install && npx prisma generate`
4.  **Start Command**: `npm run start` (Make sure to update `package.json` start script to `ts-node src/index.ts` or compile to JS).
5.  **Environment Variables**:
    *   `PORT`: `3001` (or whatever Render assigns)
    *   `JWT_SECRET`: (Generate a random string)
    *   `DATABASE_URL`: `file:/data/dev.db` (Important: Point to the persistent disk path)
6.  **Disks**:
    *   Add a Disk named `data` mounted at `/data`.
    *   This ensures your database isn't lost when the server restarts.

### 2. Frontend Deployment (Render or Vercel)

**Using Render (Static Site):**
1.  Create a new **Static Site** on Render.
2.  **Root Directory**: `client`
3.  **Build Command**: `npm install && npm run build`
4.  **Publish Directory**: `dist`
5.  **Environment Variables**:
    *   `VITE_API_URL`: The URL of your deployed backend (e.g., `https://your-backend.onrender.com`)

**Using Vercel:**
1.  Import the project to Vercel.
2.  Set **Root Directory** to `client`.
3.  Add Environment Variable: `VITE_API_URL` pointing to your backend URL.

---

## Option 2: Production Standard (PostgreSQL)

This is better for scalability and reliability.

### 1. Database (Neon / Supabase / Railway)

1.  Create a PostgreSQL database on a provider like Neon.tech, Supabase, or Railway.
2.  Get the `DATABASE_URL` connection string.

### 2. Update Project for PostgreSQL

1.  Update `server/prisma/schema.prisma`:
    ```prisma
    datasource db {
      provider = "postgresql"
      url      = env("DATABASE_URL")
    }
    ```
2.  Delete `server/prisma/migrations` folder and `dev.db`.
3.  Run `npx prisma migrate dev --name init` to create new migrations for Postgres.

### 3. Backend Deployment

1.  Deploy the `server` directory to Render/Railway/Heroku.
2.  Set `DATABASE_URL` env var to your Postgres connection string.
3.  Build Command: `npm install && npx prisma generate && npx prisma migrate deploy`
4.  Start Command: `npm run start`

### 4. Frontend Deployment

Same as Option 1 (Vercel or Render Static Site).

---

## Local Production Test

To run the production build locally:

1.  **Backend**:
    ```bash
    cd server
    npm run start
    ```

2.  **Frontend**:
    ```bash
    cd client
    # Create .env.production with VITE_API_URL=http://localhost:3001
    npm run build
    npm run preview
    ```
