# Excel Export Functionality

This document outlines the Excel export feature added to the Restaurant Inventory Management System. The feature allows users to export various data sets to Excel format for offline analysis, reporting, and sharing.

## Features

- Export inventory items to Excel with detailed information
- Export suppliers list with contact information
- Export shopping lists with status and quantities
- Export sales and inventory usage reports with visualized data
- Customized Excel formatting with header styles and auto-sized columns
- Timestamped filenames for easy identification

## Installation

The Excel export functionality requires the following dependencies, which have been added to `package.json`:

```bash
# Install dependencies
npm install xlsx file-saver
npm install --save-dev @types/file-saver
```

Or if you're using Yarn:

```bash
# Install dependencies
yarn add xlsx file-saver
yarn add --dev @types/file-saver
```

After updating your package.json, run:

```bash
npm install
# or
yarn install
```

## Implementation Details

### Core Export Utility

The core export functionality is implemented in `src/lib/utils/export.ts`, which provides:

- **Base export function**: `exportToExcel(data, filename, sheetName)`
- **Data formatters** for different data types:
  - `formatInventoryForExport(inventoryItems)`
  - `formatSuppliersForExport(suppliers)`
  - `formatShoppingListForExport(shoppingList)`

### Reusable Export Button Component

A reusable UI component (`ExportButton`) is available in `src/components/ui/export-button.tsx`. This component:

- Shows a loading state during export operations
- Includes a tooltip for additional guidance
- Supports various button variants and sizes
- Handles error states gracefully

### Integration Points

The export functionality has been integrated into the following pages:

1. **Inventory Page**

   - Export current inventory with filtering support
   - Data includes item names, categories, quantities, prices, and suppliers

2. **Suppliers Page**

   - Export supplier information
   - Data includes supplier names, contact details, and addresses

3. **Shopping List Page**

   - Export shopping list items with filtering support
   - Data includes item names, quantities, status, and type (auto-generated or manual)

4. **Reports Page**
   - Export sales data with revenue, orders, and top dishes
   - Export inventory usage data with consumption trends
   - Supports different date ranges (7 days, 30 days, 90 days)

## Usage

1. Navigate to any of the supported pages (Inventory, Suppliers, Shopping List, Reports)
2. Look for the "Export Excel" button in the page header
3. Click the button to generate and download the Excel file
4. The Excel file will be named with the current date and time (e.g., `Inventory_2023-11-15_14-30-45.xlsx`)

## Technical Implementation

### Dependencies

- **SheetJS (xlsx)**: Used for creating and formatting Excel files
- **file-saver**: Used for triggering browser file downloads

### Error Handling

- All export functions include comprehensive error handling
- User-friendly error notifications are displayed if export fails
- Export operations run asynchronously to avoid UI blocking

### Future Improvements

Planned enhancements for the export functionality:

1. **Scheduled Exports**: Automatically generate and email reports on a schedule
2. **Advanced Filtering**: Allow users to select specific columns to include in exports
3. **PDF Export**: Add support for exporting data in PDF format
4. **Import Functionality**: Allow users to import data from Excel files
5. **Custom Templates**: Save and reuse export templates for repeated exports

## Contributing

When extending the export functionality, please follow these guidelines:

1. Create data formatters for new data types in `src/lib/utils/export.ts`
2. Use the `ExportButton` component for consistent UI
3. Implement proper error handling and loading states
4. Add appropriate success notifications upon completion
5. Test exports with various data sizes and content types

## FAQ

### Why use SheetJS (xlsx) instead of other libraries?

SheetJS is a robust, well-maintained library with excellent browser compatibility. It supports a wide range of Excel features and formats, and it's pure JavaScript, which means it works well in both client and server environments.

### How large can the exported files be?

The size of exported files depends on browser memory limitations. In general, exports up to 100,000 rows should work without issues in modern browsers. For larger datasets, consider implementing server-side export functionality or pagination.

### Can I customize the Excel formatting?

Yes, the `exportToExcel` function in `src/lib/utils/export.ts` includes basic styling for headers. You can extend this functionality to include custom cell formats, colors, fonts, and other Excel styling options supported by SheetJS.

### How do I add export functionality to a new page?

1. Import the `ExportButton` component and necessary export utilities
2. Create a handler function that formats your data for export
3. Add error handling and success notifications
4. Add the `ExportButton` to your UI, passing your handler function

### Is the export functionality accessible?

Yes, the `ExportButton` component is built with accessibility in mind. It includes proper ARIA attributes, keyboard navigation support, and visual indicators for loading states.

### Does this work in all browsers?

The export functionality is compatible with all modern browsers (Chrome, Firefox, Safari, Edge). Internet Explorer is not officially supported.
