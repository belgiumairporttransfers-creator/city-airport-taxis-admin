import Image, { type StaticImageData } from "next/image";
import blankVector from "./svg/man-vector.svg";
import { cn } from "@/lib/utils";

interface BlankProps {
  children: React.ReactNode;
  img?: React.ReactNode;
  className?: string;
}

const DefaultBlankImage = () => (
  <Image
    src={blankVector as StaticImageData}
    alt=""
    width={240}
    height={240}
    className="h-full w-full object-contain"
  />
);

const Blank = ({ children, img, className }: BlankProps) => {
  const illustration = img ?? <DefaultBlankImage />;

  return (
    <div className={cn("text-center", className)}>
      {illustration && <div className="mx-auto h-[240px] w-[240px]">{illustration}</div>}
      {children}
    </div>
  );
};

export default Blank;
