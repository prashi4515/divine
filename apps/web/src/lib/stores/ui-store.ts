import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Global admin UI state (client-only). Ephemeral interaction state that many
 * components read/write — sidebar, command palette, mobile nav. Domain/server
 * data does NOT live here (that stays in the server cache / RSC).
 */
type UiState = {
  sidebarCollapsed: boolean;
  collapsedGroups: Record<string, boolean>;
  mobileNavOpen: boolean;
  commandPaletteOpen: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (value: boolean) => void;
  toggleGroup: (groupId: string) => void;
  setMobileNavOpen: (value: boolean) => void;
  setCommandPaletteOpen: (value: boolean) => void;
};

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      collapsedGroups: {},
      mobileNavOpen: false,
      commandPaletteOpen: false,
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setSidebarCollapsed: (value) => set({ sidebarCollapsed: value }),
      toggleGroup: (groupId) =>
        set((s) => ({
          collapsedGroups: {
            ...s.collapsedGroups,
            [groupId]: !s.collapsedGroups[groupId],
          },
        })),
      setMobileNavOpen: (value) => set({ mobileNavOpen: value }),
      setCommandPaletteOpen: (value) => set({ commandPaletteOpen: value }),
    }),
    {
      name: "divine.ui",
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        collapsedGroups: state.collapsedGroups,
      }),
    },
  ),
);
