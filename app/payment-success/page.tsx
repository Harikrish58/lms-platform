import Link from "next/link";
import { CheckCircle2, ArrowRight, BookOpen } from "lucide-react";

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-xl bg-emerald-50 p-2">
              <CheckCircle2 className="h-6 w-6 text-emerald-600" />
            </div>

            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Payment Successful
              </h1>

              <p className="mt-1 text-slate-600">
                Your course purchase has been completed successfully.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 bg-slate-50/50 px-6 py-4">
              <h2 className="font-semibold text-slate-900">
                Purchase Status
              </h2>
            </div>

            <div className="p-6">
              <div className="space-y-5">
                <StatusRow
                  label="Payment Status"
                  value="Completed"
                  color="emerald"
                />

                <StatusRow
                  label="Enrollment Status"
                  value="Active"
                  color="emerald"
                />

                <StatusRow
                  label="Course Access"
                  value="Granted"
                  color="emerald"
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 bg-slate-50/50 px-6 py-4">
              <h2 className="font-semibold text-slate-900">
                What Happens Next?
              </h2>
            </div>

            <div className="p-6">
              <ul className="space-y-3 text-slate-600">
                <li>• Access course content immediately.</li>
                <li>• Track your learning progress.</li>
                <li>• Complete lessons and assessments.</li>
                <li>• Earn a certificate upon completion.</li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/my-courses"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 py-3 font-medium text-white transition hover:bg-teal-700"
            >
              <BookOpen className="h-4 w-4" />
              Go To My Learning
            </Link>

            <Link
              href="/courses"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Browse More Courses
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusRow({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: "emerald";
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-600">{label}</span>

      <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
        {value}
      </span>
    </div>
  );
}