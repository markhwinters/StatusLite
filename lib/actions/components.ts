"use server";

import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function createComponent(
  projectId: string,
  data: {
    name: string;
    description?: string;
    status: string;
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

  const maxOrder = await prisma.component.findFirst({
    where: { projectId },
    orderBy: { order: "desc" },
    select: { order: true },
  });

  const component = await prisma.component.create({
    data: {
      ...data,
      projectId,
      order: (maxOrder?.order ?? -1) + 1,
    },
  });

  revalidatePath(`/dashboard/projects/${projectId}/components`);
  return component;
}

export async function updateComponent(
  componentId: string,
  data: {
    name?: string;
    description?: string;
    status?: string;
  }
) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const component = await prisma.component.findUnique({
    where: { id: componentId },
    include: { project: { include: { user: true } } },
  });

  if (!component || component.project.user.clerkId !== userId) {
    throw new Error("Component not found or unauthorized");
  }

  const updated = await prisma.component.update({
    where: { id: componentId },
    data,
  });

  revalidatePath(`/dashboard/projects/${component.projectId}/components`);
  return updated;
}

export async function deleteComponent(componentId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const component = await prisma.component.findUnique({
    where: { id: componentId },
    include: { project: { include: { user: true } } },
  });

  if (!component || component.project.user.clerkId !== userId) {
    throw new Error("Component not found or unauthorized");
  }

  await prisma.component.delete({
    where: { id: componentId },
  });

  revalidatePath(`/dashboard/projects/${component.projectId}/components`);
}

export async function reorderComponents(
  projectId: string,
  componentIds: string[]
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

  await Promise.all(
    componentIds.map((id, index) =>
      prisma.component.update({
        where: { id },
        data: { order: index },
      })
    )
  );

  revalidatePath(`/dashboard/projects/${projectId}/components`);
}
