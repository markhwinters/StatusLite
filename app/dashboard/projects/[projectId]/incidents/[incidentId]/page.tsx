import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import AddUpdateForm from "@/components/Dashboard/IncidentUpdateForm";

export default async function IncidentDetailPage({
  params,
}: {
  params: Promise<{ projectId: string; incidentId: string }>;
}) {
  const { userId } = await auth();
  if (!userId) notFound();

  const { projectId, incidentId } = await params;

  const incident = await prisma.incident.findUnique({
    where: { id: incidentId },
    include: {
      project: true,
      component: true,
      updates: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!incident || incident.projectId !== projectId) notFound();

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "critical":
        return "bg-red-600 text-white";
      case "major":
        return "bg-orange-600 text-white";
      case "minor":
        return "bg-yellow-600 text-white";
      default:
        return "bg-gray-600 text-white";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "resolved":
        return "bg-green-600 text-white";
      case "monitoring":
        return "bg-blue-600 text-white";
      case "identified":
        return "bg-yellow-600 text-white";
      default:
        return "bg-orange-600 text-white";
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <Link
          href={`/dashboard/projects/${projectId}/incidents`}
          className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-4"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to incidents
        </Link>

        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 mb-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <h1 className="text-2xl font-bold">{incident.title}</h1>
            <div className="flex gap-2">
              <span
                className={`px-3 py-1 text-sm font-medium rounded ${getImpactColor(incident.impact)}`}
              >
                {incident.impact.toUpperCase()}
              </span>
              <span
                className={`px-3 py-1 text-sm font-medium rounded ${getStatusColor(incident.status)}`}
              >
                {incident.status.toUpperCase()}
              </span>
            </div>
          </div>

          {incident.component && (
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              Affected Component:{" "}
              <span className="font-medium">{incident.component.name}</span>
            </p>
          )}

          <div className="text-sm text-gray-500">
            Started: {new Date(incident.startedAt).toLocaleString()}
            {incident.resolvedAt && (
              <> · Resolved: {new Date(incident.resolvedAt).toLocaleString()}</>
            )}
          </div>
        </div>

        {incident.status !== "resolved" && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Add Update</h2>
            <AddUpdateForm incidentId={incident.id} />
          </div>
        )}

        <div>
          <h2 className="text-xl font-semibold mb-4">Updates</h2>
          <div className="space-y-4">
            {incident.updates.map((update, index) => (
              <div
                key={update.id}
                className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(update.status)}`}
                  >
                    {update.status.toUpperCase()}
                  </span>
                  <span className="text-sm text-gray-500">
                    {new Date(update.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-gray-700 dark:text-gray-300">
                  {update.message}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
