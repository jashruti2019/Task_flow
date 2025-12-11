TaskFlow – Full-Stack Task Manager

A complete task management application built using React (frontend) and Node.js + Express + PostgreSQL (backend).
Users can create, edit, update status, delete, filter, sort, and view tasks with a modern UI and smart timeline.

Features Implemented
Backend – Node.js + Express + PostgreSQL

Based on the machine test requirements 

Machine Test
Create Task (POST /tasks)
Get All Tasks (GET /tasks)
Get Single Task (GET /tasks/:id)
Update Task (PUT /tasks/:id)
Delete Task (DELETE /tasks/:id)
PostgreSQL table fields:
id
title
description
due_date
status (pending, in-progress, done)
Input validation for required fields
Clean SQL queries (or ORM if preferred)
Frontend – React

Core Requirements
Task list page
Add Task modal
Edit Task modal
Form validation
API integration using fetch

Additional Features I Implemented
Smart upcoming timeline (7-day auto window)
Correct date handling (no timezone shift bugs)
Sorting: newest, oldest, due date asc, due date desc
Search filter
Status filtering (pending, in-progress, done)
Colored status badges
Glassmorphism premium UI
Animated transitions (Framer Motion)
Smart due-date text: “Due today”, “3 days left”, “Overdue”, etc.
Timeline hides completed tasks automatically
Fix for one-day-before timeline bug
Fix for dropdown visibility in dark mode
Fix for calendar icon visibility

Folder Structure

project/
│
├── backend/
│   ├── server.js
│   ├── db.js
│   ├── routes/
│   │   └── tasks.js
│   ├── controllers/
│   │   └── tasksController.js
│   ├── package.json
│   └── .env
│
└── frontend/
    ├── src/
    │   ├── TaskManager.jsx
    │   ├── TaskManager.css
    │   ├── App.jsx
    │   └── main.jsx
    ├── package.json
    └── .env

Backend Setup (Node + PostgreSQL)
1. Install Dependencies
cd backend
npm install

2. Create PostgreSQL Database
CREATE DATABASE taskflow;

3. Create tasks Table
CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  due_date DATE,
  status VARCHAR(20) DEFAULT 'pending'
);

4. Create .env

Inside /backend/.env:

PORT=4000
DATABASE_URL=postgres://username:password@localhost:5432/taskflow

5. Start Backend
npm run dev

Frontend Setup (React + Vite)
1. Install Dependencies
cd frontend
npm install

2. Create .env

Inside /frontend/.env:

VITE_API_URL=http://localhost:4000

3. Start Frontend
npm run dev
The app will start at:
http://localhost:5173

How to Use the App
Add Task
Click + Add Task
Enter title, description, due date, status
Date automatically adjusts correctly (timezone-safe)
Edit Task
Click Edit
Update fields and save
Mark Done
Task immediately disappears from timeline
Status badge changes to green
Smart “Completed on…” message is shown
Delete Task
Removes task permanently
Filters-All,Pending,In Progress,Done
Sorting-Newest,Oldest,Due ↑,Due ↓
Search
Real-time filter on title + description
Upcoming Timeline
Shows next 7 days
Count of tasks due each day
Completed tasks are not shown
Correct date logic prevents “one day early” bugs

Technology Stack
Frontend
React (Vite)
Framer Motion
Modern CSS (glass UI)
Fetch API

Backend
Node.js
Express.js
PostgreSQL
pg library

Environment Requirements
Node.js >= 18
PostgreSQL >= 13
NPM >= 8

Running Full Application
Start Backend
cd backend
npm run dev

Start Frontend
cd frontend
npm run dev
Both must be running simultaneously
