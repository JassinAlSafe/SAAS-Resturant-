import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type SidebarState = {
    // Core sidebar state
    isOpen: boolean;
    openMobile: boolean;
    expandedSections: Record<string, boolean>;
    lastInteraction: number;

    // Actions
    toggle: () => void;
    setOpen: (open: boolean) => void;
    toggleMobile: () => void;
    setMobileOpen: (open: boolean) => void;
    toggleSection: (section: string) => void;
    setExpandedSections: (sections: Record<string, boolean>) => void;
    resetExpandedSections: () => void;
    updateLastInteraction: () => void;
};

export const useSidebarStore = create<SidebarState>()(
    persist(
        (set) => ({
            // Initial state
            isOpen: true,
            openMobile: false,
            expandedSections: {},
            lastInteraction: Date.now(),

            // Actions
            toggle: () => set((state) => ({
                isOpen: !state.isOpen,
                lastInteraction: Date.now()
            })),
            setOpen: (open) => set({
                isOpen: open,
                lastInteraction: Date.now()
            }),
            toggleMobile: () => set((state) => ({
                openMobile: !state.openMobile,
                lastInteraction: Date.now()
            })),
            setMobileOpen: (open) => set({
                openMobile: open,
                lastInteraction: Date.now()
            }),
            toggleSection: (section) =>
                set((state) => ({
                    expandedSections: {
                        ...state.expandedSections,
                        [section]: !state.expandedSections[section]
                    },
                    lastInteraction: Date.now()
                })),
            setExpandedSections: (sections) => set({
                expandedSections: sections,
                lastInteraction: Date.now()
            }),
            resetExpandedSections: () => set({
                expandedSections: {},
                lastInteraction: Date.now()
            }),
            updateLastInteraction: () => set({
                lastInteraction: Date.now()
            }),
        }),
        {
            name: 'sidebar-storage', // unique name for localStorage
            partialize: (state) => ({
                isOpen: state.isOpen,
                expandedSections: state.expandedSections
            }),
        }
    )
); 