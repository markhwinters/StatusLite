interface Incident {
  id: string;
  title: string;
  description: string | null;
  status: string;
  impact: string;
  startedAt: Date;
  resolvedAt: Date | null;
  component: {
    id: string;
    name: string;
  } | null;
  updates: {
    id: string;
    message: string;
    status: string;
    createdAt: Date;
  }[];
}

export default function IncidentList({
  incidents,
  showResolved = false,
}: {
  incidents: Incident[];
  showResolved?: boolean;
}) {
  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "critical":
        return "text-red-600 dark:text-red-400";
      case "major":
        return "text-orange-600 dark:text-orange-400";
      case "minor":
        return "text-yellow-600 dark:text-yellow-400";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "resolved":
        return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400";
      case "monitoring":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400";
      case "identified":
        return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400";
      default:
        return "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400";
    }
  };

  return (
    <div className="space-y-6">
      {incidents.map((incident) => (
        <div
          key={incident.id}
          className="border-l-4 border-gray-300 dark:border-gray-700 pl-4"
        >
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                {incident.title}
              </h3>
              {incident.component && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Affects: {incident.component.name}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <span
                className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(incident.status)}`}
              >
                {incident.status.toUpperCase()}
              </span>
              <span
                className={`px-2 py-1 text-xs font-medium ${getImpactColor(incident.impact)}`}
              >
                {incident.impact.toUpperCase()}
              </span>
            </div>
          </div>

          <div className="space-y-3 mt-4">
            {incident.updates.map((update, index) => (
              <div
                key={update.id}
                className={`p-3 rounded-lg ${
                  index === 0
                    ? "bg-blue-50 dark:bg-blue-900/20"
                    : "bg-gray-50 dark:bg-gray-800/50"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded ${getStatusColor(update.status)}`}
                  >
                    {update.status.toUpperCase()}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(update.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                  {update.message}
                </p>
              </div>
            ))}
          </div>

          {showResolved && incident.resolvedAt && (
            <p className="text-xs text-gray-500 mt-2">
              Resolved on {new Date(incident.resolvedAt).toLocaleString()}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
