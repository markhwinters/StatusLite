"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { addIncidentUpdate } from "@/lib/actions/incidents";
import { toast } from "sonner";

const updateSchema = z.object({
  message: z.string().min(1, "Message is required"),
  status: z.enum(["investigating", "identified", "monitoring", "resolved"]),
});

type UpdateFormData = z.infer<typeof updateSchema>;

export default function AddUpdateForm({ incidentId }: { incidentId: string }) {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UpdateFormData>({
    resolver: zodResolver(updateSchema),
    defaultValues: {
      status: "monitoring",
    },
  });

  const onSubmit = async (data: UpdateFormData) => {
    try {
      setIsLoading(true);
      await addIncidentUpdate(incidentId, data);
      toast.success("Update added");
      reset();
    } catch (error: any) {
      toast.error(error.message || "Failed to add update");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4"
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Update Message
          </label>
          <textarea
            {...register("message")}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Provide an update on the incident status..."
          />
          {errors.message && (
            <p className="text-red-500 text-sm mt-1">
              {errors.message.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">New Status</label>
          <select
            {...register("status")}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="investigating">Investigating</option>
            <option value="identified">Identified</option>
            <option value="monitoring">Monitoring</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>

        <button
          type="submit"
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          disabled={isLoading}
        >
          {isLoading ? "Adding Update..." : "Add Update"}
        </button>
      </div>
    </form>
  );
}
