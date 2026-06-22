'use client';

import React from "react";
import { motion } from "framer-motion";

// ----------------------------------------------------------------
// Animation configuration
// Staggered fade-up on mount. All other motion is intentionally
// removed to keep the page calm and professional.
// ----------------------------------------------------------------

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
};

// ----------------------------------------------------------------
// Data: Tech stack entries
// ----------------------------------------------------------------

const techStack = [
  {
    category: "Frontend",
    label: "Next.js 16 & React 19",
    detail:
      "App Router architecture for server-side rendering and hybrid data fetching strategies.",
  },
  {
    category: "Language & Styling",
    label: "TypeScript & Tailwind v4",
    detail:
      "Strict end-to-end type safety paired with utility-first, highly responsive UI styling.",
  },
  {
    category: "Database",
    label: "Prisma ORM & PostgreSQL",
    detail:
      "Relational database management ensuring strict data integrity and fast, typed queries.",
  },
  {
    category: "Media & Storage",
    label: "AWS S3 & Cloudinary",
    detail:
      "Enterprise-grade media handling for heavy video streaming and optimized image delivery.",
  },
  {
    category: "Payments",
    label: "Stripe Integration",
    detail:
      "Secure, automated checkout sessions with real-time webhook event processing.",
  },
  {
    category: "Authentication",
    label: "NextAuth & RBAC",
    detail:
      "Session management, hashed credentials, and strict role-based access control via middleware.",
  },
];

// ----------------------------------------------------------------
// Data: Architecture portals
// ----------------------------------------------------------------

const architecture = [
  {
    portal: "Student Portal",
    accentClass: "bg-blue-600 dark:bg-blue-500",
    description:
      "A learning module using Server Actions to sync video completion, curriculum milestones, and dashboard metrics in real time.",
    capabilities: ["Interactive Dashboard", "Real-time Progress Tracking", "Course Reviews"],
  },
  {
    portal: "Instructor Studio",
    accentClass: "bg-emerald-600 dark:bg-emerald-500",
    description:
      "Empowers educators with a drag-and-drop curriculum builder, direct cloud media uploads, and graphical revenue analytics via Recharts.",
    capabilities: ["Curriculum Builder", "Visual Analytics", "Media Processing"],
  },
  {
    portal: "Admin Oversight",
    accentClass: "bg-violet-600 dark:bg-violet-500",
    description:
      "A portal secured by Next.js middleware, giving administrators control over user roles, course auditing, and platform moderation.",
    capabilities: ["Role-Based Access", "Content Moderation", "User Auditing"],
  },
];

