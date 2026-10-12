# Pulse of Profit

A full-stack financial insights and trading community platform built with **FastAPI** (Python) on the backend and **Next.js 14** (React & TypeScript) on the frontend, powered by **MongoDB**.

---

## 🛠️ Tech Stack

### Backend
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) (Python 3.10+)
- **Server**: [Uvicorn](https://www.uvicorn.org/)
- **Database**: [MongoDB](https://www.mongodb.com/) via [PyMongo](https://pymongo.readthedocs.io/)
- **Authentication**: Passlib (Bcrypt) & PyJWT (`python-jose`)

### Frontend
- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Library**: React 18 & TypeScript
- **Styling**: Tailwind CSS
- **Icons & Animations**: Lucide React & Framer Motion
- **Data Visualization**: Recharts

---

## 📋 Prerequisites

Before running the project, ensure you have the following installed on your machine:
- **Node.js** (v18.x or higher) & **npm**
- **Python** (v3.10 or higher) & **pip**
- **MongoDB** (Local instance running at `mongodb://localhost:27017` or a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster URI)

---

## 📁 Project Structure

```text
Site/
├── backend/                # FastAPI backend service
│   ├── main.py             # Entry point & API endpoints
│   ├── database.py         # MongoDB connections & helper functions
│   ├── auth.py             # Authentication & password security logic
│   ├── requirements.txt    # Python dependencies
│   ├── .env                # Backend environment variables
│   └── .env.example        # Environment variable template
├── frontend/               # Next.js frontend application
│   ├── src/
│   │   ├── app/            # Next.js App Router pages & routes
│   │   └── components/     # React UI components
│   ├── package.json        # Node.js dependencies & scripts
│   └── tailwind.config.ts  # Tailwind CSS styling configuration
└── README.md               # Project setup and documentation
```

---

## 🚀 Setup & Execution Guide

Follow these steps to set up and run both the backend and frontend services locally.

### 1. Backend Setup (FastAPI)

1. Open a terminal and navigate to the `backend` directory:
   ```bash
   cd backend
   ```

2. Create a Python virtual environment:
   - **Windows (PowerShell/CMD)**:
     ```powershell
     python -m venv venv
     ```
   - **Linux / macOS**:
     ```bash
     python3 -m venv venv
     ```

3. Activate the virtual environment:
   - **Windows (PowerShell)**:
     ```powershell
     .\venv\Scripts\Activate.ps1
     ```
   - **Windows (Command Prompt)**:
     ```cmd
     venv\Scripts\activate.bat
     ```
   - **Linux / macOS**:
     ```bash
     source venv/bin/activate
     ```

4. Install the required Python packages:
   ```bash
   pip install -r requirements.txt
   ```

5. Configure Environment Variables:
   Create a `.env` file in the `backend` directory (you can copy `.env.example`):
   ```bash
   cp .env.example .env
   ```
   *Edit `.env` to configure your MongoDB connection string and secret key:*
   ```env
   MONGO_URI=mongodb://localhost:27017
   DB_NAME=beat_the_street
   SECRET_KEY=your_custom_jwt_secret_key
   HOST=0.0.0.0
   PORT=8000
   ```

6. Start the backend server:
   ```bash
   uvicorn main:app --reload --port 8000
   ```
   *The API server will run at `http://localhost:8000`. You can test endpoints via Swagger UI at `http://localhost:8000/docs`.*

---

### 2. Frontend Setup (Next.js)

1. Open a new terminal window/tab and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```

2. Install Node dependencies:
   ```bash
   npm install
   ```

3. Configure Environment Variables (Optional):
   Create a `.env.local` file in the `frontend` directory if custom backend URLs are required:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

4. Start the Next.js development server:
   ```bash
   npm run dev
   ```
   *The frontend application will be live at `http://localhost:3000`.*

### Cloudflare Images (Optional)

Image uploads can be stored in Cloudflare Images. Create a Cloudflare API token with **Images: Edit** permission, then add these values to `backend/.env`:

```env
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_IMAGES_API_TOKEN=your_images_edit_token
CLOUDFLARE_IMAGES_VARIANT=public
```

Restart the backend after setting the variables. User and admin image uploads will then be stored in Cloudflare Images and served from the returned delivery URL. Video uploads continue to use the backend's local uploads folder. If the Cloudflare variables are left unset, images continue to use local storage for development.

See Cloudflare's [Images upload guide](https://developers.cloudflare.com/images/storage/upload-images/upload-url/) and [API token permissions](https://developers.cloudflare.com/fundamentals/api/reference/permissions/).

---

## 🌐 Summary of Local Endpoints

- **Frontend App**: [http://localhost:3000](http://localhost:3000)
- **Admin / Vyavasthapak Portal**: [http://localhost:3000/vyavasthapak](http://localhost:3000/vyavasthapak)
- **Backend API Base**: [http://localhost:8000](http://localhost:8000)
- **API Interactive Documentation (Swagger UI)**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **API Redoc Documentation**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

## 📜 Key Scripts & Commands

### Frontend (`/frontend`)
- `npm run dev`: Starts the Next.js development server with hot-reloading.
- `npm run build`: Creates an optimized production build.
- `npm run start`: Starts the production server after building.
- `npm run lint`: Runs ESLint checks.

### Backend (`/backend`)
- `uvicorn main:app --reload --port 8000`: Starts the FastAPI server in hot-reload mode for development.
