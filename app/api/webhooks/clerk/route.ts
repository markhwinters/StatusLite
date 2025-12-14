import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error("CLERK_WEBHOOK_SECRET is not set");
  }

  const svix_id = req.headers.get("svix-id");
  const svix_timestamp = req.headers.get("svix-timestamp");
  const svix_signature = req.headers.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json({ error: "Missing headers" }, { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: any;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    });
  } catch (err) {
    console.error("Webhook verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const eventType = evt.type;

  console.log(`Webhook received: ${eventType}`);

  try {
    switch (eventType) {
      case "organization.deleted":
        await handleOrganizationDeleted(evt.data);
        break;

      case "user.created":
        await handleUserCreated(evt.data);
        break;

      case "user.updated":
        await handleUserUpdated(evt.data);
        break;

      case "user.deleted":
        await handleUserDeleted(evt.data);
        break;

      default:
        console.log(`Unhandled event type: ${eventType}`);
    }

    return NextResponse.json({ received: true, type: eventType });
  } catch (error: any) {
    console.error(`Error handling webhook ${eventType}:`, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function handleOrganizationDeleted(data: any) {
  const { id: clerkOrgId } = data;

  console.log(`Deleting all projects for organization: ${clerkOrgId}`);

  const projects = await prisma.project.findMany({
    where: { organizationId: clerkOrgId },
    select: { id: true, name: true },
  });

  if (projects.length === 0) {
    console.log(`No projects found for organization ${clerkOrgId}`);
    return;
  }

  console.log(`Found ${projects.length} projects to delete`);

  const projectIds = projects.map((p) => p.id);

  await prisma.$transaction([
    prisma.monitorCheck.deleteMany({
      where: {
        monitor: {
          projectId: { in: projectIds },
        },
      },
    }),
    prisma.monitor.deleteMany({
      where: { projectId: { in: projectIds } },
    }),
    prisma.incidentUpdate.deleteMany({
      where: {
        incident: {
          projectId: { in: projectIds },
        },
      },
    }),
    prisma.incident.deleteMany({
      where: { projectId: { in: projectIds } },
    }),
    prisma.component.deleteMany({
      where: { projectId: { in: projectIds } },
    }),
    prisma.subscriber.deleteMany({
      where: { projectId: { in: projectIds } },
    }),
    prisma.project.deleteMany({
      where: { organizationId: clerkOrgId },
    }),
  ]);

  console.log(
    `Organization ${clerkOrgId}: Deleted ${projects.length} projects and all associated data`
  );
}

async function handleUserCreated(data: any) {
  const { id: clerkId, email_addresses, first_name, last_name } = data;

  const primaryEmail = email_addresses?.find(
    (e: any) => e.id === data.primary_email_address_id
  )?.email_address;

  if (!primaryEmail) {
    console.log(`User ${clerkId} has no email, skipping`);
    return;
  }

  const existingUser = await prisma.user.findUnique({
    where: { clerkId },
  });

  if (existingUser) {
    console.log(`User ${clerkId} already exists`);
    return;
  }

  await prisma.user.create({
    data: {
      clerkId,
      email: primaryEmail,
      name: [first_name, last_name].filter(Boolean).join(" ") || null,
    },
  });

  console.log(`User created: ${primaryEmail} (${clerkId})`);
}

async function handleUserUpdated(data: any) {
  const { id: clerkId, email_addresses, first_name, last_name } = data;

  const primaryEmail = email_addresses?.find(
    (e: any) => e.id === data.primary_email_address_id
  )?.email_address;

  const existingUser = await prisma.user.findUnique({
    where: { clerkId },
  });

  if (!existingUser) {
    console.log(`User ${clerkId} not found, creating...`);
    if (primaryEmail) {
      await prisma.user.create({
        data: {
          clerkId,
          email: primaryEmail,
          name: [first_name, last_name].filter(Boolean).join(" ") || null,
        },
      });
    }
    return;
  }

  await prisma.user.update({
    where: { clerkId },
    data: {
      email: primaryEmail || existingUser.email,
      name: [first_name, last_name].filter(Boolean).join(" ") || null,
    },
  });

  console.log(`User updated: ${clerkId}`);
}

async function handleUserDeleted(data: any) {
  const { id: clerkId } = data;

  console.log(`Deleting user: ${clerkId}`);

  const user = await prisma.user.findUnique({
    where: { clerkId },
    include: {
      projects: {
        where: { organizationId: null },
        select: { id: true },
      },
    },
  });

  if (!user) {
    console.log(`User ${clerkId} not found in database`);
    return;
  }

  const personalProjectIds = user.projects.map((p) => p.id);

  if (personalProjectIds.length > 0) {
    console.log(
      `Deleting ${personalProjectIds.length} personal projects for user ${clerkId}`
    );

    await prisma.$transaction([
      prisma.monitorCheck.deleteMany({
        where: {
          monitor: {
            projectId: { in: personalProjectIds },
          },
        },
      }),
      prisma.monitor.deleteMany({
        where: { projectId: { in: personalProjectIds } },
      }),
      prisma.incidentUpdate.deleteMany({
        where: {
          incident: {
            projectId: { in: personalProjectIds },
          },
        },
      }),
      prisma.incident.deleteMany({
        where: { projectId: { in: personalProjectIds } },
      }),
      prisma.component.deleteMany({
        where: { projectId: { in: personalProjectIds } },
      }),
      prisma.subscriber.deleteMany({
        where: { projectId: { in: personalProjectIds } },
      }),
      prisma.project.deleteMany({
        where: { id: { in: personalProjectIds } },
      }),
    ]);
  }

  await prisma.user.delete({
    where: { id: user.id },
  });

  console.log(
    `User ${clerkId} and ${personalProjectIds.length} personal projects deleted`
  );
}

export async function GET() {
  return NextResponse.json({
    message: "Clerk webhook endpoint",
    events: [
      "organization.deleted",
      "user.created",
      "user.updated",
      "user.deleted",
    ],
  });
}
