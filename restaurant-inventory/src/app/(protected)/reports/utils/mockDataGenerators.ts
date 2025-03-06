import { format, eachDayOfInterval, addDays } from 'date-fns';
import { DateRange } from 'react-day-picker';

// Generate sales data for a given date range
export const generateSalesData = (dateRange: DateRange) => {
    const { from, to } = dateRange;
    if (!from || !to) return { currentPeriod: null, metrics: null };

    const days = eachDayOfInterval({ start: from, end: to });
    const labels = days.map(day => format(day, 'MMM d'));

    // Generate random sales data
    const salesValues = days.map(() => Math.floor(Math.random() * 2000) + 500);
    const costValues = salesValues.map(sale => sale * (Math.random() * 0.3 + 0.4)); // 40-70% of sales

    // Calculate metrics
    const totalSales = salesValues.reduce((sum, sale) => sum + sale, 0);
    const totalCosts = costValues.reduce((sum, cost) => sum + cost, 0);
    const totalOrders = Math.floor(totalSales / 25); // Assuming average order is $25

    const metrics = {
        totalSales,
        avgDailySales: totalSales / days.length,
        totalOrders,
        avgOrderValue: totalSales / totalOrders,
        grossProfit: totalSales - totalCosts,
        profitMargin: (totalSales - totalCosts) / totalSales
    };

    return {
        currentPeriod: {
            labels,
            datasets: [
                {
                    label: 'Sales',
                    data: salesValues,
                    backgroundColor: 'rgba(59, 130, 246, 0.5)',
                    borderColor: 'rgb(59, 130, 246)',
                    borderWidth: 2,
                },
                {
                    label: 'Costs',
                    data: costValues,
                    backgroundColor: 'rgba(239, 68, 68, 0.5)',
                    borderColor: 'rgb(239, 68, 68)',
                    borderWidth: 2,
                }
            ]
        },
        metrics
    };
};

// Generate top dishes data
export const generateTopDishesData = () => {
    return {
        labels: ['Pizza', 'Burger', 'Pasta', 'Salad', 'Steak'],
        datasets: [
            {
                data: [65, 59, 43, 37, 28],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.7)',
                    'rgba(54, 162, 235, 0.7)',
                    'rgba(255, 206, 86, 0.7)',
                    'rgba(75, 192, 192, 0.7)',
                    'rgba(153, 102, 255, 0.7)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)'
                ],
                borderWidth: 1
            }
        ]
    };
};

// Generate inventory usage data
export const generateInventoryData = (dateRange: DateRange) => {
    const { from, to } = dateRange;
    if (!from || !to) return null;

    const days = eachDayOfInterval({ start: from, end: to });
    const labels = days.map(day => format(day, 'MMM d'));

    // Generate random data for different ingredients
    return {
        labels,
        datasets: [
            {
                label: 'Tomatoes (kg)',
                data: days.map(() => Math.random() * 2 + 0.5),
                borderColor: 'rgb(255, 99, 132)',
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
                tension: 0.3
            },
            {
                label: 'Chicken (kg)',
                data: days.map(() => Math.random() * 3 + 1),
                borderColor: 'rgb(54, 162, 235)',
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
                tension: 0.3
            },
            {
                label: 'Flour (kg)',
                data: days.map(() => Math.random() * 5 + 2),
                borderColor: 'rgb(255, 206, 86)',
                backgroundColor: 'rgba(255, 206, 86, 0.5)',
                tension: 0.3
            }
        ]
    };
};
