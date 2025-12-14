"use client";

import { useState } from "react";
import { deleteProject } from "@/lib/actions/projects";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useProjectStore } from "@/lib/store";

export default function DeleteProjectButton({
  projectId,
  projectName,
}: {
  projectId: string;
  projectName: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [confirmName, setConfirmName] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const { removeProject } = useProjectStore();

  const handleDelete = async () => {
    if (confirmName !== projectName) {
      toast.error("Project name does not match");
      return;
    }

    try {
      setIsDeleting(true);
      await deleteProject(projectId);
      removeProject(projectId);
      toast.success("Project deleted");
      router.push("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete project");
      setIsDeleting(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
      >
        <Trash2 className="w-4 h-4" />
        Delete Project
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-md w-full p-6">
        <h2 className="text-xl font-semibold mb-4 text-red-600 dark:text-red-400">
          Delete Project
        </h2>

        <p className="text-gray-700 dark:text-gray-300 mb-4">
          This will permanently delete <strong>{projectName}</strong> and all
          associated data including:
        </p>

        <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 mb-6 space-y-1">
          <li>All components</li>
          <li>All incidents and updates</li>
          <li>All monitors and check history</li>
          <li>All subscribers</li>
        </ul>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            Type <strong>{projectName}</strong> to confirm:
          </label>
          <input
            type="text"
            value={confirmName}
            onChange={(e) => setConfirmName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500"
            placeholder={projectName}
          />
        </div>

        <div className="flex gap-2 justify-end">
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              setConfirmName("");
            }}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={confirmName !== projectName || isDeleting}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeleting ? "Deleting..." : "Delete Forever"}
          </button>
        </div>
      </div>
    </div>
  );
}
