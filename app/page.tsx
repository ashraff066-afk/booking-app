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

const FEATURES = [
  { icon: "📱", title: "إشعار واتساب فوري", desc: "كل حجز يوصلك على واتساب فوراً بدون تأخير" },
  { icon: "📊", title: "تقارير شهرية", desc: "شوف إيراداتك وحجوزاتك بأرقام واضحة كل شهر" },
  { icon: "⭐", title: "تقييم العملاء", desc: "اجمع تقييمات زبائنك وحسّن خدمتك" },
  { icon: "🔍", title: "بحث وفلترة", desc: "دور على أي حجز بسرعة من لوحة التحكم" },
  { icon: "🏷️", title: "أكواد خصم", desc: "أنشئ أكواد خصم تجذب زبائن جدد" },
  { icon: "🔒", title: "بيانات آمنة", desc: "بيانات عملائك محمية بأحدث تقنيات الأمان" },
];

const SECTORS = [
  { icon: "🏥", label: "عيادات", desc: "كشف، استشارة، متابعة — كل المواعيد بنظام واحد", color: "#3b82f6" },
  { icon: "✂️", label: "صالونات", desc: "قص، صبغة، عناية — جدول مواعيد ذكي لصالونك", color: "#ec4899" },
  { icon: "🏨", label: "فنادق وشاليهات", desc: "غرف وباقات — حجز سهل وإشعار فوري", color: "#f59e0b" },
];

const TESTIMONIALS = [
  { name: "أبو علي", role: "صاحب عيادة — بغداد", text: "قبل موعدي كنت أضيع وقتي بالهاتف. هسه كل شي منظم والزبائن راضين.", stars: 5 },
  { name: "أم سارة", role: "صاحبة صالون — البصرة", text: "سهّل علي الشغل كثير. الإشعارات على الواتساب ممتازة ومو ينفوت علي موعد.", stars: 5 },
  { name: "أبو كرار", role: "مدير شاليه — كربلاء", text: "النظام احترافي ويستاهل. الإحصائيات الشهرية تساعدني أعرف أحسن أوقات الحجز.", stars: 5 },
];

