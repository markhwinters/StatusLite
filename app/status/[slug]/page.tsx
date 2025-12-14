import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import StatusBadge from "@/components/Status/StatusBadge";
import ComponentList from "@/components/Status/ComponentList";
import IncidentList from "@/components/Status/IncidentList";
import SubscribeForm from "@/components/Status/SubscribeForm";

interface StatusPageProps {
  params: Promise<{ slug: string }>;
}

export default async function StatusPageprops({ params }: StatusPageProps) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  const project = await prisma.project.findUnique({
    where: { slug },
    include: {
      components: {
        orderBy: { order: "asc" },
      },
      incidents: {
        where: {
          OR: [
            { status: { not: "resolved" } },
            {
              resolvedAt: {
                gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
              },
            },
          ],
        },
        orderBy: { startedAt: "desc" },
        include: {
          component: true,
          updates: {
            orderBy: { createdAt: "desc" },
          },
        },
      },
    },
  });

  if (!project) notFound();

  const calculateOverallStatus = () => {
    if (project.components.some((c) => c.status === "down")) return "down";
    if (project.components.some((c) => c.status === "degraded"))
      return "degraded";
    if (project.components.some((c) => c.status === "maintenance"))
      return "maintenance";
    return "operational";
  };

  const overallStatus = calculateOverallStatus();
  const activeIncidents = project.incidents.filter(
    (i) => i.status !== "resolved"
  );
  const recentIncidents = project.incidents.filter(
    (i) => i.status === "resolved"
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
            {project.name}
          </h1>
          <StatusBadge status={overallStatus} />
        </div>

        {activeIncidents.length > 0 && (
          <div className="mb-12">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 border-l-4 border-orange-500">
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <span className="text-orange-500">⚠️</span>
                Active Incidents
              </h2>
              <IncidentList incidents={activeIncidents} />
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-6">System Status</h2>
          <ComponentList components={project.components} />
        </div>

        {recentIncidents.length > 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-6">Recent Incidents</h2>
            <IncidentList incidents={recentIncidents} showResolved />
          </div>
        )}

        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Subscribe to Updates</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Get notified when we post updates
          </p>
          <SubscribeForm projectId={project.id} />
        </div>

        <div className="text-center mt-8 text-sm text-gray-500">
          <p>Powered by StatusLite</p>
        </div>
      </div>
    </div>
  );
}
