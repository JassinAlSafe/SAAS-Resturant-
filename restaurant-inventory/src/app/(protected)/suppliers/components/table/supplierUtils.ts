import { Supplier, SupplierCategory } from "@/lib/types";

/**
 * Calculate statistics for suppliers
 * @param suppliers List of suppliers
 * @param selectedSuppliers Set of selected supplier IDs
 * @returns Object with supplier statistics
 */
export const calculateSupplierStats = (
    suppliers: Supplier[],
    selectedSuppliers: Set<string>
) => {
    // Calculate total suppliers
    const totalSuppliers = suppliers.length;

    // Calculate active and inactive suppliers
    const activeSuppliers = suppliers.filter(s => s.status === "ACTIVE").length;
    const inactiveSuppliers = suppliers.filter(s => s.status === "INACTIVE").length;

    // Calculate preferred suppliers
    const preferredSuppliers = suppliers.filter(s => s.isPreferred).length;

    // Calculate unique categories
    const allCategories = new Set<SupplierCategory>();
    suppliers.forEach(supplier => {
        supplier.categories.forEach(category => {
            allCategories.add(category);
        });
    });
    const categoriesCount = allCategories.size;

    // Calculate average days since last order
    let totalDays = 0;
    let suppliersWithOrders = 0;

    suppliers.forEach(supplier => {
        if (supplier.lastOrderDate) {
            const lastOrder = new Date(supplier.lastOrderDate);
            const now = new Date();
            const daysSince = Math.floor((now.getTime() - lastOrder.getTime()) / (1000 * 60 * 60 * 24));
            totalDays += daysSince;
            suppliersWithOrders++;
        }
    });

    const lastOrderDays = suppliersWithOrders > 0
        ? Math.round(totalDays / suppliersWithOrders)
        : 0;

    // Calculate selected items stats
    const selectedCount = selectedSuppliers.size;

    return {
        totalSuppliers,
        activeSuppliers,
        inactiveSuppliers,
        preferredSuppliers,
        categoriesCount,
        lastOrderDays,
        selectedCount
    };
}; 