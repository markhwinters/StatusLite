import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import MonitorList from "@/components/Dashboard/MonitorList";
import CreateMonitorButton from "@/components/Dashboard/CreateMonitorButton";

interface MonitorPageProps {
  params: Promise<{ projectId: string }>;
}

export default async function MonitorPage({ params }: MonitorPageProps) {
  const { userId } = await auth();
  if (!userId) notFound();

  const resolvedParams = await params;
  const projectId = resolvedParams.projectId;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      components: true,
      monitors: {
        include: {
          component: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!project) notFound();

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <Link
          href={`/dashboard/projects/${project.id}`}
          className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-4"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to project
        </Link>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Monitors</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Set up automated health checks for your services
            </p>
          </div>
          <CreateMonitorButton
            projectId={project.id}
            components={project.components}
          />
        </div>

        <MonitorList monitors={project.monitors} />
      </div>
    </div>
  );
}
