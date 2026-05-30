"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../supabase";

const COLORS = {
  bg: "#0a0e1a", surface: "#111827", card: "#1a2235",
  border: "#1e2d45", accent: "#00d4aa", accentDim: "#00d4aa22",
  text: "#e2e8f0", muted: "#64748b", white: "#ffffff",
};

const DAYS_EN = ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"];

const SECTOR_SERVICES: Record<string, string[]> = {
  clinic: ["كشف عام","استشارة طبية","فحوصات","متابعة","تطعيم","أشعة"],
  salon: ["قص شعر","صبغة شعر","عناية بشرة","مانيكير","بيديكير","مساج"],
  hotel: ["غرفة عادية","غرفة ديلوكس","جناح","باقة عائلية","باقة رومانسية","إيجار يومي"],
};

const SLOT_DURATION: Record<string, number> = { clinic: 10, salon: 30, hotel: 60 };

function generateSlots(start: string, end: string, duration: number) {
  const slots: string[] = [];
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  let cur = sh * 60 + sm;
  const endMin = eh * 60 + em;
  while (cur + duration <= endMin) {
    slots.push(`${Math.floor(cur/60).toString().padStart(2,"0")}:${(cur%60).toString().padStart(2,"0")}`);
    cur += duration;
  }
  return slots;
}

export default function BookPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [client, setClient] = useState<any>(null);
  const [schedule, setSchedule] = useState<any>(null);
  const [morningEnabled, setMorningEnabled] = useState(true);
const [morningStart, setMorningStart] = useState("08:00");
const [morningEnd, setMorningEnd] = useState("12:00");
const [eveningEnabled, setEveningEnabled] = useState(false);
const [eveningStart, setEveningStart] = useState("16:00");
const [eveningEnd, setEveningEnd] = useState("21:00");
  const [notFound, setNotFound] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [service, setService] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingNumber, setBookingNumber] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [customServices, setCustomServices] = useState<string[]>([]);
  const [clientServices, setClientServices] = useState<any[]>([]);

  useEffect(() => { if (slug) loadClient(); }, [slug]);

  const loadClient = async () => {
    if (typeof window !== "undefined" && !window.location.search.includes("book=1")) {
  window.location.href = `/book/${slug}/profile`;
  return;
}
    const { data, error } = await supabase.from("clients").select("*").eq("slug", slug).limit(1);
    if (error || !data || data.length === 0) { setNotFound(true); setPageLoading(false); return; }
    const clientData = data[0];
    setClient(clientData);
    setService(SECTOR_SERVICES[clientData.sector]?.[0] || "");

    const { data: schData } = await supabase.from("schedules").select("*").eq("client_id", clientData.id).limit(1);
    setSchedule(schData?.[0] || null);

    const { data: servicesData } = await supabase.from("services").select("*").eq("client_id", clientData.id).order("created_at", { ascending: true });
if (servicesData && servicesData.length > 0) {
  setCustomServices(servicesData.map((s: any) => s.name));
  setClientServices(servicesData);
  setService(servicesData[0].name);
} else {
  setCustomServices(SECTOR_SERVICES[clientData.sector] || []);
  setClientServices([]);
}
    setPageLoading(false);
  };

  useEffect(() => {
    if (!bookingDate || !client) return;
    supabase.from("bookings").select("booking_time")
      .eq("booking_date", bookingDate).eq("sector", client.sector).neq("status", "cancelled")
      .then(({ data }: { data: any[] | null }) => {
        setBookedSlots((data || []).map((b: any) => b.booking_time?.slice(0, 5)));
        setSelectedTime("");
      });
  }, [bookingDate, client]);

  const handleBooking = async () => {
    if (phone.replace(/\s/g, '').length !== 11) { alert("رقم الهاتف يجب أن يكون 11 رقم"); return; }
    if (!name || !phone || !bookingDate || !selectedTime) { alert("يرجى إدخال جميع البيانات"); return; }
    const { data: existing } = await supabase
  .from("bookings")
  .select("id")
  .eq("phone", phone)
  .eq("booking_date", bookingDate)
  .eq("client_id", client.id)
  .neq("status", "cancelled")
  .limit(1);

if (existing && existing.length > 0) {
  alert("عندك حجز مسجل بهذا الرقم بنفس اليوم!");
  setLoading(false);
  return;
}
    setLoading(true);
    const bNumber = "HJ-" + Date.now().toString().slice(-6);
    const { error } = await supabase.from("bookings").insert([{
      name, phone, service,
      time: `${bookingDate} ${selectedTime}`,
      booking_date: bookingDate,
      booking_time: selectedTime,
      sector: client.sector,
      client_id: client.id,
      status: "pending",
    }]);
    setLoading(false);
    if (!error) {
      const msg = `🔔 حجز جديد!\nرقم الحجز: ${bNumber}\nالاسم: ${name}\nالهاتف: ${phone}\nالخدمة: ${service}\nالموعد: ${bookingDate} ${selectedTime}`;
      window.open(`https://wa.me/${client.phone?.replace(/^0/,"964")}?text=${encodeURIComponent(msg)}`, "_blank");
      setBookingNumber(bNumber);
      setBookingSuccess(true);
      setName(""); setPhone(""); setBookingDate(""); setSelectedTime("");
      setRating(0); setComment(""); setReviewSubmitted(false);
    } else { alert("حدث خطأ، حاول مجدداً"); }
  };

  const handleReview = async () => {
    if (rating === 0) { alert("يرجى اختيار تقييم"); return; }
    setReviewLoading(true);
    await supabase.from("reviews").insert([{ booking_number: bookingNumber, rating, comment }]);
    setReviewLoading(false);
    setReviewSubmitted(true);
  };

  if (pageLoading) return (
    <div dir="rtl" style={{ minHeight: "100vh", background: COLORS.bg, display: "flex", alignItems: "center", justifyContent: "center", color: COLORS.accent, fontSize: 18, fontFamily: "Tajawal, sans-serif" }}>جاري التحميل...</div>
  );

  if (notFound) return (
    <div dir="rtl" style={{ minHeight: "100vh", background: COLORS.bg, display: "flex", alignItems: "center", justifyContent: "center", color: COLORS.text, fontFamily: "Tajawal, sans-serif", textAlign: "center" }}>
      <div><div style={{ fontSize: 64, marginBottom: 16 }}>😕</div><h2 style={{ color: COLORS.white }}>الصفحة غير موجودة</h2></div>
    </div>
  );

  const services = customServices.length > 0 ? customServices : (SECTOR_SERVICES[client.sector] || []);
  const duration = SLOT_DURATION[client.sector] || 30;
