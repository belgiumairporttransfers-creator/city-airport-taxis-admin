import { cn, isLocationMatch } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

function NavLink({
  childItem,
  locationName,
}: {
  childItem: any;
  locationName: string;
}) {
  const { href, title, badge } = childItem;
  return (
    <Link
      href={href}
      className={cn(
        "flex font-medium text-sm capitalize px-[10px] py-3 gap-3 rounded-md cursor-pointer",
        {
          "bg-primary text-primary-foreground": isLocationMatch(
            href,
            locationName
          ),
          "text-default-600": !isLocationMatch(href, locationName),
        }
      )}
    >
      {childItem.icon && (
        <span className="inline-flex items-center grow-0">
          <childItem.icon className="h-5 w-5" />
        </span>
      )}
      <div className="grow truncate">{title}</div>
      {badge && <Badge className="rounded h-min">{badge}</Badge>}
    </Link>
  );
}

const ModuleMenuItem = ({
  childItem,
  toggleNested,
  nestedIndex,
  index,
  locationName,
}: {
  childItem: any;
  toggleNested: (subIndex: number) => void;
  nestedIndex: number | null;
  index: number;
  locationName: string;
}) => {
  const { title } = childItem;

  if (!childItem?.nested) {
    return (
      <div className="flex-1">
        <NavLink childItem={childItem} locationName={locationName} />
      </div>
    );
  }

  return (
    <div
      className={cn("flex items-center gap-3 px-[10px] py-3 rounded-md", {
        "bg-primary text-primary-foreground": nestedIndex === index,
        "text-default-600": nestedIndex !== index,
      })}
    >
      <div
        className="flex font-medium text-sm capitalize gap-3 cursor-pointer flex-1"
        onClick={() => toggleNested(index)}
      >
        <span className="inline-flex items-center grow-0">
          <childItem.icon className="h-5 w-5" />
        </span>
        <span className="grow truncate">{title}</span>
      </div>
      <div
        className={cn("flex-none transition-all duration-200 text-default-500", {
          "transform rotate-90 text-primary-foreground": nestedIndex === index,
        })}
      >
        <ChevronRight className="w-3.5 h-3.5" />
      </div>
    </div>
  );
};

export default ModuleMenuItem;
