"use client";
import { useState } from "react";

const COLORS = {
  bg: "#0a0e1a", surface: "#111827", card: "#1a2235",
  border: "#1e2d45", accent: "#00d4aa", accentDim: "#00d4aa22",
  text: "#e2e8f0", muted: "#64748b", white: "#ffffff",
};

const SECTORS_DATA = {
  clinic: { label: "عيادة", icon: "🏥", color: "#3b82f6" },
  salon: { label: "صالون", icon: "✂️", color: "#ec4899" },
  hotel: { label: "شاليه / فندق", icon: "🏨", color: "#f59e0b" },
};

const PLANS = [
  { name: "أساسي", price: "20,000", color: "#64748b", features: ["حجز غير محدود", "تذكير واتساب", "لوحة تحكم", "دعم فني"], ideal: "صالون صغير" },
  { name: "احترافي", price: "50,000", color: "#00d4aa", features: ["كل مزايا الأساسي", "ملف عميل كامل", "تقارير شهرية", "أكثر من موظف"], ideal: "عيادة / صالون كبير", popular: true },
  { name: "بريميوم", price: "100,000", color: "#f59e0b", features: ["كل مزايا الاحترافي", "حجز غرف متعدد", "دفع أونلاين", "API مخصص", "مدير حساب"], ideal: "فندق / شاليه" },
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

export default function App() {
  const [activeTab, setActiveTab] = useState("landing");
  const [menuOpen, setMenuOpen] = useState(false);

  const [contactSector, setContactSector] = useState("clinic");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactPayment, setContactPayment] = useState("");
  const [contactSent, setContactSent] = useState(false);

  const [showPlanModal, setShowPlanModal] = useState(false);
  const [planName, setPlanName] = useState("");
  const [planPrice, setPlanPrice] = useState("");
  const [modalName, setModalName] = useState("");
  const [modalPhone, setModalPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [step, setStep] = useState(1);

  const handleContact = () => {
    if (!contactName || !contactPhone || !contactPayment) {
      alert("يرجى إدخال جميع البيانات واختيار طريقة الدفع");
      return;
    }
    const sector = SECTORS_DATA[contactSector as keyof typeof SECTORS_DATA];
    const paymentLabel = contactPayment === "whatsapp" ? "💬 دفع عبر واتساب" : "💳 تحويل بنكي";
    const msg = `مرحبا، أريد تسجيل حساب على موعدي 👋\n\nنوع العمل: ${sector.icon} ${sector.label}\nاسم العمل: ${contactName}\nرقم الهاتف: ${contactPhone}\nطريقة الدفع: ${paymentLabel}`;
    window.open(`https://wa.me/9647739863056?text=${encodeURIComponent(msg)}`, "_blank");
    setContactSent(true);
    setTimeout(() => setContactSent(false), 4000);
    setContactName(""); setContactPhone(""); setContactPayment("");
  };

  const openPlanModal = (plan: any) => {
    setPlanName(plan.name); setPlanPrice(plan.price);
    setModalName(""); setModalPhone(""); setPaymentMethod("");
    setStep(1); setShowPlanModal(true);
  };

  const handlePayment = () => {
    if (!paymentMethod) { alert("يرجى اختيار طريقة الدفع"); return; }
    const msg = `مرحبا، أنا ${modalName} ورقمي ${modalPhone}، أريد الاشتراك بباقة ${planName} بسعر ${planPrice} دينار شهرياً`;
    window.open(`https://wa.me/9647739863056?text=${encodeURIComponent(msg)}`, "_blank");
    setShowPlanModal(false);
  };

  return (
    <div dir="rtl" style={{ minHeight: "100vh", background: COLORS.bg, color: COLORS.text, fontFamily: "'Tajawal','Cairo',sans-serif", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;800;900&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:6px} ::-webkit-scrollbar-track{background:#0a0e1a} ::-webkit-scrollbar-thumb{background:#1e2d45;border-radius:3px}
        .hover-card{transition:all 0.25s} .hover-card:hover{transform:translateY(-4px);box-shadow:0 12px 40px #00d4aa18}
        .pulse{animation:pulse 2s infinite} @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}
        .fade-in{animation:fadeIn 0.6s ease} @keyframes fadeIn{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        .glow{box-shadow:0 0 40px #00d4aa33}
        .modal-overlay{position:fixed;top:0;left:0;right:0;bottom:0;background:#00000099;display:flex;align-items:center;justify-content:center;z-index:999;padding:16px}
        @media(max-width:768px){
          .desktop-nav{display:none !important} .mobile-btn{display:block !important}
          .features-grid{grid-template-columns:1fr 1fr !important}
          .sectors-grid{grid-template-columns:1fr !important}
          .plans-grid{grid-template-columns:1fr !important}
          .stats-grid{grid-template-columns:repeat(2,1fr) !important}
          .hero-title{font-size:32px !important}
          .steps-grid{grid-template-columns:1fr !important}
        }
        @media(min-width:769px){.mobile-btn{display:none !important}.mobile-menu{display:none !important}}
      `}</style>

      {/* MODAL */}
      {showPlanModal && (
        <div className="modal-overlay" onClick={() => setShowPlanModal(false)}>
          <div onClick={e => e.stopPropagation()} style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 20, padding: 24, width: "100%", maxWidth: 420 }}>
            {step === 1 && (
              <>
                <h3 style={{ fontWeight: 800, fontSize: 18, color: COLORS.white, marginBottom: 4 }}>باقة {planName}</h3>
                <p style={{ color: COLORS.muted, fontSize: 13, marginBottom: 20 }}>{planPrice} د.ع / شهر</p>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: "block", fontSize: 13, color: COLORS.muted, marginBottom: 6 }}>اسمك الكامل</label>
                  <input type="text" placeholder="مثال: محمد علي" value={modalName} onChange={e => setModalName(e.target.value)} style={{ width: "100%", padding: "12px 16px", borderRadius: 10, background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.text, fontSize: 14, outline: "none", fontFamily: "Tajawal,sans-serif" }} />
                </div>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: "block", fontSize: 13, color: COLORS.muted, marginBottom: 6 }}>رقم الهاتف</label>
                  <input type="tel" placeholder="07xx xxx xxxx" value={modalPhone} onChange={e => setModalPhone(e.target.value)} style={{ width: "100%", padding: "12px 16px", borderRadius: 10, background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.text, fontSize: 14, outline: "none", fontFamily: "Tajawal,sans-serif" }} />
                </div>
                <button onClick={() => { if (!modalName || !modalPhone) { alert("يرجى إدخال البيانات"); return; } setStep(2); }} style={{ width: "100%", padding: "13px", background: "linear-gradient(90deg,#00d4aa,#0070f3)", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer", color: "#000", fontFamily: "Tajawal,sans-serif", marginBottom: 10 }}>التالي ←</button>
                <button onClick={() => setShowPlanModal(false)} style={{ width: "100%", padding: "11px", background: "transparent", border: `1px solid ${COLORS.border}`, borderRadius: 10, fontSize: 13, cursor: "pointer", color: COLORS.muted, fontFamily: "Tajawal,sans-serif" }}>إلغاء</button>
              </>
            )}
            {step === 2 && (
              <>
                <button onClick={() => setStep(1)} style={{ background: "transparent", border: "none", color: COLORS.muted, cursor: "pointer", fontSize: 14, marginBottom: 14, fontFamily: "Tajawal,sans-serif" }}>← رجوع</button>
                <h3 style={{ fontWeight: 800, fontSize: 18, color: COLORS.white, marginBottom: 20 }}>اختر طريقة الدفع</h3>
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
                <button onClick={handlePayment} style={{ width: "100%", padding: "13px", background: "linear-gradient(90deg,#00d4aa,#0070f3)", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer", color: "#000", fontFamily: "Tajawal,sans-serif", marginBottom: 10 }}>📱 تأكيد وإرسال على واتساب</button>
                <button onClick={() => setShowPlanModal(false)} style={{ width: "100%", padding: "11px", background: "transparent", border: `1px solid ${COLORS.border}`, borderRadius: 10, fontSize: 13, cursor: "pointer", color: COLORS.muted, fontFamily: "Tajawal,sans-serif" }}>إلغاء</button>
              </>
            )}
          </div>
        </div>
      )}

      {/* NAV */}
      <nav style={{ background: "#0a0e1a", borderBottom: `1px solid ${COLORS.border}`, padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64, position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: "linear-gradient(135deg,#00d4aa,#0070f3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 900, color: "#000" }}>م</div>
          <span style={{ fontSize: 22, fontWeight: 900, color: COLORS.white }}>موعدي</span>
        </div>
        <div className="desktop-nav" style={{ display: "flex", gap: 4, alignItems: "center" }}>
          {[{ id: "landing", label: "الرئيسية" }, { id: "contact", label: "ابدأ الآن" }, { id: "plans", label: "الأسعار" }].map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ padding: "8px 16px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 14, fontFamily: "Tajawal,sans-serif", fontWeight: activeTab === t.id ? 700 : 400, background: activeTab === t.id ? COLORS.accentDim : "transparent", color: activeTab === t.id ? COLORS.accent : COLORS.muted }}>{t.label}</button>
          ))}
          <button onClick={() => setActiveTab("contact")} style={{ background: "linear-gradient(90deg,#00d4aa,#0070f3)", padding: "9px 20px", borderRadius: 8, fontSize: 14, fontWeight: 700, color: "#000", border: "none", cursor: "pointer", fontFamily: "Tajawal,sans-serif", marginRight: 8 }}>ابدأ الآن</button>
        </div>
        <button className="mobile-btn" onClick={() => setMenuOpen(!menuOpen)} style={{ background: "transparent", border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: "7px 12px", color: COLORS.text, cursor: "pointer", fontSize: 18, display: "none" }}>☰</button>
      </nav>

      {menuOpen && (
        <div className="mobile-menu" style={{ background: "#0d1424", borderBottom: `1px solid ${COLORS.border}`, padding: "8px 16px" }}>
          {[{ id: "landing", label: "🏠 الرئيسية" }, { id: "contact", label: "🚀 ابدأ الآن" }, { id: "plans", label: "💰 الأسعار" }].map(t => (
            <button key={t.id} onClick={() => { setActiveTab(t.id); setMenuOpen(false); }} style={{ display: "block", width: "100%", padding: "12px 16px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 14, fontFamily: "Tajawal,sans-serif", background: "transparent", color: COLORS.text, textAlign: "right", marginBottom: 4 }}>{t.label}</button>
          ))}
        </div>
      )}

      {/* LANDING */}
      {activeTab === "landing" && (
        <div className="fade-in">
          <section style={{ maxWidth: 1100, margin: "0 auto", padding: "80px 24px 60px", textAlign: "center" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: COLORS.accentDim, border: `1px solid ${COLORS.accent}44`, borderRadius: 20, padding: "6px 16px", marginBottom: 24 }}>
              <span className="pulse" style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS.accent, display: "inline-block" }} />
              <span style={{ fontSize: 13, color: COLORS.accent, fontWeight: 600 }}>نظام حجوزات ذكي للعراق 🇮🇶</span>
            </div>
            <h1 className="hero-title" style={{ fontSize: 52, fontWeight: 900, lineHeight: 1.2, marginBottom: 20, color: COLORS.white }}>
              خلّي زبائنك يحجزون<br />
              <span style={{ background: "linear-gradient(90deg,#00d4aa,#0070f3)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>بضغطة وحدة</span>
            </h1>
            <p style={{ fontSize: 18, color: COLORS.muted, maxWidth: 600, margin: "0 auto 32px", lineHeight: 1.8 }}>نظام حجوزات احترافي للعيادات والصالونات والشاليهات — إشعار واتساب فوري، لوحة تحكم كاملة</p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginBottom: 16 }}>
              <button onClick={() => setActiveTab("contact")} style={{ background: "linear-gradient(90deg,#00d4aa,#0070f3)", border: "none", borderRadius: 12, padding: "16px 36px", fontSize: 17, fontWeight: 700, cursor: "pointer", color: "#000", fontFamily: "Tajawal,sans-serif" }}>🚀 ابدأ الآن</button>
              <button onClick={() => setActiveTab("plans")} style={{ background: "transparent", border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: "16px 36px", fontSize: 17, fontWeight: 600, cursor: "pointer", color: COLORS.text, fontFamily: "Tajawal,sans-serif" }}>شوف الأسعار</button>
            </div>
            <p style={{ color: COLORS.muted, fontSize: 13 }}>✅ إعداد في 5 دقائق · ✅ دعم فني مجاني · ✅ بالدينار العراقي</p>
          </section>

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
                    <button onClick={() => setActiveTab("contact")} style={{ background: `${s.color}22`, border: `1px solid ${s.color}55`, borderRadius: 10, padding: "10px 20px", color: s.color, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "Tajawal,sans-serif" }}>ابدأ الآن ←</button>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section style={{ background: "#0d1424", padding: "60px 24px" }}>
            <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
              <h2 style={{ fontSize: 36, fontWeight: 900, color: COLORS.white, marginBottom: 12 }}>كيف يشتغل؟</h2>
              <p style={{ color: COLORS.muted, fontSize: 16, marginBottom: 48 }}>3 خطوات بس</p>
              <div className="steps-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24 }}>
                {[
                  { step: "1", title: "تواصل معنا", desc: "أرسل نوع عملك واسمه على واتساب", icon: "💬" },
                  { step: "2", title: "نفعّل حسابك", desc: "نسوي لك حساب خاص برابط حجز مخصص", icon: "⚙️" },
                  { step: "3", title: "ابدأ تستقبل الحجوزات", desc: "شارك الرابط وزبائنك يحجزون مباشرة", icon: "🚀" },
                ].map((s, i) => (
                  <div key={i} style={{ textAlign: "center" }}>
                    <div style={{ width: 52, height: 52, borderRadius: "50%", background: "linear-gradient(135deg,#00d4aa,#0070f3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", fontSize: 20, fontWeight: 900, color: "#000" }}>{s.step}</div>
                    <div style={{ fontSize: 32, marginBottom: 10 }}>{s.icon}</div>
                    <h3 style={{ fontWeight: 700, color: COLORS.white, marginBottom: 6, fontSize: 16 }}>{s.title}</h3>
                    <p style={{ color: COLORS.muted, fontSize: 13, lineHeight: 1.7 }}>{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section style={{ background: "#0d1424", padding: "80px 24px" }}>
            <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
              <div style={{ background: "linear-gradient(135deg,#0d1a2e,#0a1628)", border: `1px solid ${COLORS.accent}44`, borderRadius: 24, padding: "56px 40px" }} className="glow">
                <div style={{ fontSize: 48, marginBottom: 16 }}>🚀</div>
                <h2 style={{ fontSize: 36, fontWeight: 900, color: COLORS.white, marginBottom: 12 }}>جاهز تنظم مشروعك؟</h2>
                <p style={{ color: COLORS.muted, fontSize: 16, marginBottom: 32, lineHeight: 1.8 }}>انضم لمئات أصحاب الأعمال اللي يستخدمون موعدي اليوم</p>
                <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                  <button onClick={() => setActiveTab("contact")} style={{ background: "linear-gradient(90deg,#00d4aa,#0070f3)", border: "none", borderRadius: 12, padding: "16px 40px", fontSize: 17, fontWeight: 700, cursor: "pointer", color: "#000", fontFamily: "Tajawal,sans-serif" }}>ابدأ الآن ✓</button>
                  <button onClick={() => window.open("https://wa.me/9647739863056?text=مرحبا، أريد أعرف أكثر عن موعدي", "_blank")} style={{ background: "transparent", border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: "16px 40px", fontSize: 17, fontWeight: 600, cursor: "pointer", color: COLORS.text, fontFamily: "Tajawal,sans-serif" }}>💬 تواصل معنا</button>
                </div>
              </div>
            </div>
          </section>

          <footer style={{ borderTop: `1px solid ${COLORS.border}`, padding: "32px 24px", textAlign: "center" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg,#00d4aa,#0070f3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 900, color: "#000" }}>م</div>
              <span style={{ fontSize: 18, fontWeight: 800, color: COLORS.white }}>موعدي</span>
            </div>
            <p style={{ color: COLORS.muted, fontSize: 13 }}>نظام حجوزات ذكي للعراق 🇮🇶 — جميع الحقوق محفوظة {new Date().getFullYear()}</p>
          </footer>
        </div>
      )}

      {/* CONTACT */}
      {activeTab === "contact" && (
        <div className="fade-in" style={{ maxWidth: 600, margin: "0 auto", padding: "48px 24px" }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ fontSize: 52, marginBottom: 12 }}>🚀</div>
            <h2 style={{ fontSize: 28, fontWeight: 900, color: COLORS.white, marginBottom: 8 }}>ابدأ مع موعدي</h2>
            <p style={{ color: COLORS.muted, fontSize: 14, lineHeight: 1.8 }}>أدخل بياناتك وسنتواصل معك على واتساب لإكمال الإجراءات</p>
          </div>

          <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 20, padding: 28 }}>
            {/* القطاع */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 13, color: COLORS.muted, marginBottom: 10, fontWeight: 600 }}>نوع عملك</label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
                {Object.entries(SECTORS_DATA).map(([key, val]) => (
                  <div key={key} onClick={() => setContactSector(key)} style={{ padding: "14px 8px", borderRadius: 12, textAlign: "center", cursor: "pointer", background: contactSector === key ? `${val.color}22` : COLORS.surface, border: `2px solid ${contactSector === key ? val.color : COLORS.border}`, transition: "all 0.2s" }}>
                    <div style={{ fontSize: 26 }}>{val.icon}</div>
                    <div style={{ fontSize: 12, color: contactSector === key ? val.color : COLORS.muted, fontWeight: 600, marginTop: 6 }}>{val.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* اسم العمل */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 13, color: COLORS.muted, marginBottom: 6 }}>اسم عملك</label>
              <input type="text" placeholder="مثال: عيادة د. أحمد" value={contactName} onChange={e => setContactName(e.target.value)} style={{ width: "100%", padding: "12px 16px", borderRadius: 10, background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.text, fontSize: 14, outline: "none", fontFamily: "Tajawal,sans-serif" }} />
            </div>

            {/* رقم الهاتف */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 13, color: COLORS.muted, marginBottom: 6 }}>رقم الهاتف (واتساب)</label>
              <input type="tel" placeholder="07xx xxx xxxx" value={contactPhone} onChange={e => setContactPhone(e.target.value)} style={{ width: "100%", padding: "12px 16px", borderRadius: 10, background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.text, fontSize: 14, outline: "none", fontFamily: "Tajawal,sans-serif" }} />
            </div>

            {/* طريقة الدفع */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", fontSize: 13, color: COLORS.muted, marginBottom: 10, fontWeight: 600 }}>💳 طريقة الدفع المفضلة</label>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  { id: "whatsapp", icon: "💬", label: "دفع عبر واتساب", desc: "تتواصل معنا وتدفع يدوياً" },
                  { id: "card", icon: "💳", label: "تحويل بنكي", desc: "تحويل على بطاقة الرافدين" },
                ].map(opt => (
                  <div key={opt.id} onClick={() => setContactPayment(opt.id)} style={{ padding: "12px 16px", borderRadius: 12, background: contactPayment === opt.id ? COLORS.accentDim : COLORS.surface, border: `2px solid ${contactPayment === opt.id ? COLORS.accent : COLORS.border}`, display: "flex", alignItems: "center", gap: 12, cursor: "pointer", transition: "all 0.2s" }}>
                    <span style={{ fontSize: 22 }}>{opt.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, color: COLORS.white, fontSize: 13 }}>{opt.label}</div>
                      <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 2 }}>{opt.desc}</div>
                    </div>
                    {contactPayment === opt.id && <span style={{ color: COLORS.accent, fontSize: 18 }}>✓</span>}
                  </div>
                ))}
              </div>
            </div>

            <button onClick={handleContact} style={{ width: "100%", padding: "14px", background: contactSent ? "#00d4aa" : "linear-gradient(90deg,#00d4aa,#0070f3)", border: "none", borderRadius: 10, fontSize: 16, fontWeight: 700, cursor: "pointer", color: "#000", fontFamily: "Tajawal,sans-serif", marginBottom: 12 }}>
              {contactSent ? "✅ تم الإرسال! انتظر تواصلنا" : "📱 تواصل معنا على واتساب"}
            </button>
            <p style={{ textAlign: "center", fontSize: 12, color: COLORS.muted }}>سنرد عليك خلال ساعات قليلة ✨</p>
          </div>

          <div style={{ textAlign: "center", marginTop: 20 }}>
            <p style={{ color: COLORS.muted, fontSize: 13 }}>
              عندك حساب؟{" "}
              <a href="/client" style={{ color: COLORS.accent, textDecoration: "none", fontWeight: 700 }}>سجل دخول</a>
            </p>
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
                <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.white, marginBottom: 8 }}>{p.name}</div>
                <div style={{ marginBottom: 4 }}>
                  <span style={{ fontSize: 36, fontWeight: 900, color: p.color }}>{p.price}</span>
                  <span style={{ fontSize: 13, color: COLORS.muted }}> د.ع / شهر</span>
                </div>
                <div style={{ fontSize: 12, color: COLORS.muted, marginBottom: 20 }}>مثالي لـ {p.ideal}</div>
                <div style={{ borderTop: `1px solid ${COLORS.border}`, paddingTop: 16, marginBottom: 20 }}>
                  {p.features.map((f, j) => (
                    <div key={j} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: COLORS.text, padding: "6px 0" }}>
                      <span style={{ color: p.color }}>✓</span> {f}
                    </div>
                  ))}
                </div>
                <button onClick={() => openPlanModal(p)} style={{ width: "100%", padding: "13px", background: p.popular ? "linear-gradient(90deg,#00d4aa,#0070f3)" : "transparent", border: p.popular ? "none" : `1px solid ${p.color}`, borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer", color: p.popular ? "#000" : p.color, fontFamily: "Tajawal,sans-serif" }}>اشترك الآن</button>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}