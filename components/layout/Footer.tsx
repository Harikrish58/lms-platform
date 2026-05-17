import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t mt-20">
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-4 gap-8 text-sm">

        {/* Brand */}
        <div>
          <h3 className="font-semibold text-lg mb-2">NextEra</h3>
          <p className="text-gray-600">
            A modern learning platform to build real-world skills step by step.
          </p>
        </div>

        {/* Links */}
        <div>
          <h4 className="font-medium mb-3">Platform</h4>
          <ul className="space-y-2 text-gray-600">
            <li><Link href="/courses">Courses</Link></li>
            <li><Link href="/my-courses">My Learning</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-medium mb-3">Resources</h4>
          <ul className="space-y-2 text-gray-600">
            <li><Link href="#">Help Center</Link></li>
            <li><Link href="#">Privacy Policy</Link></li>
            <li><Link href="#">Terms</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-medium mb-3">Contact</h4>
          <p className="text-gray-600">
            support@nextera.com
          </p>
        </div>
      </div>

      <div className="text-center text-xs text-gray-500 pb-6">
        © {new Date().getFullYear()} NextEra. All rights reserved.
      </div>
    </footer>
  );
}