// ----------------------------------------------------------------
// Root page component
// ----------------------------------------------------------------

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50 font-sans">

      {/* -----------------------------------------------------------
          Header bar: platform identity with a status indicator
      ----------------------------------------------------------- */}
      <header className="border-b border-slate-100 dark:border-slate-800/60">
        <div className="max-w-6xl mx-auto px-6 sm:px-12 lg:px-24 h-14 flex items-center justify-between">
          <span className="text-sm font-semibold tracking-widest uppercase text-slate-400 dark:text-slate-500">
            Nextera LMS
          </span>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
            </span>
            System Active · v2.0
          </div>
        </div>
      </header>

      <motion.div
        className="max-w-6xl mx-auto px-6 sm:px-12 lg:px-24 py-20 space-y-28"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >

        {/* -----------------------------------------------------------
            Hero: editorial pull-quote treatment.
            The vertical rule on the left is the signature element —
            precise, journalistic, specific to the "crafted" narrative.
        ----------------------------------------------------------- */}
        <motion.section
          variants={itemVariants}
          className="grid grid-cols-1 lg:grid-cols-[1fr_1.6fr] gap-12 lg:gap-20 items-start"
        >
          {/* Left: label block */}
          <div className="space-y-4">
            <p className="text-xs font-semibold tracking-widest uppercase text-slate-400 dark:text-slate-500">
              About the Platform
            </p>
            <h1 className="text-5xl sm:text-6xl font-black tracking-tighter leading-none text-slate-900 dark:text-white">
              Nextera.
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs">
              Enterprise-grade Learning Management System
            </p>
          </div>

          {/* Right: pull quote with left rule */}
          <div className="border-l-2 border-slate-200 dark:border-slate-700 pl-8 space-y-6">
            <p className="text-xl sm:text-2xl font-light text-slate-700 dark:text-slate-300 leading-relaxed tracking-tight">
              Built to bridge the gap between complex educational workflows
              and intuitive user experiences.
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              This platform represents a deliberate career transition from operations management into
              full-stack web development. Every architectural decision reflects a commitment to
              building scalable, user-centric software that resolves technical complexity into
              operational simplicity.
            </p>
            <p className="text-xs font-semibold tracking-widest uppercase text-slate-400 dark:text-slate-500">
              Crafted in Bielawa, Poland
            </p>
          </div>
        </motion.section>

        {/* -----------------------------------------------------------
            Tech stack: label-and-divider row layout.
            A clean grid with a category eyebrow above each entry —
            no icon decorations, no card shadows.
        ----------------------------------------------------------- */}
        <motion.section variants={itemVariants} className="space-y-10">

          {/* Section heading */}
          <div className="flex items-baseline gap-6">
            <h2 className="text-xs font-semibold tracking-widest uppercase text-slate-400 dark:text-slate-500">
              Core Technology
            </h2>
            <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800" />
          </div>

          {/* Tech grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10">
            {techStack.map((item) => (
              <TechEntry key={item.label} {...item} />
            ))}
          </div>
        </motion.section>

        {/* -----------------------------------------------------------
            Architecture: three portals as a ruled list.
            Each portal has an accent bar, no card shadow or hover lift.
        ----------------------------------------------------------- */}
        <motion.section variants={itemVariants} className="space-y-10">

          {/* Section heading */}
          <div className="flex items-baseline gap-6">
            <h2 className="text-xs font-semibold tracking-widest uppercase text-slate-400 dark:text-slate-500">
              System Architecture
            </h2>
            <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800" />
          </div>

          {/* Portal columns */}
          <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-slate-100 dark:divide-slate-800">
            {architecture.map((item, idx) => (
              <ArchCard key={item.portal} index={idx} {...item} />
            ))}
          </div>
        </motion.section>

        {/* -----------------------------------------------------------
            Footer: minimal sign-off, no card wrapper
        ----------------------------------------------------------- */}
        <motion.section
          variants={itemVariants}
          className="border-t border-slate-100 dark:border-slate-800 pt-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Engineered with the latest web standards for performance,
            type safety, and developer experience.
          </p>
          <span className="text-xs font-semibold tracking-widest uppercase text-slate-300 dark:text-slate-600 shrink-0">
            Nextera · v2.0
          </span>
        </motion.section>

      </motion.div>
    </div>
  );
}

// ----------------------------------------------------------------
// TechEntry: a borderless entry with a muted category eyebrow,
// bold label, and supporting detail. No icon, no card chrome.
// ----------------------------------------------------------------

function TechEntry({
  category,
  label,
  detail,
}: {
  category: string;
  label: string;
  detail: string;
}) {
  return (
    <div className="space-y-2">
      {/* Category eyebrow */}
      <p className="text-[10px] font-bold tracking-widest uppercase text-slate-400 dark:text-slate-500">
        {category}
      </p>
      {/* Tech label */}
      <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
        {label}
      </h3>
      {/* Supporting detail */}
      <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
        {detail}
      </p>
    </div>
  );
}

// ----------------------------------------------------------------
// ArchCard: a portal description panel with a colored accent bar
// at the top and a capability list at the bottom.
// The first column has no left padding; others get left padding
// to sit cleanly against the divider line.
// ----------------------------------------------------------------

function ArchCard({
  portal,
  accentClass,
  description,
  capabilities,
  index,
}: {
  portal: string;
  accentClass: string;
  description: string;
  capabilities: string[];
  index: number;
}) {
  return (
    <div className={`space-y-6 py-2 ${index > 0 ? "lg:pl-10" : ""} ${index < 2 ? "pb-10 lg:pb-2 lg:pr-10" : ""}`}>

      {/* Accent bar */}
      <div className={`h-0.5 w-10 rounded-full ${accentClass}`} />

      {/* Portal name */}
      <div className="space-y-3">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
          {portal}
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          {description}
        </p>
      </div>

      {/* Capabilities list */}
      <ul className="space-y-1.5">
        {capabilities.map((cap) => (
          <li
            key={cap}
            className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300 font-medium"
          >
            {/* Minimal bullet using a thin dash */}
            <span className="w-3 h-px bg-slate-300 dark:bg-slate-600 shrink-0" />
            {cap}
          </li>
        ))}
      </ul>
    </div>
  );
}