import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type SidebarState = {
    // Core sidebar state
    isOpen: boolean;
    openMobile: boolean;
    expandedSections: Record<string, boolean>;

    // Actions
    toggle: () => void;
    setOpen: (open: boolean) => void;
    toggleMobile: () => void;
    setMobileOpen: (open: boolean) => void;
    toggleSection: (section: string) => void;
    setExpandedSections: (sections: Record<string, boolean>) => void;
    resetExpandedSections: () => void;
};

export const useSidebarStore = create<SidebarState>()(
    persist(
        (set) => ({
            // Initial state
            isOpen: true,
            openMobile: false,
            expandedSections: {},

            // Actions
            toggle: () => set((state) => ({ isOpen: !state.isOpen })),
            setOpen: (open) => set({ isOpen: open }),
            toggleMobile: () => set((state) => ({ openMobile: !state.openMobile })),
            setMobileOpen: (open) => set({ openMobile: open }),
            toggleSection: (section) =>
                set((state) => ({
                    expandedSections: {
                        ...state.expandedSections,
                        [section]: !state.expandedSections[section]
                    }
                })),
            setExpandedSections: (sections) => set({ expandedSections: sections }),
            resetExpandedSections: () => set({ expandedSections: {} }),
        }),
        {
            name: 'sidebar-storage', // unique name for localStorage
            partialize: (state) => ({ isOpen: state.isOpen, expandedSections: state.expandedSections }),
        }
    )
); 