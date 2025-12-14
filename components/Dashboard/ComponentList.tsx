"use client";

import { useState } from "react";
import { Trash2, Edit2 } from "lucide-react";
import { deleteComponent, updateComponent } from "@/lib/actions/components";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const componentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  status: z.enum(["operational", "degraded", "down", "maintenance"]),
});

type ComponentFormData = z.infer<typeof componentSchema>;

interface Component {
  id: string;
  name: string;
  description: string | null;
  status: string;
  order: number;
}

export default function ComponentList({
  components,
  projectId,
}: {
  components: Component[];
  projectId: string;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "operational":
        return "bg-green-500";
      case "degraded":
        return "bg-yellow-500";
      case "down":
        return "bg-red-500";
      case "maintenance":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const handleDelete = async (componentId: string) => {
    if (!confirm("Are you sure you want to delete this component?")) return;

    try {
      setIsDeleting(componentId);
      await deleteComponent(componentId);
      toast.success("Component deleted");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete component");
    } finally {
      setIsDeleting(null);
    }
  };

  if (components.length === 0) {
    return (
      <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          No components yet
        </p>
        <p className="text-sm text-gray-500">
          Click "Add Component" to create your first component
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {components.map((component) => (
        <div
          key={component.id}
          className="p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800"
        >
          {editingId === component.id ? (
            <EditComponentForm
              component={component}
              onCancel={() => setEditingId(null)}
              onSave={() => setEditingId(null)}
            />
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <div
                  className={`w-3 h-3 rounded-full ${getStatusColor(component.status)}`}
                />
                <div className="flex-1">
                  <h3 className="font-medium">{component.name}</h3>
                  {component.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {component.description}
                    </p>
                  )}
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {getStatusLabel(component.status)}
                </span>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={() => setEditingId(component.id)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                  title="Edit"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(component.id)}
                  disabled={isDeleting === component.id}
                  className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded transition-colors disabled:opacity-50"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function EditComponentForm({
  component,
  onCancel,
  onSave,
}: {
  component: Component;
  onCancel: () => void;
  onSave: () => void;
}) {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ComponentFormData>({
    resolver: zodResolver(componentSchema),
    defaultValues: {
      name: component.name,
      description: component.description || "",
      status: component.status as any,
    },
  });

  const onSubmit = async (data: ComponentFormData) => {
    try {
      setIsLoading(true);
      await updateComponent(component.id, data);
      toast.success("Component updated");
      onSave();
    } catch (error: any) {
      toast.error(error.message || "Failed to update component");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <div>
        <input
          {...register("name")}
          type="text"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Component name"
        />
        {errors.name && (
          <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
        )}
      </div>

      <div>
        <input
          {...register("description")}
          type="text"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Description (optional)"
        />
      </div>

      <div>
        <select
          {...register("status")}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="operational">Operational</option>
          <option value="degraded">Degraded Performance</option>
          <option value="down">Major Outage</option>
          <option value="maintenance">Under Maintenance</option>
        </select>
      </div>

      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={onCancel}
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
          {isLoading ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
