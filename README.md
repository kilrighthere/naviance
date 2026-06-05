# Naviance

Naviance is a modern web application featuring an interactive dashboard, financial/data forecasting, and an integrated AI chatbot. The platform is structured with a modular architecture, separating the user interface, backend APIs, and machine learning services.

## Project Structure

The repository is divided into three main components:

- **Frontend (`/Frontend`)**: The user interface built with Vue 3 and Vite.
- **Backend (`/Backend`)**: A RESTful API built with Node.js and Express.
- **ML-Services (`/ML-Services`)**: Machine learning models and endpoints built with FastAPI and TensorFlow.

---

## 🎨 Frontend

A responsive, high-performance user interface featuring dynamic charts and chatbot integration.

### Tech Stack
- **Framework:** Vue 3 (Composition API)
- **Bundler:** Vite
- **Styling:** TailwindCSS
- **Charts:** ApexCharts (vue3-apexcharts)
- **State Management:** Pinia
- **Routing:** Vue Router
- **Database/Auth Client:** Supabase JS

### Getting Started
```bash
cd Frontend/navience-frontend
npm install
npm run dev
```

---

## ⚙️ Backend

The core API server that manages business logic, data validation, and communication with the database and ML services.

### Tech Stack
- **Framework:** Node.js with Express
- **Validation:** Zod
- **Calculations:** Math.js
- **Database/Auth:** Supabase JS
- **Environment:** dotenv, cors

### Getting Started
```bash
cd Backend
npm install
npm run start
```

---

## 🤖 ML-Services

A dedicated Python service for running predictive models and providing forecasting capabilities to the main application.

### Tech Stack
- **Framework:** FastAPI, Uvicorn
- **Machine Learning:** TensorFlow, Scikit-learn
- **Data Processing:** NumPy, Joblib
- **Environment:** Python-dotenv, Pydantic

### Getting Started
```bash
cd ML-Services
pip install -r requirements.txt
# Start the FastAPI server (adjust entry point if needed)
uvicorn app.main:app --reload
```

---

## ✨ Key Features
- **Overview Dashboard:** A responsive, interactive UI for data visualization.
- **Forecasting:** Advanced predictive analytics powered by machine learning.
- **Chatbot Integration:** An AI-driven chat component for intelligent user assistance.
- **Modern Architecture:** Clean separation of concerns with a RESTful API structure connecting the frontend, backend, and ML services.
- **Responsive Layout:** fully functional and aesthetically pleasing on both desktop and mobile devices.

## 🚀 Deployment
- **Frontend:** Configured for deployment on platforms like Vercel (using `npm run build`).
- **Backend/ML:** Contains configuration files (e.g., `Procfile`, `nixpacks.toml`, `runtime.txt`) for deployment on platforms like Render, Heroku, or Railway.