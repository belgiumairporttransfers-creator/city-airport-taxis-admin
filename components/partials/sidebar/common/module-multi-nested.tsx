"use client";

import {
  Collapsible,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { cn, isLocationMatch } from "@/lib/utils";
import Link from "next/link";

const ModuleMultiNested = ({
  multiIndex,
  index,
  menus,
  locationName,
}: {
  multiIndex: number | null;
  index: number;
  menus: any;
  locationName: string;
}) => {
  return (
    <Collapsible open={multiIndex === index}>
      <CollapsibleContent className="CollapsibleContent">
        <ul className="sub-menu space-y-3 relative">
          {menus?.map((item: any, i: number) => (
            <li
              className="block ml-2 relative first:pt-4"
              key={`multi_sub_menu_${i}`}
            >
              <Link href={item.href}>
                <div
                  className={cn(
                    "pl-2 text-sm font-normal capitalize hover:text-primary gap-2 flex items-center group",
                    {
                      "text-primary": isLocationMatch(item.href, locationName),
                      "text-default-700": !isLocationMatch(
                        item.href,
                        locationName
                      ),
                    }
                  )}
                >
                  <span
                    className={cn(
                      "inline-flex h-2 w-2 border border-default-500 rounded-full",
                      {
                        "bg-primary ring-primary/30 ring-[4px] border-primary":
                          isLocationMatch(item.href, locationName),
                      }
                    )}
                  />
                  <span>{item.title}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default ModuleMultiNested;
