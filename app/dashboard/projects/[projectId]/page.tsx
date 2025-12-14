import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  Settings,
  Eye,
  ExternalLink,
} from "lucide-react";

interface ProjectPageProps {
  params: Promise<{ projectId: string }>;
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { userId } = await auth();
  if (!userId) notFound();

  const resolvedParams = await params;
  const projectId = resolvedParams.projectId;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      components: {
        orderBy: { order: "asc" },
      },
      incidents: {
        where: { status: { not: "resolved" } },
        orderBy: { startedAt: "desc" },
        take: 5,
      },
      monitors: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
      _count: {
        select: {
          components: true,
          incidents: true,
          monitors: true,
          subscribers: true,
        },
      },
    },
  });

  if (!project) notFound();

  const activeIncidents = project.incidents.length;
  const operationalComponents = project.components.filter(
    (c) => c.status === "operational"
  ).length;
  const totalComponents = project.components.length;

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">{project.name}</h1>
            <p className="text-gray-600 dark:text-gray-400">{project.slug}</p>
          </div>
          <div className="flex gap-2">
            <Link
              href={`/status/${project.slug}`}
              target="_blank"
              className="px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              View Status Page
              <ExternalLink className="w-3 h-3" />
            </Link>
            <Link
              href={`/dashboard/projects/${project.id}/settings`}
              className="px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              Settings
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-2">
              <Activity className="w-4 h-4" />
              <span className="text-sm font-medium">Components</span>
            </div>
            <div className="text-2xl font-bold">
              {operationalComponents}/{totalComponents}
            </div>
            <p className="text-xs text-gray-500 mt-1">Operational</p>
          </div>

          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-2">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-medium">Active Incidents</span>
            </div>
            <div className="text-2xl font-bold">{activeIncidents}</div>
            <p className="text-xs text-gray-500 mt-1">Ongoing issues</p>
          </div>

          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-2">
              <Activity className="w-4 h-4" />
              <span className="text-sm font-medium">Monitors</span>
            </div>
            <div className="text-2xl font-bold">{project._count.monitors}</div>
            <p className="text-xs text-gray-500 mt-1">Active checks</p>
          </div>

          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-2">
              <Activity className="w-4 h-4" />
              <span className="text-sm font-medium">Subscribers</span>
            </div>
            <div className="text-2xl font-bold">
              {project._count.subscribers}
            </div>
            <p className="text-xs text-gray-500 mt-1">Email alerts</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Quick Actions</h2>
            </div>
            <div className="space-y-2">
              <Link
                href={`/dashboard/projects/${project.id}/components`}
                className="block p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
              >
                <div className="font-medium mb-1">Manage Components</div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Add or edit service components
                </p>
              </Link>
              <Link
                href={`/dashboard/projects/${project.id}/incidents`}
                className="block p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
              >
                <div className="font-medium mb-1">Create Incident</div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Report a new service incident
                </p>
              </Link>
              <Link
                href={`/dashboard/projects/${project.id}/monitors`}
                className="block p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
              >
                <div className="font-medium mb-1">Add Monitor</div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Set up automated health checks
                </p>
              </Link>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Recent Activity</h2>
              <Link
                href={`/dashboard/projects/${project.id}/incidents`}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                View all
              </Link>
            </div>
            {project.incidents.length === 0 ? (
              <div className="p-8 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 text-center">
                <p className="text-gray-600 dark:text-gray-400">
                  No active incidents
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {project.incidents.map((incident) => (
                  <Link
                    key={incident.id}
                    href={`/dashboard/projects/${project.id}/incidents/${incident.id}`}
                    className="block p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">
                          {incident.title}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {incident.status} ·{" "}
                          {new Date(incident.startedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
