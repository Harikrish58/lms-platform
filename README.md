# Learning Management System (LMS)

## Project Status: Currently under development

A modern **full-stack Learning Management System** built with **Next.js and TypeScript**.

This project demonstrates **real-world development practices**, including authentication, payments, cloud storage, and CI/CD workflows. The goal is to simulate how a **production SaaS LMS platform** works while showcasing modern technologies commonly used in professional environments.

---

# Tech Stack

## Frontend

* Next.js 15 (App Router)
* TypeScript
* Tailwind CSS
* shadcn/ui
* TanStack Query

## Backend

* Next.js Server Actions
* Next.js Route Handlers
* Prisma ORM

## Database

* PostgreSQL

## Authentication

* NextAuth (Auth.js)

## Payments

* Stripe

## Storage

* AWS S3 (lesson videos)
* Cloudinary (avatars & course thumbnails)

## Validation & Forms

* React Hook Form
* Zod

## Data Visualization

* Recharts (Instructor dashboard analytics)

## Deployment & DevOps

* Vercel (deployment)
* GitHub Actions (CI pipeline)

---

# Planned Features

## Authentication

* Email login
* Google OAuth
* Role-based access control (Student / Instructor / Admin)

## User Profiles

* Update profile information
* Upload avatar (Cloudinary)

## Course Management

* Instructor course CRUD
* Course thumbnail upload
* Publish / draft course status

## Lesson Management

* Create, edit, and reorder lessons
* Video uploads via AWS S3

## Course Catalog

* Course search
* Filtering by category, level, and price
* URL search parameters for filters

## Course Experience

* Video player with lesson sidebar
* Progress tracking
* Course enrollment system

## Payments

* Stripe checkout
* Stripe webhook handling

## Reviews

* Course rating and comments
* Average rating calculation

## Dashboards

* Instructor dashboard with analytics
* Simple admin panel

## UI / UX

* Dark / Light mode
* Skeleton loaders
* Toast notifications
* Fully responsive design

---

# Development Workflow

This project follows a **professional Git workflow**:

* Feature branches
* Pull requests
* CI checks with GitHub Actions
* Automatic deployment via Vercel

---

This repository is actively being built to simulate a **real-world LMS platform** and demonstrate **modern full-stack engineering practices**.
