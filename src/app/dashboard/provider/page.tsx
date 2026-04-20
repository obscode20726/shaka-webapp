import ProviderDashboard from "@/components/ProviderDashboard";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function ProviderDashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) {
    redirect("/signin/provider");
  }
  return <ProviderDashboard />;
}
