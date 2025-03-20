import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useDashboard } from "@/lib/hooks/useDashboard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Package, 
  AlertCircle, 
  TrendingUp, 
  ArrowRight, 
  RefreshCw,
  Calendar,
  ShoppingCart
} from "lucide-react";

export function InventoryTab() {
  const router = useRouter();
  const { 
    stats, 
    categoryStats, 
    inventoryAlerts, 
    refresh, 
    isLoading, 
    currencySymbol
  } = useDashboard();

  // Colors for the pie chart
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  // Handle refresh click
  const handleRefresh = () => {
    refresh();
  };

  // Format the category stats for the pie chart
  const formattedCategoryStats = categoryStats.map(stat => ({
    name: stat.name,
    value: stat.count
  }));

  // Format currency helper
  const formatCurrency = (value: number): string => {
    return `${currencySymbol}${value.toLocaleString()}`;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">Inventory Overview</h2>
          <div className="h-9 w-24 bg-muted/70 rounded"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="bg-card shadow-sm">
              <CardHeader className="pb-2">
                <div className="h-5 w-1/2 bg-muted/70 rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 w-1/3 bg-muted/70 rounded mb-2"></div>
                <div className="h-4 w-2/3 bg-muted/50 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-card shadow-sm">
            <CardHeader>
              <div className="h-6 w-1/3 bg-muted/70 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-muted/30 rounded-lg"></div>
            </CardContent>
          </Card>
          
          <Card className="bg-card shadow-sm">
            <CardHeader>
              <div className="h-6 w-1/3 bg-muted/70 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex justify-between p-2 border-b">
                    <div className="h-4 w-1/3 bg-muted/70 rounded"></div>
                    <div className="h-4 w-1/4 bg-muted/70 rounded"></div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Inventory Overview</h2>
        <div className="flex gap-2">
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
          <Button onClick={() => router.push("/inventory")} variant="default" size="sm">
            <Package className="h-4 w-4 mr-1" />
            Full Inventory
          </Button>
        </div>
      </div>
      
      {/* Key Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card shadow-sm hover:shadow-md transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <Package className="h-4 w-4 mr-1.5 text-blue-500" />
              Total Inventory Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(typeof stats.totalInventoryValue === 'string' ? parseFloat(stats.totalInventoryValue) : stats.totalInventoryValue)}</div>
            <p className="text-sm text-muted-foreground mt-1">
              Current valuation of all inventory items
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-card shadow-sm hover:shadow-md transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <AlertCircle className="h-4 w-4 mr-1.5 text-amber-500" />
              Low Stock Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.lowStockItems}</div>
            <p className="text-sm text-muted-foreground mt-1">
              Items below their reorder level
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-card shadow-sm hover:shadow-md transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <TrendingUp className="h-4 w-4 mr-1.5 text-green-500" />
              Inventory Turnover
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3.2x</div>
            <p className="text-sm text-muted-foreground mt-1">
              Average inventory turnover rate
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Detailed Inventory Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <Card className="bg-card shadow-sm hover:shadow-md transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between">
              <span>Category Distribution</span>
              <Badge variant="outline" className="font-normal">
                {categoryStats.length} Categories
              </Badge>
            </CardTitle>
            <CardDescription>
              Breakdown of inventory by category
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={formattedCategoryStats}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {formattedCategoryStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [`${value} items`, 'Count']}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        {/* Inventory Alerts */}
        <Card className="bg-card shadow-sm hover:shadow-md transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between">
              <span>Inventory Alerts</span>
              <Badge variant={inventoryAlerts.length > 0 ? "destructive" : "outline"} className="font-normal">
                {inventoryAlerts.length} Alerts
              </Badge>
            </CardTitle>
            <CardDescription>
              Items that need attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64 pr-4">
              {inventoryAlerts.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-4">
                  <div className="bg-green-50 text-green-700 p-3 rounded-full mb-3">
                    <Package className="h-6 w-6" />
                  </div>
                  <p className="text-muted-foreground">No inventory alerts at this time</p>
                  <p className="text-xs text-muted-foreground mt-1">All inventory items are at healthy levels</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {inventoryAlerts.map((alert) => (
                    <div 
                      key={alert.id} 
                      className="flex justify-between items-center p-3 rounded-lg border border-muted bg-card hover:bg-accent/5 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-full ${alert.type === 'low_stock' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'}`}>
                          {alert.type === 'low_stock' ? (
                            <AlertCircle className="h-4 w-4" />
                          ) : (
                            <Calendar className="h-4 w-4" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{alert.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {alert.type === 'low_stock' ? (
                              <>Stock: <span className="text-amber-600 font-medium">{alert.currentStock}</span> (Min: {alert.reorderLevel})</>
                            ) : (
                              <>Expires: <span className="text-red-600 font-medium">{new Date(alert.expiryDate!).toLocaleDateString()}</span></>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => router.push("/inventory")}>
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
      
      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3 mt-4">
        <Button variant="outline" size="sm" onClick={() => router.push("/inventory/add")}>
          <Package className="h-4 w-4 mr-1.5" />
          Add Inventory
        </Button>
        <Button variant="outline" size="sm" onClick={() => router.push("/shopping-list")}>
          <ShoppingCart className="h-4 w-4 mr-1.5" />
          Shopping List
        </Button>
      </div>
    </div>
  );
}
