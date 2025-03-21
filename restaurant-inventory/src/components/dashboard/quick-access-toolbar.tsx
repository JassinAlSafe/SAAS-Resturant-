import { Button } from "@/components/ui/button";
import {
  FiPlus,
  FiAlertTriangle,
  FiBarChart2,
  FiShoppingCart,
} from "react-icons/fi";
import { useRouter } from "next/navigation";

interface QuickAccessToolbarProps {
  isLoading: boolean;
}

export function QuickAccessToolbar({ isLoading }: QuickAccessToolbarProps) {
  const router = useRouter();

  const quickAccessItems = [
    {
      title: "Add Inventory",
      icon: <FiPlus className="h-5 w-5" />,
      onClick: () => router.push("/inventory/add"),
      accentColor: "bg-blue-500",
      iconBg: "bg-blue-100 text-blue-600",
      hoverEffect: "group-hover:scale-110 group-hover:rotate-3",
    },
    {
      title: "Low Stock",
      icon: <FiAlertTriangle className="h-5 w-5" />,
      onClick: () => router.push("/inventory?filter=low-stock"),
      accentColor: "bg-amber-500",
      iconBg: "bg-amber-100 text-amber-600",
      hoverEffect: "group-hover:scale-110 group-hover:-rotate-3",
    },
    {
      title: "Sales Report",
      icon: <FiBarChart2 className="h-5 w-5" />,
      onClick: () => router.push("/reports/sales"),
      accentColor: "bg-emerald-500",
      iconBg: "bg-emerald-100 text-emerald-600",
      hoverEffect: "group-hover:scale-110 group-hover:rotate-3",
    },
    {
      title: "Orders",
      icon: <FiShoppingCart className="h-5 w-5" />,
      onClick: () => router.push("/orders"),
      accentColor: "bg-purple-500",
      iconBg: "bg-purple-100 text-purple-600",
      hoverEffect: "group-hover:scale-110 group-hover:-rotate-3",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-28 rounded-xl bg-slate-100 animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {quickAccessItems.map((item, index) => (
        <button
          key={index}
          onClick={item.onClick}
          className="relative flex flex-col items-center justify-center h-28 rounded-xl bg-white shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden group"
        >
          {/* Top accent bar */}
          <div className={`absolute top-0 left-0 right-0 h-1.5 ${item.accentColor}`}></div>
          
          {/* Icon */}
          <div className={`relative z-10 flex flex-col items-center justify-center`}>
            <div className={`${item.iconBg} p-3.5 rounded-full mb-3 transition-all duration-300 ${item.hoverEffect}`}>
              {item.icon}
            </div>
            <span className="font-medium text-sm text-slate-700">{item.title}</span>
          </div>
          
          {/* Hover effect */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute inset-0 bg-slate-50 opacity-0 group-hover:opacity-30 transition-opacity"></div>
            <div className="absolute inset-[-100%] top-0 bg-gradient-to-r from-transparent via-white/50 to-transparent transform -translate-x-full group-hover:translate-x-[200%] transition-transform duration-1000"></div>
          </div>
        </button>
      ))}
    </div>
  );
}
