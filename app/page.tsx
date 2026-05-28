"use client";
import { useState, useEffect } from "react";
import { supabase } from "./supabase";

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

const SECTORS_DATA = {
  clinic: {
    label: "عيادة", icon: "🏥", color: "#3b82f6",
    services: ["كشف عام", "استشارة طبية", "فحوصات", "متابعة", "تطعيم", "أشعة"],
    slotDuration: 10,
  },
  salon: {
    label: "صالون", icon: "✂️", color: "#ec4899",
    services: ["قص شعر", "صبغة شعر", "عناية بشرة", "مانيكير", "بيديكير", "مساج"],
    slotDuration: 30,
  },
  hotel: {
    label: "شاليه / فندق", icon: "🏨", color: "#f59e0b",
    services: ["غرفة عادية", "غرفة ديلوكس", "جناح", "باقة عائلية", "باقة رومانسية", "إيجار يومي"],
    slotDuration: 60,
  },
};

const PLANS = [
  { name: "أساسي", price: "20,000", color: "#64748b", features: ["حجز غير محدود", "تذكير واتساب", "لوحة تحكم", "دعم فني"], ideal: "صالون صغير" },
  { name: "احترافي", price: "50,000", color: "#00d4aa", features: ["كل مزايا الأساسي", "ملف عميل كامل", "تقارير شهرية", "أكثر من موظف"], ideal: "عيادة / صالون كبير", popular: true },
  { name: "بريميوم", price: "100,000", color: "#f59e0b", features: ["كل مزايا الاحترافي", "حجز غرف متعدد", "دفع أونلاين", "API مخصص", "مدير حساب"], ideal: "فندق / شاليه", hasDiscount: true },
];

const FEATURES = [
  { icon: "📱", title: "إشعار واتساب فوري", desc: "كل حجز يوصلك على واتساب فوراً بدون تأخير" },
  { icon: "📊", title: "تقارير شهرية", desc: "شوف إيراداتك وحجوزاتك بأرقام واضحة كل شهر" },
  { icon: "⭐", title: "تقييم العملاء", desc: "اجمع تقييمات زبائنك وحسّن خدمتك" },
  { icon: "🔍", title: "بحث وفلترة", desc: "دور على أي حجز بسرعة من لوحة التحكم" },
  { icon: "🏷️", title: "أكواد خصم", desc: "أنشئ أكواد خصم تجذب زبائن جدد" },
  { icon: "🔒", title: "بيانات آمنة", desc: "بيانات عملائك محمية بأحدث تقنيات الأمان" },
];

const SECTORS_LIST = [
  { icon: "🏥", label: "عيادات", desc: "كشف، استشارة، متابعة — كل المواعيد بنظام واحد", color: "#3b82f6" },
  { icon: "✂️", label: "صالونات", desc: "قص، صبغة، عناية — جدول مواعيد ذكي لصالونك", color: "#ec4899" },
  { icon: "🏨", label: "فنادق وشاليهات", desc: "غرف وباقات — حجز سهل وإشعار فوري", color: "#f59e0b" },
];

const TESTIMONIALS = [
  { name: "أبو علي", role: "صاحب عيادة — بغداد", text: "قبل موعدي كنت أضيع وقتي بالهاتف. هسه كل شي منظم والزبائن راضين.", stars: 5 },
  { name: "أم سارة", role: "صاحبة صالون — البصرة", text: "سهّل علي الشغل كثير. الإشعارات على الواتساب ممتازة ومو ينفوت علي موعد.", stars: 5 },
  { name: "أبو كرار", role: "مدير شاليه — كربلاء", text: "النظام احترافي ويستاهل. الإحصائيات الشهرية تساعدني أعرف أحسن أوقات الحجز.", stars: 5 },
];

// توليد أوقات الدوام
function generateSlots(startTime: string, endTime: string, slotDuration: number) {
  const slots: string[] = [];
  const [startH, startM] = startTime.split(":").map(Number);
  const [endH, endM] = endTime.split(":").map(Number);
  let current = startH * 60 + startM;
  const end = endH * 60 + endM;
  while (current + slotDuration <= end) {
    const h = Math.floor(current / 60).toString().padStart(2, "0");
    const m = (current % 60).toString().padStart(2, "0");
    slots.push(`${h}:${m}`);
    current += slotDuration;
  }
  return slots;
}

