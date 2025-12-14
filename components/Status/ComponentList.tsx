interface Component {
  id: string;
  name: string;
  description: string | null;
  status: string;
}

export default function ComponentList({
  components,
}: {
  components: Component[];
}) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "operational":
        return {
          text: "Operational",
          color: "bg-green-500",
        };
      case "degraded":
        return {
          text: "Degraded",
          color: "bg-yellow-500",
        };
      case "down":
        return {
          text: "Major Outage",
          color: "bg-red-500",
        };
      case "maintenance":
        return {
          text: "Maintenance",
          color: "bg-blue-500",
        };
      default:
        return {
          text: "Unknown",
          color: "bg-gray-500",
        };
    }
  };

  return (
    <div className="space-y-3">
      {components.map((component) => {
        const statusConfig = getStatusConfig(component.status);

        return (
          <div
            key={component.id}
            className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
          >
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 dark:text-white">
                {component.name}
              </h3>
              {component.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {component.description}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${statusConfig.color}`} />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {statusConfig.text}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
