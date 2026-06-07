import Link from "next/link";
import Image from "next/image";
import { FaLinkedin, FaGithub } from "react-icons/fa6";

// Extracted outside the component to prevent recalculation on every render
const CURRENT_YEAR = new Date().getFullYear();

// Centralized Navigation Constants
const PLATFORM_LINKS = [
  { label: "Courses", href: "/courses" },
  { label: "My Learning", href: "/my-courses" },
  { label: "Instructor Dashboard", href: "/instructor/courses" },
];

const RESOURCE_LINKS = [
  { label: "About Project", href: "/about" },
];

const SOCIAL_LINKS = [
  {
    icon: FaLinkedin,
    href: "https://www.linkedin.com/in/hari-krishnan-nagarajan/",
    label: "LinkedIn",
  },
  {
    icon: FaGithub,
    href: "https://github.com/Harikrish58",
    label: "GitHub",
  },
];

export default function Footer() {
  return (
    <footer className="bg-slate-50 border-t border-slate-200 mt-20">
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-2 lg:grid-cols-4 gap-8 text-sm">
        
        {/* Brand & Mission */}
        <div className="col-span-2 lg:col-span-1 flex flex-col gap-4">
          <Link href="/" className="inline-block">
            <div className="relative w-[130px] h-[40px]">
              <Image
                src="/navlogo.png"
                alt="Nextera Logo"
                fill
                className="object-contain"
              />
            </div>
          </Link>
          <p className="text-slate-600 leading-relaxed max-w-xs mt-2 font-medium">
            A modern LMS platform built with Next.js, TypeScript, React Query, and scalable frontend architecture.
          </p>
          
          {/* Social Links */}
          <div className="flex items-center gap-2 mt-2">
            {SOCIAL_LINKS.map((social) => {
              const Icon = social.icon;
              return (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="p-2 rounded-lg text-slate-400 hover:text-teal-600 hover:bg-teal-50 transition-colors"
                >
                  <Icon size={20} />
                </a>
              );
            })}
          </div>
        </div>

        {/* Platform Links */}
        <nav aria-label="Platform">
          <h4 className="font-semibold text-slate-900 mb-4">Platform</h4>
          <ul className="space-y-3">
            {PLATFORM_LINKS.map((link) => (
              <li key={link.href}>
                <Link 
                  href={link.href}
                  className="text-slate-600 hover:text-teal-600 transition-colors font-medium"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Resource Links */}
        <nav aria-label="Resources">
          <h4 className="font-semibold text-slate-900 mb-4">Resources</h4>
          <ul className="space-y-3">
            {RESOURCE_LINKS.map((link) => (
              <li key={link.href}>
                <Link 
                  href={link.href}
                  className="text-slate-600 hover:text-teal-600 transition-colors font-medium"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Contact Info */}
        <address className="not-italic">
          <h4 className="font-semibold text-slate-900 mb-4">Contact</h4>
          <div className="space-y-2 text-slate-600 font-medium">
            <p className="font-semibold text-slate-800">Hari Krishnan Nagarajan</p>
            <p className="font-semibold text-slate-800">+48 739 686 095</p>
            <p className="font-semibold text-slate-800">harikrish61@gmail.com</p>
            <p>Wrocław, Poland</p>
            <p className="text-teal-600 mt-2 block">Available for opportunities</p>
          </div>
        </address>
      </div>

      {/* Copyright Bar */}
      <div className="border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-medium">
          <p>© {CURRENT_YEAR} NextEra. All rights reserved.</p>
          <p>Designed for the future of learning.</p>
        </div>
      </div>
    </footer>
  );
}