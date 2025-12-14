"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createMonitor } from "@/lib/actions/monitors";
import { toast } from "sonner";

const monitorSchema = z.object({
  url: z.string().url("Must be a valid URL"),
  method: z.enum(["GET", "POST", "HEAD"]),
  interval: z
    .number()
    .min(60, "Minimum 60 seconds")
    .max(3600, "Maximum 3600 seconds"),
  timeout: z.number().min(5, "Minimum 5 seconds").max(60, "Maximum 60 seconds"),
  componentId: z.string().optional(),
});

type MonitorFormData = z.infer<typeof monitorSchema>;

interface Component {
  id: string;
  name: string;
}

export default function CreateMonitorButton({
  projectId,
  components,
}: {
  projectId: string;
  components: Component[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<MonitorFormData>({
    resolver: zodResolver(monitorSchema),
    defaultValues: {
      method: "GET",
      interval: 300,
      timeout: 30,
    },
  });

  const onSubmit = async (data: MonitorFormData) => {
    try {
      setIsLoading(true);
      await createMonitor(projectId, {
        ...data,
        componentId: data.componentId || undefined,
      });
      toast.success("Monitor created");
      setIsOpen(false);
      reset();
    } catch (error: any) {
      toast.error(error.message || "Failed to create monitor");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
      >
        <Plus className="w-4 h-4" />
        Add Monitor
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-lg w-full p-6">
        <h2 className="text-xl font-semibold mb-4">Add Monitor</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              URL to Monitor
            </label>
            <input
              {...register("url")}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://api.example.com/health"
            />
            {errors.url && (
              <p className="text-red-500 text-sm mt-1">{errors.url.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Link to Component (optional)
            </label>
            <select
              {...register("componentId")}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">None</option>
              {components.map((component) => (
                <option key={component.id} value={component.id}>
                  {component.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Component status will update automatically based on monitor health
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Method</label>
              <select
                {...register("method")}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="HEAD">HEAD</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Interval (s)
              </label>
              <input
                {...register("interval", { valueAsNumber: true })}
                type="number"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="60"
                max="3600"
              />
              {errors.interval && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.interval.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Timeout (s)
              </label>
              <input
                {...register("timeout", { valueAsNumber: true })}
                type="number"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="5"
                max="60"
              />
              {errors.timeout && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.timeout.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                reset();
              }}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? "Creating..." : "Create Monitor"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
