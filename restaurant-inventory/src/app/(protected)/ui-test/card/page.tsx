"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  FiAlertCircle,
  FiArrowRight,
  FiBarChart2,
  FiCheckCircle,
  FiClock,
  FiDollarSign,
  FiShoppingCart,
  FiTrendingUp,
} from "react-icons/fi";

export default function CardTestPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">
        Card Components Test
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Basic Card */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Card</CardTitle>
            <CardDescription>
              A simple card with header, content, and footer
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              This is a basic card component with minimal styling. It includes a
              header with title and description, content area, and a footer with
              actions.
            </p>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline">Cancel</Button>
            <Button>Save</Button>
          </CardFooter>
        </Card>

        {/* Styled Card */}
        <Card className="border-blue-100 shadow-md">
          <CardHeader className="bg-blue-50 border-b border-blue-100">
            <CardTitle className="text-blue-800">Styled Card</CardTitle>
            <CardDescription className="text-blue-600">
              A card with custom styling
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-gray-600">
              This card has custom styling applied to the border, shadow, header
              background, and text colors to create a cohesive theme.
            </p>
          </CardContent>
          <CardFooter className="bg-gray-50 border-t">
            <Button className="w-full">
              <FiArrowRight className="mr-2 h-4 w-4" />
              Continue
            </Button>
          </CardFooter>
        </Card>

        {/* Status Card */}
        <Card className="border-green-100 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-gray-900">
                Order Status
              </CardTitle>
              <Badge className="bg-green-100 text-green-800 border-green-200">
                Completed
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <FiCheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Order #12345</p>
                <p className="text-sm text-gray-500">
                  Processed on May 15, 2023
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Progress</span>
                <span className="font-medium text-gray-900">100%</span>
              </div>
              <Progress value={100} className="h-2" />
            </div>
          </CardContent>
          <CardFooter className="border-t pt-4">
            <Button variant="outline" className="w-full">
              View Details
            </Button>
          </CardFooter>
        </Card>

        {/* Metric Card */}
        <Card className="border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-gray-900">$24,780</span>
              <Badge className="bg-green-100 text-green-800 border-green-200">
                <FiTrendingUp className="mr-1 h-3 w-3" />
                +12.5%
              </Badge>
            </div>
            <p className="mt-1 text-sm text-gray-500">Compared to last month</p>

            <div className="mt-4 h-[60px]">
              {/* Placeholder for chart */}
              <div className="flex items-end justify-between h-full">
                {[35, 45, 25, 60, 75, 50, 80].map((height, i) => (
                  <div
                    key={i}
                    className="w-6 bg-blue-100 rounded-t"
                    style={{ height: `${height}%` }}
                  ></div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Shopping List Summary Card */}
        <Card className="border shadow-sm">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-base font-medium">
                Shopping List Summary
              </CardTitle>
              <CardDescription>Current shopping list status</CardDescription>
            </div>
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <FiShoppingCart className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Completion</span>
                  <span className="font-medium text-gray-900">65%</span>
                </div>
                <Progress value={65} className="h-2" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center">
                      <FiClock className="h-4 w-4 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Pending</p>
                      <p className="font-medium text-gray-900">12 items</p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                      <FiCheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Purchased</p>
                      <p className="font-medium text-gray-900">23 items</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t">
            <Button
              variant="ghost"
              className="w-full text-blue-600 hover:text-blue-800 hover:bg-blue-50"
            >
              View Full List
              <FiArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>

        {/* Alert Card */}
        <Card className="border-red-100 bg-red-50 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <FiAlertCircle className="h-5 w-5 text-red-600" />
              <CardTitle className="text-lg text-red-800">
                Low Stock Alert
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-red-700 mb-4">
              The following items are running low and need to be restocked soon:
            </p>
            <ul className="space-y-2">
              <li className="bg-white p-2 rounded border border-red-100 flex justify-between items-center">
                <span className="font-medium text-gray-900">Olive Oil</span>
                <Badge className="bg-red-100 text-red-800 border-red-200">
                  1 L remaining
                </Badge>
              </li>
              <li className="bg-white p-2 rounded border border-red-100 flex justify-between items-center">
                <span className="font-medium text-gray-900">Flour</span>
                <Badge className="bg-red-100 text-red-800 border-red-200">
                  2 kg remaining
                </Badge>
              </li>
              <li className="bg-white p-2 rounded border border-red-100 flex justify-between items-center">
                <span className="font-medium text-gray-900">Milk</span>
                <Badge className="bg-red-100 text-red-800 border-red-200">
                  0.5 L remaining
                </Badge>
              </li>
            </ul>
          </CardContent>
          <CardFooter className="border-t border-red-100">
            <Button className="w-full bg-red-600 hover:bg-red-700">
              Add to Shopping List
            </Button>
          </CardFooter>
        </Card>

        {/* Financial Card */}
        <Card className="border shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium">
                Monthly Expenses
              </CardTitle>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <FiBarChart2 className="h-4 w-4" />
                <span>May 2023</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <FiDollarSign className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Spent</p>
                  <p className="text-xl font-bold text-gray-900">$12,450</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Meat & Seafood</span>
                  <span className="text-sm font-medium text-gray-900">
                    $4,230
                  </span>
                </div>
                <Progress value={34} className="h-2 bg-gray-100" />

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Produce</span>
                  <span className="text-sm font-medium text-gray-900">
                    $3,120
                  </span>
                </div>
                <Progress value={25} className="h-2 bg-gray-100" />

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Dairy</span>
                  <span className="text-sm font-medium text-gray-900">
                    $2,450
                  </span>
                </div>
                <Progress value={20} className="h-2 bg-gray-100" />

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Other</span>
                  <span className="text-sm font-medium text-gray-900">
                    $2,650
                  </span>
                </div>
                <Progress value={21} className="h-2 bg-gray-100" />
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t">
            <Button variant="outline" className="w-full">
              View Detailed Report
            </Button>
          </CardFooter>
        </Card>

        {/* Empty State Card */}
        <Card className="border shadow-sm flex flex-col items-center justify-center text-center p-6">
          <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <FiShoppingCart className="h-8 w-8 text-gray-400" />
          </div>
          <CardTitle className="text-xl mb-2">
            No Items in Shopping List
          </CardTitle>
          <CardDescription className="mb-6 max-w-xs">
            Your shopping list is currently empty. Add items to get started with
            your shopping.
          </CardDescription>
          <div className="flex gap-3">
            <Button variant="outline">Add Manually</Button>
            <Button>Generate from Inventory</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
