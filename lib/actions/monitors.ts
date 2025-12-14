"use server";

import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function createMonitor(
  projectId: string,
  data: {
    url: string;
    method: string;
    interval: number;
    timeout: number;
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

  const monitor = await prisma.monitor.create({
    data: {
      url: data.url,
      method: data.method,
      interval: data.interval,
      timeout: data.timeout,
      projectId,
      componentId: data.componentId || null,
      expectedStatus: [200, 201, 204],
    },
  });

  revalidatePath(`/dashboard/projects/${projectId}/monitors`);
  return monitor;
}

export async function updateMonitor(
  monitorId: string,
  data: {
    url?: string;
    method?: string;
    interval?: number;
    timeout?: number;
    status?: string;
  }
) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const monitor = await prisma.monitor.findUnique({
    where: { id: monitorId },
    include: { project: { include: { user: true } } },
  });

  if (!monitor || monitor.project.user.clerkId !== userId) {
    throw new Error("Monitor not found or unauthorized");
  }

  const updated = await prisma.monitor.update({
    where: { id: monitorId },
    data,
  });

  revalidatePath(`/dashboard/projects/${monitor.projectId}/monitors`);
  return updated;
}

export async function deleteMonitor(monitorId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const monitor = await prisma.monitor.findUnique({
    where: { id: monitorId },
    include: { project: { include: { user: true } } },
  });

  if (!monitor || monitor.project.user.clerkId !== userId) {
    throw new Error("Monitor not found or unauthorized");
  }

  await prisma.monitor.delete({
    where: { id: monitorId },
  });

  revalidatePath(`/dashboard/projects/${monitor.projectId}/monitors`);
}

export async function pauseMonitor(monitorId: string) {
  return updateMonitor(monitorId, { status: "paused" });
}

export async function resumeMonitor(monitorId: string) {
  return updateMonitor(monitorId, { status: "unknown" });
}
