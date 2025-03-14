"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  FiUsers,
  FiStar,
  FiUserCheck,
  FiUserX,
  FiShoppingCart,
} from "react-icons/fi";
import { Skeleton } from "@/components/ui/skeleton";

interface SupplierStats {
  totalSuppliers: number;
  activeSuppliers: number;
  inactiveSuppliers: number;
  preferredSuppliers: number;
  categoriesCount: number;
  lastOrderDays: number;
}

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
  isLoading?: boolean;
}

const StatCard = ({
  title,
  value,
  subtitle,
  icon,
  color,
  isLoading,
}: StatCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`relative flex flex-col p-6 rounded-xl border bg-white dark:bg-slate-950 shadow-sm ${color}`}
  >
    {isLoading ? (
      <>
        <Skeleton className="h-6 w-32 mb-2" />
        <Skeleton className="h-8 w-16 mb-1" />
        <Skeleton className="h-4 w-24" />
      </>
    ) : (
      <>
        <div className="flex items-center gap-2 mb-2 text-sm font-medium text-slate-600 dark:text-slate-400">
          {icon}
          {title}
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
            {value}
          </span>
          {subtitle && (
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {subtitle}
            </span>
          )}
        </div>
      </>
    )}
  </motion.div>
);

interface SupplierStatsDashboardProps {
  stats: SupplierStats;
  isLoading?: boolean;
}

export function SupplierStatsDashboard({
  stats,
  isLoading,
}: SupplierStatsDashboardProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      <StatCard
        title="Total Suppliers"
        value={stats.totalSuppliers}
        subtitle={`${stats.categoriesCount} categories`}
        icon={<FiUsers className="h-4 w-4" />}
        color="hover:border-blue-200 dark:hover:border-blue-800"
        isLoading={isLoading}
      />
      <StatCard
        title="Preferred Suppliers"
        value={stats.preferredSuppliers}
        subtitle={`${(
          (stats.preferredSuppliers / stats.totalSuppliers) *
          100
        ).toFixed(0)}% preferred`}
        icon={<FiStar className="h-4 w-4 text-yellow-500" />}
        color="hover:border-yellow-200 dark:hover:border-yellow-800"
        isLoading={isLoading}
      />
      <StatCard
        title="Active Suppliers"
        value={stats.activeSuppliers}
        subtitle={`${(
          (stats.activeSuppliers / stats.totalSuppliers) *
          100
        ).toFixed(0)}% active`}
        icon={<FiUserCheck className="h-4 w-4 text-green-500" />}
        color="hover:border-green-200 dark:hover:border-green-800"
        isLoading={isLoading}
      />
      <StatCard
        title="Inactive Suppliers"
        value={stats.inactiveSuppliers}
        subtitle={`${(
          (stats.inactiveSuppliers / stats.totalSuppliers) *
          100
        ).toFixed(0)}% inactive`}
        icon={<FiUserX className="h-4 w-4 text-orange-500" />}
        color="hover:border-orange-200 dark:hover:border-orange-800"
        isLoading={isLoading}
      />
      <StatCard
        title="Average Order Age"
        value={stats.lastOrderDays === 0 ? "N/A" : `${stats.lastOrderDays}`}
        subtitle={stats.lastOrderDays === 0 ? "No data" : "days"}
        icon={<FiShoppingCart className="h-4 w-4 text-purple-500" />}
        color="hover:border-purple-200 dark:hover:border-purple-800"
        isLoading={isLoading}
      />
    </div>
  );
}
