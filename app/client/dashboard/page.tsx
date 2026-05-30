"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../supabase";

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

const DEFAULT_SERVICES: Record<string, string[]> = {
  clinic: ["كشف عام", "استشارة طبية", "فحوصات", "متابعة", "تطعيم", "أشعة"],
  salon: ["قص شعر", "صبغة شعر", "عناية بشرة", "مانيكير", "بيديكير", "مساج"],
  hotel: ["غرفة عادية", "غرفة ديلوكس", "جناح", "باقة عائلية", "باقة رومانسية", "إيجار يومي"],
};

export default function ClientDashboard() {
  const [user, setUser] = useState<any>(null);
  const [client, setClient] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("bookings");
  const [copied, setCopied] = useState(false);

  const [workDays, setWorkDays] = useState<string[]>(["saturday","sunday","monday","tuesday","wednesday"]);
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("17:00");
  const [maxPerDay, setMaxPerDay] = useState(20);
  const [scheduleId, setScheduleId] = useState<string | null>(null);
  const [morningEnabled, setMorningEnabled] = useState(true);
const [morningStart, setMorningStart] = useState("08:00");
const [morningEnd, setMorningEnd] = useState("12:00");
const [eveningEnabled, setEveningEnabled] = useState(false);
const [eveningStart, setEveningStart] = useState("16:00");
const [eveningEnd, setEveningEnd] = useState("21:00");
  const [savingSchedule, setSavingSchedule] = useState(false);
  const [scheduleSaved, setScheduleSaved] = useState(false);

  const [settingsName, setSettingsName] = useState("");
  const [settingsPhone, setSettingsPhone] = useState("");
  const [settingsSector, setSettingsSector] = useState("clinic");
  const [settingsAddress, setSettingsAddress] = useState("");
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);

  const [newService, setNewService] = useState("");
  const [newDuration, setNewDuration] = useState(30);
  const [newPrice, setNewPrice] = useState(0);
  const [addingService, setAddingService] = useState(false);

  useEffect(() => { checkUser(); }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { window.location.href = "/client"; return; }
    setUser(user);
    const { data: clientData } = await supabase.from("clients").select("*").eq("user_id", user.id).single();
    if (!clientData?.is_active) { window.location.href = "/client/pending"; return; }
    setClient(clientData);
    setSettingsName(clientData.business_name || "");
    setSettingsPhone(clientData.phone || "");
    setSettingsSector(clientData.sector || "clinic");
    setSettingsAddress(clientData.address || "");

    const { data: bookingsData } = await supabase.from("bookings").select("*").eq("client_id", clientData.id).order("created_at", { ascending: false });
    setBookings(bookingsData || []);

    const { data: reviewsData } = await supabase.from("reviews").select("*");
    setReviews(reviewsData || []);

    const { data: scheduleData } = await supabase.from("schedules").select("*").eq("client_id", clientData.id).single();
    if (scheduleData) {
      setScheduleId(scheduleData.id);
      setWorkDays(scheduleData.work_days || []);
      setStartTime(scheduleData.start_time || "08:00");
      setEndTime(scheduleData.end_time || "17:00");
      setMaxPerDay(scheduleData.max_bookings_per_day || 20);
      setMorningEnabled(scheduleData.morning_enabled ?? true);
setMorningStart(scheduleData.morning_start || "08:00");
setMorningEnd(scheduleData.morning_end || "12:00");
setEveningEnabled(scheduleData.evening_enabled ?? false);
setEveningStart(scheduleData.evening_start || "16:00");
setEveningEnd(scheduleData.evening_end || "21:00");
    }

    const { data: servicesData } = await supabase.from("services").select("*").eq("client_id", clientData.id).order("created_at", { ascending: true });
    setServices(servicesData || []);
    setLoading(false);
  };

  const handleLogout = async () => { await supabase.auth.signOut(); window.location.href = "/client"; };

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("bookings").update({ status }).eq("id", id);
    checkUser();
  };

  const toggleDay = (day: string) => setWorkDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);

  const saveSchedule = async () => {
   
    if (!client) return;
    setSavingSchedule(true);
   const scheduleData = { 
  client_id: client.id, 
  sector: client.sector, 
  work_days: workDays, 
  start_time: morningStart, 
  end_time: morningEnd, 
  morning_enabled: morningEnabled,
  morning_start: morningStart,
  morning_end: morningEnd,
  evening_enabled: eveningEnabled,
  evening_start: eveningStart,
  evening_end: eveningEnd,
  max_bookings_per_day: maxPerDay 
};
    if (scheduleId) {
      await supabase.from("schedules").update(scheduleData).eq("id", scheduleId);
    } else {
      const { data } = await supabase.from("schedules").insert([scheduleData]).select().single();
      if (data) setScheduleId(data.id);
    }
    setSavingSchedule(false);
    setScheduleSaved(true);
    setTimeout(() => setScheduleSaved(false), 3000);
  };

  const saveSettings = async () => {
    if (!client) return;
    setSavingSettings(true);
    await supabase.from("clients").update({ business_name: settingsName, phone: settingsPhone, sector: settingsSector, address: settingsAddress }).eq("id", client.id);
    setSavingSettings(false);
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 3000);
    checkUser();
  };

  const addService = async () => {
    if (!newService.trim() || !client) return;
    setAddingService(true);
    await supabase.from("services").insert([{ client_id: client.id, name: newService.trim(), duration: newDuration, price: newPrice }]);
    setNewService(""); setNewDuration(30); setNewPrice(0);
    setAddingService(false);
    checkUser();
  };

  const deleteService = async (id: string) => {
    await supabase.from("services").delete().eq("id", id);
    checkUser();
  };

  const addDefaultServices = async () => {
    if (!client) return;
    const defaults = DEFAULT_SERVICES[client.sector] || [];
    for (const name of defaults) {
      await supabase.from("services").insert([{ client_id: client.id, name, duration: client.sector === "clinic" ? 10 : client.sector === "salon" ? 30 : 60, price: 0 }]);
    }
    checkUser();
  };

  const sendReminder = (b: any) => {
    const msg = `مرحبا ${b.name} 👋\nتذكير بموعدك 🗓️\nالخدمة: ${b.service}\nالموعد: ${b.time}\nنتطلع لاستقبالك! ✨`;
    window.open(`https://wa.me/${b.phone?.replace(/^0/, "964")}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const sendConfirmation = (b: any) => {
    const msg = `مرحبا ${b.name} 😊\nتم تأكيد موعدك ✅\nالخدمة: ${b.service}\nالموعد: ${b.time}\nنتطلع لاستقبالك! 🌟`;
    window.open(`https://wa.me/${b.phone?.replace(/^0/, "964")}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const copyLink = () => {
    if (!client?.slug) return;
    navigator.clipboard.writeText(`${window.location.origin}/book/${client.slug}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareWhatsapp = () => {
    if (!client?.slug) return;
    const link = `${window.location.origin}/book/${client.slug}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(`احجز موعدك معنا: ${link}`)}`, "_blank");
  };

  const now = new Date();
  const thisMonth = bookings.filter(b => { const d = new Date(b.created_at); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); });
  const lastMonth = bookings.filter(b => { const d = new Date(b.created_at); const lm = new Date(now.getFullYear(), now.getMonth() - 1, 1); return d.getMonth() === lm.getMonth() && d.getFullYear() === lm.getFullYear(); });
  const confirmRate = bookings.length > 0 ? Math.round((bookings.filter(b => b.status === "confirmed").length / bookings.length) * 100) : 0;
  const avgRating = reviews.length > 0 ? (reviews.reduce((a, r) => a + (r.rating || 0), 0) / reviews.length).toFixed(1) : "—";
  const monthDiff = thisMonth.length - lastMonth.length;

  if (loading) return (
    <div dir="rtl" style={{ minHeight: "100vh", background: COLORS.bg, display: "flex", alignItems: "center", justifyContent: "center", color: COLORS.accent, fontSize: 18, fontFamily: "Tajawal, sans-serif" }}>جاري التحميل...</div>
  );

  return (
    <div dir="rtl" style={{ minHeight: "100vh", background: COLORS.bg, color: COLORS.text, fontFamily: "'Tajawal','Cairo',sans-serif", paddingBottom: 80 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #0a0e1a; }
        ::-webkit-scrollbar-thumb { background: #1e2d45; border-radius: 2px; }
      `}</style>

      {/* HEADER */}
      <div style={{ background: "#0d1424", borderBottom: `1px solid ${COLORS.border}`, padding: "14px 16px", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div>
            <h1 style={{ fontSize: 17, fontWeight: 800, color: COLORS.white }}>{client?.business_name || "لوحة التحكم"}</h1>
            <p style={{ color: COLORS.muted, fontSize: 11, marginTop: 2 }}>{user?.email}</p>
          </div>
          <button onClick={handleLogout} style={{ background: "#ef444422", border: "1px solid #ef4444", borderRadius: 8, padding: "7px 14px", color: "#ef4444", fontWeight: 700, cursor: "pointer", fontFamily: "Tajawal,sans-serif", fontSize: 12 }}>خروج</button>
        </div>

        {/* رابط الحجز */}
        {client?.slug && (
          <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: "8px 12px", display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            <span style={{ fontSize: 11, color: COLORS.muted }}>🔗</span>
            <span style={{ fontSize: 11, color: COLORS.accent, fontWeight: 600, flex: 1 }}>/book/{client.slug}</span>
            <button onClick={copyLink} style={{ background: copied ? "#00d4aa22" : COLORS.accentDim, border: `1px solid ${COLORS.accent}`, borderRadius: 6, padding: "4px 10px", color: COLORS.accent, fontSize: 11, cursor: "pointer", fontFamily: "Tajawal,sans-serif", fontWeight: 700 }}>{copied ? "✅ تم" : "📋 نسخ"}</button>
            <button onClick={shareWhatsapp} style={{ background: "#25d36622", border: "1px solid #25d366", borderRadius: 6, padding: "4px 10px", color: "#25d366", fontSize: 11, cursor: "pointer", fontFamily: "Tajawal,sans-serif", fontWeight: 700 }}>📱</button>
          </div>
        )}
      </div>

      {/* تنبيه انتهاء الاشتراك */}
      {client?.subscription_end && (() => {
        const daysLeft = Math.ceil((new Date(client.subscription_end).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        if (daysLeft > 7) return null;
        return (
          <div style={{ background: daysLeft <= 3 ? "#ef444422" : "#f59e0b22", border: `1px solid ${daysLeft <= 3 ? "#ef4444" : "#f59e0b"}`, margin: "12px 16px", borderRadius: 10, padding: "12px 14px", display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 20 }}>{daysLeft <= 3 ? "🚨" : "⚠️"}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: daysLeft <= 3 ? "#ef4444" : "#f59e0b", fontSize: 13 }}>{daysLeft <= 0 ? "انتهى اشتراكك!" : `ينتهي خلال ${daysLeft} أيام`}</div>
            </div>
            <button onClick={() => window.open("https://wa.me/9647739863056?text=أريد تجديد اشتراكي", "_blank")} style={{ background: "linear-gradient(90deg,#00d4aa,#0070f3)", border: "none", borderRadius: 7, padding: "6px 12px", color: "#000", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "Tajawal,sans-serif", whiteSpace: "nowrap" }}>تجديد</button>
          </div>
        );
      })()}

      {/* STATS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, padding: "12px 16px" }}>
        {[
          { label: "الكل", value: bookings.length, icon: "📋", color: COLORS.accent },
          { label: "مؤكد", value: bookings.filter(b => b.status === "confirmed").length, icon: "✅", color: "#00d4aa" },
          { label: "انتظار", value: bookings.filter(b => b.status === "pending").length, icon: "⏳", color: "#f59e0b" },
        ].map((s, i) => (
          <div key={i} style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: "14px 10px", textAlign: "center" }}>
            <div style={{ fontSize: 20, marginBottom: 4 }}>{s.icon}</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* TABS - سكرول أفقي */}
      <div style={{ overflowX: "auto", padding: "0 16px 12px", display: "flex", gap: 8, scrollbarWidth: "none" }}>
        <style>{`.tabs-scroll::-webkit-scrollbar{display:none}`}</style>
        {[
          { id: "bookings", label: "📋 الحجوزات" },
          { id: "services", label: "🛎️ الخدمات" },
          { id: "stats", label: "📊 الإحصاء" },
          { id: "schedule", label: "📅 الدوام" },
          { id: "settings", label: "⚙️ الإعدادات" },
        ].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ padding: "9px 16px", borderRadius: 10, cursor: "pointer", fontSize: 12, fontFamily: "Tajawal,sans-serif", fontWeight: 700, background: activeTab === t.id ? COLORS.accentDim : COLORS.surface, color: activeTab === t.id ? COLORS.accent : COLORS.muted, border: `1px solid ${activeTab === t.id ? COLORS.accent : COLORS.border}`, whiteSpace: "nowrap", flexShrink: 0 }}>{t.label}</button>
        ))}
      </div>

      <div style={{ padding: "0 16px" }}>

        {/* BOOKINGS */}
        {activeTab === "bookings" && (
          <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 14, overflow: "hidden" }}>
            <div style={{ padding: "12px 16px", borderBottom: `1px solid ${COLORS.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontWeight: 700, color: COLORS.white, fontSize: 15 }}>حجوزاتك</h3>
              <button onClick={checkUser} style={{ background: COLORS.accentDim, border: `1px solid ${COLORS.accent}`, borderRadius: 8, padding: "5px 12px", color: COLORS.accent, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "Tajawal,sans-serif" }}>🔄 تحديث</button>
            </div>
            {bookings.length === 0 ? (
              <div style={{ padding: 40, textAlign: "center", color: COLORS.muted }}>
                <div style={{ fontSize: 40, marginBottom: 10 }}>📭</div>
                <div style={{ fontSize: 14 }}>لا توجد حجوزات بعد</div>
              </div>
            ) : (
              bookings.map((b, i) => (
                <div key={i} style={{ padding: "14px 16px", borderBottom: i < bookings.length - 1 ? `1px solid ${COLORS.border}` : "none", background: i % 2 === 0 ? "transparent" : "#ffffff04" }}>
                  {/* صف الاسم والحالة */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <div>
                      <div style={{ fontWeight: 700, color: COLORS.white, fontSize: 14 }}>{b.name}</div>
                      <div style={{ fontSize: 11, color: COLORS.muted }}>{b.phone}</div>
                    </div>
                    <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, fontWeight: 600, background: b.status === "confirmed" ? "#00d4aa22" : b.status === "cancelled" ? "#ef444422" : "#f59e0b22", color: b.status === "confirmed" ? "#00d4aa" : b.status === "cancelled" ? "#ef4444" : "#f59e0b", border: `1px solid ${b.status === "confirmed" ? "#00d4aa44" : b.status === "cancelled" ? "#ef444444" : "#f59e0b44"}` }}>
                      {b.status === "confirmed" ? "مؤكد" : b.status === "cancelled" ? "ملغي" : "انتظار"}
                    </span>
                  </div>
                  {/* الخدمة والوقت */}
                  <div style={{ display: "flex", gap: 12, marginBottom: 10 }}>
                    <span style={{ fontSize: 12, color: COLORS.muted }}>🛎️ {b.service}</span>
                    <span style={{ fontSize: 12, color: COLORS.muted }}>🕐 {b.time}</span>
                  </div>
                  {/* الأزرار */}
                  <div style={{ display: "flex", gap: 8 }}>
                    {b.status === "pending" && (
                      <button onClick={async () => { await updateStatus(b.id, "confirmed"); sendConfirmation(b); }} style={{ flex: 1, background: "#00d4aa22", border: "1px solid #00d4aa", borderRadius: 8, padding: "8px", color: "#00d4aa", fontSize: 12, cursor: "pointer", fontFamily: "Tajawal,sans-serif", fontWeight: 700 }}>✅ تأكيد</button>
                    )}
                    {b.status !== "cancelled" && (
                      <button onClick={() => updateStatus(b.id, "cancelled")} style={{ flex: 1, background: "#ef444422", border: "1px solid #ef4444", borderRadius: 8, padding: "8px", color: "#ef4444", fontSize: 12, cursor: "pointer", fontFamily: "Tajawal,sans-serif", fontWeight: 700 }}>❌ إلغاء</button>
                    )}
                    <button onClick={() => sendReminder(b)} style={{ background: "#25d36622", border: "1px solid #25d366", borderRadius: 8, padding: "8px 14px", color: "#25d366", fontSize: 14, cursor: "pointer", fontFamily: "Tajawal,sans-serif" }}>📱</button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* SERVICES */}
        {activeTab === "services" && (
          <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: 18 }}>
            <h3 style={{ fontWeight: 700, color: COLORS.white, marginBottom: 4, fontSize: 15 }}>🛎️ خدماتك</h3>
            <p style={{ color: COLORS.muted, fontSize: 12, marginBottom: 16 }}>ستظهر للزبائن عند الحجز</p>

            {/* إضافة خدمة */}
            <div style={{ background: COLORS.surface, borderRadius: 12, padding: 14, marginBottom: 16, border: `1px solid ${COLORS.border}` }}>
              <h4 style={{ fontWeight: 700, color: COLORS.white, marginBottom: 12, fontSize: 13 }}>➕ إضافة خدمة جديدة</h4>
              <div style={{ marginBottom: 10 }}>
                <label style={{ display: "block", fontSize: 11, color: COLORS.muted, marginBottom: 4 }}>اسم الخدمة</label>
                <input type="text" placeholder="مثلاً: كشف عام" value={newService} onChange={e => setNewService(e.target.value)} style={{ width: "100%", padding: "10px 14px", borderRadius: 10, background: COLORS.card, border: `1px solid ${COLORS.border}`, color: COLORS.text, fontSize: 13, outline: "none", fontFamily: "Tajawal,sans-serif" }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
                <div>
                  <label style={{ display: "block", fontSize: 11, color: COLORS.muted, marginBottom: 4 }}>المدة</label>
                  <select value={newDuration} onChange={e => setNewDuration(Number(e.target.value))} style={{ width: "100%", padding: "10px 8px", borderRadius: 10, background: COLORS.card, border: `1px solid ${COLORS.border}`, color: COLORS.text, fontSize: 12, outline: "none", fontFamily: "Tajawal,sans-serif" }}>
                    <option value={10}>10 دق</option>
                    <option value={15}>15 دق</option>
                    <option value={20}>20 دق</option>
                    <option value={30}>30 دق</option>
                    <option value={45}>45 دق</option>
                    <option value={60}>ساعة</option>
                    <option value={90}>ساعة ونص</option>
                    <option value={120}>ساعتين</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 11, color: COLORS.muted, marginBottom: 4 }}>السعر (د.ع)</label>
                  <input type="number" placeholder="0" value={newPrice || ""} onChange={e => setNewPrice(Number(e.target.value))} style={{ width: "100%", padding: "10px 14px", borderRadius: 10, background: COLORS.card, border: `1px solid ${COLORS.border}`, color: COLORS.text, fontSize: 13, outline: "none", fontFamily: "Tajawal,sans-serif" }} />
                </div>
              </div>
              <button onClick={addService} disabled={addingService || !newService.trim()} style={{ width: "100%", background: "linear-gradient(90deg,#00d4aa,#0070f3)", border: "none", borderRadius: 10, padding: "11px", color: "#000", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "Tajawal,sans-serif" }}>+ إضافة</button>
            </div>

            {/* قائمة الخدمات */}
            {services.length === 0 ? (
              <div style={{ textAlign: "center", padding: 24, color: COLORS.muted }}>
                <div style={{ fontSize: 36, marginBottom: 10 }}>🛎️</div>
                <div style={{ marginBottom: 14, fontSize: 13 }}>ما أضفت خدمات بعد</div>
                <button onClick={addDefaultServices} style={{ background: COLORS.accentDim, border: `1px solid ${COLORS.accent}`, borderRadius: 10, padding: "10px 20px", color: COLORS.accent, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "Tajawal,sans-serif" }}>✨ أضف الافتراضية</button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {services.map((s, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: COLORS.surface, borderRadius: 10, padding: "12px 14px", border: `1px solid ${COLORS.border}` }}>
                    <div>
                      <div style={{ fontWeight: 600, color: COLORS.white, fontSize: 13 }}>🛎️ {s.name}</div>
                      <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 3 }}>⏱ {s.duration} دق &nbsp;{s.price > 0 ? `· ${s.price.toLocaleString()} د.ع` : "· مجاناً"}</div>
                    </div>
                    <button onClick={() => deleteService(s.id)} style={{ background: "#ef444422", border: "1px solid #ef4444", borderRadius: 8, padding: "6px 12px", color: "#ef4444", fontSize: 12, cursor: "pointer", fontFamily: "Tajawal,sans-serif" }}>حذف</button>
                  </div>
                ))}
                <button onClick={addDefaultServices} style={{ background: COLORS.surface, border: `1px dashed ${COLORS.border}`, borderRadius: 10, padding: "10px", color: COLORS.muted, fontSize: 12, cursor: "pointer", fontFamily: "Tajawal,sans-serif", marginTop: 4 }}>+ إضافة الافتراضية</button>
              </div>
            )}
          </div>
        )}

        {/* STATS */}
        {activeTab === "stats" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
              {[
                { label: "هذا الشهر", value: thisMonth.length, icon: "📅", color: COLORS.accent, sub: monthDiff >= 0 ? `+${monthDiff} عن الماضي` : `${monthDiff} عن الماضي`, subColor: monthDiff >= 0 ? "#00d4aa" : "#ef4444" },
                { label: "نسبة التأكيد", value: `${confirmRate}%`, icon: "✅", color: "#00d4aa", sub: `${bookings.filter(b => b.status === "confirmed").length} من ${bookings.length}`, subColor: COLORS.muted },
                { label: "متوسط التقييم", value: avgRating, icon: "⭐", color: "#f59e0b", sub: `${reviews.length} تقييم`, subColor: COLORS.muted },
                { label: "الشهر الماضي", value: lastMonth.length, icon: "📈", color: "#64748b", sub: "حجوزات", subColor: COLORS.muted },
              ].map((s, i) => (
                <div key={i} style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: 16 }}>
                  <div style={{ fontSize: 24, marginBottom: 6 }}>{s.icon}</div>
                  <div style={{ fontSize: 26, fontWeight: 900, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 3 }}>{s.label}</div>
                  <div style={{ fontSize: 11, color: s.subColor, marginTop: 4, fontWeight: 600 }}>{s.sub}</div>
                </div>
              ))}
            </div>
            <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: 16 }}>
              <h3 style={{ fontWeight: 700, color: COLORS.white, marginBottom: 14, fontSize: 14 }}>📅 آخر الحجوزات</h3>
              {thisMonth.length === 0 ? (
                <div style={{ textAlign: "center", color: COLORS.muted, padding: 16, fontSize: 13 }}>لا توجد حجوزات هذا الشهر</div>
              ) : (
                thisMonth.slice(0, 5).map((b, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: i < Math.min(thisMonth.length, 5) - 1 ? `1px solid ${COLORS.border}` : "none" }}>
                    <div>
                      <div style={{ fontWeight: 600, color: COLORS.white, fontSize: 13 }}>{b.name}</div>
                      <div style={{ fontSize: 11, color: COLORS.muted }}>{b.service}</div>
                    </div>
                    <div style={{ textAlign: "left" }}>
                      <div style={{ fontSize: 11, color: COLORS.text }}>{b.time}</div>
                      <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 20, fontWeight: 600, background: b.status === "confirmed" ? "#00d4aa22" : b.status === "cancelled" ? "#ef444422" : "#f59e0b22", color: b.status === "confirmed" ? "#00d4aa" : b.status === "cancelled" ? "#ef4444" : "#f59e0b" }}>
                        {b.status === "confirmed" ? "مؤكد" : b.status === "cancelled" ? "ملغي" : "انتظار"}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* SCHEDULE */}
        {activeTab === "schedule" && (
          <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: 18 }}>
            <h3 style={{ fontWeight: 700, color: COLORS.white, marginBottom: 4, fontSize: 15 }}>📅 جدول الدوام</h3>
            <p style={{ color: COLORS.muted, fontSize: 12, marginBottom: 20 }}>حدد أيام وساعات عملك</p>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 13, color: COLORS.muted, marginBottom: 10, fontWeight: 600 }}>أيام الدوام</label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 6 }}>
                {DAYS.map(day => (
                  <button key={day.id} onClick={() => toggleDay(day.id)} style={{ padding: "9px 4px", borderRadius: 9, cursor: "pointer", fontFamily: "Tajawal,sans-serif", fontSize: 11, fontWeight: 600, background: workDays.includes(day.id) ? COLORS.accentDim : COLORS.surface, color: workDays.includes(day.id) ? COLORS.accent : COLORS.muted, border: `2px solid ${workDays.includes(day.id) ? COLORS.accent : COLORS.border}`, textAlign: "center" }}>
                    {workDays.includes(day.id) ? "✓" : ""} {day.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, color: COLORS.muted, marginBottom: 6, fontWeight: 600 }}>🕐 البداية</label>
                <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} style={{ width: "100%", padding: "11px 12px", borderRadius: 10, background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.text, fontSize: 14, outline: "none", fontFamily: "Tajawal,sans-serif" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, color: COLORS.muted, marginBottom: 6, fontWeight: 600 }}>🕐 النهاية</label>
                <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} style={{ width: "100%", padding: "11px 12px", borderRadius: 10, background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.text, fontSize: 14, outline: "none", fontFamily: "Tajawal,sans-serif" }} />
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 12, color: COLORS.muted, marginBottom: 8, fontWeight: 600 }}>👥 أقصى حجوزات: <span style={{ color: COLORS.accent, fontSize: 15 }}>{maxPerDay}</span></label>
              <input type="range" min={1} max={100} value={maxPerDay} onChange={e => setMaxPerDay(Number(e.target.value))} style={{ width: "100%", accentColor: COLORS.accent }} />
            </div>

            <div style={{ background: COLORS.surface, borderRadius: 10, padding: 14, marginBottom: 16, fontSize: 12, color: COLORS.muted, lineHeight: 2 }}>
              <div>📅 <span style={{ color: COLORS.text }}>{workDays.map(d => DAYS.find(x => x.id === d)?.label).join("، ")}</span></div>
              <div>🕐 <span style={{ color: COLORS.text }}>{startTime} — {endTime}</span></div>
              <div>👥 <span style={{ color: COLORS.accent, fontWeight: 700 }}>{maxPerDay} حجز / يوم</span></div>
            </div>

            <button onClick={saveSchedule} disabled={savingSchedule || workDays.length === 0} style={{ width: "100%", padding: "13px", background: scheduleSaved ? "#00d4aa" : workDays.length === 0 ? "#333" : "linear-gradient(90deg,#00d4aa,#0070f3)", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer", color: "#000", fontFamily: "Tajawal,sans-serif" }}>
              {savingSchedule ? "جاري الحفظ..." : scheduleSaved ? "✅ تم الحفظ!" : "💾 حفظ الجدول"}
            </button>
          </div>
        )}

        {/* SETTINGS */}
        {activeTab === "settings" && (
          <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: 18 }}>
            <h3 style={{ fontWeight: 700, color: COLORS.white, marginBottom: 4, fontSize: 15 }}>⚙️ الإعدادات</h3>
            <p style={{ color: COLORS.muted, fontSize: 12, marginBottom: 20 }}>عدّل معلومات مشروعك</p>

            {[
              { label: "اسم العمل", value: settingsName, setter: setSettingsName, type: "text", placeholder: "مثال: عيادة د. أحمد" },
              { label: "رقم الواتساب", value: settingsPhone, setter: setSettingsPhone, type: "tel", placeholder: "07xx xxx xxxx" },
              { label: "📍 العنوان", value: settingsAddress, setter: setSettingsAddress, type: "text", placeholder: "مثال: شارع فلسطين" },
            ].map((f, i) => (
              <div key={i} style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 12, color: COLORS.muted, marginBottom: 6 }}>{f.label}</label>
                <input type={f.type} placeholder={f.placeholder} value={f.value} onChange={e => f.setter(e.target.value)} style={{ width: "100%", padding: "12px 14px", borderRadius: 10, background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.text, fontSize: 14, outline: "none", fontFamily: "Tajawal,sans-serif" }} />
              </div>
            ))}

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 12, color: COLORS.muted, marginBottom: 6 }}>نوع العمل</label>
              <select value={settingsSector} onChange={e => setSettingsSector(e.target.value)} style={{ width: "100%", padding: "12px 14px", borderRadius: 10, background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.text, fontSize: 14, outline: "none", fontFamily: "Tajawal,sans-serif" }}>
                <option value="clinic">🏥 عيادة</option>
                <option value="salon">✂️ صالون</option>
                <option value="hotel">🏨 شاليه / فندق</option>
              </select>
            </div>

            <button onClick={saveSettings} disabled={savingSettings} style={{ width: "100%", padding: "13px", background: settingsSaved ? "#00d4aa" : "linear-gradient(90deg,#00d4aa,#0070f3)", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer", color: "#000", fontFamily: "Tajawal,sans-serif" }}>
              {savingSettings ? "جاري الحفظ..." : settingsSaved ? "✅ تم الحفظ!" : "💾 حفظ الإعدادات"}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}