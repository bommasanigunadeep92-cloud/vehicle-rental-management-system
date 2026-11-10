# 🚀 Flat Deployment Package: DriveElite Vehicle Rental Management System

This folder contains the **unified, self-contained flat production deployment** for the Vehicle Rental Management System.

Both the **React 18 frontend** and **Express.js backend** are bundled together into a single production server.

---

## 📁 Folder Structure

```
deployment/
├── package.json          # Production dependencies & start script
├── server.js             # Unified server (serves React SPA & /api/* REST endpoints)
├── Procfile              # Cloud process runner (Railway, Render, Heroku)
├── railway.json          # Railway cloud configuration
├── .env                  # Environment variables
├── public/               # Built static React 18 production bundle
└── src/                  # Backend REST API (controllers, routes, config, middleware)
```

---

## ⚡ How to Deploy on Railway

### Method A: Via Railway CLI (From Terminal)

1. Open PowerShell and navigate to this folder:
   ```powershell
   cd "c:\Users\bomma\OneDrive\Desktop\Vehicle Rental Management System\deployment"
   ```

2. Log in:
   ```powershell
   npx @railway/cli login
   ```

3. Initialize & Deploy:
   ```powershell
   npx @railway/cli init
   npx @railway/cli up
   ```

4. Generate your public link:
   ```powershell
   npx @railway/cli domain
   ```

---

### Method B: Via GitHub & Railway Web Dashboard

1. Push this folder to a GitHub repository.
2. In Railway ([https://railway.com](https://railway.com)), click **`+ New Project`** &rarr; **`Deploy from GitHub repo`**.
3. Select your repository.
4. Under **Settings** &rarr; **Networking**, click **`Generate Domain`**.
5. You get a permanent public HTTPS URL (`https://xxxx.up.railway.app`)!

---

## 🧪 Local Testing

To test this flat deployment locally:
```powershell
cd "c:\Users\bomma\OneDrive\Desktop\Vehicle Rental Management System\deployment"
npm install
npm start
```
* **Frontend Application:** `http://localhost:5000`
* **API Health Check:** `http://localhost:5000/api/health`
