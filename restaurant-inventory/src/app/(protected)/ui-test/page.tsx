"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FiBox,
  FiCheckSquare,
  FiCreditCard,
  FiFileText,
  FiGrid,
  FiLayout,
  FiList,
  FiSettings,
} from "react-icons/fi";

interface TestPageLink {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
}

export default function UITestIndexPage() {
  const testPages: TestPageLink[] = [
    {
      title: "Form Components",
      description: "Test form inputs, validation, and submission",
      href: "/ui-test/form",
      icon: <FiFileText className="h-5 w-5" />,
    },
    {
      title: "Table Components",
      description: "Test table layouts, sorting, and actions",
      href: "/ui-test/table",
      icon: <FiGrid className="h-5 w-5" />,
    },
    {
      title: "Card Components",
      description: "Test various card layouts and styles",
      href: "/ui-test/card",
      icon: <FiCreditCard className="h-5 w-5" />,
    },
    {
      title: "Select & Checkbox",
      description: "Test select dropdowns and checkbox components",
      href: "/ui-test/select-checkbox",
      icon: <FiCheckSquare className="h-5 w-5" />,
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            UI Component Tests
          </h1>
          <p className="text-gray-500 mt-1">
            Test pages for verifying UI component rendering and functionality
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/shopping-list">
            <FiList className="mr-2 h-4 w-4" />
            Back to Shopping List
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {testPages.map((page, index) => (
          <Link href={page.href} key={index} className="block group">
            <Card className="border hover:border-blue-200 hover:shadow-md transition-all duration-200">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    {page.icon}
                  </div>
                  <FiSettings className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <CardTitle className="mt-3 text-lg font-medium text-gray-900 group-hover:text-blue-700 transition-colors">
                  {page.title}
                </CardTitle>
                <CardDescription className="text-gray-500">
                  {page.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="ghost"
                  className="w-full justify-between group-hover:bg-blue-50 group-hover:text-blue-700 transition-colors"
                >
                  View Test Page
                  <FiBox className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </Link>
        ))}

        {/* Additional Card for Creating New Test */}
        <Card className="border border-dashed border-gray-300 hover:border-blue-300 bg-gray-50 hover:bg-blue-50 transition-all duration-200 flex flex-col items-center justify-center p-6">
          <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4 hover:bg-blue-100 transition-colors">
            <FiLayout className="h-8 w-8 text-gray-400 hover:text-blue-600 transition-colors" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Create New Test
          </h3>
          <p className="text-gray-500 text-center mb-4">
            Add a new component test page to verify UI rendering
          </p>
          <Button variant="outline">Add Test Page</Button>
        </Card>
      </div>
    </div>
  );
}
