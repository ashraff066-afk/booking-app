"use client";
import { useEffect, useState } from "react";
import { supabase } from "../supabase";

const COLORS = {
  bg: "#0a0e1a", surface: "#111827", card: "#1a2235",
  border: "#1e2d45", accent: "#00d4aa", accentDim: "#00d4aa22",
  text: "#e2e8f0", muted: "#64748b", white: "#ffffff",
};

const SECTORS = [
  { id: "all", label: "الكل", icon: "🌟" },
  { id: "clinic", label: "عيادات", icon: "🏥" },
  { id: "salon", label: "صالونات", icon: "✂️" },
  { id: "hotel", label: "شاليهات", icon: "🏨" },
];

export default function ExplorePage() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sector, setSector] = useState("all");
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [cities, setCities] = useState<string[]>([]);

  useEffect(() => { loadClients(); }, []);

  const loadClients = async () => {
    const { data } = await supabase
      .from("clients")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });
    setClients(data || []);
const uniqueCities: string[] = Array.from(new Set((data || []).map((c: any) => c.city).filter(Boolean)));
    setLoading(false);
  };

  const filtered = clients.filter(c => {
    const matchSector = sector === "all" || c.sector === sector;
    const matchSearch = !search || c.business_name?.includes(search) || c.specialty?.includes(search);
    const matchCity = !city || c.city === city;
    return matchSector && matchSearch && matchCity;
  });

  if (loading) return (
    <div dir="rtl" style={{ minHeight: "100vh", background: COLORS.bg, display: "flex", alignItems: "center", justifyContent: "center", color: COLORS.accent, fontSize: 18, fontFamily: "Tajawal, sans-serif" }}>جاري التحميل...</div>
  );

  return (
    <div dir="rtl" style={{ minHeight: "100vh", background: COLORS.bg, color: COLORS.text, fontFamily: "'Tajawal','Cairo',sans-serif", paddingBottom: 40 }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;800;900&display=swap'); *{box-sizing:border-box;margin:0;padding:0}`}</style>

      {/* HEADER */}
      <div style={{ background: "linear-gradient(135deg,#0d1424,#111827)", borderBottom: `1px solid ${COLORS.border}`, padding: "32px 24px", textAlign: "center" }}>
        <div style={{ width: 60, height: 60, borderRadius: 16, background: "linear-gradient(135deg,#00d4aa,#0070f3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 900, color: "#000", margin: "0 auto 14px", boxShadow: "0 8px 32px #00d4aa44" }}>م</div>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: COLORS.white, marginBottom: 8 }}>موعدي</h1>
        <p style={{ fontSize: 15, color: COLORS.muted }}>اختر الخدمة المناسبة وأحجز موعدك</p>
      </div>

      <div style={{ maxWidth: 700, margin: "0 auto", padding: "24px 16px" }}>

        {/* بحث */}
        <div style={{ marginBottom: 16 }}>
          <input type="text" placeholder="🔍 ابحث عن عيادة، صالون، تخصص..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: "100%", padding: "13px 16px", borderRadius: 12, background: COLORS.card, border: `1px solid ${COLORS.border}`, color: COLORS.text, fontSize: 14, outline: "none", fontFamily: "Tajawal,sans-serif" }} />
        </div>

        {/* فلتر القطاع */}
        <div style={{ display: "flex", gap: 8, marginBottom: 14, overflowX: "auto", paddingBottom: 4 }}>
          {SECTORS.map(s => (
            <button key={s.id} onClick={() => setSector(s.id)} style={{ padding: "9px 18px", borderRadius: 10, cursor: "pointer", fontSize: 13, fontFamily: "Tajawal,sans-serif", fontWeight: 700, background: sector === s.id ? COLORS.accentDim : COLORS.card, color: sector === s.id ? COLORS.accent : COLORS.muted, border: `1px solid ${sector === s.id ? COLORS.accent : COLORS.border}`, whiteSpace: "nowrap", flexShrink: 0 }}>{s.icon} {s.label}</button>
          ))}
        </div>

        {/* فلتر المدينة */}
        {cities.length > 0 && (
          <div style={{ display: "flex", gap: 8, marginBottom: 20, overflowX: "auto", paddingBottom: 4 }}>
            <button onClick={() => setCity("")} style={{ padding: "7px 14px", borderRadius: 20, cursor: "pointer", fontSize: 12, fontFamily: "Tajawal,sans-serif", fontWeight: 600, background: !city ? COLORS.accentDim : COLORS.card, color: !city ? COLORS.accent : COLORS.muted, border: `1px solid ${!city ? COLORS.accent : COLORS.border}`, whiteSpace: "nowrap", flexShrink: 0 }}>🌍 كل المدن</button>
            {cities.map(c => (
              <button key={c} onClick={() => setCity(c)} style={{ padding: "7px 14px", borderRadius: 20, cursor: "pointer", fontSize: 12, fontFamily: "Tajawal,sans-serif", fontWeight: 600, background: city === c ? COLORS.accentDim : COLORS.card, color: city === c ? COLORS.accent : COLORS.muted, border: `1px solid ${city === c ? COLORS.accent : COLORS.border}`, whiteSpace: "nowrap", flexShrink: 0 }}>📍 {c}</button>
            ))}
          </div>
        )}

        {/* النتائج */}
        <p style={{ color: COLORS.muted, fontSize: 12, marginBottom: 14 }}>{filtered.length} نتيجة</p>

        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: 40, color: COLORS.muted }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>😕</div>
            <div>ما في نتائج</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {filtered.map((c, i) => (
              <div key={i} onClick={() => window.location.href = `/book/${c.slug}/profile`} style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 18, cursor: "pointer", display: "flex", gap: 14, alignItems: "center", transition: "all 0.2s" }}>
                {/* صورة أو أيقونة */}
                {c.image_url ? (
                  <img src={c.image_url} alt={c.business_name} style={{ width: 70, height: 70, borderRadius: 14, objectFit: "cover", flexShrink: 0 }} />
                ) : (
                  <div style={{ width: 70, height: 70, borderRadius: 14, background: "linear-gradient(135deg,#00d4aa,#0070f3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, flexShrink: 0 }}>
                    {c.sector === "clinic" ? "🏥" : c.sector === "salon" ? "✂️" : "🏨"}
                  </div>
                )}
                {/* التفاصيل */}
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, color: COLORS.white, fontSize: 16, marginBottom: 4 }}>{c.business_name}</div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
                    {c.specialty && <span style={{ fontSize: 12, color: COLORS.accent, fontWeight: 600 }}>🎯 {c.specialty}</span>}
                    {c.city && <span style={{ fontSize: 12, color: COLORS.muted }}>📍 {c.city}</span>}
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, fontWeight: 600, background: c.sector === "clinic" ? "#3b82f622" : c.sector === "salon" ? "#ec489922" : "#f59e0b22", color: c.sector === "clinic" ? "#3b82f6" : c.sector === "salon" ? "#ec4899" : "#f59e0b", border: `1px solid ${c.sector === "clinic" ? "#3b82f644" : c.sector === "salon" ? "#ec489944" : "#f59e0b44"}` }}>
                      {c.sector === "clinic" ? "🏥 عيادة" : c.sector === "salon" ? "✂️ صالون" : "🏨 شاليه"}
                    </span>
                  </div>
                </div>
                <div style={{ color: COLORS.accent, fontSize: 20 }}>←</div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}