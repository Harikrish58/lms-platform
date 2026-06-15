import Link from "next/link";
import { AlertTriangle, ArrowLeft } from "lucide-react";

export default function PaymentCancelPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-xl bg-amber-50 p-2">
              <AlertTriangle className="h-6 w-6 text-amber-600" />
            </div>

            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Payment Cancelled
              </h1>

              <p className="mt-1 text-slate-600">
                Your payment was not completed and no enrollment was created.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 bg-slate-50/50 px-6 py-4">
              <h2 className="font-semibold text-slate-900">
                Payment Status
              </h2>
            </div>

            <div className="space-y-5 p-6">
              <StatusRow
                label="Payment Status"
                value="Cancelled"
              />

              <StatusRow
                label="Enrollment Status"
                value="Not Active"
              />

              <StatusRow
                label="Course Access"
                value="Not Granted"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 bg-slate-50/50 px-6 py-4">
              <h2 className="font-semibold text-slate-900">
                Possible Reasons
              </h2>
            </div>

            <div className="p-6">
              <ul className="space-y-3 text-slate-600">
                <li>• Payment was cancelled manually.</li>
                <li>• Payment window was closed.</li>
                <li>• Authentication was not completed.</li>
                <li>• Temporary payment provider issue.</li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/courses"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 py-3 font-medium text-white transition hover:bg-teal-700"
            >
              Return To Courses
            </Link>

            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 font-medium text-slate-700 transition hover:bg-slate-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Back To Home
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
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-600">{label}</span>

      <span className="rounded-full bg-amber-50 px-3 py-1 text-sm font-medium text-amber-700">
        {value}
      </span>
    </div>
  );
}