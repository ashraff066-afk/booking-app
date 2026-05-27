"use client";
import { useEffect, useState } from "react";
import { supabase } from "../supabase";

const ADMIN_PASSWORD = "hojozati2024";

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

export default function AdminPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [pass, setPass] = useState("");
  const [passError, setPassError] = useState(false);

  useEffect(() => {
    if (authed) fetchBookings();
  }, [authed]);

  const fetchBookings = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false });
    setBookings(data || []);
    setLoading(false);
  };

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("bookings").update({ status }).eq("id", id);
    fetchBookings();
  };

  const handleLogin = () => {
    if (pass === ADMIN_PASSWORD) {
      setAuthed(true);
      setPassError(false);
    } else {
      setPassError(true);
    }
  };

  if (!authed) {
    return (
      <div dir="rtl" style={{
        minHeight: "100vh", background: COLORS.bg, color: COLORS.text,
        fontFamily: "'Tajawal', 'Cairo', sans-serif",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;800&display=swap');`}</style>
        <div style={{
          background: COLORS.card, border: `1px solid ${COLORS.border}`,
          borderRadius: 20, padding: 40, width: 380,
        }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 14, margin: "0 auto 16px",
              background: "linear-gradient(135deg, #00d4aa, #0070f3)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 24, fontWeight: 900, color: "#000",
            }}>ح</div>
            <h2 style={{ fontWeight: 800, fontSize: 22, color: COLORS.white }}>لوحة التحكم</h2>
            <p style={{ color: COLORS.muted, fontSize: 14, marginTop: 8 }}>أدخل كلمة السر للدخول</p>
          </div>
          <input
            type="password"
            placeholder="كلمة السر"
            value={pass}
            onChange={e => setPass(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleLogin()}
            style={{
              width: "100%", padding: "12px 16px", borderRadius: 10,
              background: COLORS.surface, border: `1px solid ${passError ? "#ef4444" : COLORS.border}`,
              color: COLORS.text, fontSize: 14, outline: "none",
              fontFamily: "Tajawal, sans-serif", marginBottom: 8,
            }}
          />
          {passError && <p style={{ color: "#ef4444", fontSize: 13, marginBottom: 12 }}>كلمة السر غلط!</p>}
          <button onClick={handleLogin} style={{
            width: "100%", padding: "14px",
            background: "linear-gradient(90deg, #00d4aa, #0070f3)",
            border: "none", borderRadius: 10, fontSize: 16,
            fontWeight: 700, cursor: "pointer", color: "#000",
            fontFamily: "Tajawal, sans-serif", marginTop: 8,
          }}>دخول</button>
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl" style={{
      minHeight: "100vh", background: COLORS.bg, color: COLORS.text,
      fontFamily: "'Tajawal', 'Cairo', sans-serif", padding: 32,
    }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: COLORS.white }}>لوحة التحكم</h1>
            <p style={{ color: COLORS.muted, marginTop: 4 }}>كل الطلبات والاشتراكات</p>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <button onClick={fetchBookings} style={{
              background: COLORS.accentDim, border: `1px solid ${COLORS.accent}`,
              borderRadius: 10, padding: "10px 20px", color: COLORS.accent,
              fontWeight: 700, cursor: "pointer", fontFamily: "Tajawal, sans-serif",
            }}>🔄 تحديث</button>
            <button onClick={() => setAuthed(false)} style={{
              background: "#ef444422", border: "1px solid #ef4444",
              borderRadius: 10, padding: "10px 20px", color: "#ef4444",
              fontWeight: 700, cursor: "pointer", fontFamily: "Tajawal, sans-serif",
            }}>خروج</button>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 32 }}>
          {[
            { label: "إجمالي الطلبات", value: bookings.length, icon: "📋" },
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

        <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 16, overflow: "hidden" }}>
          <div style={{ padding: "20px 24px", borderBottom: `1px solid ${COLORS.border}` }}>
            <h3 style={{ fontWeight: 700, color: COLORS.white }}>الطلبات</h3>
          </div>
          {loading ? (
            <div style={{ padding: 40, textAlign: "center", color: COLORS.muted }}>جاري التحميل...</div>
          ) : bookings.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center", color: COLORS.muted }}>لا توجد طلبات بعد</div>
          ) : (
            <div>
              {bookings.map((b, i) => (
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
                  <div style={{ color: COLORS.text, fontSize: 14 }}>{b.time}</div>
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
                  <div style={{ display: "flex", gap: 8 }}>
                    {b.status === "pending" && (
                      <button onClick={() => updateStatus(b.id, "confirmed")} style={{
                        background: "#00d4aa22", border: "1px solid #00d4aa",
                        borderRadius: 8, padding: "6px 12px", color: "#00d4aa",
                        fontSize: 12, cursor: "pointer", fontFamily: "Tajawal, sans-serif",
                      }}>تأكيد</button>
                    )}
                    {b.status !== "cancelled" && (
                      <button onClick={() => updateStatus(b.id, "cancelled")} style={{
                        background: "#ef444422", border: "1px solid #ef4444",
                        borderRadius: 8, padding: "6px 12px", color: "#ef4444",
                        fontSize: 12, cursor: "pointer", fontFamily: "Tajawal, sans-serif",
                      }}>إلغاء</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}