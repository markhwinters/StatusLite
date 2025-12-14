export default function StatusBadge({ status }: { status: string }) {
  const getStatusConfig = () => {
    switch (status) {
      case "operational":
        return {
          text: "All Systems Operational",
          icon: "✓",
          bg: "bg-green-50 dark:bg-green-900/20",
          border: "border-green-500",
          textColor: "text-green-700 dark:text-green-400",
        };
      case "degraded":
        return {
          text: "Degraded Performance",
          icon: "⚠",
          bg: "bg-yellow-50 dark:bg-yellow-900/20",
          border: "border-yellow-500",
          textColor: "text-yellow-700 dark:text-yellow-400",
        };
      case "down":
        return {
          text: "Major Outage",
          icon: "✕",
          bg: "bg-red-50 dark:bg-red-900/20",
          border: "border-red-500",
          textColor: "text-red-700 dark:text-red-400",
        };
      case "maintenance":
        return {
          text: "Under Maintenance",
          icon: "🔧",
          bg: "bg-blue-50 dark:bg-blue-900/20",
          border: "border-blue-500",
          textColor: "text-blue-700 dark:text-blue-400",
        };
      default:
        return {
          text: "Unknown Status",
          icon: "?",
          bg: "bg-gray-50 dark:bg-gray-900/20",
          border: "border-gray-500",
          textColor: "text-gray-700 dark:text-gray-400",
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div
      className={`inline-flex items-center gap-3 px-6 py-3 rounded-full border-2 ${config.bg} ${config.border}`}
    >
      <span className="text-2xl">{config.icon}</span>
      <span className={`font-semibold text-lg ${config.textColor}`}>
        {config.text}
      </span>
    </div>
  );
}
