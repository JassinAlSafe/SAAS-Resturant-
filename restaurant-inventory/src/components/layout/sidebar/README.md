# Sidebar Component Refactoring

This directory contains the refactored sidebar components for the restaurant inventory management system. The original monolithic sidebar (21KB, 580 lines) has been broken down into smaller, more manageable components.

## Component Structure

- `Sidebar.tsx`: The main sidebar component that orchestrates all the sub-components
- `types.ts`: Type definitions for navigation items and utility functions

### Components Directory

- `SidebarHeader.tsx`: Handles the logo and business name display
- `SidebarNavigation.tsx`: Manages the navigation items, including expandable sections
- `SidebarUserProfile.tsx`: Displays user information and logout functionality
- `SidebarCollapseButton.tsx`: Provides the circular button to collapse/expand the sidebar
- `MobileSidebar.tsx`: Handles the mobile version of the sidebar

## Usage

The sidebar is used in the main layout of the application. It accepts children components that will be rendered in the main content area.

```tsx
import { Sidebar } from "@/components/layout/sidebar/Sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <Sidebar>{children}</Sidebar>;
}
```

## Benefits of Refactoring

1. **Improved Maintainability**: Each component has a single responsibility
2. **Better Code Organization**: Related code is grouped together
3. **Enhanced Readability**: Smaller files are easier to understand
4. **Easier Testing**: Components can be tested in isolation
5. **Simplified Updates**: Changes to one aspect of the sidebar don't require modifying the entire file

## Component Responsibilities

- **SidebarHeader**: Displays the business logo or a fallback icon, along with the business name when the sidebar is open
- **SidebarNavigation**: Renders navigation items, handles expandable sections, and manages active states
- **SidebarUserProfile**: Shows user information and provides logout functionality, with different layouts for open and closed states
- **SidebarCollapseButton**: Provides a button to toggle the sidebar between open and closed states
- **MobileSidebar**: Provides a mobile-optimized version of the sidebar with an overlay

## State Management

The sidebar uses several pieces of state:

- `open`: Controls whether the sidebar is expanded or collapsed
- `openMobile`: Controls whether the mobile sidebar is visible
- `expandedSections`: Tracks which navigation sections are expanded