export default function App() {
  const [activeTab, setActiveTab] = useState("landing");
  const [menuOpen, setMenuOpen] = useState(false);

  // Booking
  const [bookingSector, setBookingSector] = useState("clinic");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [service, setService] = useState("كشف عام");
  const [bookingDate, setBookingDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingNumber, setBookingNumber] = useState("");

  // Review
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);

  // Plans Modal
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [planName, setPlanName] = useState("");
  const [planPrice, setPlanPrice] = useState("");
  const [planHasDiscount, setPlanHasDiscount] = useState(false);
  const [modalName, setModalName] = useState("");
  const [modalPhone, setModalPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [step, setStep] = useState(1);
  const [discountCode, setDiscountCode] = useState("");
  const [discountStatus, setDiscountStatus] = useState<"idle"|"loading"|"success"|"error">("idle");
  const [discountMsg, setDiscountMsg] = useState("");
  const [discountApplied, setDiscountApplied] = useState(false);
  const [discountValue, setDiscountValue] = useState("");

  const currentSector = SECTORS_DATA[bookingSector as keyof typeof SECTORS_DATA];
  const slots = bookingDate ? generateSlots("08:00", "17:00", currentSector.slotDuration) : [];

  // جلب الأوقات المحجوزة
  useEffect(() => {
    if (!bookingDate) return;
    async function fetchBooked() {
      const { data } = await supabase
        .from("bookings")
        .select("booking_time")
        .eq("booking_date", bookingDate)
        .eq("sector", bookingSector)
        .neq("status", "cancelled");
      setBookedSlots((data || []).map((b: any) => b.booking_time?.slice(0, 5)));
      setSelectedTime("");
    }
    fetchBooked();
  }, [bookingDate, bookingSector]);

  const handleSectorChange = (s: string) => {
    setBookingSector(s);
    setService(SECTORS_DATA[s as keyof typeof SECTORS_DATA].services[0]);
    setSelectedTime("");
    setBookedSlots([]);
    setBookingDate("");
  };

  const generateBookingNumber = () => "HJ-" + Date.now().toString().slice(-6);

  const handleBooking = async () => {
    if (!name || !phone || !bookingDate || !selectedTime) {
      alert("يرجى إدخال جميع البيانات واختيار وقت");
      return;
    }
    setLoading(true);
    const bNumber = generateBookingNumber();
    const { error } = await supabase.from("bookings").insert([{
      name, phone, service,
      time: `${bookingDate} ${selectedTime}`,
      booking_date: bookingDate,
      booking_time: selectedTime,
      sector: bookingSector,
      status: "pending"
    }]);
    setLoading(false);
    if (!error) {
      const msg = `🔔 حجز جديد!\nرقم الحجز: ${bNumber}\nالاسم: ${name}\nالهاتف: ${phone}\nالخدمة: ${service}\nالقطاع: ${currentSector.label}\nالموعد: ${bookingDate} ${selectedTime}`;
      window.open(`https://wa.me/9647739863056?text=${encodeURIComponent(msg)}`, "_blank");
      setBookingNumber(bNumber);
      setBookingSuccess(true);
      setName(""); setPhone(""); setBookingDate(""); setSelectedTime("");
      setRating(0); setComment(""); setReviewSubmitted(false);
    } else {
      alert("حدث خطأ، حاول مجدداً");
    }
  };

  const handleReview = async () => {
    if (rating === 0) { alert("يرجى اختيار تقييم"); return; }
    setReviewLoading(true);
    await supabase.from("reviews").insert([{ booking_number: bookingNumber, rating, comment }]);
    setReviewLoading(false);
    setReviewSubmitted(true);
  };

  const openPlanModal = (plan: any) => {
    setPlanName(plan.name); setPlanPrice(plan.price); setPlanHasDiscount(!!plan.hasDiscount);
    setModalName(""); setModalPhone(""); setPaymentMethod("");
    setDiscountCode(""); setDiscountStatus("idle"); setDiscountMsg("");
    setDiscountApplied(false); setDiscountValue("");
    setStep(1); setShowPlanModal(true);
  };

  const handleCheckDiscount = async () => {
    if (!discountCode.trim()) return;
    setDiscountStatus("loading");
    const { data, error } = await supabase.from("discount_codes").select("*").eq("code", discountCode.toUpperCase().trim()).eq("active", true).single();
    if (error || !data) { setDiscountStatus("error"); setDiscountMsg("كود الخصم غير صحيح أو منتهي"); return; }
    if (data.expires_at && new Date(data.expires_at) < new Date()) { setDiscountStatus("error"); setDiscountMsg("انتهت صلاحية هذا الكود"); return; }
    if (data.max_uses !== null && data.used_count >= data.max_uses) { setDiscountStatus("error"); setDiscountMsg("تم استنفاد هذا الكود"); return; }
    const val = data.type === "percent" ? `${data.value}%` : `${data.value.toLocaleString()} د.ع`;
    setDiscountStatus("success"); setDiscountMsg(`✅ كود صحيح! خصم ${val}`);
    setDiscountApplied(true); setDiscountValue(val);
  };

  const handlePlanSubmit = () => {
    if (!modalName || !modalPhone) { alert("يرجى إدخال الاسم ورقم الهاتف"); return; }
    setStep(2);
  };

  const handlePayment = () => {
    if (!paymentMethod) { alert("يرجى اختيار طريقة الدفع"); return; }
    const discountNote = discountApplied ? `\nكود الخصم: ${discountCode.toUpperCase()} (خصم ${discountValue})` : "";
    const msg = paymentMethod === "whatsapp"
      ? `مرحبا، أنا ${modalName} ورقمي ${modalPhone}، أريد الاشتراك بباقة ${planName} بسعر ${planPrice} دينار شهرياً${discountNote} — سأدفع عبر واتساب`
      : `مرحبا، أنا ${modalName} ورقمي ${modalPhone}، أريد الاشتراك بباقة ${planName} بسعر ${planPrice} دينار شهرياً${discountNote} — سأدفع بالبطاقة البنكية`;
    window.open(`https://wa.me/9647739863056?text=${encodeURIComponent(msg)}`, "_blank");
    setShowPlanModal(false);
  };

  // THANK YOU PAGE
  if (bookingSuccess) {
    return (
      <div dir="rtl" style={{ minHeight: "100vh", background: COLORS.bg, color: COLORS.text, fontFamily: "'Tajawal', 'Cairo', sans-serif", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;800;900&display=swap'); * { box-sizing: border-box; margin: 0; padding: 0; }`}</style>
        <div style={{ background: COLORS.card, border: `1px solid ${COLORS.accent}44`, borderRadius: 24, padding: 24, maxWidth: 500, width: "100%", textAlign: "center", boxShadow: "0 0 60px #00d4aa22" }}>
          <div style={{ fontSize: 56, marginBottom: 12 }}>🎉</div>
          <h2 style={{ fontSize: 22, fontWeight: 900, color: COLORS.white, marginBottom: 8 }}>تم الحجز بنجاح!</h2>
          <p style={{ color: COLORS.muted, fontSize: 13, marginBottom: 20, lineHeight: 1.7 }}>شكراً! تم تسجيل حجزك وسيتم التواصل معك على واتساب للتأكيد.</p>
          <div style={{ background: COLORS.accentDim, border: `2px solid ${COLORS.accent}`, borderRadius: 14, padding: "14px 20px", marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: COLORS.muted, marginBottom: 4 }}>رقم حجزك</div>
            <div style={{ fontSize: 26, fontWeight: 900, color: COLORS.accent, letterSpacing: 2 }}>{bookingNumber}</div>
            <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 4 }}>احتفظ بهذا الرقم للمتابعة</div>
          </div>
          <div style={{ background: COLORS.surface, borderRadius: 12, padding: 14, marginBottom: 20, textAlign: "right" }}>
            {[
              { label: "الخدمة", value: service, color: COLORS.accent },
              { label: "القطاع", value: `${currentSector.icon} ${currentSector.label}`, color: COLORS.white },
              { label: "الموعد", value: `${bookingDate} ${selectedTime}`, color: COLORS.white },
            ].map((row, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: i < 2 ? `1px solid ${COLORS.border}` : "none" }}>
                <span style={{ color: row.color, fontWeight: 600, fontSize: 13 }}>{row.value}</span>
                <span style={{ color: COLORS.muted, fontSize: 12 }}>{row.label}</span>
              </div>
            ))}
          </div>
          {!reviewSubmitted ? (
            <div style={{ background: COLORS.surface, borderRadius: 16, padding: 16, marginBottom: 16, border: `1px solid ${COLORS.border}` }}>
              <h4 style={{ fontWeight: 700, color: COLORS.white, marginBottom: 4, fontSize: 15 }}>قيّم تجربتك ⭐</h4>
              <p style={{ fontSize: 12, color: COLORS.muted, marginBottom: 12 }}>رأيك يساعدنا نتحسن!</p>
              <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 12 }}>
                {[1,2,3,4,5].map(star => (
                  <span key={star} onClick={() => setRating(star)} onMouseEnter={() => setHoverRating(star)} onMouseLeave={() => setHoverRating(0)} style={{ fontSize: 32, cursor: "pointer", transition: "transform 0.1s", transform: (hoverRating || rating) >= star ? "scale(1.2)" : "scale(1)", filter: (hoverRating || rating) >= star ? "none" : "grayscale(1)" }}>⭐</span>
                ))}
              </div>
              <textarea placeholder="اكتب تعليقك هنا (اختياري)..." value={comment} onChange={e => setComment(e.target.value)} rows={2} style={{ width: "100%", padding: "10px 14px", borderRadius: 10, background: COLORS.card, border: `1px solid ${COLORS.border}`, color: COLORS.text, fontSize: 13, outline: "none", fontFamily: "Tajawal, sans-serif", resize: "none", marginBottom: 10 }} />
              <button onClick={handleReview} disabled={reviewLoading} style={{ width: "100%", padding: "11px", background: rating > 0 ? "linear-gradient(90deg, #00d4aa, #0070f3)" : COLORS.surface, border: `1px solid ${rating > 0 ? COLORS.accent : COLORS.border}`, borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: rating > 0 ? "pointer" : "not-allowed", color: rating > 0 ? "#000" : COLORS.muted, fontFamily: "Tajawal, sans-serif" }}>{reviewLoading ? "جاري الإرسال..." : "إرسال التقييم"}</button>
            </div>
          ) : (
            <div style={{ background: "#00d4aa22", border: "1px solid #00d4aa", borderRadius: 14, padding: 14, marginBottom: 16, color: COLORS.accent, fontWeight: 700, fontSize: 14 }}>✅ شكراً على تقييمك! {"⭐".repeat(rating)}</div>
          )}
          <button onClick={() => { setBookingSuccess(false); setActiveTab("booking"); }} style={{ width: "100%", padding: "13px", background: "linear-gradient(90deg, #00d4aa, #0070f3)", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer", color: "#000", fontFamily: "Tajawal, sans-serif" }}>حجز جديد</button>
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl" style={{ minHeight: "100vh", background: COLORS.bg, color: COLORS.text, fontFamily: "'Tajawal', 'Cairo', sans-serif", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #0a0e1a; }
        ::-webkit-scrollbar-thumb { background: #1e2d45; border-radius: 3px; }
        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: #00000099; display: flex; align-items: center; justify-content: center; z-index: 999; padding: 16px; }
        .hover-card { transition: all 0.25s; }
        .hover-card:hover { transform: translateY(-4px); box-shadow: 0 12px 40px #00d4aa18; }
        .pulse { animation: pulse 2s infinite; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        .fade-in { animation: fadeIn 0.6s ease; }
        @keyframes fadeIn { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        .glow { box-shadow: 0 0 40px #00d4aa33; }
        .slot-btn { transition: all 0.15s; }
        .slot-btn:hover:not(:disabled) { transform: scale(1.05); }
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-btn { display: block !important; }
          .features-grid { grid-template-columns: 1fr 1fr !important; }
          .sectors-grid { grid-template-columns: 1fr !important; }
          .plans-grid { grid-template-columns: 1fr !important; }
          .testimonials-grid { grid-template-columns: 1fr !important; }
          .stats-grid { grid-template-columns: repeat(2,1fr) !important; }
          .hero-title { font-size: 32px !important; }
          .steps-grid { grid-template-columns: 1fr !important; }
          .slots-grid { grid-template-columns: repeat(3,1fr) !important; }
        }
        @media (min-width: 769px) { .mobile-btn { display: none !important; } .mobile-menu { display: none !important; } }
      `}</style>

      {/* MODAL */}
      {showPlanModal && (
        <div className="modal-overlay" onClick={() => setShowPlanModal(false)}>
          <div onClick={e => e.stopPropagation()} style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 20, padding: 24, width: "100%", maxWidth: 420, maxHeight: "90vh", overflowY: "auto" }}>
            {step === 1 && (
              <>
                <h3 style={{ fontWeight: 800, fontSize: 18, color: COLORS.white, marginBottom: 4 }}>باقة {planName}</h3>
                <p style={{ color: COLORS.muted, fontSize: 13, marginBottom: 20 }}>{planPrice} د.ع / شهر</p>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: "block", fontSize: 13, color: COLORS.muted, marginBottom: 6 }}>اسمك الكامل</label>
                  <input type="text" placeholder="مثال: محمد علي" value={modalName} onChange={e => setModalName(e.target.value)} style={{ width: "100%", padding: "12px 16px", borderRadius: 10, background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.text, fontSize: 14, outline: "none", fontFamily: "Tajawal, sans-serif" }} />
                </div>
                <div style={{ marginBottom: planHasDiscount ? 14 : 20 }}>
                  <label style={{ display: "block", fontSize: 13, color: COLORS.muted, marginBottom: 6 }}>رقم الهاتف (واتساب)</label>
                  <input type="tel" placeholder="07xx xxx xxxx" value={modalPhone} onChange={e => setModalPhone(e.target.value)} style={{ width: "100%", padding: "12px 16px", borderRadius: 10, background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.text, fontSize: 14, outline: "none", fontFamily: "Tajawal, sans-serif" }} />
                </div>
                {planHasDiscount && (
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ display: "block", fontSize: 13, color: COLORS.muted, marginBottom: 6 }}>🏷️ كود الخصم (اختياري)</label>
                    <div style={{ display: "flex", gap: 8 }}>
                      <input type="text" placeholder="مثال: EID50" value={discountCode} onChange={e => { setDiscountCode(e.target.value.toUpperCase()); setDiscountStatus("idle"); setDiscountMsg(""); setDiscountApplied(false); }} disabled={discountApplied} style={{ flex: 1, padding: "12px 16px", borderRadius: 10, background: COLORS.surface, border: `1px solid ${discountStatus === "success" ? "#00d4aa" : discountStatus === "error" ? "#ef4444" : COLORS.border}`, color: COLORS.text, fontSize: 14, outline: "none", fontFamily: "Tajawal, sans-serif" }} />
                      {!discountApplied ? (
                        <button onClick={handleCheckDiscount} disabled={discountStatus === "loading" || !discountCode.trim()} style={{ background: COLORS.accentDim, border: `1px solid ${COLORS.accent}`, borderRadius: 10, padding: "0 14px", color: COLORS.accent, fontWeight: 700, cursor: "pointer", fontFamily: "Tajawal, sans-serif", fontSize: 13, whiteSpace: "nowrap" }}>{discountStatus === "loading" ? "..." : "تطبيق"}</button>
                      ) : (
                        <button onClick={() => { setDiscountApplied(false); setDiscountCode(""); setDiscountStatus("idle"); setDiscountMsg(""); }} style={{ background: "#ef444422", border: "1px solid #ef4444", borderRadius: 10, padding: "0 14px", color: "#ef4444", fontWeight: 700, cursor: "pointer", fontFamily: "Tajawal, sans-serif", fontSize: 13 }}>إلغاء</button>
                      )}
                    </div>
                    {discountMsg && <p style={{ fontSize: 12, marginTop: 6, color: discountStatus === "success" ? "#00d4aa" : "#ef4444" }}>{discountMsg}</p>}
                  </div>
                )}
                <button onClick={handlePlanSubmit} style={{ width: "100%", padding: "13px", background: "linear-gradient(90deg, #00d4aa, #0070f3)", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer", color: "#000", fontFamily: "Tajawal, sans-serif", marginBottom: 10 }}>التالي ←</button>
                <button onClick={() => setShowPlanModal(false)} style={{ width: "100%", padding: "11px", background: "transparent", border: `1px solid ${COLORS.border}`, borderRadius: 10, fontSize: 13, cursor: "pointer", color: COLORS.muted, fontFamily: "Tajawal, sans-serif" }}>إلغاء</button>
              </>
            )}
            {step === 2 && (
              <>
                <button onClick={() => setStep(1)} style={{ background: "transparent", border: "none", color: COLORS.muted, cursor: "pointer", fontSize: 14, marginBottom: 14, fontFamily: "Tajawal, sans-serif" }}>← رجوع</button>
                <h3 style={{ fontWeight: 800, fontSize: 18, color: COLORS.white, marginBottom: 4 }}>اختر طريقة الدفع</h3>
                <p style={{ color: COLORS.muted, fontSize: 13, marginBottom: discountApplied ? 8 : 20 }}>باقة {planName} — {planPrice} د.ع / شهر</p>
                {discountApplied && <div style={{ background: "#00d4aa11", border: "1px solid #00d4aa44", borderRadius: 10, padding: "8px 14px", marginBottom: 14, fontSize: 13, color: "#00d4aa" }}>🏷️ خصم {discountValue} مطبّق</div>}
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
                  {[{ id: "whatsapp", icon: "💬", label: "دفع عبر واتساب", desc: "تتواصل معنا وتدفع يدوياً" }, { id: "card", icon: "💳", label: "تحويل بنكي", desc: "تحويل على بطاقة الرافدين" }].map(opt => (
                    <div key={opt.id} onClick={() => setPaymentMethod(opt.id)} style={{ padding: "14px 16px", borderRadius: 12, background: paymentMethod === opt.id ? COLORS.accentDim : COLORS.surface, border: `2px solid ${paymentMethod === opt.id ? COLORS.accent : COLORS.border}`, display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
                      <span style={{ fontSize: 24 }}>{opt.icon}</span>
                      <div>
                        <div style={{ fontWeight: 700, color: COLORS.white, fontSize: 14 }}>{opt.label}</div>
                        <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 2 }}>{opt.desc}</div>
                      </div>
                      {paymentMethod === opt.id && <span style={{ marginRight: "auto", color: COLORS.accent }}>✓</span>}
                    </div>
                  ))}
                </div>
                <button onClick={handlePayment} style={{ width: "100%", padding: "13px", background: "linear-gradient(90deg, #00d4aa, #0070f3)", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer", color: "#000", fontFamily: "Tajawal, sans-serif", marginBottom: 10 }}>📱 تأكيد وإرسال على واتساب</button>
                <button onClick={() => setShowPlanModal(false)} style={{ width: "100%", padding: "11px", background: "transparent", border: `1px solid ${COLORS.border}`, borderRadius: 10, fontSize: 13, cursor: "pointer", color: COLORS.muted, fontFamily: "Tajawal, sans-serif" }}>إلغاء</button>
              </>
            )}
          </div>
        </div>
      )}

      {/* NAV */}
      <nav style={{ background: "#0a0e1a", borderBottom: `1px solid ${COLORS.border}`, padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64, position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: "linear-gradient(135deg, #00d4aa, #0070f3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 900, color: "#000" }}>م</div>
          <span style={{ fontSize: 22, fontWeight: 900, color: COLORS.white }}>موعدي</span>
        </div>
        <div className="desktop-nav" style={{ display: "flex", gap: 4, alignItems: "center" }}>
          {[{ id: "landing", label: "الرئيسية" }, { id: "booking", label: "احجز الآن" }, { id: "plans", label: "الأسعار" }].map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ padding: "8px 16px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 14, fontFamily: "Tajawal, sans-serif", fontWeight: activeTab === t.id ? 700 : 400, background: activeTab === t.id ? COLORS.accentDim : "transparent", color: activeTab === t.id ? COLORS.accent : COLORS.muted }}>{t.label}</button>
          ))}
          <button onClick={() => setActiveTab("booking")} style={{ background: "linear-gradient(90deg, #00d4aa, #0070f3)", padding: "9px 20px", borderRadius: 8, fontSize: 14, fontWeight: 700, color: "#000", border: "none", cursor: "pointer", fontFamily: "Tajawal, sans-serif", marginRight: 8 }}>احجز الآن</button>
        </div>
        <button className="mobile-btn" onClick={() => setMenuOpen(!menuOpen)} style={{ background: "transparent", border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: "7px 12px", color: COLORS.text, cursor: "pointer", fontSize: 18, display: "none" }}>☰</button>
      </nav>

      {menuOpen && (
        <div className="mobile-menu" style={{ background: "#0d1424", borderBottom: `1px solid ${COLORS.border}`, padding: "8px 16px" }}>
          {[{ id: "landing", label: "🏠 الرئيسية" }, { id: "booking", label: "📅 احجز الآن" }, { id: "plans", label: "💰 الأسعار" }].map(t => (
            <button key={t.id} onClick={() => { setActiveTab(t.id); setMenuOpen(false); }} style={{ display: "block", width: "100%", padding: "12px 16px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 14, fontFamily: "Tajawal, sans-serif", background: "transparent", color: COLORS.text, textAlign: "right", marginBottom: 4 }}>{t.label}</button>
          ))}
        </div>
      )}

      {/* LANDING */}
      {activeTab === "landing" && (
        <div className="fade-in">
          {/* HERO */}
          <section style={{ maxWidth: 1100, margin: "0 auto", padding: "80px 24px 60px", textAlign: "center" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: COLORS.accentDim, border: `1px solid ${COLORS.accent}44`, borderRadius: 20, padding: "6px 16px", marginBottom: 24 }}>
              <span className="pulse" style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS.accent, display: "inline-block" }} />
              <span style={{ fontSize: 13, color: COLORS.accent, fontWeight: 600 }}>نظام حجوزات ذكي للعراق 🇮🇶</span>
            </div>
            <h1 className="hero-title" style={{ fontSize: 52, fontWeight: 900, lineHeight: 1.2, marginBottom: 20, color: COLORS.white }}>
              خلّي زبائنك يحجزون<br />
              <span style={{ background: "linear-gradient(90deg, #00d4aa, #0070f3)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>بضغطة وحدة</span>
            </h1>
            <p style={{ fontSize: 18, color: COLORS.muted, maxWidth: 600, margin: "0 auto 32px", lineHeight: 1.8 }}>نظام حجوزات احترافي للعيادات والصالونات والشاليهات — إشعار واتساب فوري، لوحة تحكم كاملة</p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginBottom: 16 }}>
              <button onClick={() => setActiveTab("booking")} style={{ background: "linear-gradient(90deg, #00d4aa, #0070f3)", border: "none", borderRadius: 12, padding: "16px 36px", fontSize: 17, fontWeight: 700, cursor: "pointer", color: "#000", fontFamily: "Tajawal, sans-serif" }}>🚀 احجز الآن مجاناً</button>
              <button onClick={() => setActiveTab("plans")} style={{ background: "transparent", border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: "16px 36px", fontSize: 17, fontWeight: 600, cursor: "pointer", color: COLORS.text, fontFamily: "Tajawal, sans-serif" }}>شوف الأسعار</button>
            </div>
            <p style={{ color: COLORS.muted, fontSize: 13 }}>✅ بدون بطاقة ائتمان · ✅ إعداد في 5 دقائق · ✅ دعم فني مجاني</p>
          </section>

          {/* STATS */}
          <section style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 60px" }}>
            <div className="stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
              {[{ value: "500+", label: "عميل مسجل", icon: "👥" }, { value: "15,000+", label: "حجز منجز", icon: "📅" }, { value: "98%", label: "نسبة الرضا", icon: "⭐" }, { value: "3", label: "قطاعات مدعومة", icon: "🏢" }].map((s, i) => (
                <div key={i} style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 24, textAlign: "center" }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
                  <div style={{ fontSize: 28, fontWeight: 900, color: COLORS.accent }}>{s.value}</div>
                  <div style={{ fontSize: 13, color: COLORS.muted, marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </section>

          {/* FEATURES */}
          <section style={{ background: "#0d1424", padding: "60px 24px" }}>
            <div style={{ maxWidth: 1100, margin: "0 auto" }}>
              <div style={{ textAlign: "center", marginBottom: 48 }}>
                <h2 style={{ fontSize: 36, fontWeight: 900, color: COLORS.white, marginBottom: 12 }}>كل شي تحتاجه بمكان واحد</h2>
                <p style={{ color: COLORS.muted, fontSize: 16 }}>مصمم خصيصاً لأصحاب الأعمال بالعراق</p>
              </div>
              <div className="features-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
                {FEATURES.map((f, i) => (
                  <div key={i} className="hover-card" style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 24 }}>
                    <div style={{ fontSize: 36, marginBottom: 14 }}>{f.icon}</div>
                    <h3 style={{ fontWeight: 700, color: COLORS.white, marginBottom: 8, fontSize: 16 }}>{f.title}</h3>
                    <p style={{ color: COLORS.muted, fontSize: 14, lineHeight: 1.7 }}>{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* SECTORS */}
          <section style={{ padding: "60px 24px" }}>
            <div style={{ maxWidth: 1100, margin: "0 auto" }}>
              <div style={{ textAlign: "center", marginBottom: 48 }}>
                <h2 style={{ fontSize: 36, fontWeight: 900, color: COLORS.white, marginBottom: 12 }}>لكل قطاع حل مخصص</h2>
              </div>
              <div className="sectors-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
                {SECTORS_LIST.map((s, i) => (
                  <div key={i} className="hover-card" style={{ background: COLORS.card, border: `2px solid ${s.color}33`, borderRadius: 20, padding: 32, textAlign: "center" }}>
                    <div style={{ fontSize: 52, marginBottom: 16 }}>{s.icon}</div>
                    <h3 style={{ fontWeight: 800, color: COLORS.white, marginBottom: 10, fontSize: 20 }}>{s.label}</h3>
                    <p style={{ color: COLORS.muted, fontSize: 14, lineHeight: 1.7, marginBottom: 20 }}>{s.desc}</p>
                    <button onClick={() => setActiveTab("booking")} style={{ background: `${s.color}22`, border: `1px solid ${s.color}55`, borderRadius: 10, padding: "10px 20px", color: s.color, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "Tajawal, sans-serif" }}>احجز الآن ←</button>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* HOW IT WORKS */}
          <section style={{ background: "#0d1424", padding: "60px 24px" }}>
            <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
              <h2 style={{ fontSize: 36, fontWeight: 900, color: COLORS.white, marginBottom: 12 }}>كيف يشتغل؟</h2>
              <p style={{ color: COLORS.muted, fontSize: 16, marginBottom: 48 }}>3 خطوات بس</p>
              <div className="steps-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24 }}>
                {[
                  { step: "1", title: "اختر القطاع", desc: "عيادة، صالون، أو شاليه", icon: "🏢" },
                  { step: "2", title: "اختر الوقت", desc: "شوف الأوقات المتاحة واختار اللي يناسبك", icon: "📅" },
                  { step: "3", title: "تأكيد فوري", desc: "يوصلك إشعار واتساب بتأكيد موعدك", icon: "✅" },
                ].map((s, i) => (
                  <div key={i} style={{ textAlign: "center" }}>
                    <div style={{ width: 52, height: 52, borderRadius: "50%", background: "linear-gradient(135deg, #00d4aa, #0070f3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", fontSize: 20, fontWeight: 900, color: "#000" }}>{s.step}</div>
                    <div style={{ fontSize: 32, marginBottom: 10 }}>{s.icon}</div>
                    <h3 style={{ fontWeight: 700, color: COLORS.white, marginBottom: 6, fontSize: 16 }}>{s.title}</h3>
                    <p style={{ color: COLORS.muted, fontSize: 13, lineHeight: 1.7 }}>{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* TESTIMONIALS */}
          <section style={{ padding: "60px 24px" }}>
            <div style={{ maxWidth: 1100, margin: "0 auto" }}>
              <div style={{ textAlign: "center", marginBottom: 48 }}>
                <h2 style={{ fontSize: 36, fontWeight: 900, color: COLORS.white, marginBottom: 12 }}>شنو يقولون عملاؤنا؟</h2>
              </div>
              <div className="testimonials-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
                {TESTIMONIALS.map((t, i) => (
                  <div key={i} className="hover-card" style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 24 }}>
                    <div style={{ color: "#f59e0b", fontSize: 18, marginBottom: 12 }}>{"⭐".repeat(t.stars)}</div>
                    <p style={{ color: COLORS.text, fontSize: 14, lineHeight: 1.8, marginBottom: 16, fontStyle: "italic" }}>"{t.text}"</p>
                    <div>
                      <div style={{ fontWeight: 700, color: COLORS.white, fontSize: 14 }}>{t.name}</div>
                      <div style={{ color: COLORS.muted, fontSize: 12, marginTop: 2 }}>{t.role}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA */}
          <section style={{ background: "#0d1424", padding: "80px 24px" }}>
            <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
              <div style={{ background: "linear-gradient(135deg, #0d1a2e, #0a1628)", border: `1px solid ${COLORS.accent}44`, borderRadius: 24, padding: "56px 40px" }} className="glow">
                <div style={{ fontSize: 48, marginBottom: 16 }}>🚀</div>
                <h2 style={{ fontSize: 36, fontWeight: 900, color: COLORS.white, marginBottom: 12 }}>جاهز تنظم مشروعك؟</h2>
                <p style={{ color: COLORS.muted, fontSize: 16, marginBottom: 32, lineHeight: 1.8 }}>انضم لمئات أصحاب الأعمال اللي يستخدمون موعدي اليوم</p>
                <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                  <button onClick={() => setActiveTab("booking")} style={{ background: "linear-gradient(90deg, #00d4aa, #0070f3)", border: "none", borderRadius: 12, padding: "16px 40px", fontSize: 17, fontWeight: 700, cursor: "pointer", color: "#000", fontFamily: "Tajawal, sans-serif" }}>ابدأ مجاناً الآن ✓</button>
                  <button onClick={() => window.open("https://wa.me/9647739863056?text=مرحبا، أريد أعرف أكثر عن موعدي", "_blank")} style={{ background: "transparent", border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: "16px 40px", fontSize: 17, fontWeight: 600, cursor: "pointer", color: COLORS.text, fontFamily: "Tajawal, sans-serif" }}>💬 تواصل معنا</button>
                </div>
              </div>
            </div>
          </section>

          {/* FOOTER */}
          <footer style={{ borderTop: `1px solid ${COLORS.border}`, padding: "32px 24px", textAlign: "center" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg, #00d4aa, #0070f3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 900, color: "#000" }}>م</div>
              <span style={{ fontSize: 18, fontWeight: 800, color: COLORS.white }}>موعدي</span>
            </div>
            <p style={{ color: COLORS.muted, fontSize: 13 }}>نظام حجوزات ذكي للعراق 🇮🇶 — جميع الحقوق محفوظة {new Date().getFullYear()}</p>
          </footer>
        </div>
      )}

      {/* BOOKING */}
      {activeTab === "booking" && (
        <div className="fade-in" style={{ maxWidth: 700, margin: "0 auto", padding: "32px 16px" }}>
          <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6, textAlign: "center" }}>احجز موعدك</h2>
          <p style={{ color: COLORS.muted, marginBottom: 24, fontSize: 14, textAlign: "center" }}>اختر قطاعك والوقت المناسب</p>

          <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 24 }}>
            {/* القطاع */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 13, color: COLORS.muted, marginBottom: 10, fontWeight: 500 }}>اختر القطاع</label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
                {Object.entries(SECTORS_DATA).map(([key, val]) => (
                  <div key={key} onClick={() => handleSectorChange(key)} style={{ padding: "12px 8px", borderRadius: 10, textAlign: "center", cursor: "pointer", background: bookingSector === key ? `${val.color}22` : COLORS.surface, border: `2px solid ${bookingSector === key ? val.color : COLORS.border}`, transition: "all 0.2s" }}>
                    <div style={{ fontSize: 22 }}>{val.icon}</div>
                    <div style={{ fontSize: 12, color: bookingSector === key ? val.color : COLORS.muted, fontWeight: 600, marginTop: 4 }}>{val.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* الاسم والهاتف */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 13, color: COLORS.muted, marginBottom: 6 }}>اسمك الكامل</label>
              <input type="text" placeholder="مثال: محمد علي" value={name} onChange={e => setName(e.target.value)} style={{ width: "100%", padding: "12px 16px", borderRadius: 10, background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.text, fontSize: 14, outline: "none", fontFamily: "Tajawal, sans-serif" }} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 13, color: COLORS.muted, marginBottom: 6 }}>رقم الهاتف (واتساب)</label>
              <input type="tel" placeholder="07xx xxx xxxx" value={phone} onChange={e => setPhone(e.target.value)} style={{ width: "100%", padding: "12px 16px", borderRadius: 10, background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.text, fontSize: 14, outline: "none", fontFamily: "Tajawal, sans-serif" }} />
            </div>

            {/* الخدمة */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 13, color: COLORS.muted, marginBottom: 6 }}>{currentSector.icon} نوع الخدمة</label>
              <select value={service} onChange={e => setService(e.target.value)} style={{ width: "100%", padding: "12px 16px", borderRadius: 10, background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.text, fontSize: 14, outline: "none", fontFamily: "Tajawal, sans-serif" }}>
                {currentSector.services.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>

            {/* التاريخ */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 13, color: COLORS.muted, marginBottom: 6 }}>📅 التاريخ</label>
              <input type="date" value={bookingDate} onChange={e => setBookingDate(e.target.value)} min={new Date().toISOString().split("T")[0]} style={{ width: "100%", padding: "12px 16px", borderRadius: 10, background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.text, fontSize: 14, outline: "none", fontFamily: "Tajawal, sans-serif" }} />
            </div>

            {/* الأوقات */}
            {bookingDate && (
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: "block", fontSize: 13, color: COLORS.muted, marginBottom: 10 }}>
                  🕐 اختر الوقت
                  <span style={{ fontSize: 11, marginRight: 8 }}>
                    🟢 متاح &nbsp; 🔴 محجوز
                  </span>
                </label>
                <div className="slots-grid" style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 8 }}>
                  {slots.map(slot => {
                    const isBooked = bookedSlots.includes(slot);
                    const isSelected = selectedTime === slot;
                    return (
                      <button
                        key={slot}
                        className="slot-btn"
                        disabled={isBooked}
                        onClick={() => setSelectedTime(slot)}
                        style={{
                          padding: "10px 4px",
                          borderRadius: 10,
                          border: `2px solid ${isSelected ? COLORS.accent : isBooked ? "#ef444444" : COLORS.border}`,
                          background: isSelected ? COLORS.accentDim : isBooked ? "#ef444411" : COLORS.surface,
                          color: isSelected ? COLORS.accent : isBooked ? "#ef4444" : COLORS.text,
                          fontSize: 13,
                          fontWeight: isSelected ? 700 : 400,
                          cursor: isBooked ? "not-allowed" : "pointer",
                          fontFamily: "Tajawal, sans-serif",
                          opacity: isBooked ? 0.5 : 1,
                        }}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
                {selectedTime && (
                  <p style={{ color: COLORS.accent, fontSize: 13, marginTop: 10, fontWeight: 600 }}>✅ اخترت الساعة {selectedTime}</p>
                )}
              </div>
            )}

            <button onClick={handleBooking} disabled={loading || !selectedTime} style={{ width: "100%", padding: "14px", background: loading || !selectedTime ? "#333" : "linear-gradient(90deg, #00d4aa, #0070f3)", border: "none", borderRadius: 10, fontSize: 16, fontWeight: 700, cursor: loading || !selectedTime ? "not-allowed" : "pointer", color: loading || !selectedTime ? COLORS.muted : "#000", fontFamily: "Tajawal, sans-serif" }}>
              {loading ? "جاري الحجز..." : !bookingDate ? "اختر التاريخ أولاً" : !selectedTime ? "اختر وقتاً" : "✅ تأكيد الحجز"}
            </button>
          </div>
        </div>
      )}

      {/* PLANS */}
      {activeTab === "plans" && (
        <div className="fade-in" style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h2 style={{ fontSize: 36, fontWeight: 900, color: COLORS.white, marginBottom: 12 }}>أسعار واضحة بدون مفاجآت</h2>
            <p style={{ color: COLORS.muted, fontSize: 16 }}>اشتراك شهري بالدينار العراقي</p>
          </div>
          <div className="plans-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
            {PLANS.map((p, i) => (
              <div key={i} className="hover-card" style={{ background: COLORS.card, border: `2px solid ${p.popular ? p.color : COLORS.border}`, borderRadius: 20, padding: 28, position: "relative", boxShadow: p.popular ? `0 0 40px ${p.color}33` : "none" }}>
                {p.popular && <div style={{ position: "absolute", top: -14, right: "50%", transform: "translateX(50%)", background: p.color, color: "#000", fontSize: 11, padding: "4px 16px", borderRadius: 20, fontWeight: 700, whiteSpace: "nowrap" }}>⭐ الأكثر مبيعاً</div>}
                {p.hasDiscount && <div style={{ position: "absolute", top: -14, left: 16, background: "#f59e0b", color: "#000", fontSize: 10, padding: "3px 12px", borderRadius: 20, fontWeight: 700 }}>🏷️ قابل للخصم</div>}
                <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.white, marginBottom: 8 }}>{p.name}</div>
                <div style={{ marginBottom: 4 }}>
                  <span style={{ fontSize: 36, fontWeight: 900, color: p.color }}>{p.price}</span>
                  <span style={{ fontSize: 13, color: COLORS.muted }}> د.ع / شهر</span>
                </div>
                <div style={{ fontSize: 12, color: COLORS.muted, marginBottom: p.hasDiscount ? 8 : 20 }}>مثالي لـ {p.ideal}</div>
                {p.hasDiscount && <div style={{ background: "#f59e0b11", border: "1px solid #f59e0b44", borderRadius: 8, padding: "6px 10px", marginBottom: 16, fontSize: 11, color: "#f59e0b" }}>🎁 لديك كود خصم؟ طبّقه عند الاشتراك!</div>}
                <div style={{ borderTop: `1px solid ${COLORS.border}`, paddingTop: 16, marginBottom: 20 }}>
                  {p.features.map((f, j) => (
                    <div key={j} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: COLORS.text, padding: "6px 0" }}>
                      <span style={{ color: p.color }}>✓</span> {f}
                    </div>
                  ))}
                </div>
                <button onClick={() => openPlanModal(p)} style={{ width: "100%", padding: "13px", background: p.popular ? "linear-gradient(90deg, #00d4aa, #0070f3)" : "transparent", border: p.popular ? "none" : `1px solid ${p.color}`, borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer", color: p.popular ? "#000" : p.color, fontFamily: "Tajawal, sans-serif" }}>اشترك الآن</button>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}