const morningSlots = bookingDate && schedule?.morning_enabled ? generateSlots(schedule.morning_start || "08:00", schedule.morning_end || "12:00", duration) : [];
const eveningSlots = bookingDate && schedule?.evening_enabled ? generateSlots(schedule.evening_start || "16:00", schedule.evening_end || "21:00", duration) : [];
const slots = [...morningSlots, ...eveningSlots];
  const sectorIcon = client.sector === "clinic" ? "🏥" : client.sector === "salon" ? "✂️" : "🏨";

  if (bookingSuccess) return (
    <div dir="rtl" style={{ minHeight: "100vh", background: COLORS.bg, color: COLORS.text, fontFamily: "'Tajawal','Cairo',sans-serif", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;800;900&display=swap'); *{box-sizing:border-box;margin:0;padding:0}`}</style>
      <div style={{ background: COLORS.card, border: `1px solid ${COLORS.accent}44`, borderRadius: 24, padding: 24, maxWidth: 480, width: "100%", textAlign: "center" }}>
        <div style={{ fontSize: 56, marginBottom: 12 }}>🎉</div>
        <h2 style={{ fontSize: 22, fontWeight: 900, color: COLORS.white, marginBottom: 8 }}>تم الحجز بنجاح!</h2>
        <p style={{ color: COLORS.muted, fontSize: 13, marginBottom: 20 }}>سيتم التواصل معك على واتساب للتأكيد.</p>
        <div style={{ background: COLORS.accentDim, border: `2px solid ${COLORS.accent}`, borderRadius: 14, padding: "14px 20px", marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: COLORS.muted, marginBottom: 4 }}>رقم حجزك</div>
          <div style={{ fontSize: 26, fontWeight: 900, color: COLORS.accent, letterSpacing: 2 }}>{bookingNumber}</div>
        </div>
        {!reviewSubmitted ? (
          <div style={{ background: COLORS.surface, borderRadius: 16, padding: 16, marginBottom: 16, border: `1px solid ${COLORS.border}` }}>
            <h4 style={{ fontWeight: 700, color: COLORS.white, marginBottom: 12 }}>قيّم تجربتك ⭐</h4>
            <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 12 }}>
              {[1,2,3,4,5].map(star => (
                <span key={star} onClick={() => setRating(star)} onMouseEnter={() => setHoverRating(star)} onMouseLeave={() => setHoverRating(0)} style={{ fontSize: 32, cursor: "pointer", filter: (hoverRating||rating) >= star ? "none" : "grayscale(1)" }}>⭐</span>
              ))}
            </div>
            <textarea placeholder="اكتب تعليقك (اختياري)..." value={comment} onChange={e => setComment(e.target.value)} rows={2} style={{ width: "100%", padding: "10px 14px", borderRadius: 10, background: COLORS.card, border: `1px solid ${COLORS.border}`, color: COLORS.text, fontSize: 13, outline: "none", fontFamily: "Tajawal,sans-serif", resize: "none", marginBottom: 10 }} />
            <button onClick={handleReview} disabled={reviewLoading} style={{ width: "100%", padding: "11px", background: rating > 0 ? "linear-gradient(90deg,#00d4aa,#0070f3)" : COLORS.surface, border: `1px solid ${rating > 0 ? COLORS.accent : COLORS.border}`, borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: rating > 0 ? "pointer" : "not-allowed", color: rating > 0 ? "#000" : COLORS.muted, fontFamily: "Tajawal,sans-serif" }}>{reviewLoading ? "جاري الإرسال..." : "إرسال التقييم"}</button>
          </div>
        ) : (
          <div style={{ background: "#00d4aa22", border: "1px solid #00d4aa", borderRadius: 14, padding: 14, marginBottom: 16, color: COLORS.accent, fontWeight: 700 }}>✅ شكراً على تقييمك!</div>
        )}
        <button onClick={() => setBookingSuccess(false)} style={{ width: "100%", padding: "13px", background: "linear-gradient(90deg,#00d4aa,#0070f3)", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer", color: "#000", fontFamily: "Tajawal,sans-serif" }}>حجز جديد</button>
      </div>
    </div>
  );

  return (
    <div dir="rtl" style={{ minHeight: "100vh", background: COLORS.bg, color: COLORS.text, fontFamily: "'Tajawal','Cairo',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;800;900&display=swap'); *{box-sizing:border-box;margin:0;padding:0} .slot-btn{transition:all 0.15s} .slot-btn:hover:not(:disabled){transform:scale(1.05)} @media(max-width:768px){.slots-grid{grid-template-columns:repeat(3,1fr)!important}}`}</style>

      <div style={{ background: "#0d1424", borderBottom: `1px solid ${COLORS.border}`, padding: "16px 24px", display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 42, height: 42, borderRadius: 10, background: "linear-gradient(135deg,#00d4aa,#0070f3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{sectorIcon}</div>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 800, color: COLORS.white }}>{client.business_name}</h1>
          {client.address && <p style={{ fontSize: 11, color: COLORS.muted, marginTop: 2 }}>📍 {client.address}</p>}
{schedule?.morning_enabled && <p style={{ fontSize: 11, color: COLORS.muted, marginTop: 2 }}>🌅 {schedule.morning_start} — {schedule.morning_end}</p>}
{schedule?.evening_enabled && <p style={{ fontSize: 11, color: COLORS.muted, marginTop: 2 }}>🌙 {schedule.evening_start} — {schedule.evening_end}</p>}
        </div>
      </div>

      <div style={{ maxWidth: 600, margin: "0 auto", padding: "24px 16px" }}>
        <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 24 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: COLORS.white, marginBottom: 20, textAlign: "center" }}>احجز موعدك</h2>

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 13, color: COLORS.muted, marginBottom: 6 }}>اسمك الكامل</label>
            <input type="text" placeholder="مثال: محمد علي" value={name} onChange={e => setName(e.target.value)} style={{ width: "100%", padding: "12px 16px", borderRadius: 10, background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.text, fontSize: 14, outline: "none", fontFamily: "Tajawal,sans-serif" }} />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 13, color: COLORS.muted, marginBottom: 6 }}>رقم الهاتف (واتساب)</label>
            <input type="tel" placeholder="07xx xxx xxxx" value={phone} onChange={e => setPhone(e.target.value)} style={{ width: "100%", padding: "12px 16px", borderRadius: 10, background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.text, fontSize: 14, outline: "none", fontFamily: "Tajawal,sans-serif" }} />
          </div>

<div style={{ marginBottom: 14 }}>
  <label style={{ display: "block", fontSize: 13, color: COLORS.muted, marginBottom: 8 }}>{sectorIcon} اختر الخدمة</label>
  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
    {customServices.length > 0 ? (
      // خدمات العميل مع السعر والمدة
      clientServices.map((s: any, i: number) => (
        <div key={i} onClick={() => setService(s.name)} style={{ padding: "12px 16px", borderRadius: 10, background: service === s.name ? COLORS.accentDim : COLORS.surface, border: `2px solid ${service === s.name ? COLORS.accent : COLORS.border}`, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", transition: "all 0.2s" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {service === s.name && <span style={{ color: COLORS.accent }}>✓</span>}
            <span style={{ fontWeight: 600, color: COLORS.white, fontSize: 14 }}>{s.name}</span>
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <span style={{ fontSize: 11, color: COLORS.muted }}>⏱ {s.duration} دقيقة</span>
            {s.price > 0 && <span style={{ fontSize: 12, color: COLORS.accent, fontWeight: 700 }}>{s.price.toLocaleString()} د.ع</span>}
          </div>
        </div>
      ))
    ) : (
      // خدمات افتراضية بدون سعر
      services.map((s: string, i: number) => (
        <div key={i} onClick={() => setService(s)} style={{ padding: "12px 16px", borderRadius: 10, background: service === s ? COLORS.accentDim : COLORS.surface, border: `2px solid ${service === s ? COLORS.accent : COLORS.border}`, cursor: "pointer", display: "flex", alignItems: "center", gap: 10, transition: "all 0.2s" }}>
          {service === s && <span style={{ color: COLORS.accent }}>✓</span>}
          <span style={{ fontWeight: 600, color: COLORS.white, fontSize: 14 }}>{s}</span>
        </div>
      ))
    )}
  </div>
</div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 13, color: COLORS.muted, marginBottom: 6 }}>📅 التاريخ</label>
            <input type="date" value={bookingDate} onChange={e => setBookingDate(e.target.value)} min={new Date().toISOString().split("T")[0]} style={{ width: "100%", padding: "12px 16px", borderRadius: 10, background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.text, fontSize: 14, outline: "none", fontFamily: "Tajawal,sans-serif" }} />
          </div>

          {bookingDate && slots.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", fontSize: 13, color: COLORS.muted, marginBottom: 10 }}>
                🕐 اختر الوقت &nbsp;<span style={{ fontSize: 11 }}>🟢 متاح &nbsp; 🔴 محجوز</span>
              </label>
              <div className="slots-grid" style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 8 }}>
                {slots.map(slot => {
                  const isBooked = bookedSlots.includes(slot);
                  const isSelected = selectedTime === slot;
                  return (
                    <button key={slot} className="slot-btn" disabled={isBooked} onClick={() => setSelectedTime(slot)} style={{ padding: "10px 4px", borderRadius: 10, border: `2px solid ${isSelected ? COLORS.accent : isBooked ? "#ef444444" : COLORS.border}`, background: isSelected ? COLORS.accentDim : isBooked ? "#ef444411" : COLORS.surface, color: isSelected ? COLORS.accent : isBooked ? "#ef4444" : COLORS.text, fontSize: 12, fontWeight: isSelected ? 700 : 400, cursor: isBooked ? "not-allowed" : "pointer", fontFamily: "Tajawal,sans-serif", opacity: isBooked ? 0.5 : 1 }}>
                      {slot}
                    </button>
                  );
                })}
              </div>
              {selectedTime && <p style={{ color: COLORS.accent, fontSize: 13, marginTop: 10, fontWeight: 600 }}>✅ اخترت الساعة {selectedTime}</p>}
            </div>
          )}

          {bookingDate && slots.length === 0 && (
            <div style={{ background: "#ef444411", border: "1px solid #ef444444", borderRadius: 10, padding: 14, marginBottom: 20, color: "#ef4444", fontSize: 13, textAlign: "center" }}>
              ⚠️ لا توجد أوقات متاحة — تأكد من إعداد جدول الدوام
            </div>
          )}

          <button onClick={handleBooking} disabled={loading || !selectedTime} style={{ width: "100%", padding: "14px", background: loading || !selectedTime ? "#333" : "linear-gradient(90deg,#00d4aa,#0070f3)", border: "none", borderRadius: 10, fontSize: 16, fontWeight: 700, cursor: loading || !selectedTime ? "not-allowed" : "pointer", color: loading || !selectedTime ? COLORS.muted : "#000", fontFamily: "Tajawal,sans-serif" }}>
            {loading ? "جاري الحجز..." : !bookingDate ? "اختر التاريخ أولاً" : !selectedTime ? "اختر وقتاً" : "✅ تأكيد الحجز"}
          </button>
        </div>

        {schedule?.work_days && (
          <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: 16, marginTop: 16 }}>
            <h4 style={{ fontWeight: 700, color: COLORS.white, marginBottom: 10, fontSize: 14 }}>📅 أيام الدوام</h4>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {["saturday","sunday","monday","tuesday","wednesday","thursday","friday"].map(d => {
                const labels: Record<string,string> = { saturday:"السبت", sunday:"الأحد", monday:"الاثنين", tuesday:"الثلاثاء", wednesday:"الأربعاء", thursday:"الخميس", friday:"الجمعة" };
                const active = schedule.work_days.includes(d);
                return <span key={d} style={{ padding: "5px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600, background: active ? COLORS.accentDim : COLORS.surface, color: active ? COLORS.accent : COLORS.muted, border: `1px solid ${active ? COLORS.accent : COLORS.border}` }}>{active ? "✓ " : ""}{labels[d]}</span>;
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}