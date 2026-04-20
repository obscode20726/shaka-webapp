import HomeownerDashboard from "@/components/HomeownerDashboard";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function HomeownerDashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) {
    redirect("/signin/homeowner");
  }
  return <HomeownerDashboard />;
}
