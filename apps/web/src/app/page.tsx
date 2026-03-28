import { redirect } from "next/navigation";

import { getDefaultCountryPath } from "@/lib/tenant-routing";

export default function Home() {
	redirect(getDefaultCountryPath());
}
