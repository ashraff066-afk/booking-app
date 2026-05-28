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

export default function ClientDashboard() {
  const [user, setUser] = useState<any>(null);
  const [client, setClient] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("bookings");
  const [copied, setCopied] = useState(false);

  const [workDays, setWorkDays] = useState<string[]>(["saturday","sunday","monday","tuesday","wednesday"]);
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("17:00");
  const [maxPerDay, setMaxPerDay] = useState(20);
  const [scheduleId, setScheduleId] = useState<string | null>(null);
  const [savingSchedule, setSavingSchedule] = useState(false);
  const [scheduleSaved, setScheduleSaved] = useState(false);

  const [settingsName, setSettingsName] = useState("");
  const [settingsPhone, setSettingsPhone] = useState("");
  const [settingsSector, setSettingsSector] = useState("clinic");
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);

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
    }
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
    const scheduleData = { client_id: client.id, sector: client.sector, work_days: workDays, start_time: startTime, end_time: endTime, max_bookings_per_day: maxPerDay };
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
    await supabase.from("clients").update({ business_name: settingsName, phone: settingsPhone, sector: settingsSector }).eq("id", client.id);
    setSavingSettings(false);
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 3000);
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

  // إحصائيات
  const now = new Date();
  const thisMonth = bookings.filter(b => {
    const d = new Date(b.created_at);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const lastMonth = bookings.filter(b => {
    const d = new Date(b.created_at);
    const lm = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return d.getMonth() === lm.getMonth() && d.getFullYear() === lm.getFullYear();
  });
  const confirmRate = bookings.length > 0 ? Math.round((bookings.filter(b => b.status === "confirmed").length / bookings.length) * 100) : 0;
  const avgRating = reviews.length > 0 ? (reviews.reduce((a, r) => a + (r.rating || 0), 0) / reviews.length).toFixed(1) : "—";
  const monthDiff = thisMonth.length - lastMonth.length;

  if (loading) return (
    <div dir="rtl" style={{ minHeight: "100vh", background: COLORS.bg, display: "flex", alignItems: "center", justifyContent: "center", color: COLORS.accent, fontSize: 18, fontFamily: "Tajawal, sans-serif" }}>جاري التحميل...</div>
  );

  return (
    <div dir="rtl" style={{ minHeight: "100vh", background: COLORS.bg, color: COLORS.text, fontFamily: "'Tajawal','Cairo',sans-serif", padding: 24 }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;800&display=swap'); *{box-sizing:border-box;margin:0;padding:0}`}</style>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>

        {/* HEADER */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: COLORS.white }}>{client?.business_name || "لوحة التحكم"}</h1>
            <p style={{ color: COLORS.muted, fontSize: 12, marginTop: 3 }}>{user?.email}</p>
            {client?.slug && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10, background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: "8px 14px", flexWrap: "wrap" }}>
                <span style={{ fontSize: 12, color: COLORS.muted }}>🔗 رابط حجزك:</span>
                <span style={{ fontSize: 12, color: COLORS.accent, fontWeight: 600 }}>/book/{client.slug}</span>
                <button onClick={copyLink} style={{ background: copied ? "#00d4aa22" : COLORS.accentDim, border: `1px solid ${COLORS.accent}`, borderRadius: 6, padding: "3px 10px", color: COLORS.accent, fontSize: 11, cursor: "pointer", fontFamily: "Tajawal,sans-serif", fontWeight: 700 }}>{copied ? "✅ تم النسخ" : "📋 نسخ"}</button>
                <button onClick={shareWhatsapp} style={{ background: "#25d36622", border: "1px solid #25d366", borderRadius: 6, padding: "3px 10px", color: "#25d366", fontSize: 11, cursor: "pointer", fontFamily: "Tajawal,sans-serif", fontWeight: 700 }}>📱 واتساب</button>
              </div>
            )}
          </div>
          <button onClick={handleLogout} style={{ background: "#ef444422", border: "1px solid #ef4444", borderRadius: 10, padding: "9px 18px", color: "#ef4444", fontWeight: 700, cursor: "pointer", fontFamily: "Tajawal,sans-serif", fontSize: 13 }}>خروج</button>
        </div>

        {/* تنبيه انتهاء الاشتراك */}
        {client?.subscription_end && (() => {
          const daysLeft = Math.ceil((new Date(client.subscription_end).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
          if (daysLeft > 7) return null;
          return (
            <div style={{ background: daysLeft <= 3 ? "#ef444422" : "#f59e0b22", border: `1px solid ${daysLeft <= 3 ? "#ef4444" : "#f59e0b"}`, borderRadius: 12, padding: "14px 20px", marginBottom: 20, display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 24 }}>{daysLeft <= 3 ? "🚨" : "⚠️"}</span>
              <div>
                <div style={{ fontWeight: 700, color: daysLeft <= 3 ? "#ef4444" : "#f59e0b", fontSize: 14 }}>{daysLeft <= 0 ? "انتهى اشتراكك!" : `اشتراكك ينتهي خلال ${daysLeft} أيام`}</div>
                <div style={{ fontSize: 12, color: COLORS.muted, marginTop: 2 }}>تواصل معنا لتجديد الاشتراك</div>
              </div>
              <button onClick={() => window.open("https://wa.me/9647739863056?text=أريد تجديد اشتراكي", "_blank")} style={{ marginRight: "auto", background: "linear-gradient(90deg,#00d4aa,#0070f3)", border: "none", borderRadius: 8, padding: "8px 16px", color: "#000", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "Tajawal,sans-serif", whiteSpace: "nowrap" }}>تجديد الآن</button>
            </div>
          );
        })()}

        {/* STATS */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 24 }}>
          {[
            { label: "إجمالي الحجوزات", value: bookings.length, icon: "📋", color: COLORS.accent },
            { label: "مؤكد", value: bookings.filter(b => b.status === "confirmed").length, icon: "✅", color: "#00d4aa" },
            { label: "انتظار", value: bookings.filter(b => b.status === "pending").length, icon: "⏳", color: "#f59e0b" },
          ].map((s, i) => (
            <div key={i} style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: 18 }}>
              <div style={{ fontSize: 24, marginBottom: 6 }}>{s.icon}</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 12, color: COLORS.muted, marginTop: 3 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* TABS */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
          {[{ id: "bookings", label: "📋 الحجوزات" }, { id: "stats", label: "📊 الإحصائيات" }, { id: "schedule", label: "📅 جدول الدوام" }, { id: "settings", label: "⚙️ الإعدادات" }].map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ padding: "10px 20px", borderRadius: 10, cursor: "pointer", fontSize: 13, fontFamily: "Tajawal,sans-serif", fontWeight: 700, background: activeTab === t.id ? COLORS.accentDim : COLORS.surface, color: activeTab === t.id ? COLORS.accent : COLORS.muted, border: `1px solid ${activeTab === t.id ? COLORS.accent : COLORS.border}` }}>{t.label}</button>
          ))}
        </div>

        {/* BOOKINGS */}
        {activeTab === "bookings" && (
          <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 16, overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: `1px solid ${COLORS.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontWeight: 700, color: COLORS.white }}>حجوزاتك</h3>
              <button onClick={checkUser} style={{ background: COLORS.accentDim, border: `1px solid ${COLORS.accent}`, borderRadius: 8, padding: "6px 14px", color: COLORS.accent, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "Tajawal,sans-serif" }}>🔄 تحديث</button>
            </div>
            {bookings.length === 0 ? (
              <div style={{ padding: 40, textAlign: "center", color: COLORS.muted }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
                <div>لا توجد حجوزات بعد</div>
              </div>
            ) : (
              bookings.map((b, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", padding: "14px 20px", alignItems: "center", borderBottom: i < bookings.length - 1 ? `1px solid ${COLORS.border}` : "none", background: i % 2 === 0 ? "transparent" : "#ffffff04" }}>
                  <div>
                    <div style={{ fontWeight: 600, color: COLORS.white, fontSize: 14 }}>{b.name}</div>
                    <div style={{ fontSize: 11, color: COLORS.muted }}>{b.phone}</div>
                  </div>
                  <div style={{ color: COLORS.text, fontSize: 13 }}>{b.service}</div>
                  <div style={{ color: COLORS.text, fontSize: 12 }}>{b.time}</div>
                  <div>
                    <span style={{ fontSize: 11, padding: "3px 8px", borderRadius: 20, fontWeight: 600, background: b.status === "confirmed" ? "#00d4aa22" : b.status === "cancelled" ? "#ef444422" : "#f59e0b22", color: b.status === "confirmed" ? "#00d4aa" : b.status === "cancelled" ? "#ef4444" : "#f59e0b", border: `1px solid ${b.status === "confirmed" ? "#00d4aa44" : b.status === "cancelled" ? "#ef444444" : "#f59e0b44"}` }}>
                      {b.status === "confirmed" ? "مؤكد" : b.status === "cancelled" ? "ملغي" : "انتظار"}
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                    {b.status === "pending" && (
                      <button onClick={async () => { await updateStatus(b.id, "confirmed"); sendConfirmation(b); }} style={{ background: "#00d4aa22", border: "1px solid #00d4aa", borderRadius: 7, padding: "4px 8px", color: "#00d4aa", fontSize: 10, cursor: "pointer", fontFamily: "Tajawal,sans-serif" }}>✅ تأكيد</button>
                    )}
                    {b.status !== "cancelled" && (
                      <button onClick={() => updateStatus(b.id, "cancelled")} style={{ background: "#ef444422", border: "1px solid #ef4444", borderRadius: 7, padding: "4px 8px", color: "#ef4444", fontSize: 10, cursor: "pointer", fontFamily: "Tajawal,sans-serif" }}>إلغاء</button>
                    )}
                    <button onClick={() => sendReminder(b)} style={{ background: "#25d36622", border: "1px solid #25d366", borderRadius: 7, padding: "4px 8px", color: "#25d366", fontSize: 10, cursor: "pointer", fontFamily: "Tajawal,sans-serif" }}>📱</button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* STATS TAB */}
        {activeTab === "stats" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 16, marginBottom: 24 }}>
              {[
                { label: "حجوزات هذا الشهر", value: thisMonth.length, icon: "📅", color: COLORS.accent, sub: monthDiff >= 0 ? `+${monthDiff} عن الشهر الماضي` : `${monthDiff} عن الشهر الماضي`, subColor: monthDiff >= 0 ? "#00d4aa" : "#ef4444" },
                { label: "نسبة التأكيد", value: `${confirmRate}%`, icon: "✅", color: "#00d4aa", sub: `${bookings.filter(b => b.status === "confirmed").length} من ${bookings.length} حجز`, subColor: COLORS.muted },
                { label: "متوسط التقييم", value: avgRating, icon: "⭐", color: "#f59e0b", sub: `${reviews.length} تقييم`, subColor: COLORS.muted },
                { label: "الشهر الماضي", value: lastMonth.length, icon: "📈", color: "#64748b", sub: "حجوزات", subColor: COLORS.muted },
              ].map((s, i) => (
                <div key={i} style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 24 }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
                  <div style={{ fontSize: 32, fontWeight: 900, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 13, color: COLORS.muted, marginTop: 4 }}>{s.label}</div>
                  <div style={{ fontSize: 12, color: s.subColor, marginTop: 6, fontWeight: 600 }}>{s.sub}</div>
                </div>
              ))}
            </div>

            {/* آخر الحجوزات هذا الشهر */}
            <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 24 }}>
              <h3 style={{ fontWeight: 700, color: COLORS.white, marginBottom: 16 }}>📅 حجوزات هذا الشهر</h3>
              {thisMonth.length === 0 ? (
                <div style={{ textAlign: "center", color: COLORS.muted, padding: 20 }}>لا توجد حجوزات هذا الشهر</div>
              ) : (
                thisMonth.slice(0, 5).map((b, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: i < Math.min(thisMonth.length, 5) - 1 ? `1px solid ${COLORS.border}` : "none" }}>
                    <div>
                      <div style={{ fontWeight: 600, color: COLORS.white, fontSize: 13 }}>{b.name}</div>
                      <div style={{ fontSize: 11, color: COLORS.muted }}>{b.service}</div>
                    </div>
                    <div style={{ textAlign: "left" }}>
                      <div style={{ fontSize: 12, color: COLORS.text }}>{b.time}</div>
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
          <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 24 }}>
            <h3 style={{ fontWeight: 700, color: COLORS.white, marginBottom: 6 }}>📅 جدول الدوام</h3>
            <p style={{ color: COLORS.muted, fontSize: 13, marginBottom: 24 }}>حدد أيام وساعات عملك</p>
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", fontSize: 13, color: COLORS.muted, marginBottom: 12, fontWeight: 600 }}>أيام الدوام</label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {DAYS.map(day => (
                  <button key={day.id} onClick={() => toggleDay(day.id)} style={{ padding: "8px 16px", borderRadius: 10, cursor: "pointer", fontFamily: "Tajawal,sans-serif", fontSize: 13, fontWeight: 600, background: workDays.includes(day.id) ? COLORS.accentDim : COLORS.surface, color: workDays.includes(day.id) ? COLORS.accent : COLORS.muted, border: `2px solid ${workDays.includes(day.id) ? COLORS.accent : COLORS.border}` }}>
                    {workDays.includes(day.id) ? "✓ " : ""}{day.label}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
              <div>
                <label style={{ display: "block", fontSize: 13, color: COLORS.muted, marginBottom: 8, fontWeight: 600 }}>🕐 وقت البداية</label>
                <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} style={{ width: "100%", padding: "12px 16px", borderRadius: 10, background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.text, fontSize: 14, outline: "none", fontFamily: "Tajawal,sans-serif" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, color: COLORS.muted, marginBottom: 8, fontWeight: 600 }}>🕐 وقت الانتهاء</label>
                <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} style={{ width: "100%", padding: "12px 16px", borderRadius: 10, background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.text, fontSize: 14, outline: "none", fontFamily: "Tajawal,sans-serif" }} />
              </div>
            </div>
            <div style={{ marginBottom: 28 }}>
              <label style={{ display: "block", fontSize: 13, color: COLORS.muted, marginBottom: 8, fontWeight: 600 }}>👥 أقصى حجوزات باليوم: <span style={{ color: COLORS.accent, fontSize: 16 }}>{maxPerDay}</span></label>
              <input type="range" min={1} max={100} value={maxPerDay} onChange={e => setMaxPerDay(Number(e.target.value))} style={{ width: "100%", accentColor: COLORS.accent }} />
            </div>
            <div style={{ background: COLORS.surface, borderRadius: 12, padding: 16, marginBottom: 20 }}>
              <h4 style={{ fontWeight: 700, color: COLORS.white, marginBottom: 10, fontSize: 14 }}>ملخص جدولك</h4>
              <div style={{ fontSize: 13, color: COLORS.muted, lineHeight: 2 }}>
                <div>📅 أيام الدوام: <span style={{ color: COLORS.text }}>{workDays.map(d => DAYS.find(x => x.id === d)?.label).join("، ")}</span></div>
                <div>🕐 ساعات العمل: <span style={{ color: COLORS.text }}>{startTime} — {endTime}</span></div>
                <div>👥 أقصى حجوزات: <span style={{ color: COLORS.accent, fontWeight: 700 }}>{maxPerDay} حجز / يوم</span></div>
              </div>
            </div>
            <button onClick={saveSchedule} disabled={savingSchedule || workDays.length === 0} style={{ width: "100%", padding: "14px", background: scheduleSaved ? "#00d4aa" : workDays.length === 0 ? "#333" : "linear-gradient(90deg,#00d4aa,#0070f3)", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: savingSchedule || workDays.length === 0 ? "not-allowed" : "pointer", color: "#000", fontFamily: "Tajawal,sans-serif" }}>
              {savingSchedule ? "جاري الحفظ..." : scheduleSaved ? "✅ تم الحفظ!" : "💾 حفظ الجدول"}
            </button>
          </div>
        )}

        {/* SETTINGS */}
        {activeTab === "settings" && (
          <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 24 }}>
            <h3 style={{ fontWeight: 700, color: COLORS.white, marginBottom: 6 }}>⚙️ إعدادات الحساب</h3>
            <p style={{ color: COLORS.muted, fontSize: 13, marginBottom: 24 }}>عدّل معلومات مشروعك</p>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 13, color: COLORS.muted, marginBottom: 6 }}>اسم العمل</label>
              <input type="text" value={settingsName} onChange={e => setSettingsName(e.target.value)} style={{ width: "100%", padding: "12px 16px", borderRadius: 10, background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.text, fontSize: 14, outline: "none", fontFamily: "Tajawal,sans-serif" }} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 13, color: COLORS.muted, marginBottom: 6 }}>رقم الواتساب</label>
              <input type="tel" value={settingsPhone} onChange={e => setSettingsPhone(e.target.value)} placeholder="07xx xxx xxxx" style={{ width: "100%", padding: "12px 16px", borderRadius: 10, background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.text, fontSize: 14, outline: "none", fontFamily: "Tajawal,sans-serif" }} />
              <p style={{ fontSize: 11, color: COLORS.muted, marginTop: 4 }}>هذا الرقم سيصله إشعار الواتساب عند كل حجز</p>
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", fontSize: 13, color: COLORS.muted, marginBottom: 6 }}>نوع العمل</label>
              <select value={settingsSector} onChange={e => setSettingsSector(e.target.value)} style={{ width: "100%", padding: "12px 16px", borderRadius: 10, background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.text, fontSize: 14, outline: "none", fontFamily: "Tajawal,sans-serif" }}>
                <option value="clinic">🏥 عيادة</option>
                <option value="salon">✂️ صالون</option>
                <option value="hotel">🏨 شاليه / فندق</option>
              </select>
            </div>
            <button onClick={saveSettings} disabled={savingSettings} style={{ width: "100%", padding: "14px", background: settingsSaved ? "#00d4aa" : "linear-gradient(90deg,#00d4aa,#0070f3)", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: savingSettings ? "not-allowed" : "pointer", color: "#000", fontFamily: "Tajawal,sans-serif" }}>
              {savingSettings ? "جاري الحفظ..." : settingsSaved ? "✅ تم الحفظ!" : "💾 حفظ الإعدادات"}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}