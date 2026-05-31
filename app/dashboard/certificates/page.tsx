import { redirect } from "next/navigation";

export default function DashboardCertificatesRedirectPage() {
  redirect("/certificate/my");
}
