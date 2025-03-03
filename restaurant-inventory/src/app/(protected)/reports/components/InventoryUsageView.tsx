"use client";

import Card from "@/components/Card";
import { Line } from "react-chartjs-2";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { InventoryUsageViewProps } from "../types";
import { InventoryRow } from "./InventoryRow";

export const InventoryUsageView = ({
  inventoryUsageData,
}: InventoryUsageViewProps) => (
  <div className="grid grid-cols-1 gap-4 md:gap-6">
    <Card title="Ingredient Usage Trends" className="min-h-[320px]">
      <div className="h-[280px] md:h-[320px]">
        <Line
          data={inventoryUsageData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: "top" as const,
                display: true,
                labels: {
                  boxWidth: 12,
                  padding: 10,
                  font: {
                    size: 11,
                  },
                },
              },
              title: {
                display: false,
              },
            },
            scales: {
              x: {
                ticks: {
                  font: {
                    size: 10,
                  },
                  maxRotation: 45,
                  minRotation: 45,
                },
              },
              y: {
                ticks: {
                  font: {
                    size: 10,
                  },
                },
              },
            },
          }}
        />
      </div>
    </Card>

    <Card title="Inventory Summary">
      <div className="overflow-x-auto -mx-4 md:mx-0">
        <div className="min-w-[600px] md:min-w-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[30%] text-xs md:text-sm">
                  Ingredient
                </TableHead>
                <TableHead className="w-[20%] text-xs md:text-sm">
                  Current Stock
                </TableHead>
                <TableHead className="w-[25%] text-xs md:text-sm">
                  Usage (Last 7 Days)
                </TableHead>
                <TableHead className="w-[25%] text-xs md:text-sm">
                  Projected Depletion
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <InventoryRow
                name="Tomatoes"
                stock="2 kg"
                usage="5.5 kg"
                depletion="2.5 days"
                depleted={true}
              />
              <InventoryRow
                name="Chicken Breast"
                stock="1.5 kg"
                usage="4.1 kg"
                depletion="2.6 days"
                depleted={true}
              />
              <InventoryRow
                name="Mozzarella Cheese"
                stock="0.5 kg"
                usage="2.8 kg"
                depletion="1.3 days"
                depleted={true}
              />
              <InventoryRow
                name="Flour"
                stock="8 kg"
                usage="8.5 kg"
                depletion="6.6 days"
                depleted={false}
                warning={true}
              />
              <InventoryRow
                name="Eggs"
                stock="24 pcs"
                usage="36 pcs"
                depletion="4.7 days"
                depleted={false}
                warning={true}
              />
            </TableBody>
          </Table>
        </div>
      </div>
    </Card>
  </div>
);
