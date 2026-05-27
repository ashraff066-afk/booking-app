"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../supabase";

const COLORS = {
  bg: "#0a0e1a",
  surface: "#111827",
  card: "#1a2235",
  border: "#1e2d45",
  accent: "#00d4aa",
  accentDim: "#00d4aa22",
  text: "#e2e8f0",
  muted: "#64748b",
  white: "#ffffff",
};

export default function ClientDashboard() {
  const [user, setUser] = useState<any>(null);
  const [client, setClient] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      window.location.href = "/client";
      return;
    }
    setUser(user);

    const { data: clientData } = await supabase
      .from("clients")
      .select("*")
      .eq("user_id", user.id)
      .single();
    setClient(clientData);

    if (clientData) {
      const { data: bookingsData } = await supabase
        .from("bookings")
        .select("*")
        .eq("sector", clientData.sector)
        .order("created_at", { ascending: false });
      setBookings(bookingsData || []);
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/client";
  };

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("bookings").update({ status }).eq("id", id);
    checkUser();
  };

  if (loading) {
    return (
      <div dir="rtl" style={{
        minHeight: "100vh", background: COLORS.bg,
        display: "flex", alignItems: "center", justifyContent: "center",
        color: COLORS.accent, fontSize: 18, fontFamily: "Tajawal, sans-serif",
      }}>جاري التحميل...</div>
    );
  }

  return (
    <div dir="rtl" style={{
      minHeight: "100vh", background: COLORS.bg, color: COLORS.text,
      fontFamily: "'Tajawal', 'Cairo', sans-serif", padding: 32,
    }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;800&display=swap'); * { box-sizing: border-box; margin: 0; padding: 0; }`}</style>

      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        {/* HEADER */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: COLORS.white }}>
              {client?.business_name || "لوحة التحكم"}
            </h1>
            <p style={{ color: COLORS.muted, fontSize: 13, marginTop: 4 }}>{user?.email}</p>
          </div>
          <button onClick={handleLogout} style={{
            background: "#ef444422", border: "1px solid #ef4444",
            borderRadius: 10, padding: "10px 20px", color: "#ef4444",
            fontWeight: 700, cursor: "pointer", fontFamily: "Tajawal, sans-serif",
          }}>خروج</button>
        </div>

        {/* STATS */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 32 }}>
          {[
            { label: "إجمالي الحجوزات", value: bookings.length, icon: "📋" },
            { label: "مؤكد", value: bookings.filter(b => b.status === "confirmed").length, icon: "✅" },
            { label: "انتظار", value: bookings.filter(b => b.status === "pending").length, icon: "⏳" },
          ].map((s, i) => (
            <div key={i} style={{
              background: COLORS.card, border: `1px solid ${COLORS.border}`,
              borderRadius: 14, padding: 20,
            }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
              <div style={{ fontSize: 32, fontWeight: 800, color: COLORS.white }}>{s.value}</div>
              <div style={{ fontSize: 13, color: COLORS.muted, marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* BOOKINGS */}
        <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 16, overflow: "hidden" }}>
          <div style={{ padding: "20px 24px", borderBottom: `1px solid ${COLORS.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ fontWeight: 700, color: COLORS.white }}>حجوزاتك</h3>
            <button onClick={checkUser} style={{
              background: COLORS.accentDim, border: `1px solid ${COLORS.accent}`,
              borderRadius: 8, padding: "6px 14px", color: COLORS.accent,
              fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "Tajawal, sans-serif",
            }}>🔄 تحديث</button>
          </div>

          {bookings.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center", color: COLORS.muted }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
              <div>لا توجد حجوزات بعد</div>
            </div>
          ) : (
            bookings.map((b, i) => (
              <div key={i} style={{
                display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr",
                padding: "16px 24px", alignItems: "center",
                borderBottom: i < bookings.length - 1 ? `1px solid ${COLORS.border}` : "none",
                background: i % 2 === 0 ? "transparent" : "#ffffff04",
              }}>
                <div>
                  <div style={{ fontWeight: 600, color: COLORS.white }}>{b.name}</div>
                  <div style={{ fontSize: 12, color: COLORS.muted }}>{b.phone}</div>
                </div>
                <div style={{ color: COLORS.text, fontSize: 14 }}>{b.service}</div>
                <div style={{ color: COLORS.text, fontSize: 13 }}>{b.time}</div>
                <div>
                  <span style={{
                    fontSize: 11, padding: "4px 10px", borderRadius: 20, fontWeight: 600,
                    background: b.status === "confirmed" ? "#00d4aa22" : b.status === "cancelled" ? "#ef444422" : "#f59e0b22",
                    color: b.status === "confirmed" ? "#00d4aa" : b.status === "cancelled" ? "#ef4444" : "#f59e0b",
                    border: `1px solid ${b.status === "confirmed" ? "#00d4aa44" : b.status === "cancelled" ? "#ef444444" : "#f59e0b44"}`,
                  }}>
                    {b.status === "confirmed" ? "مؤكد" : b.status === "cancelled" ? "ملغي" : "انتظار"}
                  </span>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  {b.status === "pending" && (
                    <button onClick={() => updateStatus(b.id, "confirmed")} style={{
                      background: "#00d4aa22", border: "1px solid #00d4aa",
                      borderRadius: 8, padding: "5px 10px", color: "#00d4aa",
                      fontSize: 11, cursor: "pointer", fontFamily: "Tajawal, sans-serif",
                    }}>تأكيد</button>
                  )}
                  {b.status !== "cancelled" && (
                    <button onClick={() => updateStatus(b.id, "cancelled")} style={{
                      background: "#ef444422", border: "1px solid #ef4444",
                      borderRadius: 8, padding: "5px 10px", color: "#ef4444",
                      fontSize: 11, cursor: "pointer", fontFamily: "Tajawal, sans-serif",
                    }}>إلغاء</button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}