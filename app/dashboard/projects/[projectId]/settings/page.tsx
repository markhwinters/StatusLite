import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import DeleteProjectButton from "@/components/Dashboard/DeleteProjectButton";

interface SettingsPageProps {
  params: Promise<{ projectId: string }>;
}

export default async function IncidentsPage({ params }: SettingsPageProps) {
  const { userId } = await auth();
  if (!userId) notFound();

  const resolvedParams = await params;
  const projectId = resolvedParams.projectId;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) notFound();

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <Link
          href={`/dashboard/projects/${project.id}`}
          className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-4"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to project
        </Link>

        <h1 className="text-3xl font-bold mb-8">Project Settings</h1>

        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
            <h2 className="text-xl font-semibold mb-4">Project Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Project Name
                </label>
                <input
                  type="text"
                  value={project.name}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Slug</label>
                <input
                  type="text"
                  value={project.slug}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Status page URL: {process.env.NEXT_PUBLIC_APP_URL}/status/
                  {project.slug}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-lg border border-red-200 dark:border-red-900 p-6">
            <h2 className="text-xl font-semibold mb-2 text-red-600 dark:text-red-400">
              Danger Zone
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Once you delete a project, there is no going back. Please be
              certain.
            </p>
            <DeleteProjectButton
              projectId={project.id}
              projectName={project.name}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
