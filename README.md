# Team Task Manager

A full-stack project management web application built with React, Node.js, Express, and PostgreSQL.

## Features

- **Authentication**: Secure JWT-based authentication with bcrypt password hashing.
- **Role-Based Access Control**: Project-level roles (Admin vs Member).
- **Kanban Board**: Drag-and-drop task management using `@dnd-kit`.
- **Dashboard**: High-level metrics and task overviews.
- **Responsive Design**: Modern, clean UI built with Tailwind CSS.

## Tech Stack

- **Frontend**: React (Vite), Tailwind CSS, React Router, Axios, dnd-kit, Lucide React
- **Backend**: Node.js, Express.js, Sequelize ORM, PostgreSQL
- **Security**: JWT, bcryptjs, express-validator

## Getting Started

### Evaluator Credentials
You can log in instantly using the following seed accounts:
- **Admin user**: `admin@test.com` / **Password**: `Admin@1234`
- **Member user**: `member@test.com` / **Password**: `Member@1234`

### Prerequisites
- Node.js (v18+)
- PostgreSQL (or use a cloud provider like Railway/Neon)

### Backend Setup
1. `cd backend`
2. `npm install`
3. Create a `.env` file with `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL`
4. `npm run dev`

### Frontend Setup
1. `cd frontend`
2. `npm install`
3. Create a `.env` file with `VITE_API_URL`
4. `npm run dev`

## Deployment (Railway)
The application is deployed on Railway.

- **Live Frontend URL**: [Will be populated upon deployment]
- **GitHub Repository**: [Your repo link here]

### Local Deployment
Configured to be deployed on Railway. The `railway.json` configuration supports deploying both the Node.js backend and building the Vite static frontend.

## API Documentation Quick Reference
| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/auth/login` | POST | Login and receive JWT | No |
| `/api/auth/signup` | POST | Register a new user | No |
| `/api/projects` | GET | List all projects | Yes |
| `/api/projects` | POST | Create a project | Yes |
| `/api/projects/:id` | PUT | Update project details | Yes (Admin) |
| `/api/projects/:id` | DELETE | Delete project | Yes (Admin) |
| `/api/tasks/project/:projectId` | GET | List tasks for a project | Yes |
| `/api/tasks/project/:projectId` | POST | Create a new task | Yes (Admin) |
| `/api/tasks/:id` | PUT | Update task status/details | Yes |
| `/api/tasks/:id` | DELETE | Delete task | Yes (Admin) |
