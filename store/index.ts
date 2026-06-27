import { create } from "zustand";
import { siteConfig } from "@/config/site";
import { persist, createJSONStorage } from "zustand/middleware";

interface ThemeStoreState {
  theme: string;
  setTheme: (theme: string) => void;
  radius: number;
  layout: string;
  navbarType: string;
  footerType: string;
}

export const useThemeStore = create<ThemeStoreState>()(() => ({
  theme: siteConfig.theme,
  setTheme: () => {},
  radius: siteConfig.radius,
  layout: siteConfig.layout,
  navbarType: siteConfig.navbarType,
  footerType: siteConfig.footerType,
}));

interface SidebarState {
  collapsed: boolean;
  setCollapsed: (value: boolean) => void;
  sidebarType: string;
  subMenu: boolean;
  setSubmenu: (value: boolean) => void;
}

export const useSidebar = create<SidebarState>()(
  persist(
    (set) => ({
      collapsed: false,
      setCollapsed: (value) => set({ collapsed: value }),
      sidebarType: siteConfig.sidebarType,
      subMenu: false,
      setSubmenu: (value) => set({ subMenu: value }),
    }),
    {
      name: "sidebar-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        collapsed: state.collapsed,
        subMenu: state.subMenu,
      }),
    }
  )
);
