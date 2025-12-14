"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Folder } from "lucide-react";
import { Project } from "@/lib/store";

interface ProjectLinkProps {
  project: Project;
  isCollapsed: boolean;
}

export default function ProjectLink({
  project,
  isCollapsed,
}: ProjectLinkProps) {
  const pathname = usePathname();
  const isActive = pathname.startsWith(`/dashboard/projects/${project.id}`);

  if (isCollapsed) {
    return (
      <Link
        href={`/dashboard/projects/${project.id}`}
        className={cn(
          "flex items-center justify-center p-2 rounded-lg transition-colors",
          isActive
            ? "bg-white/75 dark:bg-gray-800/50 text-blue-600 dark:text-blue-400"
            : "text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-800/30"
        )}
        title={project.name}
      >
        <Folder className="w-4 h-4" />
      </Link>
    );
  }

  return (
    <Link
      href={`/dashboard/projects/${project.id}`}
      className={cn(
        "flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors",
        isActive
          ? "bg-white/75 dark:bg-gray-800/50 text-blue-600 dark:text-blue-400 font-medium"
          : "text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-800/30"
      )}
    >
      <Folder className="w-4 h-4 flex-shrink-0" />
      <span className="truncate">{project.name}</span>
    </Link>
  );
}
