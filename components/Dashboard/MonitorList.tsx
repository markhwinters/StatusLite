"use client";

import { useState } from "react";
import { Trash2, Pause, Play, Globe } from "lucide-react";
import {
  deleteMonitor,
  pauseMonitor,
  resumeMonitor,
} from "@/lib/actions/monitors";
import { toast } from "sonner";

interface Monitor {
  id: string;
  url: string;
  method: string;
  interval: number;
  timeout: number;
  status: string;
  lastChecked: Date | null;
  lastStatus: number | null;
  component: {
    id: string;
    name: string;
  } | null;
}

export default function MonitorList({ monitors }: { monitors: Monitor[] }) {
  const [actioningId, setActioningId] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "up":
        return "bg-green-500";
      case "down":
        return "bg-red-500";
      case "paused":
        return "bg-gray-500";
      default:
        return "bg-yellow-500";
    }
  };

  const getStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const handleDelete = async (monitorId: string) => {
    if (!confirm("Are you sure you want to delete this monitor?")) return;

    try {
      setActioningId(monitorId);
      await deleteMonitor(monitorId);
      toast.success("Monitor deleted");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete monitor");
    } finally {
      setActioningId(null);
    }
  };

  const handlePause = async (monitorId: string) => {
    try {
      setActioningId(monitorId);
      await pauseMonitor(monitorId);
      toast.success("Monitor paused");
    } catch (error: any) {
      toast.error(error.message || "Failed to pause monitor");
    } finally {
      setActioningId(null);
    }
  };

  const handleResume = async (monitorId: string) => {
    try {
      setActioningId(monitorId);
      await resumeMonitor(monitorId);
      toast.success("Monitor resumed");
    } catch (error: any) {
      toast.error(error.message || "Failed to resume monitor");
    } finally {
      setActioningId(null);
    }
  };

  if (monitors.length === 0) {
    return (
      <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
        <Globe className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-600 dark:text-gray-400 mb-4">No monitors yet</p>
        <p className="text-sm text-gray-500">
          Create a monitor to automatically check your service health
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {monitors.map((monitor) => (
        <div
          key={monitor.id}
          className="p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${getStatusColor(monitor.status)}`}
              />
              <span className="font-medium">
                {getStatusLabel(monitor.status)}
              </span>
            </div>
            <div className="flex items-center gap-1">
              {monitor.status === "paused" ? (
                <button
                  onClick={() => handleResume(monitor.id)}
                  disabled={actioningId === monitor.id}
                  className="p-2 hover:bg-green-50 dark:hover:bg-green-900/20 text-green-600 dark:text-green-400 rounded transition-colors disabled:opacity-50"
                  title="Resume"
                >
                  <Play className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => handlePause(monitor.id)}
                  disabled={actioningId === monitor.id}
                  className="p-2 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 rounded transition-colors disabled:opacity-50"
                  title="Pause"
                >
                  <Pause className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => handleDelete(monitor.id)}
                disabled={actioningId === monitor.id}
                className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded transition-colors disabled:opacity-50"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <div>
              <span className="text-gray-600 dark:text-gray-400">URL:</span>
              <p className="font-mono text-xs break-all">{monitor.url}</p>
            </div>

            {monitor.component && (
              <div>
                <span className="text-gray-600 dark:text-gray-400">
                  Component:
                </span>
                <p>{monitor.component.name}</p>
              </div>
            )}

            <div className="flex gap-4 pt-2">
              <div>
                <span className="text-gray-600 dark:text-gray-400">
                  Method:
                </span>
                <p className="font-medium">{monitor.method}</p>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">
                  Interval:
                </span>
                <p className="font-medium">{monitor.interval}s</p>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">
                  Timeout:
                </span>
                <p className="font-medium">{monitor.timeout}s</p>
              </div>
            </div>

            {monitor.lastChecked && (
              <div className="pt-2 border-t border-gray-200 dark:border-gray-800">
                <span className="text-gray-600 dark:text-gray-400">
                  Last checked:
                </span>
                <p className="text-xs">
                  {new Date(monitor.lastChecked).toLocaleString()}
                </p>
                {monitor.lastStatus && (
                  <p className="text-xs text-gray-500 mt-1">
                    Status code: {monitor.lastStatus}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
