"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  ChefHat,
  ClipboardList,
  DollarSign,
  LineChart,
  Package,
  RefreshCw,
  ShoppingCart,
  Utensils,
} from "lucide-react";

export default function UserFlowPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-center mb-8">
        ShelfWise Restaurant Inventory Manager
      </h1>
      <h2 className="text-2xl font-semibold text-center mb-12">
        User Flow Overview
      </h2>

      {/* Flowchart Container */}
      <div className="relative">
        {/* Phase 1: Onboarding */}
        <FlowSection
          number="1"
          title="Onboarding (First-Time Setup)"
          description="Set up restaurant inventory & menu items"
          icon={<ChefHat className="h-8 w-8" />}
          color="bg-blue-100 border-blue-300"
        >
          <FlowStep
            number="1"
            title="Sign up/Login"
            description="Create an account or log in with email & password"
            icon={<Utensils className="h-5 w-5" />}
          />
          <FlowArrow />
          <FlowStep
            number="2"
            title="Add Ingredients"
            description="Go to 'Inventory' → Add all ingredients (e.g., Tomatoes, Cheese, Flour)"
            icon={<Package className="h-5 w-5" />}
          />
          <FlowArrow />
          <FlowStep
            number="3"
            title="Create Menu Items"
            description="Go to 'Menu Items' → Add dishes and their recipes (linking ingredients)"
            icon={<ClipboardList className="h-5 w-5" />}
          />
        </FlowSection>

        {/* Connector */}
        <div className="flex justify-center my-8">
          <div className="h-16 w-1 bg-gray-300"></div>
        </div>

        {/* Phase 2: Daily Operations */}
        <FlowSection
          number="2"
          title="Daily Operations"
          description="Log daily sales from the X-report and auto-update stock"
          icon={<ShoppingCart className="h-8 w-8" />}
          color="bg-green-100 border-green-300"
        >
          <FlowStep
            number="1"
            title="Enter Sales"
            description="Go to 'Sales Entry' → Select the menu items sold today"
            icon={<DollarSign className="h-5 w-5" />}
          />
          <FlowArrow />
          <FlowStep
            number="2"
            title="Input Quantities"
            description="Enter quantity sold for each dish (from the X-report)"
            icon={<ClipboardList className="h-5 w-5" />}
          />
          <FlowArrow />
          <FlowStep
            number="3"
            title="Submit & Update"
            description="Click 'Submit' → The system automatically updates stock levels"
            icon={<RefreshCw className="h-5 w-5" />}
          />
        </FlowSection>

        {/* Connector */}
        <div className="flex justify-center my-8">
          <div className="h-16 w-1 bg-gray-300"></div>
        </div>

        {/* Phase 3: Monitoring & Restocking */}
        <FlowSection
          number="3"
          title="Monitoring & Restocking"
          description="Ensure stock levels are maintained & reorder when needed"
          icon={<Package className="h-8 w-8" />}
          color="bg-amber-100 border-amber-300"
        >
          <FlowStep
            number="1"
            title="Check Dashboard"
            description="See low-stock alerts and inventory status"
            icon={<LineChart className="h-5 w-5" />}
          />
          <FlowArrow />
          <FlowStep
            number="2"
            title="Review Inventory"
            description="Go to 'Inventory' → See stock levels & ingredient usage history"
            icon={<ClipboardList className="h-5 w-5" />}
          />
          <FlowArrow />
          <FlowStep
            number="3"
            title="Restock & Update"
            description="Restock ingredients and update system with new quantities"
            icon={<RefreshCw className="h-5 w-5" />}
          />
        </FlowSection>

        {/* Connector */}
        <div className="flex justify-center my-8">
          <div className="h-16 w-1 bg-gray-300"></div>
        </div>

        {/* Phase 4: Insights & Optimization */}
        <FlowSection
          number="4"
          title="Insights & Optimization"
          description="Track sales & ingredient usage trends to optimize inventory"
          icon={<LineChart className="h-8 w-8" />}
          color="bg-purple-100 border-purple-300"
        >
          <FlowStep
            number="1"
            title="View Reports"
            description="Go to 'Reports' → View Top-Selling Dishes and usage trends"
            icon={<LineChart className="h-5 w-5" />}
          />
          <FlowArrow />
          <FlowStep
            number="2"
            title="Analyze Trends"
            description="See Stock Usage Trends and sales patterns"
            icon={<ClipboardList className="h-5 w-5" />}
          />
          <FlowArrow />
          <FlowStep
            number="3"
            title="Get Predictions"
            description="View AI-based reorder predictions and optimization suggestions"
            icon={<RefreshCw className="h-5 w-5" />}
          />
        </FlowSection>
      </div>

      {/* Summary Section */}
      <Card className="mt-16 border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="text-xl">Summary of User Flow</CardTitle>
          <CardDescription>
            How restaurant managers will use ShelfWise day-to-day
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <SummaryItem
            title="Daily Routine"
            description="Log sales → Auto-update stock → Check dashboard alerts → Restock if needed"
          />
          <SummaryItem
            title="Weekly Review"
            description="Check reports → Analyze sales trends → Optimize inventory purchasing"
          />
          <SummaryItem
            title="First-Time Setup"
            description="Add ingredients & menu items → Set up recipes → Start tracking automatically"
          />
        </CardContent>
      </Card>

      <div className="mt-12 text-center">
        <Button size="lg" className="bg-primary hover:bg-primary/90">
          Get Started with ShelfWise
        </Button>
      </div>
    </div>
  );
}

// Helper Components
function FlowSection({
  number,
  title,
  description,
  icon,
  color,
  children,
}: {
  number: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`rounded-lg border-2 p-6 ${color}`}
    >
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center justify-center h-12 w-12 rounded-full bg-card border-2 border-current text-primary">
          <span className="text-xl font-bold">{number}</span>
        </div>
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2">
            {title} {icon}
          </h3>
          <p className="text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="mt-6 space-y-4 md:space-y-0 md:flex md:items-start md:justify-between">
        {children}
      </div>
    </motion.div>
  );
}

function FlowStep({
  number,
  title,
  description,
  icon,
}: {
  number: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex-1 bg-card rounded-md p-4 border shadow-xs">
      <div className="flex items-center gap-2 mb-2">
        <div className="flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
          {number}
        </div>
        <h4 className="font-semibold flex items-center gap-1">
          {title} {icon}
        </h4>
      </div>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function FlowArrow() {
  return (
    <div className="hidden md:flex items-center justify-center">
      <ArrowRight className="h-6 w-6 text-muted-foreground" />
    </div>
  );
}

function SummaryItem({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="border-l-4 border-primary pl-4 py-2">
      <h4 className="font-semibold text-lg">{title}</h4>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}
