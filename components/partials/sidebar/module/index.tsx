"use client";

import React, { useEffect, useState } from "react";
import { cn, isLocationMatch, getDynamicPath } from "@/lib/utils";
import { menus } from "@/config/menus";
import SingleIconMenu from "../common/single-icon-menu";
import { useSidebar } from "@/store";
import ModuleMenuItem from "../common/module-menu-item";
import ModuleNestedMenus from "../common/module-nested-menus";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SiteLogo } from "@/components/svg";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMediaQuery } from "@/hooks/use-media-query";
import MenuOverlayPortal from "./MenuOverlayPortal";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const ModuleSidebar = () => {
  const { subMenu, setSubmenu, collapsed, setCollapsed } = useSidebar();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [currentSubMenu, setCurrentSubMenu] = useState<any[]>([]);
  const [nestedIndex, setNestedIndex] = useState<number | null>(null);
  const [multiNestedIndex, setMultiNestedIndex] = useState<number | null>(null);
  const [menuOverlay, setMenuOverlay] = useState<boolean>(false);
  const isDesktop = useMediaQuery("(min-width: 1280px)");

  const pathname = usePathname();
  const locationName = getDynamicPath(pathname);

  const toggleSubMenu = (index: number) => {
    setActiveIndex(index);
    if (menus[index].child) {
      setCurrentSubMenu(menus[index].child);
      setSubmenu(false);
      setCollapsed(false);
      if (!isDesktop) {
        setMenuOverlay(true);
      }
    } else {
      setSubmenu(true);
      setCollapsed(true);

      if (!isDesktop && isLocationMatch(menus[index].title, locationName)) {
        setSubmenu(false);
      }
    }
  };

  const toggleNested = (subIndex: number) => {
    setNestedIndex((current) => (current === subIndex ? null : subIndex));
  };

  const toggleMultiNested = (index: number) => {
    setMultiNestedIndex((current) => (current === index ? null : index));
  };

  function setActiveMenu(menuIndex: number, childMenu: any) {
    setActiveIndex(menuIndex);
    setCurrentSubMenu(childMenu);
    setSubmenu(false);
    setCollapsed(false);
  }

  function setActiveNestedMenu(
    menuIndex: number,
    nestedMenuIndex: number,
    childMenu: any
  ) {
    setActiveIndex(menuIndex);
    setNestedIndex(nestedMenuIndex);
    setCurrentSubMenu(childMenu);
    setSubmenu(false);
    setCollapsed(false);
  }

  const getMenuTitle = () => {
    if (activeIndex !== null) {
      return menus[activeIndex].title;
    }
    return "";
  };

  useEffect(() => {
    let isMenuMatched = false;
    menus.forEach((item: any, i: number) => {
      if (item?.href) {
        if (isLocationMatch(item.href, locationName)) {
          isMenuMatched = true;
          setSubmenu(true);
          setCollapsed(true);
          setMenuOverlay(false);
        }
      }

      item?.child?.forEach((childItem: any, j: number) => {
        if (isLocationMatch(childItem.href, locationName)) {
          setActiveMenu(i, item.child);
          setMenuOverlay(false);
          isMenuMatched = true;
        }

        if (childItem.nested) {
          childItem.nested.forEach((nestedItem: any) => {
            if (isLocationMatch(nestedItem.href, locationName)) {
              setActiveNestedMenu(i, j, item.child);
              setMenuOverlay(false);
              isMenuMatched = true;
            }
            nestedItem.child?.forEach((multiItem: any) => {
              if (isLocationMatch(multiItem.href, locationName)) {
                setActiveNestedMenu(i, j, item.child);
                setMenuOverlay(false);
                isMenuMatched = true;
              }
            });
          });
        }
      });
    });

    if (!isMenuMatched) {
      setSubmenu(false);
    }
    if (!isDesktop) {
      setSubmenu(true);
    }
  }, [locationName, isDesktop]);

  return (
    <>
      <div
        className={cn(
          "main-sidebar pointer-events-none fixed start-0 top-0 z-60 flex h-full overflow-hidden xl:z-10 print:hidden",
          {
            "max-xl:w-0": !isDesktop && !collapsed && subMenu,
            "max-xl:w-[72px]": !isDesktop && collapsed && subMenu,
            "max-xl:w-[300px]": !isDesktop && !collapsed && !subMenu,
          }
        )}
      >
        <div
          className={cn(
            "border-border dark:border-default-300 pointer-events-auto relative z-20 flex h-full w-[72px] shrink-0 flex-col border-r border-dashed bg-card transition-all duration-300",
            {
              "max-xl:hidden": !isDesktop && !collapsed && subMenu,
              "-translate-x-full xl:translate-x-0": isDesktop && !collapsed && subMenu,
            }
          )}
        >
          <div className="pt-4">
            <Link href="/dashboard">
              <SiteLogo className="mx-auto text-primary h-8 w-8" />
            </Link>
          </div>
          <ScrollArea className="grow pt-6 pb-6">
            {menus.map((item, i) => (
              <div
                key={i}
                onClick={() => toggleSubMenu(i)}
                className="mb-3 last:mb-0"
              >
                <SingleIconMenu
                  index={i}
                  activeIndex={activeIndex}
                  item={item}
                  locationName={locationName}
                />
              </div>
            ))}
          </ScrollArea>
        </div>

        <div
          className={cn(
            "border-border pointer-events-auto relative z-10 flex h-full w-[228px] shrink-0 flex-col border-r bg-card transition-all duration-300",
            {
              "max-xl:hidden": !isDesktop && (collapsed || subMenu),
              "translate-x-[calc(-100%_-_72px)]": isDesktop && (collapsed || subMenu),
            }
          )}
        >
          <h2 className="text-lg bg-transparent z-50 font-semibold flex gap-4 items-center text-default-700 sticky top-0 py-4 px-4 capitalize">
            <span className="block">{getMenuTitle()}</span>
            {!isDesktop && (
              <Button
                size="icon"
                variant="ghost"
                onClick={() => {
                  setCollapsed(true);
                  setSubmenu(true);
                  setMenuOverlay(false);
                }}
                className="rounded-full h-8 w-8"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
            )}
          </h2>
          <ScrollArea className="h-[calc(100%-40px)] grow">
            <div className="px-4">
              <ul>
                {currentSubMenu?.map((childItem, j) => (
                  <li key={j} className="mb-1.5 last:mb-0">
                    <ModuleMenuItem
                      childItem={childItem}
                      toggleNested={toggleNested}
                      index={j}
                      nestedIndex={nestedIndex}
                      locationName={locationName}
                    />
                    <ModuleNestedMenus
                      index={j}
                      nestedIndex={nestedIndex}
                      nestedMenus={childItem.nested}
                      locationName={locationName}
                      toggleMulti={toggleMultiNested}
                      multiIndex={multiNestedIndex}
                    />
                  </li>
                ))}
              </ul>
            </div>
          </ScrollArea>
        </div>
      </div>
      {!isDesktop && (
        <MenuOverlayPortal
          isOpen={menuOverlay || collapsed}
          onClose={() => {
            setMenuOverlay(false);
            setSubmenu(true);
            setCollapsed(false);
          }}
        />
      )}
    </>
  );
};

export default ModuleSidebar;
