import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import ComponentList from "@/components/Dashboard/ComponentList";
import CreateComponentButton from "@/components/Dashboard/CreateComponentButton";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

interface ComponentPageProps {
  params: Promise<{ projectId: string }>;
}

export default async function ComponentsPage({ params }: ComponentPageProps) {
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
    },
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

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Components</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage the components displayed on your status page
            </p>
          </div>
          <CreateComponentButton projectId={project.id} />
        </div>

        <ComponentList components={project.components} projectId={project.id} />
      </div>
    </div>
  );
}
