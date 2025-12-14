import { clerkClient } from "@clerk/nextjs/server";
import prisma from "./prisma";
//import { getPlanLimits, PlanType } from './plans'

export async function getOrganizationPlan(orgId: string): Promise<PlanType> {
  try {
    const client = await clerkClient();
    const org = await client.organizations.getOrganization({
      organizationId: orgId,
    });
    const plan = org.publicMetadata?.plan as PlanType;
    return plan || "free";
  } catch (error) {
    console.error("Error getting organization plan:", error);
    return "free";
  }
}

export async function canCreateProject(
  orgId: string | null
): Promise<{ allowed: boolean; reason?: string }> {
  if (!orgId) {
    return { allowed: true };
  }

  const plan = await getOrganizationPlan(orgId);
  const limits = getPlanLimits(plan);

  const projectCount = await prisma.project.count({
    where: { organizationId: orgId },
  });

  if (projectCount >= limits.maxProjects) {
    return {
      allowed: false,
      reason: `You've reached the maximum of ${limits.maxProjects} projects on the ${plan} plan. Upgrade to create more.`,
    };
  }

  return { allowed: true };
}

export async function canCreateMonitor(
  projectId: string
): Promise<{ allowed: boolean; reason?: string }> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      organizationId: true,
      _count: {
        select: { monitors: true },
      },
    },
  });

  if (!project?.organizationId) {
    return { allowed: true };
  }

  const plan = await getOrganizationPlan(project.organizationId);
  const limits = getPlanLimits(plan);

  if (project._count.monitors >= limits.maxMonitors) {
    return {
      allowed: false,
      reason: `You've reached the maximum of ${limits.maxMonitors} monitors on the ${plan} plan. Upgrade to create more.`,
    };
  }

  return { allowed: true };
}

export async function canCreateComponent(
  projectId: string
): Promise<{ allowed: boolean; reason?: string }> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      organizationId: true,
      _count: {
        select: { components: true },
      },
    },
  });

  if (!project?.organizationId) {
    return { allowed: true };
  }

  const plan = await getOrganizationPlan(project.organizationId);
  const limits = getPlanLimits(plan);

  if (project._count.components >= limits.maxComponentsPerProject) {
    return {
      allowed: false,
      reason: `You've reached the maximum of ${limits.maxComponentsPerProject} components per project on the ${plan} plan. Upgrade to create more.`,
    };
  }

  return { allowed: true };
}

export async function getUsageStats(orgId: string | null) {
  if (!orgId) {
    return {
      plan: "free" as PlanType,
      limits: getPlanLimits("free"),
      usage: {
        projects: 0,
        monitors: 0,
        components: 0,
        subscribers: 0,
      },
    };
  }

  const plan = await getOrganizationPlan(orgId);
  const limits = getPlanLimits(plan);

  const projects = await prisma.project.findMany({
    where: { organizationId: orgId },
    select: {
      _count: {
        select: {
          monitors: true,
          components: true,
          subscribers: true,
        },
      },
    },
  });

  const totalMonitors = projects.reduce((sum, p) => sum + p._count.monitors, 0);
  const totalComponents = projects.reduce(
    (sum, p) => sum + p._count.components,
    0
  );
  const totalSubscribers = projects.reduce(
    (sum, p) => sum + p._count.subscribers,
    0
  );

  return {
    plan,
    limits,
    usage: {
      projects: projects.length,
      monitors: totalMonitors,
      components: totalComponents,
      subscribers: totalSubscribers,
    },
  };
}
