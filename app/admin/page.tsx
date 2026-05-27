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
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [pass, setPass] = useState("");
  const [passError, setPassError] = useState(false);
  const [activeSection, setActiveSection] = useState("bookings");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterSector, setFilterSector] = useState("all");

  useEffect(() => {
    if (authed) { fetchBookings(); fetchClients(); }
  }, [authed]);

  useEffect(() => {
    if (!authed) return;
    fetchBookings();
  }, [search, filterStatus, filterSector]);

  const fetchBookings = async () => {
    setLoading(true);
    let query = supabase.from("bookings").select("*").order("created_at", { ascending: false });
    if (filterStatus !== "all") query = query.eq("status", filterStatus);
    if (filterSector !== "all") query = query.eq("sector", filterSector);
    if (search.trim() !== "") {
      query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%,service.ilike.%${search}%`);
    }
    const { data } = await query;
    setBookings(data || []);
    setLoading(false);
  };

  const fetchClients = async () => {
    const { data } = await supabase.from("clients").select("*").order("created_at", { ascending: false });
    setClients(data || []);
  };

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("bookings").update({ status }).eq("id", id);
    fetchBookings();
  };

  const toggleClientActive = async (id: string, current: boolean) => {
    await supabase.from("clients").update({ is_active: !current }).eq("id", id);
    fetchClients();
  };

  const handleLogin = () => {
    if (pass === ADMIN_PASSWORD) { setAuthed(true); setPassError(false); }
    else { setPassError(true); }
  };

  if (!authed) {
    return (
      <div dir="rtl" style={{ minHeight: "100vh", background: COLORS.bg, color: COLORS.text, fontFamily: "'Tajawal', 'Cairo', sans-serif", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;800&display=swap'); * { box-sizing: border-box; margin: 0; padding: 0; }`}</style>
        <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 20, padding: 40, width: 380 }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ width: 56, height: 56, borderRadius: 14, margin: "0 auto 16px", background: "linear-gradient(135deg, #00d4aa, #0070f3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 900, color: "#000" }}>ح</div>
            <h2 style={{ fontWeight: 800, fontSize: 22, color: COLORS.white }}>لوحة التحكم</h2>
            <p style={{ color: COLORS.muted, fontSize: 14, marginTop: 8 }}>أدخل كلمة السر للدخول</p>
          </div>
          <input type="password" placeholder="كلمة السر" value={pass} onChange={e => setPass(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()} style={{ width: "100%", padding: "12px 16px", borderRadius: 10, background: COLORS.surface, border: `1px solid ${passError ? "#ef4444" : COLORS.border}`, color: COLORS.text, fontSize: 14, outline: "none", fontFamily: "Tajawal, sans-serif", marginBottom: 8 }} />
          {passError && <p style={{ color: "#ef4444", fontSize: 13, marginBottom: 12 }}>كلمة السر غلط!</p>}
          <button onClick={handleLogin} style={{ width: "100%", padding: "14px", background: "linear-gradient(90deg, #00d4aa, #0070f3)", border: "none", borderRadius: 10, fontSize: 16, fontWeight: 700, cursor: "pointer", color: "#000", fontFamily: "Tajawal, sans-serif", marginTop: 8 }}>دخول</button>
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl" style={{ minHeight: "100vh", background: COLORS.bg, color: COLORS.text, fontFamily: "'Tajawal', 'Cairo', sans-serif", padding: 32 }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;800&display=swap'); * { box-sizing: border-box; margin: 0; padding: 0; }`}</style>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: COLORS.white }}>لوحة التحكم</h1>
            <p style={{ color: COLORS.muted, marginTop: 4 }}>إدارة الحجوزات والعملاء</p>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <button onClick={() => { fetchBookings(); fetchClients(); }} style={{ background: COLORS.accentDim, border: `1px solid ${COLORS.accent}`, borderRadius: 10, padding: "10px 20px", color: COLORS.accent, fontWeight: 700, cursor: "pointer", fontFamily: "Tajawal, sans-serif" }}>🔄 تحديث</button>
            <button onClick={() => setAuthed(false)} style={{ background: "#ef444422", border: "1px solid #ef4444", borderRadius: 10, padding: "10px 20px", color: "#ef4444", fontWeight: 700, cursor: "pointer", fontFamily: "Tajawal, sans-serif" }}>خروج</button>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
          {[{ id: "bookings", label: "📋 الحجوزات" }, { id: "clients", label: "👥 العملاء" }].map(t => (
            <button key={t.id} onClick={() => setActiveSection(t.id)} style={{ padding: "10px 24px", borderRadius: 10, cursor: "pointer", fontSize: 14, fontFamily: "Tajawal, sans-serif", fontWeight: 700, background: activeSection === t.id ? COLORS.accentDim : COLORS.surface, color: activeSection === t.id ? COLORS.accent : COLORS.muted, border: `1px solid ${activeSection === t.id ? COLORS.accent : COLORS.border}` }}>{t.label}</button>
          ))}
        </div>

        {activeSection === "bookings" && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
              {[
                { label: "الكل", value: bookings.length, icon: "📋", color: COLORS.accent },
                { label: "انتظار", value: bookings.filter(b => b.status === "pending").length, icon: "⏳", color: "#f59e0b" },
                { label: "مؤكد", value: bookings.filter(b => b.status === "confirmed").length, icon: "✅", color: "#00d4aa" },
                { label: "ملغي", value: bookings.filter(b => b.status === "cancelled").length, icon: "❌", color: "#ef4444" },
              ].map((s, i) => (
                <div key={i} style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: 20, cursor: "pointer" }} onClick={() => setFilterStatus(i === 0 ? "all" : ["pending", "confirmed", "cancelled"][i - 1])}>
                  <div style={{ fontSize: 24, marginBottom: 6 }}>{s.icon}</div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 13, color: COLORS.muted, marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 12, marginBottom: 20 }}>
              <input type="text" placeholder="🔍 ابحث بالاسم أو الهاتف أو الخدمة..." value={search} onChange={e => setSearch(e.target.value)} style={{ padding: "12px 16px", borderRadius: 10, background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.text, fontSize: 14, outline: "none", fontFamily: "Tajawal, sans-serif" }} />
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ padding: "12px 16px", borderRadius: 10, background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.text, fontSize: 14, outline: "none", fontFamily: "Tajawal, sans-serif" }}>
                <option value="all">كل الحالات</option>
                <option value="pending">انتظار</option>
                <option value="confirmed">مؤكد</option>
                <option value="cancelled">ملغي</option>
              </select>
              <select value={filterSector} onChange={e => setFilterSector(e.target.value)} style={{ padding: "12px 16px", borderRadius: 10, background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.text, fontSize: 14, outline: "none", fontFamily: "Tajawal, sans-serif" }}>
                <option value="all">كل القطاعات</option>
                <option value="clinic">🏥 عيادة</option>
                <option value="salon">✂️ صالون</option>
                <option value="hotel">🏨 شاليه</option>
              </select>
            </div>

            <p style={{ color: COLORS.muted, fontSize: 13, marginBottom: 12 }}>عدد النتائج: {bookings.length}</p>

            <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 16, overflow: "hidden" }}>
              <div style={{ padding: "20px 24px", borderBottom: `1px solid ${COLORS.border}` }}>
                <h3 style={{ fontWeight: 700, color: COLORS.white }}>الحجوزات</h3>
              </div>
              {loading ? (
                <div style={{ padding: 40, textAlign: "center", color: COLORS.muted }}>جاري التحميل...</div>
              ) : bookings.length === 0 ? (
                <div style={{ padding: 40, textAlign: "center", color: COLORS.muted }}>لا توجد نتائج</div>
              ) : (
                bookings.map((b, i) => (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", padding: "16px 24px", alignItems: "center", borderBottom: i < bookings.length - 1 ? `1px solid ${COLORS.border}` : "none", background: i % 2 === 0 ? "transparent" : "#ffffff04" }}>
                    <div>
                      <div style={{ fontWeight: 600, color: COLORS.white }}>{b.name}</div>
                      <div style={{ fontSize: 12, color: COLORS.muted }}>{b.phone}</div>
                    </div>
                    <div style={{ color: COLORS.text, fontSize: 14 }}>{b.service}</div>
                    <div style={{ color: COLORS.text, fontSize: 13 }}>{b.time}</div>
                    <div>
                      <span style={{ fontSize: 11, padding: "4px 10px", borderRadius: 20, fontWeight: 600, background: b.status === "confirmed" ? "#00d4aa22" : b.status === "cancelled" ? "#ef444422" : "#f59e0b22", color: b.status === "confirmed" ? "#00d4aa" : b.status === "cancelled" ? "#ef4444" : "#f59e0b", border: `1px solid ${b.status === "confirmed" ? "#00d4aa44" : b.status === "cancelled" ? "#ef444444" : "#f59e0b44"}` }}>
                        {b.status === "confirmed" ? "مؤكد" : b.status === "cancelled" ? "ملغي" : "انتظار"}
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      {b.status === "pending" && (
                        <button onClick={() => updateStatus(b.id, "confirmed")} style={{ background: "#00d4aa22", border: "1px solid #00d4aa", borderRadius: 8, padding: "6px 12px", color: "#00d4aa", fontSize: 12, cursor: "pointer", fontFamily: "Tajawal, sans-serif" }}>تأكيد</button>
                      )}
                      {b.status !== "cancelled" && (
                        <button onClick={() => updateStatus(b.id, "cancelled")} style={{ background: "#ef444422", border: "1px solid #ef4444", borderRadius: 8, padding: "6px 12px", color: "#ef4444", fontSize: 12, cursor: "pointer", fontFamily: "Tajawal, sans-serif" }}>إلغاء</button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {activeSection === "clients" && (
          <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 16, overflow: "hidden" }}>
            <div style={{ padding: "20px 24px", borderBottom: `1px solid ${COLORS.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontWeight: 700, color: COLORS.white }}>العملاء المسجلين ({clients.length})</h3>
            </div>
            {clients.length === 0 ? (
              <div style={{ padding: 40, textAlign: "center", color: COLORS.muted }}>لا يوجد عملاء بعد</div>
            ) : (
              clients.map((c, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", padding: "16px 24px", alignItems: "center", borderBottom: i < clients.length - 1 ? `1px solid ${COLORS.border}` : "none", background: i % 2 === 0 ? "transparent" : "#ffffff04" }}>
                  <div>
                    <div style={{ fontWeight: 600, color: COLORS.white }}>{c.business_name}</div>
                    <div style={{ fontSize: 12, color: COLORS.muted }}>{c.phone}</div>
                  </div>
                  <div style={{ color: COLORS.text, fontSize: 14 }}>
                    {c.sector === "clinic" ? "🏥 عيادة" : c.sector === "salon" ? "✂️ صالون" : "🏨 شاليه"}
                  </div>
                  <div>
                    <span style={{ fontSize: 11, padding: "4px 10px", borderRadius: 20, fontWeight: 600, background: c.is_active ? "#00d4aa22" : "#ef444422", color: c.is_active ? "#00d4aa" : "#ef4444", border: `1px solid ${c.is_active ? "#00d4aa44" : "#ef444444"}` }}>{c.is_active ? "✅ مفعّل" : "⏳ انتظار الدفع"}</span>
                  </div>
                  <div>
                    <button onClick={() => toggleClientActive(c.id, c.is_active)} style={{ background: c.is_active ? "#ef444422" : "#00d4aa22", border: `1px solid ${c.is_active ? "#ef4444" : "#00d4aa"}`, borderRadius: 8, padding: "6px 12px", color: c.is_active ? "#ef4444" : "#00d4aa", fontSize: 12, cursor: "pointer", fontFamily: "Tajawal, sans-serif" }}>{c.is_active ? "إيقاف" : "تفعيل ✓"}</button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

      </div>
    </div>
  );
}