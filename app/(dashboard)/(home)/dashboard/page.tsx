import { getSeoMeta } from "@/lib/get-seo-meta";
import DashboardPageView from "./page-view";

export const metadata = getSeoMeta({
  title: "City Airport Taxis Dashboard",
  description: "City Airport Taxis Dashboard",
});

const Dashboard = () => {
  return <DashboardPageView />;
};

export default Dashboard;
