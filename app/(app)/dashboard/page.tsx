import { getKpis, listCcss } from "@/lib/queries";
import { DashboardView } from "@/components/dashboard/dashboard-view";

export default async function DashboardPage() {
  const [kpis, ccss] = await Promise.all([getKpis(), listCcss()]);

  return <DashboardView kpis={kpis} ccss={ccss} />;
}
