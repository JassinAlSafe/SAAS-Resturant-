# UI Components

This directory contains reusable UI components for the restaurant inventory application.

## CustomCheckbox

The `CustomCheckbox` component is a styled checkbox that provides a consistent look and feel across the application. It's designed to replace the default Checkbox component from Radix UI.

### Usage

```tsx
import { CustomCheckbox } from "@/components/ui/custom-checkbox";

// Basic usage
<CustomCheckbox
  checked={isChecked}
  onCheckedChange={setIsChecked}
/>

// With purchased variant (green checkmark)
<CustomCheckbox
  variant="purchased"
  checked={true}
  disabled
/>

// Disabled state
<CustomCheckbox
  checked={isChecked}
  onCheckedChange={setIsChecked}
  disabled
/>
```

### Props

The `CustomCheckbox` component accepts the following props:

- `checked`: boolean - Whether the checkbox is checked
- `onCheckedChange`: (checked: boolean) => void - Callback when the checkbox state changes
- `disabled`: boolean - Whether the checkbox is disabled
- `variant`: "default" | "purchased" - The variant of the checkbox
  - `default`: Standard checkbox with blue hover effect
  - `purchased`: Green checkbox with checkmark (used for purchased items)
- All standard HTML div attributes

### Implementation

The component is implemented as a styled div with a checkmark icon. It uses Tailwind CSS for styling and the `FiCheck` icon from `react-icons/fi`.

### Migration

When migrating from the default Checkbox component to CustomCheckbox:

1. Update the import statement:

   ```tsx
   // Before
   import { Checkbox } from "@/components/ui/checkbox";

   // After
   import { CustomCheckbox } from "@/components/ui/custom-checkbox";
   ```

2. Replace all instances of `<Checkbox>` with `<CustomCheckbox>`:

   ```tsx
   // Before
   <Checkbox
     checked={isChecked}
     onCheckedChange={(checked) => handleChange(checked as boolean)}
   />

   // After
   <CustomCheckbox
     checked={isChecked}
     onCheckedChange={(checked) => handleChange(checked)}
   />
   ```

3. For purchased items, use the "purchased" variant:
   ```tsx
   <CustomCheckbox variant="purchased" checked={true} disabled />
   ```
