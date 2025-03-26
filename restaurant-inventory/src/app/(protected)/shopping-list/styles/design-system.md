# Shopping List Visual Design System

This document outlines the design principles and components for the Shopping List interface to create a cohesive, visually appealing experience.

## 🎨 Color Palette

### Primary Colors

- **Primary Brand**: `#570DF8` (DaisyUI primary)
- **Success**: `#36D399` (DaisyUI success)
- **Warning**: `#FBBD23` (DaisyUI warning)
- **Error**: `#F87272` (DaisyUI error)
- **Info**: `#3ABFF8` (DaisyUI info)

### Secondary Colors

- **Neutral**: `#3D4451` (DaisyUI neutral)
- **Base-100**: `#FFFFFF` (DaisyUI base-100)
- **Base-200**: `#F2F2F2` (DaisyUI base-200)
- **Base-300**: `#E5E6E6` (DaisyUI base-300)

### Color Application

- Use **Transparent Colored Backgrounds** (`bg-primary/10`, `bg-success/10`) for subtle emphasis
- Apply **Gradient Backgrounds** for visual interest in progress indicators
- Use **Color Coding** for statuses (success for complete, warning for in-progress, error for urgent)

## 📐 Layout

### Grid System

- Implement responsive grid layouts:
  - Mobile: Single column (`grid-cols-1`)
  - Tablet: Two columns (`md:grid-cols-2`)
  - Desktop: Four columns (`lg:grid-cols-4`)

### Spacing

- Card padding: `p-5`
- Section margins: `mb-6`
- Element gaps: `gap-4`
- Button spacing: `gap-2`

### White Space Management

- Use appropriate padding and margins to create visual hierarchy
- Employ negative space to improve readability and focus

## 📦 Components

### Cards

- **Style**: `card bg-base-100 shadow-md hover:shadow-lg transition-all duration-300`
- **Elevation**: Use subtle shadows with hover effects (`shadow-md` → `shadow-lg`)
- **Animation**: Scale slightly on hover (`whileHover={{ y: -5 }}`)
- **Corners**: Rounded corners (`rounded-lg`)
- **Border**: Use subtle borders only when necessary (`border-b`)

### Buttons

- **Primary Action**: `btn btn-primary btn-sm gap-2 rounded-lg shadow-sm hover:shadow-md`
- **Secondary Action**: `btn btn-outline btn-sm btn-secondary gap-2 rounded-lg`
- **Tertiary Action**: `btn btn-outline btn-sm gap-2 rounded-lg`
- **Animation**: Scale on hover/tap (`whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}`)

### Progress Indicators

- **Style**: Custom gradient progress bars with animation
- **Background**: `bg-base-200 rounded-full`
- **Foreground**: `bg-gradient-to-r from-success/80 to-success`
- **Animation**: Width animation and subtle shimmer effect

### Icons

- **Size**: Use appropriate sizing (`h-4 w-4` for buttons, `h-5 w-5` for indicators)
- **Placement**: Consistent icon placement (`gap-2` with text)
- **Background**: Circular backgrounds for emphasis (`p-2 rounded-full bg-primary/10`)

### Empty States

- **Style**: Central, visually appealing illustrations
- **Animation**: Staggered fade-in animations for elements
- **Guidance**: Clear calls-to-action with primary/secondary buttons

## 📱 Responsiveness

### Breakpoints

- Mobile: Up to 768px
- Tablet: 768px - 1024px
- Desktop: 1024px and above

### Mobile Considerations

- Stack grid items vertically
- Reduce padding and margins
- Make touch targets larger

## 🎭 Animations

### Types

- **Hover Effects**: Subtle elevation and scaling
- **Loading States**: Rotating spinners and progress bars
- **Transitions**: Smooth transitions for state changes
- **Entrance Animations**: Fade and slide effects

### Animation Properties

- **Duration**: Fast for micro-interactions (0.2s-0.3s)
- **Duration**: Medium for content transitions (0.5s-0.8s)
- **Easing**: Use natural easing functions (`easeOut`, `easeInOut`)
- **Staggering**: Stagger animations for multiple elements (0.1s between items)

## 🔤 Typography

### Hierarchy

- **Card Titles**: `text-lg font-bold`
- **Values**: `text-2xl font-bold`
- **Labels**: `text-sm text-base-content/70`
- **Metadata**: `text-xs text-base-content/70`

### Font Weights

- `font-bold` for primary information
- `font-medium` for secondary information
- `font-normal` for tertiary information

## 📏 Component Measurements

### Cards

- Height: Auto (content-based)
- Width: 100% (container width)
- Padding: 20px (`p-5`)
- Corner Radius: 12px (`rounded-lg`)

### Buttons

- Height: 32px (small buttons, `btn-sm`)
- Padding: Horizontal 16px, Vertical 8px
- Corner Radius: 8px (`rounded-lg`)

### Progress Bars

- Height: 12px (`h-3`)
- Corner Radius: 9999px (`rounded-full`)

## 🖼️ Visual Elements

### Iconography

- **Style**: Use Lucide Icons consistently
- **Application**: Use icons to reinforce meaning, not just decoration
- **Color**: Match icon colors to content meaning

### Shadows

- **Cards**: `shadow-md hover:shadow-lg`
- **Buttons**: `shadow-sm hover:shadow-md`
- **Transitions**: Apply smooth transitions to shadows (`transition-all duration-300`)

### Visual Feedback

- **Hover States**: Scale up slightly, increase shadow
- **Active States**: Scale down slightly
- **Loading States**: Animated indicators
- **Success/Error States**: Color-coded feedback with icons

## Implementation Examples

### Summary Card

```jsx
<motion.div
  whileHover={{ y: -5 }}
  transition={{ type: "spring", stiffness: 300 }}
  className="card bg-base-100 shadow-md hover:shadow-lg transition-all duration-300"
>
  <div className="card-body p-5">
    <div className="flex items-center justify-between">
      <h2 className="card-title text-lg">Card Title</h2>
      <div className="p-2 rounded-full bg-primary/10 text-primary">
        <Icon className="w-5 h-5" />
      </div>
    </div>
    <div className="mt-2">
      <p className="text-2xl font-bold">Value</p>
      <div className="flex justify-between mt-1 text-sm">
        <span className="text-base-content/70">Label:</span>
        <span className="font-medium">Detail</span>
      </div>
    </div>
  </div>
</motion.div>
```

### Progress Bar

```jsx
<div className="relative h-3 w-full bg-base-200 rounded-full overflow-hidden">
  <motion.div
    initial={{ width: 0 }}
    animate={{ width: `${percentage}%` }}
    transition={{ duration: 0.8, ease: "easeOut" }}
    className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-success/80 to-success"
  />
  <motion.div
    animate={{
      opacity: [0.5, 1, 0.5],
      x: ["0%", "5%", "0%"],
    }}
    transition={{
      repeat: Infinity,
      duration: 2,
      ease: "easeInOut",
    }}
    className="absolute top-0 left-0 h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
  />
</div>
```

### Button

```jsx
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  className="btn btn-primary btn-sm gap-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
>
  <PlusIcon className="h-4 w-4" />
  <span>Button Text</span>
</motion.button>
```

This design system provides a consistent framework for all UI components in the Shopping List feature, ensuring a cohesive, visually appealing user experience across all screens and states.
