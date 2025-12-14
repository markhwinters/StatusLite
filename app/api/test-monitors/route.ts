import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import axios from "axios";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

async function handleMonitorDown(monitor: any) {
  const currentFails = monitor.currentFails + 1;

  await prisma.monitor.update({
    where: { id: monitor.id },
    data: {
      currentFails,
      status: currentFails >= monitor.alertAfter ? "down" : monitor.status,
      lastChecked: new Date(),
    },
  });

  if (currentFails === monitor.alertAfter && monitor.componentId) {
    const activeIncident = await prisma.incident.findFirst({
      where: {
        componentId: monitor.componentId,
        status: { not: "resolved" },
      },
    });

    if (!activeIncident) {
      await prisma.incident.create({
        data: {
          title: `${monitor.component?.name || monitor.url} is down`,
          description: `Monitor detected that ${monitor.url} is not responding correctly.`,
          status: "investigating",
          impact: "major",
          projectId: monitor.projectId,
          componentId: monitor.componentId,
          updates: {
            create: {
              message: `Monitor detected that ${monitor.url} is not responding correctly.`,
              status: "investigating",
            },
          },
        },
      });

      await prisma.component.update({
        where: { id: monitor.componentId },
        data: { status: "down" },
      });
    }
  }
}

async function handleMonitorUp(monitor: any) {
  const wasDown = monitor.status === "down";

  await prisma.monitor.update({
    where: { id: monitor.id },
    data: {
      currentFails: 0,
      status: "up",
      lastChecked: new Date(),
    },
  });

  if (wasDown && monitor.componentId) {
    const activeIncident = await prisma.incident.findFirst({
      where: {
        componentId: monitor.componentId,
        status: { not: "resolved" },
      },
    });

    if (activeIncident) {
      await prisma.incident.update({
        where: { id: activeIncident.id },
        data: {
          status: "resolved",
          resolvedAt: new Date(),
          updates: {
            create: {
              message: "Service has been restored and is operating normally.",
              status: "resolved",
            },
          },
        },
      });

      await prisma.component.update({
        where: { id: monitor.componentId },
        data: { status: "operational" },
      });
    }
  }
}

export async function GET(request: NextRequest) {
  try {
    const monitors = await prisma.monitor.findMany({
      where: {
        status: { not: "paused" },
      },
      include: {
        project: true,
        component: true,
      },
      take: 20,
    });

    const results = [];

    for (const monitor of monitors) {
      const shouldCheck =
        !monitor.lastChecked ||
        Date.now() - new Date(monitor.lastChecked).getTime() >=
          monitor.interval * 1000;

      if (!shouldCheck) {
        results.push({
          id: monitor.id,
          url: monitor.url,
          status: "skipped",
          reason: "Not time to check yet",
        });
        continue;
      }

      try {
        const start = Date.now();
        const response = await axios({
          method: monitor.method,
          url: monitor.url,
          timeout: monitor.timeout * 1000,
          validateStatus: () => true,
          headers: {
            "User-Agent": "StatusLite-Monitor/1.0",
          },
        });
        const responseTime = Date.now() - start;

        const success = monitor.expectedStatus.includes(response.status);

        await prisma.monitorCheck.create({
          data: {
            monitorId: monitor.id,
            status: response.status,
            responseTime,
            success,
          },
        });

        await prisma.monitor.update({
          where: { id: monitor.id },
          data: { lastStatus: response.status },
        });

        if (success) {
          await handleMonitorUp(monitor);
          results.push({
            id: monitor.id,
            url: monitor.url,
            status: "up",
            responseTime,
            httpStatus: response.status,
          });
        } else {
          await handleMonitorDown(monitor);
          results.push({
            id: monitor.id,
            url: monitor.url,
            status: "down",
            httpStatus: response.status,
            expected: monitor.expectedStatus,
          });
        }
      } catch (error: any) {
        await prisma.monitorCheck.create({
          data: {
            monitorId: monitor.id,
            status: 0,
            responseTime: 0,
            success: false,
            errorMessage: error.message,
          },
        });

        await handleMonitorDown(monitor);
        results.push({
          id: monitor.id,
          url: monitor.url,
          status: "error",
          error: error.message,
        });
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      totalMonitors: monitors.length,
      checked: results.filter((r) => r.status !== "skipped").length,
      skipped: results.filter((r) => r.status === "skipped").length,
      results,
    });
  } catch (error: any) {
    console.error("Monitor check error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}
