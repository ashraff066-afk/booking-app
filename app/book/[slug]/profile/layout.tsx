import { supabase } from "../../../supabase";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const { data } = await supabase
    .from("clients")
    .select("business_name, sector, address, city, specialty")
    .eq("slug", params.slug)
    .single();

  if (!data) return { title: "موعدي" };

  const sectorLabel = data.sector === "clinic" ? "عيادة" : data.sector === "salon" ? "صالون" : "شاليه";
  const title = `${data.business_name} — ${sectorLabel} | موعدي`;
  const description = `احجز موعدك في ${data.business_name}${data.specialty ? ` — ${data.specialty}` : ""}${data.city ? ` في ${data.city}` : ""}. نظام حجز سهل وسريع.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      siteName: "موعدي",
    },
  };
}

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}