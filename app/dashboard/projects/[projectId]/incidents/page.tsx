import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, AlertTriangle, CheckCircle } from "lucide-react";
import CreateIncidentButton from "@/components/Dashboard/CreateIncidentButton";

interface IncidentsPageProps {
  params: Promise<{ projectId: string }>;
}

export default async function IncidentsPage({ params }: IncidentsPageProps) {
  const { userId } = await auth();
  if (!userId) notFound();

  const resolvedParams = await params;
  const projectId = resolvedParams.projectId;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      components: true,
      incidents: {
        orderBy: { startedAt: "desc" },
        include: {
          component: true,
          updates: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      },
    },
  });

  if (!project) notFound();

  const activeIncidents = project.incidents.filter(
    (i) => i.status !== "resolved"
  );
  const resolvedIncidents = project.incidents.filter(
    (i) => i.status === "resolved"
  );

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "critical":
        return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20";
      case "major":
        return "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20";
      case "minor":
        return "text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20";
      default:
        return "text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20";
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <Link
          href={`d/dashboard/projects/${project.id}`}
          className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-4"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to project
        </Link>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Incidents</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Create and manage service incidents
            </p>
          </div>
          <CreateIncidentButton
            projectId={project.id}
            components={project.components}
          />
        </div>

        {activeIncidents.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              Active Incidents ({activeIncidents.length})
            </h2>
            <div className="space-y-3">
              {activeIncidents.map((incident) => (
                <Link
                  key={incident.id}
                  href={`d/dashboard/projects/${project.id}/incidents/${incident.id}`}
                  className="block p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{incident.title}</h3>
                      {incident.component && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          Affects: {incident.component.name}
                        </p>
                      )}
                      {incident.updates[0] && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {incident.updates[0].message}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded ${getImpactColor(incident.impact)}`}
                      >
                        {incident.impact.toUpperCase()}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(incident.startedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            Resolved Incidents
          </h2>
          {resolvedIncidents.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
              <p className="text-gray-600 dark:text-gray-400">
                No resolved incidents
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {resolvedIncidents.slice(0, 10).map((incident) => (
                <Link
                  key={incident.id}
                  href={`d/dashboard/projects/${project.id}/incidents/${incident.id}`}
                  className="block p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-blue-500 dark:hover:border-blue-500 transition-colors opacity-60 hover:opacity-100"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{incident.title}</h3>
                      {incident.component && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Affected: {incident.component.name}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                        RESOLVED
                      </span>
                      <span className="text-xs text-gray-500">
                        {incident.resolvedAt &&
                          new Date(incident.resolvedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
