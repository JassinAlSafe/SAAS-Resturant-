import { useMutation } from '@tanstack/react-query';
import { InventoryItem } from '@/lib/types';
import { exportToExcel, formatInventoryForExport } from '@/lib/utils/export';
import { useToast } from '@/components/ui/use-toast';

export function useInventoryExport() {
    const { toast } = useToast();

    // Export data mutation
    const exportMutation = useMutation({
        mutationFn: async ({
            items,
            format
        }: {
            items: InventoryItem[];
            format: 'csv' | 'excel' | 'pdf'
        }) => {
            // Format data for export
            const formattedData = formatInventoryForExport(items);

            // Export based on format
            switch (format) {
                case 'excel':
                    await exportToExcel(formattedData, 'Inventory', 'Inventory Items');
                    return { success: true, format };

                case 'csv':
                    // Convert to CSV and trigger download
                    const csvContent = formattedData
                        .map(row => Object.values(row).join(','))
                        .join('\n');
                    const csvBlob = new Blob([csvContent], { type: 'text/csv' });
                    const csvUrl = window.URL.createObjectURL(csvBlob);
                    const link = document.createElement('a');
                    link.href = csvUrl;
                    link.setAttribute('download', 'inventory.csv');
                    document.body.appendChild(link);
                    link.click();
                    link.remove();
                    return { success: true, format };

                case 'pdf':
                    // This would be implemented with a PDF generation library
                    throw new Error('PDF export is not yet implemented');

                default:
                    throw new Error(`Unsupported export format: ${format}`);
            }
        },
        onSuccess: (result) => {
            toast({
                title: 'Export Complete',
                description: `Inventory data has been exported to ${result.format.toUpperCase()}.`
            });
        },
        onError: (error) => {
            console.error('Error exporting inventory:', error);
            toast({
                title: 'Export Failed',
                description: error instanceof Error
                    ? error.message
                    : 'There was an error exporting your inventory data.',
                variant: 'destructive'
            });
        }
    });

    return {
        exportInventory: exportMutation.mutate,
        isExporting: exportMutation.isPending,
        exportError: exportMutation.error
    };
} 