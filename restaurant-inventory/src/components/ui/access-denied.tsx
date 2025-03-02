import { FiLock } from "react-icons/fi";

interface AccessDeniedProps {
  title?: string;
  message?: string;
  icon?: React.ReactNode;
}

export function AccessDenied({
  title = "Access Denied",
  message = "You don't have permission to access this page. Please contact your administrator for assistance.",
  icon = <FiLock className="h-12 w-12 text-red-600 dark:text-red-400" />,
}: AccessDeniedProps) {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="bg-red-100 dark:bg-red-900/20 p-6 rounded-full mb-6">
          {icon}
        </div>
        <h2 className="text-xl font-semibold mb-2">{title}</h2>
        <p className="text-muted-foreground max-w-md mb-6">{message}</p>
      </div>
    </div>
  );
}
