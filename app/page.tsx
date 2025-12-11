import Link from "next/link";

export default function Home() {
  return (
    <div className="container mx-auto py-16 px-4">
      <main className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Welcome to Health Log</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Track your medical history, appointments, and documents in one place.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/medical-history"
            className="block p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
          >
            <h2 className="text-xl font-semibold mb-2">Medical History</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your conditions, medications, and allergies.
            </p>
          </Link>

          <Link
            href="/appointments"
            className="block p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
          >
            <h2 className="text-xl font-semibold mb-2">Appointments</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Track doctor visits, symptoms, and prepare for appointments.
            </p>
          </Link>

          <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 opacity-60">
            <h2 className="text-xl font-semibold mb-2 text-gray-500">Documents</h2>
            <p className="text-gray-500 dark:text-gray-600">
              Coming soon - Upload and manage medical documents.
            </p>
          </div>
        </div>

        <div className="mt-12 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <h3 className="text-lg font-semibold mb-2">Getting Started</h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Start by adding your medical history. Click on the Medical History card above or use the navigation menu.
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Note: All data is stored locally in your browser. Make sure to backup important information.
          </p>
        </div>
      </main>
    </div>
  );
}