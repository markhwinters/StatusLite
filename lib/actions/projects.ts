"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function getProjects() {
  const { orgId, userId } = await auth();

  if (!userId) {
    return [];
  }

  const user = await currentUser();
  if (!user) return [];

  let dbUser = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  if (!dbUser) {
    dbUser = await prisma.user.create({
      data: {
        clerkId: userId,
        email: user.emailAddresses[0]?.emailAddress || "",
        name: user.firstName
          ? `${user.firstName} ${user.lastName || ""}`.trim()
          : null,
      },
    });
  }

  if (orgId) {
    // Fetch projects for the user's organization
    const projects = await prisma.project.findMany({
      where: {
        organizationId: orgId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return projects;
  }

  // If no orgId found, return projects where the user is not part of an organization
  const projects = await prisma.project.findMany({
    where: {
      userId: dbUser.id,
      organizationId: null,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return projects;
}

export async function createProject(data: { name: string; slug: string }) {
  const { orgId, userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const user = await currentUser();
  if (!user) throw new Error("User not found");

  let dbUser = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  if (!dbUser) {
    dbUser = await prisma.user.create({
      data: {
        clerkId: userId,
        email: user.emailAddresses[0]?.emailAddress || "",
        name: user.firstName
          ? `${user.firstName} ${user.lastName || ""}`.trim()
          : null,
      },
    });
  }

  if (!orgId) {
    throw new Error("User does not belong to an organization");
  }

  // Check if the project slug already exists
  const existingProject = await prisma.project.findUnique({
    where: { slug: data.slug },
  });

  if (existingProject) {
    throw new Error("Slug already taken");
  }

  // Create the project with the user's organization
  const project = await prisma.project.create({
    data: {
      name: data.name,
      slug: data.slug,
      userId: dbUser.id,
      organizationId: orgId, // Use the orgId from Clerk
      components: {
        create: [
          { name: "Website", status: "operational", order: 0 },
          { name: "API", status: "operational", order: 1 },
          { name: "Database", status: "operational", order: 2 },
        ],
      },
    },
  });

  revalidatePath("/dashboard");
  return project;
}

export async function deleteProject(projectId: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { user: true },
  });

  if (!project || project.user.clerkId !== userId) {
    throw new Error("Project not found or unauthorized");
  }

  await prisma.project.delete({
    where: { id: projectId },
  });

  revalidatePath("/dashboard");
  return { success: true };
}
