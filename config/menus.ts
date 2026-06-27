import {
  Application,
  Calendar,
  DashBoard,
  DocsCheck,
  Envelope,
  FareQuote,
  Files,
  Graph,
  ListFill,
  Mail,
  Mail2,
  Messages,
  Settings,
  User,
  UserPlus,
  Users,
  Vehicle,
  VehiclePricing,
  Web,
  Grid,
} from "@/components/svg";
import type { ComponentType } from "react";

export interface MenuItem {
  title: string;
  icon: ComponentType<{ className?: string }>;
  href?: string;
  child?: MenuItem[];
}

export const menus: MenuItem[] = [
  {
    title: "Dashboard",
    icon: DashBoard,
    child: [
      {
        title: "Analytics",
        href: "/dashboard",
        icon: Graph,
      },
    ],
  },
  {
    title: "Application",
    icon: Application,
    child: [
      { title: "Chat", icon: Messages, href: "/chat" },
      { title: "Calendar", icon: Calendar, href: "/calendar" },
    ],
  },
  {
    title: "Newsletter",
    icon: Envelope,
    child: [
      {
        title: "Newsletters",
        href: "/newsletters",
        icon: Mail,
      },
      {
        title: "Send Newsletter",
        href: "/send",
        icon: Mail2,
      },
      {
        title: "Draft Newsletters",
        href: "/drafts",
        icon: Files,
      },
      {
        title: "Sent Campaigns",
        href: "/campaigns",
        icon: Graph,
      },
      {
        title: "Failed Recipients",
        href: "/campaign-recipients",
        icon: ListFill,
      },
    ],
  },
  {
    title: "Vehicles",
    icon: Vehicle,
    child: [
      {
        title: "Categories",
        href: "/vehicle-categories",
        icon: Grid,
      },
      {
        title: "Vehicles",
        href: "/vehicles",
        icon: Vehicle,
      },
      {
        title: "Pricing",
        href: "/vehicle-pricing",
        icon: VehiclePricing,
      },
      {
        title: "check fare quotes",
        href: "/vehicle-fare-quotes",
        icon: FareQuote,
      },
    ],
  },
  {
    title: "Drivers",
    icon: Users,
    child: [
      {
        title: "Applications",
        href: "/drivers",
        icon: DocsCheck,
      },
      {
        title: "Add Driver",
        href: "/drivers/add",
        icon: UserPlus,
      },
    ],
  },
  {
    title: "Settings",
    icon: Settings,
    child: [
      {
        title: "Profile Settings",
        href: "/profile",
        icon: User,
      },
      {
        title: "Site Settings",
        href: "/site-settings",
        icon: Web,
      },
    ],
  },
];

export type MenuType = (typeof menus)[number];
