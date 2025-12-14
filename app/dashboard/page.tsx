"use client";

import { useEffect } from "react";
import { useProjectStore } from "@/lib/store";
import { useOrganization } from "@clerk/nextjs";
import { getProjects } from "@/lib/actions/projects";
import Link from "next/link";
import { Folder } from "lucide-react";

export default function DashboardPage() {
  const { projects, setProjects } = useProjectStore();
  const { organization } = useOrganization();

  useEffect(() => {
    const loadProjects = async () => {
      const fetchedProjects = await getProjects();
      setProjects(fetchedProjects);
    };

    loadProjects();
  }, [setProjects, organization?.id]);

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          {organization
            ? `Managing projects for ${organization.name}`
            : "Manage your personal status pages and monitor your services"}
        </p>

        {projects.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
            <Folder className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold mb-2">No projects yet</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Create your first project to get started
            </p>
            <p className="text-sm text-gray-500">
              Click the <span className="font-semibold">+</span> button in the
              sidebar
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/dashboard/projects/${project.id}`}
                className="p-6 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <Folder className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg mb-1 truncate">
                      {project.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                      statuslite.com/{project.slug}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
