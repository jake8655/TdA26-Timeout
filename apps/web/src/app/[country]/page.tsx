import TenantHome, { tenantMetadata } from "@/components/tenant/tenant-home";

export const metadata = tenantMetadata;

export default function CountryHomePage() {
	return <TenantHome />;
}
