# 🚀 Project 3: Intelligent Lead Scraper & Enrichment Engine  
# ProspectMiner AI

---

## 📌 Project Overview

ProspectMiner AI is a full-stack MERN web application designed to automate lead collection, storage, and enrichment for business development teams. The system enables users to capture prospect data, store it securely in MongoDB, and manage leads efficiently through a clean React-based dashboard.

This project demonstrates modern web development practices using MongoDB, Express.js, React.js (Vite), and Node.js.

---

## 👥 Team Size: 3 Members

### 1️⃣ Full Stack Developer (Team Lead)
- Designed system architecture
- Integrated frontend with backend APIs
- Managed MongoDB database schema
- Handled GitHub repository and deployment
- Implemented RESTful APIs

### 2️⃣ Frontend Developer
- Built UI using React + Vite
- Developed reusable components
- Implemented lead submission form
- Integrated Axios for API calls
- Applied responsive design principles

### 3️⃣ Backend Developer
- Developed REST APIs
- Built Lead model using Mongoose
- Implemented CRUD operations
- Configured database connection
- Handled server-side validation

---

## 🛠 Tech Stack

### Frontend
- React.js (Vite)
- Axios
- HTML5
- CSS3

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- CORS
- Dotenv

### Development Tools
- VS Code
- Git & GitHub
- Postman
- MongoDB Compass

---

## 🎯 Core Features

### ✅ 1. Lead Submission System
- Users can submit prospect details
- Fields include:
  - Name
  - Email
  - Company
  - LinkedIn URL
- Data is validated before submission

### ✅ 2. MongoDB Database Integration
- Leads stored securely in MongoDB
- Mongoose schema validation
- Automatic timestamp creation

### ✅ 3. REST API Architecture
- POST /api/leads → Add new lead
- GET /api/leads → Retrieve all leads
- JSON-based communication

### ✅ 4. Frontend-Backend Integration
- Axios used for API communication
- Real-time lead submission
- Alert confirmation on success

### ✅ 5. Modular Code Structure
- Separate folders for routes and models
- Clean React component structure
- Scalable backend architecture

### ✅ 6. Environment Configuration
- Sensitive data stored in `.env.`
- MongoDB URI secured
- Dotenv integration

### ✅ 7. GitHub Version Control
- Proper .gitignore configuration
- Node modules excluded
- Professional README documentation

---

## 🔄 Application Workflow

1. User enters lead details in React form
2. Frontend sends a POST request using Axios
3. Express server receives a request
4. Lead data validated and stored in MongoDB
5. Response sent back to frontend
6. Success alert displayed

---

## 🔧 Installation Guide

### 📌 Prerequisites
- Node.js installed
- MongoDB installed or MongoDB Atlas account
- Git installed

---

## ⚙ Backend Setup

```bash
cd backend
npm install


