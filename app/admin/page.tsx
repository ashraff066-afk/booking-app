"use client";
import { useEffect, useState } from "react";
import { supabase } from "../supabase";

const ADMIN_PASSWORD = "hojozati2024";

const COLORS = {
  bg: "#0a0e1a", surface: "#111827", card: "#1a2235",
  border: "#1e2d45", accent: "#00d4aa", accentDim: "#00d4aa22",
  text: "#e2e8f0", muted: "#64748b", white: "#ffffff",
};

const ARABIC_MONTHS = ["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"];

function getSubscriptionDaysLeft(subscription_end: string | null) {
  if (!subscription_end) return null;
  return Math.ceil((new Date(subscription_end).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
}

export default function AdminPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [monthlyStats, setMonthlyStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [pass, setPass] = useState("");
  const [passError, setPassError] = useState(false);
  const [activeSection, setActiveSection] = useState("bookings");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterSector, setFilterSector] = useState("all");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    if (authed) { fetchBookings(); fetchClients(); }
  }, [authed]);

  useEffect(() => {
    if (!authed) return;
    fetchBookings();
  }, [search, filterStatus, filterSector]);

  useEffect(() => {
    if (!authed) return;
    fetchMonthlyStats();
  }, [authed, selectedYear]);

  const fetchBookings = async () => {
    setLoading(true);
    let query = supabase.from("bookings").select("*").order("created_at", { ascending: false });
    if (filterStatus !== "all") query = query.eq("status", filterStatus);
    if (filterSector !== "all") query = query.eq("sector", filterSector);
    if (search.trim() !== "") query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%,service.ilike.%${search}%`);
    const { data } = await query;
    setBookings(data || []);
    setLoading(false);
  };

  const fetchClients = async () => {
    const { data } = await supabase.from("clients").select("*").order("created_at", { ascending: false });
    setClients(data || []);
  };

  const fetchMonthlyStats = async () => {
    const { data } = await supabase.from("bookings").select("created_at, status").gte("created_at", `${selectedYear}-01-01`).lte("created_at", `${selectedYear}-12-31`);
    const months: any[] = [];
    for (let m = 0; m < 12; m++) {
      const monthData = (data || []).filter(b => new Date(b.created_at).getMonth() === m);
      months.push({ label: ARABIC_MONTHS[m], total: monthData.length, confirmed: monthData.filter(b => b.status === "confirmed").length, pending: monthData.filter(b => b.status === "pending").length, cancelled: monthData.filter(b => b.status === "cancelled").length });
    }
    setMonthlyStats(months);
  };

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("bookings").update({ status }).eq("id", id);
    fetchBookings();
  };

 const toggleClientActive = async (id: string, current: boolean) => {
  await supabase.from("clients").update({ is_active: !current }).eq("id", id);
  
  // إشعار تلقائي للعميل لما يتفعّل
  if (!current) {
    const client = clients.find(c => c.id === id);
    if (client?.phone && client?.slug) {
      const link = `${window.location.origin}/book/${client.slug}`;
      const loginLink = `${window.location.origin}/client`;
      const msg = `مرحبا ${client.business_name} 👋\n\nتم تفعيل حسابك على موعدي ✅\n\nرابط حجزك الخاص:\n${link}\n\nللدخول للوحة التحكم:\n${loginLink}\n\nشارك رابط حجزك مع زبائنك وابدأ تستقبل الحجوزات! 🚀`;
      window.open(`https://wa.me/${client.phone?.replace(/^0/,"964")}?text=${encodeURIComponent(msg)}`, "_blank");
    }
  }
  
  fetchClients();
};

  const sendReminder = (b: any) => {
    const msg = `مرحبا ${b.name} 👋\nتذكير بموعدك 🗓️\nالخدمة: ${b.service}\nالموعد: ${b.time}\nنتطلع لاستقبالك! ✨`;
    window.open(`https://wa.me/${b.phone?.replace(/^0/, "964")}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const sendConfirmation = (b: any) => {
    const msg = `مرحبا ${b.name} 😊\nتم تأكيد موعدك ✅\nالخدمة: ${b.service}\nالموعد: ${b.time}\nنتطلع لاستقبالك! 🌟`;
    window.open(`https://wa.me/${b.phone?.replace(/^0/, "964")}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const handleLogin = () => {
    if (pass === ADMIN_PASSWORD) { setAuthed(true); setPassError(false); }
    else { setPassError(true); }
  };

  const maxTotal = Math.max(...monthlyStats.map(s => s.total), 1);
  const expiringClients = clients.filter(c => { const d = getSubscriptionDaysLeft(c.subscription_end); return d !== null && d <= 7; });

  if (!authed) {
    return (
      <div dir="rtl" style={{ minHeight: "100vh", background: COLORS.bg, color: COLORS.text, fontFamily: "'Tajawal','Cairo',sans-serif", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;800&display=swap'); *{box-sizing:border-box;margin:0;padding:0}`}</style>
        <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 20, padding: 40, width: 380 }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ width: 56, height: 56, borderRadius: 14, margin: "0 auto 16px", background: "linear-gradient(135deg,#00d4aa,#0070f3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 900, color: "#000" }}>م</div>
            <h2 style={{ fontWeight: 800, fontSize: 22, color: COLORS.white }}>لوحة التحكم</h2>
            <p style={{ color: COLORS.muted, fontSize: 14, marginTop: 8 }}>أدخل كلمة السر للدخول</p>
          </div>
          <input type="password" placeholder="كلمة السر" value={pass} onChange={e => setPass(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()} style={{ width: "100%", padding: "12px 16px", borderRadius: 10, background: COLORS.surface, border: `1px solid ${passError ? "#ef4444" : COLORS.border}`, color: COLORS.text, fontSize: 14, outline: "none", fontFamily: "Tajawal,sans-serif", marginBottom: 8 }} />
          {passError && <p style={{ color: "#ef4444", fontSize: 13, marginBottom: 12 }}>كلمة السر غلط!</p>}
          <button onClick={handleLogin} style={{ width: "100%", padding: "14px", background: "linear-gradient(90deg,#00d4aa,#0070f3)", border: "none", borderRadius: 10, fontSize: 16, fontWeight: 700, cursor: "pointer", color: "#000", fontFamily: "Tajawal,sans-serif", marginTop: 8 }}>دخول</button>
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl" style={{ minHeight: "100vh", background: COLORS.bg, color: COLORS.text, fontFamily: "'Tajawal','Cairo',sans-serif", padding: 32 }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;800&display=swap'); *{box-sizing:border-box;margin:0;padding:0}`}</style>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: COLORS.white }}>لوحة التحكم</h1>
            <p style={{ color: COLORS.muted, marginTop: 4 }}>إدارة الحجوزات والعملاء</p>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <button onClick={() => { fetchBookings(); fetchClients(); fetchMonthlyStats(); }} style={{ background: COLORS.accentDim, border: `1px solid ${COLORS.accent}`, borderRadius: 10, padding: "10px 20px", color: COLORS.accent, fontWeight: 700, cursor: "pointer", fontFamily: "Tajawal,sans-serif" }}>🔄 تحديث</button>
            <button onClick={() => setAuthed(false)} style={{ background: "#ef444422", border: "1px solid #ef4444", borderRadius: 10, padding: "10px 20px", color: "#ef4444", fontWeight: 700, cursor: "pointer", fontFamily: "Tajawal,sans-serif" }}>خروج</button>
          </div>
        </div>

        {/* تنبيه العملاء اللي اشتراكهم ينتهي */}
        {expiringClients.length > 0 && (
          <div style={{ background: "#f59e0b22", border: "1px solid #f59e0b", borderRadius: 12, padding: "14px 20px", marginBottom: 24 }}>
            <div style={{ fontWeight: 700, color: "#f59e0b", marginBottom: 8 }}>⚠️ {expiringClients.length} عميل اشتراكه ينتهي قريباً</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {expiringClients.map((c, i) => {
                const d = getSubscriptionDaysLeft(c.subscription_end);
                return (
                  <span key={i} style={{ fontSize: 12, padding: "4px 12px", borderRadius: 20, background: (d !== null && d <= 3) ? "#ef444422" : "#f59e0b22", color: (d !== null && d <= 3) ? "#ef4444" : "#f59e0b", border: `1px solid ${(d !== null && d <= 3) ? "#ef4444" : "#f59e0b"}` }}>
                    {c.business_name} — {d !== null && d <= 0 ? "منتهي" : `${d} أيام`}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
          {[{ id: "bookings", label: "📋 الحجوزات" }, { id: "stats", label: "📊 الإحصائيات" }, { id: "clients", label: `👥 العملاء${expiringClients.length > 0 ? ` 🔴` : ""}` }].map(t => (
            <button key={t.id} onClick={() => setActiveSection(t.id)} style={{ padding: "10px 24px", borderRadius: 10, cursor: "pointer", fontSize: 14, fontFamily: "Tajawal,sans-serif", fontWeight: 700, background: activeSection === t.id ? COLORS.accentDim : COLORS.surface, color: activeSection === t.id ? COLORS.accent : COLORS.muted, border: `1px solid ${activeSection === t.id ? COLORS.accent : COLORS.border}` }}>{t.label}</button>
          ))}
        </div>

        {/* BOOKINGS */}
        {activeSection === "bookings" && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
              {[
                { label: "الكل", value: bookings.length, icon: "📋", color: COLORS.accent },
                { label: "انتظار", value: bookings.filter(b => b.status === "pending").length, icon: "⏳", color: "#f59e0b" },
                { label: "مؤكد", value: bookings.filter(b => b.status === "confirmed").length, icon: "✅", color: "#00d4aa" },
                { label: "ملغي", value: bookings.filter(b => b.status === "cancelled").length, icon: "❌", color: "#ef4444" },
              ].map((s, i) => (
                <div key={i} style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: 20, cursor: "pointer" }} onClick={() => setFilterStatus(i === 0 ? "all" : ["pending","confirmed","cancelled"][i-1])}>
                  <div style={{ fontSize: 24, marginBottom: 6 }}>{s.icon}</div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 13, color: COLORS.muted, marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 12, marginBottom: 20 }}>
              <input type="text" placeholder="🔍 ابحث بالاسم أو الهاتف أو الخدمة..." value={search} onChange={e => setSearch(e.target.value)} style={{ padding: "12px 16px", borderRadius: 10, background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.text, fontSize: 14, outline: "none", fontFamily: "Tajawal,sans-serif" }} />
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ padding: "12px 16px", borderRadius: 10, background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.text, fontSize: 14, outline: "none", fontFamily: "Tajawal,sans-serif" }}>
                <option value="all">كل الحالات</option>
                <option value="pending">انتظار</option>
                <option value="confirmed">مؤكد</option>
                <option value="cancelled">ملغي</option>
              </select>
              <select value={filterSector} onChange={e => setFilterSector(e.target.value)} style={{ padding: "12px 16px", borderRadius: 10, background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.text, fontSize: 14, outline: "none", fontFamily: "Tajawal,sans-serif" }}>
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
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {b.status === "pending" && (
                        <button onClick={async () => { await updateStatus(b.id, "confirmed"); sendConfirmation(b); }} style={{ background: "#00d4aa22", border: "1px solid #00d4aa", borderRadius: 8, padding: "6px 10px", color: "#00d4aa", fontSize: 11, cursor: "pointer", fontFamily: "Tajawal,sans-serif" }}>✅ تأكيد</button>
                      )}
                      {b.status !== "cancelled" && (
                        <button onClick={() => updateStatus(b.id, "cancelled")} style={{ background: "#ef444422", border: "1px solid #ef4444", borderRadius: 8, padding: "6px 10px", color: "#ef4444", fontSize: 11, cursor: "pointer", fontFamily: "Tajawal,sans-serif" }}>إلغاء</button>
                      )}
                      <button onClick={() => sendReminder(b)} style={{ background: "#25d36622", border: "1px solid #25d366", borderRadius: 8, padding: "6px 10px", color: "#25d366", fontSize: 11, cursor: "pointer", fontFamily: "Tajawal,sans-serif" }}>📱 تذكير</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {/* STATS */}
        {activeSection === "stats" && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: COLORS.white }}>📊 الإحصائيات الشهرية</h2>
              <select value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))} style={{ padding: "10px 16px", borderRadius: 10, background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.text, fontSize: 14, outline: "none", fontFamily: "Tajawal,sans-serif" }}>
                {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 32 }}>
              {[
                { label: "إجمالي الحجوزات", value: monthlyStats.reduce((a, s) => a + s.total, 0), color: COLORS.accent },
                { label: "مؤكدة", value: monthlyStats.reduce((a, s) => a + s.confirmed, 0), color: "#00d4aa" },
                { label: "انتظار", value: monthlyStats.reduce((a, s) => a + s.pending, 0), color: "#f59e0b" },
                { label: "ملغاة", value: monthlyStats.reduce((a, s) => a + s.cancelled, 0), color: "#ef4444" },
              ].map((s, i) => (
                <div key={i} style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: 20 }}>
                  <div style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 13, color: COLORS.muted, marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>
            <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 24 }}>
              <h3 style={{ fontWeight: 700, color: COLORS.white, marginBottom: 24 }}>الحجوزات لكل شهر</h3>
              {monthlyStats.map((s, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                  <span style={{ color: COLORS.muted, fontSize: 13, width: 60, textAlign: "right", flexShrink: 0 }}>{s.label}</span>
                  <div style={{ flex: 1, background: COLORS.surface, borderRadius: 99, height: 28, overflow: "hidden" }}>
                    <div style={{ height: "100%", borderRadius: 99, background: "linear-gradient(90deg,#00d4aa,#0070f3)", width: `${(s.total / maxTotal) * 100}%`, transition: "width 0.5s", display: "flex", alignItems: "center", paddingRight: 10, minWidth: s.total > 0 ? 30 : 0 }}>
                      {s.total > 0 && <span style={{ fontSize: 11, fontWeight: 700, color: "#000" }}>{s.total}</span>}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                    <span style={{ fontSize: 11, color: "#00d4aa" }}>✅ {s.confirmed}</span>
                    <span style={{ fontSize: 11, color: "#f59e0b" }}>⏳ {s.pending}</span>
                    <span style={{ fontSize: 11, color: "#ef4444" }}>❌ {s.cancelled}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* CLIENTS */}
        {activeSection === "clients" && (
          <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 16, overflow: "hidden" }}>
            <div style={{ padding: "20px 24px", borderBottom: `1px solid ${COLORS.border}` }}>
              <h3 style={{ fontWeight: 700, color: COLORS.white }}>العملاء المسجلين ({clients.length})</h3>
            </div>
            {clients.length === 0 ? (
              <div style={{ padding: 40, textAlign: "center", color: COLORS.muted }}>لا يوجد عملاء بعد</div>
            ) : (
              clients.map((c, i) => {
                const daysLeft = getSubscriptionDaysLeft(c.subscription_end);
                return (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", padding: "16px 24px", alignItems: "center", borderBottom: i < clients.length - 1 ? `1px solid ${COLORS.border}` : "none", background: i % 2 === 0 ? "transparent" : "#ffffff04" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontWeight: 600, color: COLORS.white }}>{c.business_name}</span>
                        {daysLeft !== null && daysLeft <= 7 && (
                          <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 20, fontWeight: 700, background: daysLeft <= 3 ? "#ef444422" : "#f59e0b22", color: daysLeft <= 3 ? "#ef4444" : "#f59e0b", border: `1px solid ${daysLeft <= 3 ? "#ef4444" : "#f59e0b"}` }}>
                            {daysLeft <= 0 ? "🚨 منتهي" : `⚠️ ${daysLeft} أيام`}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 12, color: COLORS.muted }}>{c.phone}</div>
                      {c.subscription_end && <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 2 }}>ينتهي: {new Date(c.subscription_end).toLocaleDateString("ar-IQ")}</div>}
                    </div>
                    <div style={{ color: COLORS.text, fontSize: 14 }}>
                      {c.sector === "clinic" ? "🏥 عيادة" : c.sector === "salon" ? "✂️ صالون" : "🏨 شاليه"}
                    </div>
                    <div>
                      <span style={{ fontSize: 11, padding: "4px 10px", borderRadius: 20, fontWeight: 600, background: c.is_active ? "#00d4aa22" : "#ef444422", color: c.is_active ? "#00d4aa" : "#ef4444", border: `1px solid ${c.is_active ? "#00d4aa44" : "#ef444444"}` }}>
                        {c.is_active ? "✅ مفعّل" : "⏳ انتظار الدفع"}
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => toggleClientActive(c.id, c.is_active)} style={{ background: c.is_active ? "#ef444422" : "#00d4aa22", border: `1px solid ${c.is_active ? "#ef4444" : "#00d4aa"}`, borderRadius: 8, padding: "6px 12px", color: c.is_active ? "#ef4444" : "#00d4aa", fontSize: 12, cursor: "pointer", fontFamily: "Tajawal,sans-serif" }}>
                        {c.is_active ? "إيقاف" : "تفعيل ✓"}
                      </button>
                      <button
  onClick={() => {
    const link = `${window.location.origin}/book/${c.slug}`;
    const msg = `مرحبا ${c.business_name} 👋\n\nتم تفعيل حسابك على موعدي ✅\n\nرابط حجزك الخاص:\n${link}\n\nشارك الرابط مع زبائنك وابدأ تستقبل الحجوزات! 🚀`;
    window.open(`https://wa.me/${c.phone?.replace(/^0/,"964")}?text=${encodeURIComponent(msg)}`, "_blank");
  }}
  style={{ background: "#25d36622", border: "1px solid #25d366", borderRadius: 8, padding: "6px 12px", color: "#25d366", fontSize: 12, cursor: "pointer", fontFamily: "Tajawal,sans-serif" }}
>
  📱 إرسال الرابط
</button>
                      {daysLeft !== null && daysLeft <= 7 && (
                        <button onClick={() => { const msg = `مرحبا ${c.business_name}، اشتراكك ينتهي ${daysLeft <= 0 ? "اليوم" : `خلال ${daysLeft} أيام`}، تواصل معنا للتجديد`; window.open(`https://wa.me/${c.phone?.replace(/^0/,"964")}?text=${encodeURIComponent(msg)}`, "_blank"); }} style={{ background: "#f59e0b22", border: "1px solid #f59e0b", borderRadius: 8, padding: "6px 12px", color: "#f59e0b", fontSize: 12, cursor: "pointer", fontFamily: "Tajawal,sans-serif" }}>
                          📱 تذكير
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

      </div>
    </div>
  );
}