"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../../../supabase";
const COLORS = {
  bg: "#0a0e1a", surface: "#111827", card: "#1a2235",
  border: "#1e2d45", accent: "#00d4aa", accentDim: "#00d4aa22",
  text: "#e2e8f0", muted: "#64748b", white: "#ffffff",
};

const DAYS = [
  { id: "saturday", label: "السبت" }, { id: "sunday", label: "الأحد" },
  { id: "monday", label: "الاثنين" }, { id: "tuesday", label: "الثلاثاء" },
  { id: "wednesday", label: "الأربعاء" }, { id: "thursday", label: "الخميس" },
  { id: "friday", label: "الجمعة" },
];

export default function ProfilePage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [client, setClient] = useState<any>(null);
  const [schedule, setSchedule] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => { if (slug) loadData(); }, [slug]);

  const loadData = async () => {
    const { data, error } = await supabase.from("clients").select("*").eq("slug", slug).limit(1);
    if (error || !data || data.length === 0) { setNotFound(true); setLoading(false); return; }
    const clientData = data[0];
    setClient(clientData);

    const { data: schData } = await supabase.from("schedules").select("*").eq("client_id", clientData.id).limit(1);
    setSchedule(schData?.[0] || null);

    const { data: servicesData } = await supabase.from("services").select("*").eq("client_id", clientData.id).order("created_at", { ascending: true });
    setServices(servicesData || []);

    const { data: reviewsData } = await supabase.from("reviews").select("*").limit(10);
    setReviews(reviewsData || []);

    setLoading(false);
  };

  if (loading) return (
    <div dir="rtl" style={{ minHeight: "100vh", background: COLORS.bg, display: "flex", alignItems: "center", justifyContent: "center", color: COLORS.accent, fontSize: 18, fontFamily: "Tajawal, sans-serif" }}>جاري التحميل...</div>
  );

  if (notFound) return (
    <div dir="rtl" style={{ minHeight: "100vh", background: COLORS.bg, display: "flex", alignItems: "center", justifyContent: "center", color: COLORS.text, fontFamily: "Tajawal, sans-serif", textAlign: "center" }}>
      <div><div style={{ fontSize: 64, marginBottom: 16 }}>😕</div><h2 style={{ color: COLORS.white }}>الصفحة غير موجودة</h2></div>
    </div>
  );

  const sectorIcon = client.sector === "clinic" ? "🏥" : client.sector === "salon" ? "✂️" : "🏨";
  const sectorLabel = client.sector === "clinic" ? "عيادة" : client.sector === "salon" ? "صالون" : "شاليه / فندق";
  const avgRating = reviews.length > 0 ? (reviews.reduce((a, r) => a + (r.rating || 0), 0) / reviews.length).toFixed(1) : null;

  return (
    <div dir="rtl" style={{ minHeight: "100vh", background: COLORS.bg, color: COLORS.text, fontFamily: "'Tajawal','Cairo',sans-serif", paddingBottom: 100 }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;800;900&display=swap'); *{box-sizing:border-box;margin:0;padding:0}`}</style>

      {/* HERO */}
      <div style={{ background: "linear-gradient(135deg,#0d1424,#111827)", borderBottom: `1px solid ${COLORS.border}`, padding: "40px 24px 32px", textAlign: "center" }}>
        <div style={{ width: 80, height: 80, borderRadius: 22, background: "linear-gradient(135deg,#00d4aa,#0070f3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, margin: "0 auto 16px", boxShadow: "0 8px 32px #00d4aa44" }}>{sectorIcon}</div>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: COLORS.white, marginBottom: 8 }}>{client.business_name}</h1>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
          <span style={{ background: COLORS.accentDim, border: `1px solid ${COLORS.accent}44`, borderRadius: 20, padding: "4px 14px", fontSize: 13, color: COLORS.accent, fontWeight: 700 }}>{sectorIcon} {sectorLabel}</span>
          {client.address && <span style={{ fontSize: 13, color: COLORS.muted }}>📍 {client.address}</span>}
          {avgRating && <span style={{ fontSize: 13, color: "#f59e0b", fontWeight: 700 }}>⭐ {avgRating} ({reviews.length} تقييم)</span>}
        </div>
      </div>

      <div style={{ maxWidth: 600, margin: "0 auto", padding: "24px 16px" }}>

        {/* ساعات العمل */}
        {schedule && (
          <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 20, marginBottom: 16 }}>
            <h3 style={{ fontWeight: 700, color: COLORS.white, marginBottom: 14, fontSize: 15 }}>🕐 ساعات العمل</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {schedule.morning_enabled && (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: COLORS.surface, borderRadius: 10, padding: "12px 16px" }}>
                  <span style={{ fontSize: 14, color: COLORS.text, fontWeight: 600 }}>🌅 الصباح</span>
                  <span style={{ fontSize: 14, color: COLORS.accent, fontWeight: 700 }}>{schedule.morning_start} — {schedule.morning_end}</span>
                </div>
              )}
              {schedule.evening_enabled && (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: COLORS.surface, borderRadius: 10, padding: "12px 16px" }}>
                  <span style={{ fontSize: 14, color: COLORS.text, fontWeight: 600 }}>🌙 المساء</span>
                  <span style={{ fontSize: 14, color: COLORS.accent, fontWeight: 700 }}>{schedule.evening_start} — {schedule.evening_end}</span>
                </div>
              )}
            </div>
            {/* أيام الدوام */}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 12 }}>
              {DAYS.map(d => {
                const active = schedule.work_days?.includes(d.id);
                return <span key={d.id} style={{ padding: "5px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600, background: active ? COLORS.accentDim : COLORS.surface, color: active ? COLORS.accent : COLORS.muted, border: `1px solid ${active ? COLORS.accent : COLORS.border}` }}>{active ? "✓ " : ""}{d.label}</span>;
              })}
            </div>
          </div>
        )}

        {/* الخدمات */}
        {services.length > 0 && (
          <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 20, marginBottom: 16 }}>
            <h3 style={{ fontWeight: 700, color: COLORS.white, marginBottom: 14, fontSize: 15 }}>🛎️ الخدمات</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {services.map((s, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: COLORS.surface, borderRadius: 10, padding: "12px 16px" }}>
                  <span style={{ fontSize: 14, color: COLORS.text, fontWeight: 600 }}>🛎️ {s.name}</span>
                  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <span style={{ fontSize: 12, color: COLORS.muted }}>⏱ {s.duration} دق</span>
                    {s.price > 0 && <span style={{ fontSize: 13, color: COLORS.accent, fontWeight: 700 }}>{s.price.toLocaleString()} د.ع</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* التقييمات */}
        {reviews.length > 0 && (
          <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 20, marginBottom: 16 }}>
            <h3 style={{ fontWeight: 700, color: COLORS.white, marginBottom: 14, fontSize: 15 }}>⭐ آراء الزبائن</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {reviews.slice(0, 5).map((r, i) => (
                <div key={i} style={{ background: COLORS.surface, borderRadius: 10, padding: "12px 16px" }}>
                  <div style={{ display: "flex", gap: 4, marginBottom: 6 }}>
                    {[1,2,3,4,5].map(s => <span key={s} style={{ fontSize: 14, filter: r.rating >= s ? "none" : "grayscale(1)" }}>⭐</span>)}
                  </div>
                  {r.comment && <p style={{ fontSize: 13, color: COLORS.muted, lineHeight: 1.6 }}>{r.comment}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* زر الحجز ثابت */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, padding: "16px", background: "#0a0e1acc", backdropFilter: "blur(10px)", borderTop: `1px solid ${COLORS.border}` }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <button onClick={() => window.location.href = `/book/${slug}`} style={{ width: "100%", padding: "15px", background: "linear-gradient(90deg,#00d4aa,#0070f3)", border: "none", borderRadius: 12, fontSize: 17, fontWeight: 700, cursor: "pointer", color: "#000", fontFamily: "Tajawal,sans-serif" }}>
            📅 احجز موعدك الآن
          </button>
        </div>
      </div>

    </div>
  );
}