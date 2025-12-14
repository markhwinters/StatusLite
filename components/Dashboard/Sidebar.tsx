"use client";

import { cn } from "@/lib/utils";
import {
  ChevronRightIcon,
  ChevronLeftIcon,
  LayoutDashboard,
} from "lucide-react";
import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import CreateProjectButton from "./CreateProjectButton";
import ProjectLink from "./ProjectLink";
import { useProjectStore } from "@/lib/store";
import {
  OrganizationSwitcher,
  useOrganization,
  UserButton,
} from "@clerk/nextjs";
import { getProjects } from "@/lib/actions/projects";

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const { projects, setProjects } = useProjectStore();
  const { organization } = useOrganization();

  const orgId = organization?.id;
  const canCreateProjects = true;

  React.useEffect(() => {
    const loadProjects = async () => {
      const fetchedProjects = await getProjects();
      setProjects(fetchedProjects);
    };

    loadProjects();
  }, [setProjects, orgId]);

  return (
    <div
      className={cn(
        "h-screen border-r border-gray-200 dark:border-gray-800 p-4 bg-gradient-to-b from-blue-50 via-purple-50/80 to-blue-50 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-blue-950/20",
        "transition-all duration-300 ease-in-out flex flex-col",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      <nav className="space-y-2 flex-grow">
        <div className="flex items-center justify-between gap-2 mb-4">
          <div
            className={cn(
              "transition-all duration-300",
              isCollapsed ? "w-0 overflow-hidden" : "w-auto"
            )}
          >
            <UserButton showName />
          </div>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 rounded-lg hover:bg-white/75 dark:hover:bg-gray-800/50 transition-colors flex-shrink-0"
          >
            {isCollapsed ? (
              <ChevronRightIcon className="w-4 h-4" />
            ) : (
              <ChevronLeftIcon className="w-4 h-4" />
            )}
          </button>
        </div>

        <div
          className={cn(
            "transition-all duration-300",
            isCollapsed ? "w-0 overflow-hidden" : "w-auto"
          )}
        >
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-white/75 dark:hover:bg-gray-800/50 rounded-lg transition-colors"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>
        </div>

        <div
          className={cn(
            "pt-4 transition-all duration-300",
            isCollapsed ? "w-0 overflow-hidden" : "w-auto"
          )}
        >
          <div className="px-3 pb-2 text-xs font-semibold text-gray-500 dark:text-gray-400 flex items-center justify-between">
            <span>Projects</span>
            {canCreateProjects && <CreateProjectButton />}
          </div>
          <div className="space-y-1">
            {projects.length === 0 ? (
              <p className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400">
                No projects yet
              </p>
            ) : (
              projects.map((project) => (
                <ProjectLink
                  key={project.id}
                  project={project}
                  isCollapsed={isCollapsed}
                />
              ))
            )}
          </div>
        </div>
      </nav>

      <div
        className={cn(
          "transition-all duration-300 mt-auto pt-4",
          isCollapsed ? "w-0 overflow-hidden" : "w-auto"
        )}
      >
        <OrganizationSwitcher />
      </div>
    </div>
  );
}
