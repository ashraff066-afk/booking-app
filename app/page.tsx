"use client";
import { useState } from "react";
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
  },
  salon: {
    label: "صالون", icon: "✂️", color: "#ec4899",
    services: ["قص شعر", "صبغة شعر", "عناية بشرة", "مانيكير", "بيديكير", "مساج"],
  },
  hotel: {
    label: "شاليه / فندق", icon: "🏨", color: "#f59e0b",
    services: ["غرفة عادية", "غرفة ديلوكس", "جناح", "باقة عائلية", "باقة رومانسية", "إيجار يومي"],
  },
};

const SECTORS = [
  { id: "clinic", label: "عيادات", icon: "🏥", color: "#3b82f6", bookings: 24, revenue: "1,200,000" },
  { id: "salon", label: "صالونات", icon: "✂️", color: "#ec4899", bookings: 38, revenue: "950,000" },
  { id: "hotel", label: "فنادق / شاليهات", icon: "🏨", color: "#f59e0b", bookings: 12, revenue: "3,600,000" },
];

const PLANS = [
  {
    name: "أساسي", price: "20,000", color: "#64748b",
    features: ["حجز غير محدود", "تذكير واتساب", "لوحة تحكم", "دعم فني"],
    ideal: "صالون صغير",
  },
  {
    name: "احترافي", price: "50,000", color: "#00d4aa",
    features: ["كل مزايا الأساسي", "ملف عميل كامل", "تقارير شهرية", "أكثر من موظف"],
    ideal: "عيادة / صالون كبير", popular: true,
  },
  {
    name: "بريميوم", price: "100,000", color: "#f59e0b",
    features: ["كل مزايا الاحترافي", "حجز غرف متعدد", "دفع أونلاين", "API مخصص", "مدير حساب"],
    ideal: "فندق / شاليه", hasDiscount: true,
  },
];

const BOOKINGS_DEMO = [
  { name: "أحمد محمد", service: "كشف عام", time: "10:00 ص", status: "confirmed", sector: "🏥" },
  { name: "سارة علي", service: "قص شعر", time: "11:30 ص", status: "pending", sector: "✂️" },
  { name: "عمر خالد", service: "غرفة ديلوكس", time: "الغد", status: "confirmed", sector: "🏨" },
  { name: "نور حسين", service: "عناية بشرة", time: "2:00 م", status: "confirmed", sector: "✂️" },
];