export default function LandingPage() {
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
  const [menuOpen, setMenuOpen] = useState(false);

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
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-btn { display: block !important; }
          .hero-grid { grid-template-columns: 1fr !important; }
          .features-grid { grid-template-columns: 1fr 1fr !important; }
          .sectors-grid { grid-template-columns: 1fr !important; }
          .plans-grid { grid-template-columns: 1fr !important; }
          .testimonials-grid { grid-template-columns: 1fr !important; }
          .stats-grid { grid-template-columns: repeat(2,1fr) !important; }
          .hero-title { font-size: 32px !important; }
          .cta-btns { flex-direction: column !important; }
        }
        @media (min-width: 769px) { .mobile-btn { display: none !important; } .mobile-menu { display: none !important; } }
      `}</style>

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
      <nav style={{ background: "#0a0e1a", borderBottom: `1px solid ${COLORS.border}`, padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64, position: "sticky", top: 0, zIndex: 100, backdropFilter: "blur(10px)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: "linear-gradient(135deg, #00d4aa, #0070f3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 900, color: "#000" }}>م</div>
          <span style={{ fontSize: 22, fontWeight: 900, color: COLORS.white }}>موعدي</span>
        </div>
        <div className="desktop-nav" style={{ display: "flex", gap: 4, alignItems: "center" }}>
          {[{ label: "المميزات", href: "#features" }, { label: "القطاعات", href: "#sectors" }, { label: "الأسعار", href: "#plans" }, { label: "آراء العملاء", href: "#testimonials" }].map(t => (
            <a key={t.href} href={t.href} style={{ padding: "8px 16px", borderRadius: 8, fontSize: 14, fontFamily: "Tajawal, sans-serif", color: COLORS.muted, textDecoration: "none", transition: "color 0.2s" }}>{t.label}</a>
          ))}
          <a href="/demo" style={{ background: "linear-gradient(90deg, #00d4aa, #0070f3)", padding: "9px 20px", borderRadius: 8, fontSize: 14, fontWeight: 700, color: "#000", textDecoration: "none", marginRight: 8 }}>جرب مجاناً</a>
        </div>
        <button className="mobile-btn" onClick={() => setMenuOpen(!menuOpen)} style={{ background: "transparent", border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: "7px 12px", color: COLORS.text, cursor: "pointer", fontSize: 18, display: "none" }}>☰</button>
      </nav>

      {menuOpen && (
        <div className="mobile-menu" style={{ background: "#0d1424", borderBottom: `1px solid ${COLORS.border}`, padding: "8px 16px" }}>
          {[{ label: "المميزات", href: "#features" }, { label: "القطاعات", href: "#sectors" }, { label: "الأسعار", href: "#plans" }, { label: "آراء العملاء", href: "#testimonials" }].map(t => (
            <a key={t.href} href={t.href} onClick={() => setMenuOpen(false)} style={{ display: "block", padding: "12px 16px", fontSize: 14, fontFamily: "Tajawal, sans-serif", color: COLORS.text, textDecoration: "none", borderBottom: `1px solid ${COLORS.border}` }}>{t.label}</a>
          ))}
          <a href="/demo" style={{ display: "block", padding: "12px 16px", fontSize: 14, fontFamily: "Tajawal, sans-serif", color: COLORS.accent, textDecoration: "none", fontWeight: 700 }}>جرب مجاناً ←</a>
        </div>
      )}

      {/* HERO */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "80px 24px 60px" }} className="fade-in">
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: COLORS.accentDim, border: `1px solid ${COLORS.accent}44`, borderRadius: 20, padding: "6px 16px", marginBottom: 24 }}>
            <span className="pulse" style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS.accent, display: "inline-block" }} />
            <span style={{ fontSize: 13, color: COLORS.accent, fontWeight: 600 }}>نظام حجوزات ذكي للعراق 🇮🇶</span>
          </div>
          <h1 className="hero-title" style={{ fontSize: 52, fontWeight: 900, lineHeight: 1.2, marginBottom: 20, color: COLORS.white }}>
            خلّي زبائنك يحجزون<br />
            <span style={{ background: "linear-gradient(90deg, #00d4aa, #0070f3)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>بضغطة وحدة</span>
          </h1>
          <p style={{ fontSize: 18, color: COLORS.muted, maxWidth: 600, margin: "0 auto 32px", lineHeight: 1.8 }}>
            نظام حجوزات احترافي للعيادات والصالونات والشاليهات — إشعار واتساب فوري، لوحة تحكم كاملة، بدون تعقيد
          </p>
          <div className="cta-btns" style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="/demo" style={{ background: "linear-gradient(90deg, #00d4aa, #0070f3)", border: "none", borderRadius: 12, padding: "16px 36px", fontSize: 17, fontWeight: 700, cursor: "pointer", color: "#000", fontFamily: "Tajawal, sans-serif", textDecoration: "none", display: "inline-block" }}>🚀 جرب مجاناً الآن</a>
            <a href="#plans" style={{ background: "transparent", border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: "16px 36px", fontSize: 17, fontWeight: 600, cursor: "pointer", color: COLORS.text, fontFamily: "Tajawal, sans-serif", textDecoration: "none", display: "inline-block" }}>شوف الأسعار</a>
          </div>
          <p style={{ color: COLORS.muted, fontSize: 13, marginTop: 16 }}>✅ بدون بطاقة ائتمان · ✅ إعداد في 5 دقائق · ✅ دعم فني مجاني</p>
        </div>

        {/* STATS */}
        <div className="stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 60 }}>
          {[
            { value: "500+", label: "عميل مسجل", icon: "👥" },
            { value: "15,000+", label: "حجز منجز", icon: "📅" },
            { value: "98%", label: "نسبة الرضا", icon: "⭐" },
            { value: "3", label: "قطاعات مدعومة", icon: "🏢" },
          ].map((s, i) => (
            <div key={i} style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 24, textAlign: "center" }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
              <div style={{ fontSize: 28, fontWeight: 900, color: COLORS.accent }}>{s.value}</div>
              <div style={{ fontSize: 13, color: COLORS.muted, marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" style={{ background: "#0d1424", padding: "60px 24px" }}>
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
      <section id="sectors" style={{ padding: "60px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h2 style={{ fontSize: 36, fontWeight: 900, color: COLORS.white, marginBottom: 12 }}>لكل قطاع حل مخصص</h2>
            <p style={{ color: COLORS.muted, fontSize: 16 }}>سواء عندك عيادة أو صالون أو شاليه — موعدي يناسبك</p>
          </div>
          <div className="sectors-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
            {SECTORS.map((s, i) => (
              <div key={i} className="hover-card" style={{ background: COLORS.card, border: `2px solid ${s.color}33`, borderRadius: 20, padding: 32, textAlign: "center" }}>
                <div style={{ fontSize: 52, marginBottom: 16 }}>{s.icon}</div>
                <h3 style={{ fontWeight: 800, color: COLORS.white, marginBottom: 10, fontSize: 20 }}>{s.label}</h3>
                <p style={{ color: COLORS.muted, fontSize: 14, lineHeight: 1.7, marginBottom: 20 }}>{s.desc}</p>
                <a href="/demo" style={{ background: `${s.color}22`, border: `1px solid ${s.color}55`, borderRadius: 10, padding: "10px 20px", color: s.color, fontSize: 14, fontWeight: 700, textDecoration: "none", display: "inline-block", fontFamily: "Tajawal, sans-serif" }}>جرب الآن ←</a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ background: "#0d1424", padding: "60px 24px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: 36, fontWeight: 900, color: COLORS.white, marginBottom: 12 }}>كيف يشتغل؟</h2>
          <p style={{ color: COLORS.muted, fontSize: 16, marginBottom: 48 }}>3 خطوات بس وتبدأ تستقبل حجوزات</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24 }}>
            {[
              { step: "1", title: "سجّل مشروعك", desc: "أدخل اسم مشروعك ورقمك وابدأ خلال 5 دقائق", icon: "📝" },
              { step: "2", title: "شارك الرابط", desc: "أرسل رابط الحجز لزبائنك على واتساب أو سوشيال ميديا", icon: "🔗" },
              { step: "3", title: "استقبل الحجوزات", desc: "كل حجز يوصلك على واتساب فوراً وتأكده بضغطة", icon: "✅" },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <div style={{ width: 56, height: 56, borderRadius: "50%", background: "linear-gradient(135deg, #00d4aa, #0070f3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 22, fontWeight: 900, color: "#000" }}>{s.step}</div>
                <div style={{ fontSize: 32, marginBottom: 12 }}>{s.icon}</div>
                <h3 style={{ fontWeight: 700, color: COLORS.white, marginBottom: 8 }}>{s.title}</h3>
                <p style={{ color: COLORS.muted, fontSize: 14, lineHeight: 1.7 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PLANS */}
      <section id="plans" style={{ padding: "60px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h2 style={{ fontSize: 36, fontWeight: 900, color: COLORS.white, marginBottom: 12 }}>أسعار واضحة بدون مفاجآت</h2>
            <p style={{ color: COLORS.muted, fontSize: 16 }}>اشتراك شهري بالدينار العراقي — ألغِ وقت ما تريد</p>
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
      </section>

      {/* TESTIMONIALS */}
      <section id="testimonials" style={{ background: "#0d1424", padding: "60px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h2 style={{ fontSize: 36, fontWeight: 900, color: COLORS.white, marginBottom: 12 }}>شنو يقولون عملاؤنا؟</h2>
            <p style={{ color: COLORS.muted, fontSize: 16 }}>آراء حقيقية من أصحاب أعمال بالعراق</p>
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
      <section style={{ padding: "80px 24px" }}>
        <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
          <div style={{ background: "linear-gradient(135deg, #0d1a2e, #0a1628)", border: `1px solid ${COLORS.accent}44`, borderRadius: 24, padding: "56px 40px" }} className="glow">
            <div style={{ fontSize: 48, marginBottom: 16 }}>🚀</div>
            <h2 style={{ fontSize: 36, fontWeight: 900, color: COLORS.white, marginBottom: 12 }}>جاهز تنظم مشروعك؟</h2>
            <p style={{ color: COLORS.muted, fontSize: 16, marginBottom: 32, lineHeight: 1.8 }}>انضم لمئات أصحاب الأعمال اللي يستخدمون موعدي اليوم</p>
            <div className="cta-btns" style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <a href="/demo" style={{ background: "linear-gradient(90deg, #00d4aa, #0070f3)", border: "none", borderRadius: 12, padding: "16px 40px", fontSize: 17, fontWeight: 700, cursor: "pointer", color: "#000", fontFamily: "Tajawal, sans-serif", textDecoration: "none", display: "inline-block" }}>ابدأ مجاناً الآن ✓</a>
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
  );
}