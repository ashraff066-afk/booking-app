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
  const [editingSubscription, setEditingSubscription] = useState<string | null>(null);
  const [subscriptionDate, setSubscriptionDate] = useState("");

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
    if (!current) {
      const client = clients.find(c => c.id === id);
      if (client?.phone && client?.slug) {
        const link = `${window.location.origin}/book/${client.slug}`;
        const loginLink = `${window.location.origin}/client`;
        const msg = `مرحبا ${client.business_name} 👋\n\nتم تفعيل حسابك على موعدي ✅\n\nرابط حجزك:\n${link}\n\nلوحة التحكم:\n${loginLink}\n\nابدأ تستقبل الحجوزات! 🚀`;
        window.open(`https://wa.me/${client.phone?.replace(/^0/,"964")}?text=${encodeURIComponent(msg)}`, "_blank");
      }
    }
    fetchClients();
  };

  const saveSubscription = async (id: string) => {
    if (!subscriptionDate) return;
    await supabase.from("clients").update({ subscription_end: subscriptionDate }).eq("id", id);
    setEditingSubscription(null);
    setSubscriptionDate("");
    fetchClients();
  };

  const setQuickSubscription = async (id: string, days: number) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    const dateStr = date.toISOString().split("T")[0];
    await supabase.from("clients").update({ subscription_end: dateStr }).eq("id", id);
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
      <div dir="rtl" style={{ minHeight: "100vh", background: COLORS.bg, color: COLORS.text, fontFamily: "'Tajawal','Cairo',sans-serif", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;800&display=swap'); *{box-sizing:border-box;margin:0;padding:0}`}</style>
        <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 20, padding: 32, width: "100%", maxWidth: 380 }}>
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, margin: "0 auto 14px", background: "linear-gradient(135deg,#00d4aa,#0070f3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 900, color: "#000" }}>م</div>
            <h2 style={{ fontWeight: 800, fontSize: 20, color: COLORS.white }}>لوحة التحكم</h2>
            <p style={{ color: COLORS.muted, fontSize: 13, marginTop: 6 }}>أدخل كلمة السر للدخول</p>
          </div>
          <input type="password" placeholder="كلمة السر" value={pass} onChange={e => setPass(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()} style={{ width: "100%", padding: "13px 16px", borderRadius: 10, background: COLORS.surface, border: `1px solid ${passError ? "#ef4444" : COLORS.border}`, color: COLORS.text, fontSize: 15, outline: "none", fontFamily: "Tajawal,sans-serif", marginBottom: 8 }} />
          {passError && <p style={{ color: "#ef4444", fontSize: 13, marginBottom: 10 }}>كلمة السر غلط!</p>}
          <button onClick={handleLogin} style={{ width: "100%", padding: "13px", background: "linear-gradient(90deg,#00d4aa,#0070f3)", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer", color: "#000", fontFamily: "Tajawal,sans-serif", marginTop: 6 }}>دخول</button>
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl" style={{ minHeight: "100vh", background: COLORS.bg, color: COLORS.text, fontFamily: "'Tajawal','Cairo',sans-serif", paddingBottom: 80 }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;800&display=swap'); *{box-sizing:border-box;margin:0;padding:0}`}</style>

      {/* HEADER */}
      <div style={{ background: "#0d1424", borderBottom: `1px solid ${COLORS.border}`, padding: "14px 16px", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 800, color: COLORS.white }}>لوحة التحكم</h1>
            <p style={{ color: COLORS.muted, fontSize: 11, marginTop: 2 }}>إدارة الحجوزات والعملاء</p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => { fetchBookings(); fetchClients(); fetchMonthlyStats(); }} style={{ background: COLORS.accentDim, border: `1px solid ${COLORS.accent}`, borderRadius: 8, padding: "7px 12px", color: COLORS.accent, fontWeight: 700, cursor: "pointer", fontFamily: "Tajawal,sans-serif", fontSize: 12 }}>🔄</button>
            <button onClick={() => setAuthed(false)} style={{ background: "#ef444422", border: "1px solid #ef4444", borderRadius: 8, padding: "7px 12px", color: "#ef4444", fontWeight: 700, cursor: "pointer", fontFamily: "Tajawal,sans-serif", fontSize: 12 }}>خروج</button>
          </div>
        </div>
      </div>

      {/* تنبيه منتهي الاشتراك */}
      {expiringClients.length > 0 && (
        <div style={{ background: "#f59e0b22", border: "1px solid #f59e0b", borderRadius: 10, margin: "12px 16px", padding: "12px 14px" }}>
          <div style={{ fontWeight: 700, color: "#f59e0b", fontSize: 13, marginBottom: 8 }}>⚠️ {expiringClients.length} عميل اشتراكه ينتهي قريباً</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {expiringClients.map((c, i) => {
              const d = getSubscriptionDaysLeft(c.subscription_end);
              return (
                <span key={i} style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, fontWeight: 700, background: (d !== null && d <= 3) ? "#ef444422" : "#f59e0b22", color: (d !== null && d <= 3) ? "#ef4444" : "#f59e0b", border: `1px solid ${(d !== null && d <= 3) ? "#ef4444" : "#f59e0b"}` }}>
                  {c.business_name} — {d !== null && d <= 0 ? "منتهي" : `${d} أيام`}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* TABS */}
      <div style={{ overflowX: "auto", padding: "12px 16px", display: "flex", gap: 8 }}>
        {[
          { id: "bookings", label: "📋 الحجوزات" },
          { id: "stats", label: "📊 الإحصاء" },
          { id: "clients", label: `👥 العملاء${expiringClients.length > 0 ? " 🔴" : ""}` },
        ].map(t => (
          <button key={t.id} onClick={() => setActiveSection(t.id)} style={{ padding: "9px 18px", borderRadius: 10, cursor: "pointer", fontSize: 13, fontFamily: "Tajawal,sans-serif", fontWeight: 700, background: activeSection === t.id ? COLORS.accentDim : COLORS.surface, color: activeSection === t.id ? COLORS.accent : COLORS.muted, border: `1px solid ${activeSection === t.id ? COLORS.accent : COLORS.border}`, whiteSpace: "nowrap", flexShrink: 0 }}>{t.label}</button>
        ))}
      </div>

      <div style={{ padding: "0 16px" }}>

        {/* BOOKINGS */}
        {activeSection === "bookings" && (
          <>
            {/* إحصاء سريع */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 10, marginBottom: 14 }}>
              {[
                { label: "الكل", value: bookings.length, color: COLORS.accent, status: "all" },
                { label: "انتظار", value: bookings.filter(b => b.status === "pending").length, color: "#f59e0b", status: "pending" },
                { label: "مؤكد", value: bookings.filter(b => b.status === "confirmed").length, color: "#00d4aa", status: "confirmed" },
                { label: "ملغي", value: bookings.filter(b => b.status === "cancelled").length, color: "#ef4444", status: "cancelled" },
              ].map((s, i) => (
                <div key={i} onClick={() => setFilterStatus(s.status)} style={{ background: filterStatus === s.status ? `${s.color}22` : COLORS.card, border: `1px solid ${filterStatus === s.status ? s.color : COLORS.border}`, borderRadius: 12, padding: "14px 16px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 13, color: COLORS.muted }}>{s.label}</span>
                  <span style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</span>
                </div>
              ))}
            </div>

            {/* فلاتر */}
            <div style={{ marginBottom: 12 }}>
              <input type="text" placeholder="🔍 ابحث بالاسم أو الهاتف..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: "100%", padding: "11px 14px", borderRadius: 10, background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.text, fontSize: 13, outline: "none", fontFamily: "Tajawal,sans-serif", marginBottom: 8 }} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ padding: "10px 12px", borderRadius: 10, background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.text, fontSize: 13, outline: "none", fontFamily: "Tajawal,sans-serif" }}>
                  <option value="all">كل الحالات</option>
                  <option value="pending">انتظار</option>
                  <option value="confirmed">مؤكد</option>
                  <option value="cancelled">ملغي</option>
                </select>
                <select value={filterSector} onChange={e => setFilterSector(e.target.value)} style={{ padding: "10px 12px", borderRadius: 10, background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.text, fontSize: 13, outline: "none", fontFamily: "Tajawal,sans-serif" }}>
                  <option value="all">كل القطاعات</option>
                  <option value="clinic">🏥 عيادة</option>
                  <option value="salon">✂️ صالون</option>
                  <option value="hotel">🏨 شاليه</option>
                </select>
              </div>
            </div>

            <p style={{ color: COLORS.muted, fontSize: 12, marginBottom: 10 }}>النتائج: {bookings.length}</p>

            {/* قائمة الحجوزات */}
            <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 14, overflow: "hidden" }}>
              {loading ? (
                <div style={{ padding: 32, textAlign: "center", color: COLORS.muted, fontSize: 14 }}>جاري التحميل...</div>
              ) : bookings.length === 0 ? (
                <div style={{ padding: 32, textAlign: "center", color: COLORS.muted, fontSize: 14 }}>لا توجد نتائج</div>
              ) : (
                bookings.map((b, i) => (
                  <div key={i} style={{ padding: "14px 16px", borderBottom: i < bookings.length - 1 ? `1px solid ${COLORS.border}` : "none", background: i % 2 === 0 ? "transparent" : "#ffffff04" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <div>
                        <div style={{ fontWeight: 700, color: COLORS.white, fontSize: 14 }}>{b.name}</div>
                        <div style={{ fontSize: 11, color: COLORS.muted }}>{b.phone}</div>
                      </div>
                      <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, fontWeight: 600, background: b.status === "confirmed" ? "#00d4aa22" : b.status === "cancelled" ? "#ef444422" : "#f59e0b22", color: b.status === "confirmed" ? "#00d4aa" : b.status === "cancelled" ? "#ef4444" : "#f59e0b", border: `1px solid ${b.status === "confirmed" ? "#00d4aa44" : b.status === "cancelled" ? "#ef444444" : "#f59e0b44"}` }}>
                        {b.status === "confirmed" ? "مؤكد" : b.status === "cancelled" ? "ملغي" : "انتظار"}
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: 12, marginBottom: 10 }}>
                      <span style={{ fontSize: 12, color: COLORS.muted }}>🛎️ {b.service}</span>
                      <span style={{ fontSize: 12, color: COLORS.muted }}>🕐 {b.time}</span>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      {b.status === "pending" && (
                        <button onClick={async () => { await updateStatus(b.id, "confirmed"); sendConfirmation(b); }} style={{ flex: 1, background: "#00d4aa22", border: "1px solid #00d4aa", borderRadius: 8, padding: "8px", color: "#00d4aa", fontSize: 12, cursor: "pointer", fontFamily: "Tajawal,sans-serif", fontWeight: 700 }}>✅ تأكيد</button>
                      )}
                      {b.status !== "cancelled" && (
                        <button onClick={() => updateStatus(b.id, "cancelled")} style={{ flex: 1, background: "#ef444422", border: "1px solid #ef4444", borderRadius: 8, padding: "8px", color: "#ef4444", fontSize: 12, cursor: "pointer", fontFamily: "Tajawal,sans-serif", fontWeight: 700 }}>❌ إلغاء</button>
                      )}
                      <button onClick={() => sendReminder(b)} style={{ background: "#25d36622", border: "1px solid #25d366", borderRadius: 8, padding: "8px 14px", color: "#25d366", fontSize: 14, cursor: "pointer" }}>📱</button>
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
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <h2 style={{ fontSize: 16, fontWeight: 800, color: COLORS.white }}>📊 الإحصائيات</h2>
              <select value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))} style={{ padding: "8px 12px", borderRadius: 10, background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.text, fontSize: 13, outline: "none", fontFamily: "Tajawal,sans-serif" }}>
                {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 10, marginBottom: 16 }}>
              {[
                { label: "إجمالي", value: monthlyStats.reduce((a, s) => a + s.total, 0), color: COLORS.accent },
                { label: "مؤكدة", value: monthlyStats.reduce((a, s) => a + s.confirmed, 0), color: "#00d4aa" },
                { label: "انتظار", value: monthlyStats.reduce((a, s) => a + s.pending, 0), color: "#f59e0b" },
                { label: "ملغاة", value: monthlyStats.reduce((a, s) => a + s.cancelled, 0), color: "#ef4444" },
              ].map((s, i) => (
                <div key={i} style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: "14px 16px" }}>
                  <div style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 12, color: COLORS.muted, marginTop: 3 }}>{s.label}</div>
                </div>
              ))}
            </div>

            <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: 16 }}>
              <h3 style={{ fontWeight: 700, color: COLORS.white, marginBottom: 16, fontSize: 14 }}>الحجوزات الشهرية</h3>
              {monthlyStats.map((s, i) => (
                <div key={i} style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ color: COLORS.muted, fontSize: 12 }}>{s.label}</span>
                    <div style={{ display: "flex", gap: 8 }}>
                      <span style={{ fontSize: 11, color: "#00d4aa" }}>✅{s.confirmed}</span>
                      <span style={{ fontSize: 11, color: "#f59e0b" }}>⏳{s.pending}</span>
                      <span style={{ fontSize: 11, color: "#ef4444" }}>❌{s.cancelled}</span>
                    </div>
                  </div>
                  <div style={{ background: COLORS.surface, borderRadius: 99, height: 22, overflow: "hidden" }}>
                    <div style={{ height: "100%", borderRadius: 99, background: "linear-gradient(90deg,#00d4aa,#0070f3)", width: `${(s.total / maxTotal) * 100}%`, display: "flex", alignItems: "center", paddingRight: 8, minWidth: s.total > 0 ? 28 : 0 }}>
                      {s.total > 0 && <span style={{ fontSize: 10, fontWeight: 700, color: "#000" }}>{s.total}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* CLIENTS */}
        {activeSection === "clients" && (
          <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 14, overflow: "hidden" }}>
            <div style={{ padding: "12px 16px", borderBottom: `1px solid ${COLORS.border}` }}>
              <h3 style={{ fontWeight: 700, color: COLORS.white, fontSize: 15 }}>العملاء ({clients.length})</h3>
            </div>
            {clients.length === 0 ? (
              <div style={{ padding: 32, textAlign: "center", color: COLORS.muted, fontSize: 14 }}>لا يوجد عملاء بعد</div>
            ) : (
              clients.map((c, i) => {
                const daysLeft = getSubscriptionDaysLeft(c.subscription_end);
                return (
                  <div key={i} style={{ padding: "14px 16px", borderBottom: i < clients.length - 1 ? `1px solid ${COLORS.border}` : "none", background: i % 2 === 0 ? "transparent" : "#ffffff04" }}>
                    {/* اسم العميل والحالة */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                          <span style={{ fontWeight: 700, color: COLORS.white, fontSize: 14 }}>{c.business_name}</span>
                          {daysLeft !== null && daysLeft <= 7 && (
                            <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 20, fontWeight: 700, background: daysLeft <= 3 ? "#ef444422" : "#f59e0b22", color: daysLeft <= 3 ? "#ef4444" : "#f59e0b", border: `1px solid ${daysLeft <= 3 ? "#ef4444" : "#f59e0b"}` }}>
                              {daysLeft <= 0 ? "🚨 منتهي" : `⚠️ ${daysLeft}ي`}
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 2 }}>{c.phone}</div>
                        <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 2 }}>
                          {c.sector === "clinic" ? "🏥 عيادة" : c.sector === "salon" ? "✂️ صالون" : "🏨 شاليه"}
                          {c.subscription_end && <span> · ينتهي: {new Date(c.subscription_end).toLocaleDateString("ar-IQ")}</span>}
                        </div>
                      </div>
                      <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, fontWeight: 600, background: c.is_active ? "#00d4aa22" : "#ef444422", color: c.is_active ? "#00d4aa" : "#ef4444", border: `1px solid ${c.is_active ? "#00d4aa44" : "#ef444444"}`, whiteSpace: "nowrap" }}>
                        {c.is_active ? "✅ مفعّل" : "⏳ انتظار"}
                      </span>
                    </div>

                    {/* الأزرار */}
                    <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                      <button onClick={() => toggleClientActive(c.id, c.is_active)} style={{ flex: 1, background: c.is_active ? "#ef444422" : "#00d4aa22", border: `1px solid ${c.is_active ? "#ef4444" : "#00d4aa"}`, borderRadius: 8, padding: "8px", color: c.is_active ? "#ef4444" : "#00d4aa", fontSize: 12, cursor: "pointer", fontFamily: "Tajawal,sans-serif", fontWeight: 700 }}>
                        {c.is_active ? "إيقاف" : "✓ تفعيل"}
                      </button>
                      <button onClick={() => { const link = `${window.location.origin}/book/${c.slug}`; const msg = `مرحبا ${c.business_name} 👋\nرابط حجزك:\n${link}`; window.open(`https://wa.me/${c.phone?.replace(/^0/,"964")}?text=${encodeURIComponent(msg)}`, "_blank"); }} style={{ background: "#25d36622", border: "1px solid #25d366", borderRadius: 8, padding: "8px 12px", color: "#25d366", fontSize: 12, cursor: "pointer", fontFamily: "Tajawal,sans-serif", fontWeight: 700 }}>📱 رابط</button>
                      <button onClick={() => { setEditingSubscription(editingSubscription === c.id ? null : c.id); setSubscriptionDate(c.subscription_end?.split("T")[0] || ""); }} style={{ background: COLORS.accentDim, border: `1px solid ${COLORS.accent}`, borderRadius: 8, padding: "8px 12px", color: COLORS.accent, fontSize: 12, cursor: "pointer", fontFamily: "Tajawal,sans-serif", fontWeight: 700 }}>📅</button>
                      {daysLeft !== null && daysLeft <= 7 && (
                        <button onClick={() => { const msg = `مرحبا ${c.business_name}، اشتراكك ينتهي ${daysLeft <= 0 ? "اليوم" : `خلال ${daysLeft} أيام`}، تواصل معنا للتجديد`; window.open(`https://wa.me/${c.phone?.replace(/^0/,"964")}?text=${encodeURIComponent(msg)}`, "_blank"); }} style={{ background: "#f59e0b22", border: "1px solid #f59e0b", borderRadius: 8, padding: "8px 12px", color: "#f59e0b", fontSize: 12, cursor: "pointer", fontFamily: "Tajawal,sans-serif", fontWeight: 700 }}>⚠️</button>
                      )}
                    </div>

                    {/* تحديد الاشتراك */}
                    {editingSubscription === c.id && (
                      <div style={{ background: COLORS.surface, borderRadius: 10, padding: 14, border: `1px solid ${COLORS.border}`, marginTop: 10 }}>
                        <div style={{ fontSize: 12, color: COLORS.muted, marginBottom: 10, fontWeight: 600 }}>📅 تحديد انتهاء الاشتراك</div>
                        <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
                          {[{ label: "14 يوم", days: 14 }, { label: "شهر", days: 30 }, { label: "3 أشهر", days: 90 }, { label: "6 أشهر", days: 180 }, { label: "سنة", days: 365 }].map(opt => (
                            <button key={opt.days} onClick={() => { setQuickSubscription(c.id, opt.days); setEditingSubscription(null); }} style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: "6px 12px", color: COLORS.text, fontSize: 12, cursor: "pointer", fontFamily: "Tajawal,sans-serif", fontWeight: 600 }}>
                              {opt.label}
                            </button>
                          ))}
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                          <input type="date" value={subscriptionDate} onChange={e => setSubscriptionDate(e.target.value)} style={{ flex: 1, padding: "9px 12px", borderRadius: 8, background: COLORS.card, border: `1px solid ${COLORS.border}`, color: COLORS.text, fontSize: 13, outline: "none", fontFamily: "Tajawal,sans-serif" }} />
                          <button onClick={() => saveSubscription(c.id)} style={{ background: "linear-gradient(90deg,#00d4aa,#0070f3)", border: "none", borderRadius: 8, padding: "9px 16px", color: "#000", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "Tajawal,sans-serif" }}>حفظ</button>
                          <button onClick={() => setEditingSubscription(null)} style={{ background: "#ef444422", border: "1px solid #ef4444", borderRadius: 8, padding: "9px 12px", color: "#ef4444", fontSize: 13, cursor: "pointer", fontFamily: "Tajawal,sans-serif" }}>✕</button>
                        </div>
                      </div>
                    )}
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