const statusLabel: Record<string, string> = { confirmed: "مؤكد", pending: "انتظار" };
const statusColor: Record<string, string> = { confirmed: "#00d4aa", pending: "#f59e0b" };

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [activeSector, setActiveSector] = useState("clinic");
  const [selectedPlan, setSelectedPlan] = useState("احترافي");

  const [bookingSector, setBookingSector] = useState("clinic");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [service, setService] = useState("كشف عام");
  const [bookingDate, setBookingDate] = useState("");
  const [bookingHour, setBookingHour] = useState("10");
  const [bookingMinute, setBookingMinute] = useState("00");
  const [loading, setLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingNumber, setBookingNumber] = useState("");

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);

  const [showPlanModal, setShowPlanModal] = useState(false);
  const [planName, setPlanName] = useState("");
  const [planPrice, setPlanPrice] = useState("");
  const [planHasDiscount, setPlanHasDiscount] = useState(false);
  const [modalName, setModalName] = useState("");
  const [modalPhone, setModalPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [step, setStep] = useState(1);

  // كود الخصم
  const [discountCode, setDiscountCode] = useState("");
  const [discountStatus, setDiscountStatus] = useState<"idle"|"loading"|"success"|"error">("idle");
  const [discountMsg, setDiscountMsg] = useState("");
  const [discountApplied, setDiscountApplied] = useState(false);
  const [discountValue, setDiscountValue] = useState("");

  const currentSector = SECTORS_DATA[bookingSector as keyof typeof SECTORS_DATA];

  const handleSectorChange = (s: string) => {
    setBookingSector(s);
    setService(SECTORS_DATA[s as keyof typeof SECTORS_DATA].services[0]);
  };

  const generateBookingNumber = () => "HJ-" + Date.now().toString().slice(-6);

const handleBooking = async () => {
  if (!name || !phone || !bookingDate) { alert("يرجى إدخال جميع البيانات"); return; }
  setLoading(true);
  const timeStr = `${bookingDate} ${bookingHour}:${bookingMinute}`;
  const bNumber = generateBookingNumber();
  const { error } = await supabase.from("bookings").insert([
    { name, phone, service, time: timeStr, sector: bookingSector, status: "pending" }
  ]);
  setLoading(false);
  if (!error) {
    const msg = `🔔 حجز جديد!\nرقم الحجز: ${bNumber}\nالاسم: ${name}\nالهاتف: ${phone}\nالخدمة: ${service}\nالقطاع: ${currentSector.label}\nالموعد: ${timeStr}`;
    window.open(`https://wa.me/9647739863056?text=${encodeURIComponent(msg)}`, "_blank");
    setBookingNumber(bNumber);
    setBookingSuccess(true);
    setName(""); setPhone(""); setBookingDate("");
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

  const openPlanModal = (plan: { name: string; price: string; hasDiscount?: boolean }) => {
    setPlanName(plan.name);
    setPlanPrice(plan.price);
    setPlanHasDiscount(!!plan.hasDiscount);
    setModalName(""); setModalPhone(""); setPaymentMethod("");
    setDiscountCode(""); setDiscountStatus("idle"); setDiscountMsg("");
    setDiscountApplied(false); setDiscountValue("");
    setStep(1);
    setShowPlanModal(true);
  };

  const handleCheckDiscount = async () => {
    if (!discountCode.trim()) return;
    setDiscountStatus("loading");
    const { data, error } = await supabase
      .from("discount_codes")
      .select("*")
      .eq("code", discountCode.toUpperCase().trim())
      .eq("active", true)
      .single();

    if (error || !data) {
      setDiscountStatus("error");
      setDiscountMsg("كود الخصم غير صحيح أو منتهي");
      return;
    }
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      setDiscountStatus("error");
      setDiscountMsg("انتهت صلاحية هذا الكود");
      return;
    }
    if (data.max_uses !== null && data.used_count >= data.max_uses) {
      setDiscountStatus("error");
      setDiscountMsg("تم استنفاد هذا الكود");
      return;
    }
    const val = data.type === "percent" ? `${data.value}%` : `${data.value.toLocaleString()} د.ع`;
    setDiscountStatus("success");
    setDiscountMsg(`✅ كود صحيح! خصم ${val} على سعر الباقة`);
    setDiscountApplied(true);
    setDiscountValue(val);
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

  if (bookingSuccess) {
    return (
      <div dir="rtl" style={{ minHeight: "100vh", background: COLORS.bg, color: COLORS.text, fontFamily: "'Tajawal', 'Cairo', sans-serif", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;800;900&display=swap'); * { box-sizing: border-box; margin: 0; padding: 0; }`}</style>
        <div style={{ background: COLORS.card, border: `1px solid ${COLORS.accent}44`, borderRadius: 24, padding: 40, maxWidth: 500, width: "100%", textAlign: "center", boxShadow: "0 0 60px #00d4aa22" }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
          <h2 style={{ fontSize: 26, fontWeight: 900, color: COLORS.white, marginBottom: 8 }}>تم الحجز بنجاح!</h2>
          <p style={{ color: COLORS.muted, fontSize: 14, marginBottom: 24, lineHeight: 1.7 }}>شكراً! تم تسجيل حجزك وسيتم التواصل معك على واتساب للتأكيد.</p>
          <div style={{ background: COLORS.accentDim, border: `2px solid ${COLORS.accent}`, borderRadius: 14, padding: "16px 24px", marginBottom: 20 }}>
            <div style={{ fontSize: 12, color: COLORS.muted, marginBottom: 4 }}>رقم حجزك</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: COLORS.accent, letterSpacing: 2 }}>{bookingNumber}</div>
            <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 4 }}>احتفظ بهذا الرقم للمتابعة</div>
          </div>
          <div style={{ background: COLORS.surface, borderRadius: 12, padding: 16, marginBottom: 24, textAlign: "right" }}>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${COLORS.border}` }}>
              <span style={{ color: COLORS.accent, fontWeight: 600 }}>{service}</span>
              <span style={{ color: COLORS.muted, fontSize: 13 }}>الخدمة</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${COLORS.border}` }}>
              <span style={{ color: COLORS.white }}>{currentSector.icon} {currentSector.label}</span>
              <span style={{ color: COLORS.muted, fontSize: 13 }}>القطاع</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0" }}>
              <span style={{ color: COLORS.white }}>{bookingDate} {bookingHour}:{bookingMinute}</span>
              <span style={{ color: COLORS.muted, fontSize: 13 }}>الموعد</span>
            </div>
          </div>
          {!reviewSubmitted ? (
            <div style={{ background: COLORS.surface, borderRadius: 16, padding: 20, marginBottom: 20, border: `1px solid ${COLORS.border}` }}>
              <h4 style={{ fontWeight: 700, color: COLORS.white, marginBottom: 4 }}>قيّم تجربتك ⭐</h4>
              <p style={{ fontSize: 13, color: COLORS.muted, marginBottom: 16 }}>رأيك يساعدنا نتحسن!</p>
              <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 16 }}>
                {[1,2,3,4,5].map(star => (
                  <span key={star} onClick={() => setRating(star)} onMouseEnter={() => setHoverRating(star)} onMouseLeave={() => setHoverRating(0)} style={{ fontSize: 36, cursor: "pointer", transition: "transform 0.1s", transform: (hoverRating || rating) >= star ? "scale(1.2)" : "scale(1)", filter: (hoverRating || rating) >= star ? "none" : "grayscale(1)" }}>⭐</span>
                ))}
              </div>
              <textarea placeholder="اكتب تعليقك هنا (اختياري)..." value={comment} onChange={e => setComment(e.target.value)} rows={3} style={{ width: "100%", padding: "10px 14px", borderRadius: 10, background: COLORS.card, border: `1px solid ${COLORS.border}`, color: COLORS.text, fontSize: 13, outline: "none", fontFamily: "Tajawal, sans-serif", resize: "none", marginBottom: 12 }} />
              <button onClick={handleReview} disabled={reviewLoading} style={{ width: "100%", padding: "12px", background: rating > 0 ? "linear-gradient(90deg, #00d4aa, #0070f3)" : COLORS.surface, border: `1px solid ${rating > 0 ? COLORS.accent : COLORS.border}`, borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: rating > 0 ? "pointer" : "not-allowed", color: rating > 0 ? "#000" : COLORS.muted, fontFamily: "Tajawal, sans-serif" }}>{reviewLoading ? "جاري الإرسال..." : "إرسال التقييم"}</button>
            </div>
          ) : (
            <div style={{ background: "#00d4aa22", border: "1px solid #00d4aa", borderRadius: 14, padding: 16, marginBottom: 20, color: COLORS.accent, fontWeight: 700 }}>✅ شكراً على تقييمك! {"⭐".repeat(rating)}</div>
          )}
          <button onClick={() => { setBookingSuccess(false); setActiveTab("demo"); }} style={{ width: "100%", padding: "14px", background: "linear-gradient(90deg, #00d4aa, #0070f3)", border: "none", borderRadius: 10, fontSize: 16, fontWeight: 700, cursor: "pointer", color: "#000", fontFamily: "Tajawal, sans-serif" }}>حجز جديد</button>
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
        .tab-btn { transition: all 0.2s; }
        .tab-btn:hover { background: #1a2235 !important; }
        .card-hover { transition: all 0.25s; cursor: pointer; }
        .card-hover:hover { transform: translateY(-3px); box-shadow: 0 12px 40px #00d4aa18; border-color: #00d4aa55 !important; }
        .plan-card { transition: all 0.25s; cursor: pointer; }
        .plan-card:hover { transform: translateY(-4px); }
        .glow { box-shadow: 0 0 30px #00d4aa33, 0 0 60px #00d4aa11; }
        .pulse { animation: pulse 2s infinite; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.6} }
        .fade-in { animation: fadeIn 0.5s ease; }
        @keyframes fadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        .badge-live { animation: badgePulse 1.5s infinite; }
        @keyframes badgePulse { 0%,100%{box-shadow:0 0 0 0 #00d4aa44} 50%{box-shadow:0 0 0 6px #00d4aa00} }
        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: #00000088; display: flex; align-items: center; justify-content: center; z-index: 999; }
        .pay-option { transition: all 0.2s; cursor: pointer; }
        .pay-option:hover { transform: translateY(-2px); }
        input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(1); }
        input[type="number"] { -moz-appearance: textfield; }
        input[type="number"]::-webkit-outer-spin-button, input[type="number"]::-webkit-inner-spin-button { -webkit-appearance: none; }
      `}</style>

      {showPlanModal && (
        <div className="modal-overlay" onClick={() => setShowPlanModal(false)}>
          <div onClick={e => e.stopPropagation()} style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 20, padding: 32, width: 420, maxWidth: "90vw" }}>
            {step === 1 && (
              <>
                <h3 style={{ fontWeight: 800, fontSize: 20, color: COLORS.white, marginBottom: 4 }}>باقة {planName}</h3>
                <p style={{ color: COLORS.muted, fontSize: 14, marginBottom: 24 }}>{planPrice} د.ع / شهر</p>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", fontSize: 13, color: COLORS.muted, marginBottom: 6 }}>اسمك الكامل</label>
                  <input type="text" placeholder="مثال: محمد علي" value={modalName} onChange={e => setModalName(e.target.value)} style={{ width: "100%", padding: "12px 16px", borderRadius: 10, background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.text, fontSize: 14, outline: "none", fontFamily: "Tajawal, sans-serif" }} />
                </div>
                <div style={{ marginBottom: planHasDiscount ? 16 : 24 }}>
                  <label style={{ display: "block", fontSize: 13, color: COLORS.muted, marginBottom: 6 }}>رقم الهاتف (واتساب)</label>
                  <input type="tel" placeholder="07xx xxx xxxx" value={modalPhone} onChange={e => setModalPhone(e.target.value)} style={{ width: "100%", padding: "12px 16px", borderRadius: 10, background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.text, fontSize: 14, outline: "none", fontFamily: "Tajawal, sans-serif" }} />
                </div>

                {planHasDiscount && (
                  <div style={{ marginBottom: 24 }}>
                    <label style={{ display: "block", fontSize: 13, color: COLORS.muted, marginBottom: 6 }}>🏷️ كود الخصم (اختياري)</label>
                    <div style={{ display: "flex", gap: 8 }}>
                      <input
                        type="text"
                        placeholder="مثال: EID50"
                        value={discountCode}
                        onChange={e => { setDiscountCode(e.target.value.toUpperCase()); setDiscountStatus("idle"); setDiscountMsg(""); setDiscountApplied(false); }}
                        disabled={discountApplied}
                        style={{ flex: 1, padding: "12px 16px", borderRadius: 10, background: COLORS.surface, border: `1px solid ${discountStatus === "success" ? "#00d4aa" : discountStatus === "error" ? "#ef4444" : COLORS.border}`, color: COLORS.text, fontSize: 14, outline: "none", fontFamily: "Tajawal, sans-serif", textTransform: "uppercase" }}
                      />
                      {!discountApplied ? (
                        <button onClick={handleCheckDiscount} disabled={discountStatus === "loading" || !discountCode.trim()} style={{ background: COLORS.accentDim, border: `1px solid ${COLORS.accent}`, borderRadius: 10, padding: "0 16px", color: COLORS.accent, fontWeight: 700, cursor: "pointer", fontFamily: "Tajawal, sans-serif", fontSize: 13, whiteSpace: "nowrap" }}>
                          {discountStatus === "loading" ? "..." : "تطبيق"}
                        </button>
                      ) : (
                        <button onClick={() => { setDiscountApplied(false); setDiscountCode(""); setDiscountStatus("idle"); setDiscountMsg(""); }} style={{ background: "#ef444422", border: "1px solid #ef4444", borderRadius: 10, padding: "0 16px", color: "#ef4444", fontWeight: 700, cursor: "pointer", fontFamily: "Tajawal, sans-serif", fontSize: 13 }}>إلغاء</button>
                      )}
                    </div>
                    {discountMsg && (
                      <p style={{ fontSize: 12, marginTop: 6, color: discountStatus === "success" ? "#00d4aa" : "#ef4444" }}>{discountMsg}</p>
                    )}
                  </div>
                )}

                <button onClick={handlePlanSubmit} style={{ width: "100%", padding: "14px", background: "linear-gradient(90deg, #00d4aa, #0070f3)", border: "none", borderRadius: 10, fontSize: 16, fontWeight: 700, cursor: "pointer", color: "#000", fontFamily: "Tajawal, sans-serif", marginBottom: 12 }}>التالي — اختر طريقة الدفع ←</button>
                <button onClick={() => setShowPlanModal(false)} style={{ width: "100%", padding: "12px", background: "transparent", border: `1px solid ${COLORS.border}`, borderRadius: 10, fontSize: 14, cursor: "pointer", color: COLORS.muted, fontFamily: "Tajawal, sans-serif" }}>إلغاء</button>
              </>
            )}
            {step === 2 && (
              <>
                <button onClick={() => setStep(1)} style={{ background: "transparent", border: "none", color: COLORS.muted, cursor: "pointer", fontSize: 14, marginBottom: 16, fontFamily: "Tajawal, sans-serif" }}>← رجوع</button>
                <h3 style={{ fontWeight: 800, fontSize: 20, color: COLORS.white, marginBottom: 4 }}>اختر طريقة الدفع</h3>
                <p style={{ color: COLORS.muted, fontSize: 14, marginBottom: discountApplied ? 8 : 24 }}>باقة {planName} — {planPrice} د.ع / شهر</p>
                {discountApplied && (
                  <div style={{ background: "#00d4aa11", border: "1px solid #00d4aa44", borderRadius: 10, padding: "8px 14px", marginBottom: 16, fontSize: 13, color: "#00d4aa" }}>
                    🏷️ كود خصم مطبّق: {discountCode} — خصم {discountValue}
                  </div>
                )}
                <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
                  {[
                    { id: "whatsapp", icon: "💬", label: "دفع عبر واتساب", desc: "تتواصل معنا وتدفع يدوياً" },
                    { id: "card", icon: "💳", label: "تحويل بنكي", desc: "تحويل على بطاقة الرافدين" },
                  ].map(opt => (
                    <div key={opt.id} className="pay-option" onClick={() => setPaymentMethod(opt.id)} style={{ padding: "16px 20px", borderRadius: 12, background: paymentMethod === opt.id ? COLORS.accentDim : COLORS.surface, border: `2px solid ${paymentMethod === opt.id ? COLORS.accent : COLORS.border}`, display: "flex", alignItems: "center", gap: 14 }}>
                      <span style={{ fontSize: 28 }}>{opt.icon}</span>
                      <div>
                        <div style={{ fontWeight: 700, color: COLORS.white, fontSize: 15 }}>{opt.label}</div>
                        <div style={{ fontSize: 12, color: COLORS.muted, marginTop: 2 }}>{opt.desc}</div>
                      </div>
                      {paymentMethod === opt.id && <span style={{ marginRight: "auto", color: COLORS.accent, fontSize: 20 }}>✓</span>}
                    </div>
                  ))}
                </div>
                {paymentMethod === "card" && (
                  <div style={{ background: "#f59e0b11", border: "1px solid #f59e0b44", borderRadius: 10, padding: "12px 16px", marginBottom: 16, fontSize: 13, color: "#f59e0b", lineHeight: 1.7 }}>⚠️ ستصلك تفاصيل التحويل على واتساب. أرسل إيصال التحويل لتفعيل الاشتراك.</div>
                )}
                <button onClick={handlePayment} style={{ width: "100%", padding: "14px", background: "linear-gradient(90deg, #00d4aa, #0070f3)", border: "none", borderRadius: 10, fontSize: 16, fontWeight: 700, cursor: "pointer", color: "#000", fontFamily: "Tajawal, sans-serif", marginBottom: 12 }}>📱 تأكيد وإرسال على واتساب</button>
                <button onClick={() => setShowPlanModal(false)} style={{ width: "100%", padding: "12px", background: "transparent", border: `1px solid ${COLORS.border}`, borderRadius: 10, fontSize: 14, cursor: "pointer", color: COLORS.muted, fontFamily: "Tajawal, sans-serif" }}>إلغاء</button>
              </>
            )}
          </div>
        </div>
      )}

      <nav style={{ background: "#0d1424", borderBottom: `1px solid ${COLORS.border}`, padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64, position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #00d4aa, #0070f3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 900 }}>ح</div>
          <span style={{ fontSize: 20, fontWeight: 800, color: COLORS.white }}>حجوزاتي</span>
          <span style={{ fontSize: 10, background: COLORS.accent, color: "#000", padding: "2px 8px", borderRadius: 20, fontWeight: 700, marginRight: 4 }}>BETA</span>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {[{ id: "dashboard", label: "لوحة التحكم" }, { id: "demo", label: "جرب المنصة" }, { id: "plans", label: "الأسعار" }, { id: "start", label: "ابدأ الآن" }].map(t => (
            <button key={t.id} className="tab-btn" onClick={() => setActiveTab(t.id)} style={{ padding: "8px 16px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 14, fontFamily: "Tajawal, sans-serif", fontWeight: activeTab === t.id ? 700 : 400, background: activeTab === t.id ? COLORS.accentDim : "transparent", color: activeTab === t.id ? COLORS.accent : COLORS.muted, borderBottom: activeTab === t.id ? `2px solid ${COLORS.accent}` : "2px solid transparent" }}>{t.label}</button>
          ))}
        </div>
        <div style={{ background: "linear-gradient(90deg, #00d4aa, #0070f3)", padding: "8px 20px", borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: "pointer", color: "#000" }}>ابدأ مجاناً</div>
      </nav>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }} className="fade-in">

        {activeTab === "dashboard" && (
          <div>
            <div style={{ background: "linear-gradient(135deg, #0d1a2e 0%, #0a1628 50%, #0d1a2e 100%)", border: `1px solid ${COLORS.border}`, borderRadius: 20, padding: "48px 40px", marginBottom: 32 }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: COLORS.accentDim, border: `1px solid ${COLORS.accent}44`, borderRadius: 20, padding: "6px 16px", marginBottom: 20 }}>
                <span className="pulse" style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS.accent, display: "inline-block" }} />
                <span style={{ fontSize: 13, color: COLORS.accent, fontWeight: 600 }}>منصة SaaS للحجوزات — العراق</span>
              </div>
              <h1 style={{ fontSize: 42, fontWeight: 900, lineHeight: 1.3, marginBottom: 16 }}>
                نظام حجوزات ذكي<br />
                <span style={{ background: "linear-gradient(90deg, #00d4aa, #0070f3)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>لكل قطاع بالعراق</span>
              </h1>
              <p style={{ fontSize: 18, color: COLORS.muted, maxWidth: 500, lineHeight: 1.8, marginBottom: 28 }}>عيادات، صالونات، فنادق وشاليهات — منصة واحدة، اشتراك شهري، تذكير تلقائي بالواتساب</p>
              <div style={{ display: "flex", gap: 12 }}>
                <button onClick={() => setActiveTab("demo")} style={{ background: "linear-gradient(90deg, #00d4aa, #0070f3)", border: "none", borderRadius: 10, padding: "14px 28px", fontSize: 16, fontWeight: 700, cursor: "pointer", color: "#000", fontFamily: "Tajawal, sans-serif" }}>جرب المنصة الآن</button>
                <button onClick={() => setActiveTab("plans")} style={{ background: "transparent", border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: "14px 28px", fontSize: 16, fontWeight: 600, cursor: "pointer", color: COLORS.text, fontFamily: "Tajawal, sans-serif" }}>شوف الأسعار</button>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 32 }}>
              {[
                { label: "عملاء مسجلين", value: "1,240", icon: "👥", trend: "+12%" },
                { label: "حجوزات اليوم", value: "74", icon: "📅", trend: "+8%" },
                { label: "الإيرادات (د.ع)", value: "5.7M", icon: "💰", trend: "+22%" },
                { label: "نسبة الرضا", value: "98%", icon: "⭐", trend: "+2%" },
              ].map((s, i) => (
                <div key={i} className="card-hover" style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: 20 }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
                  <div style={{ fontSize: 26, fontWeight: 800, color: COLORS.white }}>{s.value}</div>
                  <div style={{ fontSize: 13, color: COLORS.muted, marginTop: 4 }}>{s.label}</div>
                  <div style={{ fontSize: 12, color: COLORS.accent, marginTop: 6, fontWeight: 600 }}>{s.trend} هذا الشهر</div>
                </div>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 24 }}>
                <h3 style={{ fontWeight: 700, marginBottom: 20, color: COLORS.white }}>القطاعات المدعومة</h3>
                {SECTORS.map(s => (
                  <div key={s.id} onClick={() => setActiveSector(s.id)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderRadius: 10, marginBottom: 10, background: activeSector === s.id ? `${s.color}18` : "#ffffff08", border: `1px solid ${activeSector === s.id ? s.color + "55" : "transparent"}`, cursor: "pointer", transition: "all 0.2s" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ fontSize: 24 }}>{s.icon}</span>
                      <div>
                        <div style={{ fontWeight: 600, color: COLORS.white }}>{s.label}</div>
                        <div style={{ fontSize: 12, color: COLORS.muted }}>{s.bookings} حجز اليوم</div>
                      </div>
                    </div>
                    <div style={{ textAlign: "left" }}>
                      <div style={{ fontSize: 13, color: s.color, fontWeight: 700 }}>{s.revenue}</div>
                      <div style={{ fontSize: 11, color: COLORS.muted }}>دينار / شهر</div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <h3 style={{ fontWeight: 700, color: COLORS.white }}>آخر الحجوزات</h3>
                  <span className="badge-live" style={{ background: COLORS.accentDim, color: COLORS.accent, fontSize: 11, padding: "3px 10px", borderRadius: 20, fontWeight: 600, border: `1px solid ${COLORS.accent}44` }}>● مباشر</span>
                </div>
                {BOOKINGS_DEMO.map((b, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: i < BOOKINGS_DEMO.length - 1 ? `1px solid ${COLORS.border}` : "none" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: "50%", background: COLORS.surface, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>{b.sector}</div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14, color: COLORS.white }}>{b.name}</div>
                        <div style={{ fontSize: 12, color: COLORS.muted }}>{b.service} · {b.time}</div>
                      </div>
                    </div>
                    <span style={{ fontSize: 11, padding: "4px 10px", borderRadius: 20, fontWeight: 600, background: `${statusColor[b.status]}22`, color: statusColor[b.status], border: `1px solid ${statusColor[b.status]}44` }}>{statusLabel[b.status]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "demo" && (
          <div>
            <h2 style={{ fontSize: 30, fontWeight: 800, marginBottom: 8 }}>جرب نظام الحجز</h2>
            <p style={{ color: COLORS.muted, marginBottom: 28 }}>اختر قطاعك وسجل حجزك الآن</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
              <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 28 }}>
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
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", fontSize: 13, color: COLORS.muted, marginBottom: 6, fontWeight: 500 }}>اسمك الكامل</label>
                  <input type="text" placeholder="مثال: محمد علي" value={name} onChange={e => setName(e.target.value)} style={{ width: "100%", padding: "12px 16px", borderRadius: 10, background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.text, fontSize: 14, outline: "none", fontFamily: "Tajawal, sans-serif" }} />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", fontSize: 13, color: COLORS.muted, marginBottom: 6, fontWeight: 500 }}>رقم الهاتف (واتساب)</label>
                  <input type="tel" placeholder="07xx xxx xxxx" value={phone} onChange={e => setPhone(e.target.value)} style={{ width: "100%", padding: "12px 16px", borderRadius: 10, background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.text, fontSize: 14, outline: "none", fontFamily: "Tajawal, sans-serif" }} />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", fontSize: 13, color: COLORS.muted, marginBottom: 6, fontWeight: 500 }}>{currentSector.icon} نوع الخدمة</label>
                  <select value={service} onChange={e => setService(e.target.value)} style={{ width: "100%", padding: "12px 16px", borderRadius: 10, background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.text, fontSize: 14, outline: "none", fontFamily: "Tajawal, sans-serif" }}>
                    {currentSector.services.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", fontSize: 13, color: COLORS.muted, marginBottom: 6, fontWeight: 500 }}>📅 التاريخ</label>
                  <input type="date" value={bookingDate} onChange={e => setBookingDate(e.target.value)} style={{ width: "100%", padding: "12px 16px", borderRadius: 10, background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.text, fontSize: 14, outline: "none", fontFamily: "Tajawal, sans-serif" }} />
                </div>
                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: "block", fontSize: 13, color: COLORS.muted, marginBottom: 6, fontWeight: 500 }}>🕐 الوقت</label>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <input type="number" min="0" max="23" value={bookingHour} onChange={e => setBookingHour(e.target.value.padStart(2, "0"))} style={{ flex: 1, padding: "12px 16px", borderRadius: 10, background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.text, fontSize: 18, outline: "none", fontFamily: "Tajawal, sans-serif", textAlign: "center" }} />
                    <span style={{ color: COLORS.accent, fontSize: 22, fontWeight: 800 }}>:</span>
                    <input type="number" min="0" max="59" value={bookingMinute} onChange={e => setBookingMinute(e.target.value.padStart(2, "0"))} style={{ flex: 1, padding: "12px 16px", borderRadius: 10, background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.text, fontSize: 18, outline: "none", fontFamily: "Tajawal, sans-serif", textAlign: "center" }} />
                  </div>
                  <p style={{ fontSize: 11, color: COLORS.muted, marginTop: 6 }}>الوقت: {bookingHour}:{bookingMinute}</p>
                </div>
                <button onClick={handleBooking} disabled={loading} style={{ width: "100%", padding: "14px", background: loading ? "#666" : "linear-gradient(90deg, #00d4aa, #0070f3)", border: "none", borderRadius: 10, fontSize: 16, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", color: "#000", fontFamily: "Tajawal, sans-serif" }}>{loading ? "جاري الحجز..." : "✅ تأكيد الحجز"}</button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 24 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                    <span style={{ fontSize: 24 }}>💬</span>
                    <span style={{ fontWeight: 700, color: COLORS.white }}>إشعار واتساب فوري</span>
                  </div>
                  <div style={{ background: "#075e54", borderRadius: 12, padding: 16 }}>
                    <div style={{ background: "#dcf8c6", borderRadius: "12px 12px 2px 12px", padding: "10px 14px", maxWidth: "85%", marginRight: "auto", color: "#111", fontSize: 13, lineHeight: 1.7 }}>
                      <div style={{ fontWeight: 700, marginBottom: 4 }}>🔔 حجز جديد!</div>
                      <div>رقم الحجز: HJ-123456</div>
                      <div>الاسم: محمد علي</div>
                      <div>الهاتف: 07700000000</div>
                      <div>الخدمة: كشف عام</div>
                      <div>الموعد: 2026-05-27 10:30</div>
                    </div>
                  </div>
                </div>
                <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 24 }}>
                  <h4 style={{ fontWeight: 700, marginBottom: 16, color: COLORS.white }}>⚡ الميزات الرئيسية</h4>
                  {["إشعار فوري على واتساب عند كل حجز", "خدمات مخصصة لكل قطاع", "اختيار حر للوقت 24 ساعة", "رقم حجز فريد لكل عميل", "تقييم الخدمة بالنجوم", "دفع بالدينار العراقي"].map((f, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: i < 5 ? `1px solid ${COLORS.border}` : "none" }}>
                      <span style={{ color: COLORS.accent, fontSize: 16 }}>✓</span>
                      <span style={{ fontSize: 14, color: COLORS.text }}>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "plans" && (
          <div>
            <h2 style={{ fontSize: 30, fontWeight: 800, marginBottom: 8, textAlign: "center" }}>باقات الاشتراك</h2>
            <p style={{ color: COLORS.muted, marginBottom: 32, textAlign: "center" }}>اشتراك شهري بالدينار العراقي — ألغِ وقت ما تريد</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
              {PLANS.map((p, i) => (
                <div key={i} className="plan-card" onClick={() => setSelectedPlan(p.name)} style={{ background: COLORS.card, border: `2px solid ${selectedPlan === p.name ? p.color : COLORS.border}`, borderRadius: 18, padding: 28, position: "relative", boxShadow: selectedPlan === p.name ? `0 0 30px ${p.color}33` : "none" }}>
                  {p.popular && (
                    <div style={{ position: "absolute", top: -12, right: 20, background: p.color, color: "#000", fontSize: 11, padding: "4px 14px", borderRadius: 20, fontWeight: 700 }}>الأكثر مبيعاً</div>
                  )}
                  {p.hasDiscount && (
                    <div style={{ position: "absolute", top: -12, left: 20, background: "#f59e0b", color: "#000", fontSize: 11, padding: "4px 14px", borderRadius: 20, fontWeight: 700 }}>🏷️ قابل للخصم</div>
                  )}
                  <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.white, marginBottom: 8 }}>{p.name}</div>
                  <div style={{ marginBottom: 4 }}>
                    <span style={{ fontSize: 36, fontWeight: 900, color: p.color }}>{p.price}</span>
                    <span style={{ fontSize: 13, color: COLORS.muted }}> د.ع / شهر</span>
                  </div>
                  <div style={{ fontSize: 12, color: COLORS.muted, marginBottom: p.hasDiscount ? 8 : 20 }}>مثالي لـ {p.ideal}</div>
                  {p.hasDiscount && (
                    <div style={{ background: "#f59e0b11", border: "1px solid #f59e0b44", borderRadius: 8, padding: "6px 12px", marginBottom: 16, fontSize: 12, color: "#f59e0b" }}>
                      🎁 لديك كود خصم؟ طبّقه عند الاشتراك!
                    </div>
                  )}
                  <div style={{ borderTop: `1px solid ${COLORS.border}`, paddingTop: 16 }}>
                    {p.features.map((f, j) => (
                      <div key={j} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: COLORS.text, padding: "6px 0" }}>
                        <span style={{ color: p.color }}>✓</span> {f}
                      </div>
                    ))}
                  </div>
                  <button onClick={e => { e.stopPropagation(); openPlanModal(p); }} style={{ width: "100%", marginTop: 20, padding: "12px", background: "linear-gradient(90deg, #00d4aa, #0070f3)", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer", color: "#000", fontFamily: "Tajawal, sans-serif" }}>اشترك الآن</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "start" && (
          <div>
            <h2 style={{ fontSize: 30, fontWeight: 800, marginBottom: 8 }}>🗺️ خارطة طريقك</h2>
            <p style={{ color: COLORS.muted, marginBottom: 32 }}>شسوي بالضبط حتى تبلش وتبيع هالنظام</p>
            <div style={{ background: "linear-gradient(135deg, #0d1a2e, #0a1628)", border: `1px solid ${COLORS.accent}44`, borderRadius: 16, padding: 32, textAlign: "center" }} className="glow">
              <div style={{ fontSize: 32, marginBottom: 12 }}>🚀</div>
              <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8, color: COLORS.white }}>جاهز تبلش؟</h3>
              <p style={{ color: COLORS.muted, marginBottom: 20 }}>ابعتلي رسالة وأساعدك تبني النظام خطوة بخطوة</p>
              <button onClick={() => window.open("https://wa.me/9647739863056?text=مرحبا، أريد أبدأ مشروعي", "_blank")} style={{ background: "linear-gradient(90deg, #00d4aa, #0070f3)", border: "none", borderRadius: 10, padding: "14px 40px", fontSize: 16, fontWeight: 700, cursor: "pointer", color: "#000", fontFamily: "Tajawal, sans-serif" }}>ابدأ مشروعك الآن ✓</button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}