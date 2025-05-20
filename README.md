# Clinic System Dashboard

A SvelteKit-based dashboard for Metro Dagupan Clinic.

---

## Table of Contents

- [Local Development Setup](#local-development-setup)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Running the App Locally](#running-the-app-locally)
- [Deploying to Netlify](#deploying-to-netlify)
- [Deploying to Vercel](#deploying-to-vercel)
- [Building and Publishing](#building-and-publishing)

---

## Local Development Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/clinic-system-dashboard.git
   cd clinic-system-dashboard
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

## Deploying to Netlify

1. **Install Netlify CLI (optional):**
   ```bash
   npm install -g netlify-cli
   ```

2. **Connect your repository on [Netlify](https://app.netlify.com/).**

3. **Set environment variables** in the Netlify dashboard (`DATABASE_URL`, `DATABASE_AUTH_TOKEN`).

4. **Build settings:**
   - **Build command:** `npm run build`
   - **Publish directory:** `.svelte-kit/output`

5. **Adapter:**  
   This project uses `@sveltejs/adapter-netlify` (see `package.json`).

6. **Deploy!**

---

## Deploying to Vercel

1. **Install Vercel CLI (optional):**
   ```bash
   npm install -g vercel
   ```

2. **Connect your repository on [Vercel](https://vercel.com/).**

3. **Set environment variables** in the Vercel dashboard (`DATABASE_URL`, `DATABASE_AUTH_TOKEN`).

4. **Build settings:**
   - **Framework Preset:** SvelteKit
   - **Build command:** `npm run build`
   - **Output directory:** `.svelte-kit/output`

5. **Adapter:**  
   You may need to install and configure `@sveltejs/adapter-vercel`:
   ```bash
   npm install -D @sveltejs/adapter-vercel
   ```
   Then update your `svelte.config.js`:
   ```js
   import adapter from '@sveltejs/adapter-vercel';
   export default {
     kit: {
       adapter: adapter(),
     }
   };
   ```

6. **Deploy!**

---

## Building and Publishing

- **Build the app:**
  ```bash
  npm run build
  ```

- **Preview production build:**
  ```bash
  npm run preview
  ```

- **Publish library to npm:**
  ```bash
  npm publish
  ```

---

## Notes

- For production, always set environment variables in your deployment dashboard.
- For local development, `.env` is loaded automatically.
- For more info, see [SvelteKit documentation](https://kit.svelte.dev/docs/deploy).

---
