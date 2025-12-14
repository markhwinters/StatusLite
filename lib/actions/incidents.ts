"use server";

import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function createIncident(
  projectId: string,
  data: {
    title: string;
    description: string;
    status: string;
    impact: string;
    componentId?: string;
  }
) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { user: true },
  });

  if (!project || project.user.clerkId !== userId) {
    throw new Error("Project not found or unauthorized");
  }

  const incident = await prisma.incident.create({
    data: {
      title: data.title,
      description: data.description,
      status: data.status,
      impact: data.impact,
      projectId,
      componentId: data.componentId || null,
      updates: {
        create: {
          message: data.description,
          status: data.status,
        },
      },
    },
  });

  if (data.componentId) {
    let componentStatus = "operational";
    if (data.impact === "critical") componentStatus = "down";
    else if (data.impact === "major") componentStatus = "degraded";
    else if (data.impact === "minor") componentStatus = "degraded";

    await prisma.component.update({
      where: { id: data.componentId },
      data: { status: componentStatus },
    });
  }

  revalidatePath(`/dashboard/projects/${projectId}/incidents`);
  revalidatePath(`/status/${project.slug}`);
  return incident;
}

export async function addIncidentUpdate(
  incidentId: string,
  data: {
    message: string;
    status: string;
  }
) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const incident = await prisma.incident.findUnique({
    where: { id: incidentId },
    include: { project: { include: { user: true } } },
  });

  if (!incident || incident.project.user.clerkId !== userId) {
    throw new Error("Incident not found or unauthorized");
  }

  const update = await prisma.incidentUpdate.create({
    data: {
      incidentId,
      message: data.message,
      status: data.status,
    },
  });

  await prisma.incident.update({
    where: { id: incidentId },
    data: {
      status: data.status,
      resolvedAt: data.status === "resolved" ? new Date() : null,
    },
  });

  if (data.status === "resolved" && incident.componentId) {
    await prisma.component.update({
      where: { id: incident.componentId },
      data: { status: "operational" },
    });
  }

  revalidatePath(`/dashboard/projects/${incident.projectId}/incidents`);
  revalidatePath(`/status/${incident.project.slug}`);
  return update;
}
