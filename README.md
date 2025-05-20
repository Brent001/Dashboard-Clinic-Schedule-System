# Clinic System Dashboard

<img src="https://github.com/Brent001/Dashboard-Clinic-Schedule-System/raw/main/static/logo/logo.png" alt="Metro Dagupan Clinic Logo" width="120" style="margin-bottom: 1rem;" />

A SvelteKit-based dashboard for Metro Dagupan Clinic.

---

> **Disclaimer:**  
> This project is the intellectual property of Metro Dagupan College students, created as a final project for their 2nd year.  
> **Do not distribute, copy, or use this code without explicit permission from the authors or Metro Dagupan College.**

---

## Table of Contents

- [Local Development Setup](#local-development-setup)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Running the App Locally](#running-the-app-locally)
- [Building and Publishing](#building-and-publishing)
- [Notes](#notes)

---

## Local Development Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/clinic-system-dashboard.git](https://github.com/Brent001/Dashboard-Clinic-Schedule-System.git
   cd Dashboard-Clinic-Schedule-System
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**  
   Copy `.env` and update with your credentials if needed.
   ```bash
   cp .env.example .env
   # Edit .env as needed
   ```

---

## Environment Variables

The app uses a `.env` file for sensitive configuration.  
Example:
```env
DATABASE_URL="your_database_url"
DATABASE_AUTH_TOKEN="your_database_token"
```
Make sure these are set for both local and production deployments.

---

## Database Setup

This project uses [Drizzle ORM](https://orm.drizzle.team/) and [libSQL](https://libsql.org/).

- **Push schema and seed data:**
  ```bash
  npm run setup
  ```
  This runs `drizzle-kit push` and seeds the database.

- **Other database commands:**
  - Migrate: `npm run db:migrate`
  - Studio: `npm run db:studio`

---

## Running the App Locally

Start the development server:
```bash
npm run dev
```
Visit [http://localhost:5173](http://localhost:5173) (or the port shown in your terminal).

---

## Building and Publishing

- **Build the app:**
  ```bash
  npm run build
  ```

- **Preview production build:**
  ```bash
  npm run preview
---

## Notes

- For production, always set environment variables in your deployment dashboard.
- For local development, `.env` is loaded automatically.
- For more info, see [SvelteKit documentation](https://kit.svelte.dev/docs/deploy).

---

**Created by Metro Dagupan College students — Final Project, 2nd Year**
