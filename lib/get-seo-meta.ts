import type { Metadata } from "next";

type TGetSeoMetaProps = Metadata | void;

export const getSeoMeta = (props: TGetSeoMetaProps): Metadata => {
  const {
    title,
    applicationName = "DashTail Dashboard",
    description = "Created by Codeshaper",
    // manifest = "/assets/fav-icon/site.webmanifest",
    icons = {
      icon: "/assets/fav-icon/favicon-32x32.png",
      apple: "/assets/fav-icon/apple-touch-icon.png",
    },
    ...restProps
  } = props || {};
  const finalTitle = title
    ? `${title} | DashTail Dashboard`
    : "DashTail Dashboard";

  return {
    title: finalTitle,
    applicationName,
    description,
    icons,
    // manifest,
    ...restProps,
  };
};
