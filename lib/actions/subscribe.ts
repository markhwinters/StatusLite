"use server";

import prisma from "@/lib/prisma";
import { nanoid } from "nanoid";

export async function subscribeToUpdates(projectId: string, email: string) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error("Invalid email address");
  }

  const existing = await prisma.subscriber.findUnique({
    where: {
      email_projectId: {
        email,
        projectId,
      },
    },
  });

  if (existing) {
    if (existing.verified) {
      throw new Error("You are already subscribed");
    }
    return existing;
  }

  const verifyToken = nanoid(32);

  const subscriber = await prisma.subscriber.create({
    data: {
      email,
      projectId,
      verifyToken,
      verified: false,
    },
  });

  return subscriber;
}
