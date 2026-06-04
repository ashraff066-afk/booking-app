"use client";
import { useState } from "react";

const COLORS = {
  bg: "#0a0e1a", surface: "#111827", card: "#1a2235",
  border: "#1e2d45", accent: "#00d4aa", accentDim: "#00d4aa22",
  text: "#e2e8f0", muted: "#64748b", white: "#ffffff",
};

export default function HowItWorksPage() {
  const [activeTab, setActiveTab] = useState("business");

  return (
    <div dir="rtl" style={{ minHeight: "100vh", background: COLORS.bg, color: COLORS.text, fontFamily: "'Tajawal','Cairo',sans-serif", paddingBottom: 60 }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;800;900&display=swap'); *{box-sizing:border-box;margin:0;padding:0}`}</style>

      {/* HEADER */}
      <div style={{ background: "linear-gradient(135deg,#0d1424,#111827)", borderBottom: `1px solid ${COLORS.border}`, padding: "32px 24px", textAlign: "center" }}>
        <div style={{ width: 60, height: 60, borderRadius: 16, background: "linear-gradient(135deg,#00d4aa,#0070f3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 900, color: "#000", margin: "0 auto 14px", boxShadow: "0 8px 32px #00d4aa44" }}>م</div>
        <h1 style={{ fontSize: 26, fontWeight: 900, color: COLORS.white, marginBottom: 8 }}>كيف يشتغل موعدي؟</h1>
        <p style={{ fontSize: 15, color: COLORS.muted }}>دليلك الكامل لاستخدام المنصة</p>
      </div>

      {/* TABS */}
      <div style={{ display: "flex", justifyContent: "center", gap: 12, padding: "24px 16px 0" }}>
        <button onClick={() => setActiveTab("business")} style={{ padding: "10px 24px", borderRadius: 10, cursor: "pointer", fontSize: 14, fontFamily: "Tajawal,sans-serif", fontWeight: 700, background: activeTab === "business" ? COLORS.accentDim : COLORS.card, color: activeTab === "business" ? COLORS.accent : COLORS.muted, border: `1px solid ${activeTab === "business" ? COLORS.accent : COLORS.border}` }}>
          🏥 لأصحاب الأعمال
        </button>
        <button onClick={() => setActiveTab("customer")} style={{ padding: "10px 24px", borderRadius: 10, cursor: "pointer", fontSize: 14, fontFamily: "Tajawal,sans-serif", fontWeight: 700, background: activeTab === "customer" ? COLORS.accentDim : COLORS.card, color: activeTab === "customer" ? COLORS.accent : COLORS.muted, border: `1px solid ${activeTab === "customer" ? COLORS.accent : COLORS.border}` }}>
          👤 للزبائن
        </button>
        <button onClick={() => setActiveTab("pwa")} style={{ padding: "10px 24px", borderRadius: 10, cursor: "pointer", fontSize: 14, fontFamily: "Tajawal,sans-serif", fontWeight: 700, background: activeTab === "pwa" ? COLORS.accentDim : COLORS.card, color: activeTab === "pwa" ? COLORS.accent : COLORS.muted, border: `1px solid ${activeTab === "pwa" ? COLORS.accent : COLORS.border}` }}>
          📱 تثبيت التطبيق
        </button>
      </div>

      <div style={{ maxWidth: 700, margin: "0 auto", padding: "24px 16px" }}>

        {/* لأصحاب الأعمال */}
        {activeTab === "business" && (
          <div>
            <div style={{ background: COLORS.accentDim, border: `1px solid ${COLORS.accent}44`, borderRadius: 14, padding: "14px 20px", marginBottom: 24, textAlign: "center" }}>
              <p style={{ color: COLORS.accent, fontWeight: 700, fontSize: 14 }}>🎁 أسبوعين مجاناً — بدون أي تعهد</p>
            </div>

            {[
              {
                step: "1",
                icon: "📝",
                title: "سجل حسابك",
                desc: "روح لـ maw3idi.org واضغط 'ابدأ الآن' — أدخل اسم عملك ونوعه ورقمك وإيميلك وكلمة سر.",
                note: "✅ التسجيل مجاني وما يأخذ أكثر من دقيقتين",
              },
              {
                step: "2",
                icon: "✅",
                title: "تفعيل الحساب",
                desc: "بعد التسجيل نتواصل معك على واتساب لتأكيد بياناتك وتفعيل حسابك. بعد التفعيل يصير عندك أسبوعين مجاناً.",
                note: "⚡ التفعيل يصير خلال ساعات",
              },
              {
                step: "3",
                icon: "📅",
                title: "اضبط جدول دوامك",
                desc: "من لوحة التحكم — روح لـ 'جدول الدوام' وحدد أيام عملك وأوقات الصباح والمساء.",
                note: "🕐 تقدر تحدد فترة صباح ومساء بشكل منفصل",
              },
              {
                step: "4",
                icon: "🛎️",
                title: "أضف خدماتك",
                desc: "من قسم 'الخدمات' أضف الخدمات اللي تقدمها مع المدة والسعر — ستظهر للزبائن عند الحجز.",
                note: "💡 تقدر تضيف خدمات افتراضية بضغطة وحدة",
              },
              {
                step: "5",
                icon: "🔗",
                title: "شارك رابطك",
                desc: "كل حساب عنده رابط خاص — مثل maw3idi.org/book/your-name — شاركه على واتساب والانستا وكل مكان.",
                note: "📱 الزبون يفتح الرابط ويحجز مباشرة بدون تسجيل",
              },
              {
                step: "6",
                icon: "📱",
                title: "استقبل إشعارات الحجز",
                desc: "كل ما يجي حجز جديد يوصلك إشعار على واتساب فوراً مع اسم الزبون وهاتفه والخدمة والوقت.",
                note: "🔔 ما تفوتك أي حجز",
              },
              {
                step: "7",
                icon: "🎛️",
                title: "أدر حجوزاتك",
                desc: "من لوحة التحكم تقدر تأكد أو تلغي الحجوزات وترسل تذكيرات للزبائن على واتساب.",
                note: "📊 وعندك إحصائيات شهرية واضحة",
              },
            ].map((s, i) => (
              <div key={i} style={{ display: "flex", gap: 16, marginBottom: 20 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg,#00d4aa,#0070f3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 900, color: "#000", flexShrink: 0 }}>{s.step}</div>
                <div style={{ flex: 1, background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: "16px 18px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: 22 }}>{s.icon}</span>
                    <span style={{ fontWeight: 800, color: COLORS.white, fontSize: 15 }}>{s.title}</span>
                  </div>
                  <p style={{ color: COLORS.muted, fontSize: 13, lineHeight: 1.8, marginBottom: 8 }}>{s.desc}</p>
                  <p style={{ color: COLORS.accent, fontSize: 12, fontWeight: 600 }}>{s.note}</p>
                </div>
              </div>
            ))}

            <div style={{ background: "linear-gradient(135deg,#00d4aa22,#0070f322)", border: `1px solid ${COLORS.accent}44`, borderRadius: 16, padding: 24, textAlign: "center", marginTop: 8 }}>
              <p style={{ color: COLORS.white, fontWeight: 800, fontSize: 16, marginBottom: 12 }}>جاهز تبدأ؟ 🚀</p>
              <button onClick={() => window.location.href = "/"} style={{ background: "linear-gradient(90deg,#00d4aa,#0070f3)", border: "none", borderRadius: 12, padding: "13px 32px", fontSize: 15, fontWeight: 700, cursor: "pointer", color: "#000", fontFamily: "Tajawal,sans-serif" }}>
                سجل مجاناً الآن
              </button>
            </div>
          </div>
        )}

        {/* للزبائن */}
        {activeTab === "customer" && (
          <div>
            {[
              {
                step: "1",
                icon: "🔍",
                title: "دور على الخدمة",
                desc: "افتح maw3idi.org/explore وابحث عن العيادة أو الصالون اللي تريده — تقدر تفلتر بالمدينة أو التخصص.",
                note: "🗺️ تقدر تشوف موقع العمل على خريطة Google",
              },
              {
                step: "2",
                icon: "👤",
                title: "شوف البروفايل",
                desc: "اضغط على أي عمل وشوف بروفايله الكامل — الخدمات والأسعار وأوقات الدوام والتقييمات.",
                note: "⭐ تقدر تشوف تقييمات الزبائن الثانيين",
              },
              {
                step: "3",
                icon: "📅",
                title: "احجز موعدك",
                desc: "اضغط 'احجز موعدك الآن' — اختر الخدمة والتاريخ والوقت المناسب وأدخل اسمك ورقمك.",
                note: "✅ ما تحتاج تسجل حساب — الحجز مباشر",
              },
              {
                step: "4",
                icon: "📱",
                title: "تأكيد الحجز",
                desc: "بعد الحجز يوصلك رقم حجز خاص — وصاحب العمل يتواصل معك على واتساب للتأكيد.",
                note: "🔔 تقدر تقيم تجربتك بعد الحجز",
              },
            ].map((s, i) => (
              <div key={i} style={{ display: "flex", gap: 16, marginBottom: 20 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg,#00d4aa,#0070f3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 900, color: "#000", flexShrink: 0 }}>{s.step}</div>
                <div style={{ flex: 1, background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: "16px 18px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: 22 }}>{s.icon}</span>
                    <span style={{ fontWeight: 800, color: COLORS.white, fontSize: 15 }}>{s.title}</span>
                  </div>
                  <p style={{ color: COLORS.muted, fontSize: 13, lineHeight: 1.8, marginBottom: 8 }}>{s.desc}</p>
                  <p style={{ color: COLORS.accent, fontSize: 12, fontWeight: 600 }}>{s.note}</p>
                </div>
              </div>
            ))}

            <div style={{ background: "linear-gradient(135deg,#00d4aa22,#0070f322)", border: `1px solid ${COLORS.accent}44`, borderRadius: 16, padding: 24, textAlign: "center", marginTop: 8 }}>
              <p style={{ color: COLORS.white, fontWeight: 800, fontSize: 16, marginBottom: 12 }}>دور على خدمة قريبة منك 🔍</p>
              <button onClick={() => window.location.href = "/explore"} style={{ background: "linear-gradient(90deg,#00d4aa,#0070f3)", border: "none", borderRadius: 12, padding: "13px 32px", fontSize: 15, fontWeight: 700, cursor: "pointer", color: "#000", fontFamily: "Tajawal,sans-serif" }}>
                استكشف الخدمات
              </button>
            </div>
          </div>
        )}

        {/* تثبيت التطبيق */}
        {activeTab === "pwa" && (
          <div>
            <div style={{ background: COLORS.accentDim, border: `1px solid ${COLORS.accent}44`, borderRadius: 14, padding: "14px 20px", marginBottom: 24, textAlign: "center" }}>
              <p style={{ color: COLORS.accent, fontWeight: 700, fontSize: 14 }}>📱 خلّي موعدي على شاشتك مثل أي تطبيق!</p>
            </div>

            {/* الايفون */}
            <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 20, marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <span style={{ fontSize: 28 }}>🍎</span>
                <span style={{ fontWeight: 800, color: COLORS.white, fontSize: 16 }}>iPhone (iOS)</span>
              </div>
              {[
                { step: "1", text: "افتح maw3idi.org بمتصفح Safari (مهم — مو Chrome)" },
                { step: "2", text: "اضغط زر المشاركة 📤 (المربع والسهم للأعلى بالأسفل)" },
                { step: "3", text: "اسكرول للأسفل واضغط 'Add to Home Screen' أو 'إضافة إلى الشاشة الرئيسية'" },
                { step: "4", text: "اضغط 'Add' أو 'إضافة' وخلص!" },
              ].map((s, i) => (
                <div key={i} style={{ display: "flex", gap: 12, marginBottom: 12, alignItems: "flex-start" }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: COLORS.accentDim, border: `1px solid ${COLORS.accent}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: COLORS.accent, flexShrink: 0 }}>{s.step}</div>
                  <p style={{ color: COLORS.text, fontSize: 13, lineHeight: 1.7, paddingTop: 4 }}>{s.text}</p>
                </div>
              ))}
            </div>

            {/* الأندرويد */}
            <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 20, marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <span style={{ fontSize: 28 }}>🤖</span>
                <span style={{ fontWeight: 800, color: COLORS.white, fontSize: 16 }}>Android</span>
              </div>
              {[
                { step: "1", text: "افتح maw3idi.org بمتصفح Chrome" },
                { step: "2", text: "اضغط النقاط الثلاث ⋮ بالأعلى اليمين" },
                { step: "3", text: "اضغط 'Add to Home Screen' أو 'إضافة إلى الشاشة الرئيسية'" },
                { step: "4", text: "اضغط 'Add' وخلص!" },
              ].map((s, i) => (
                <div key={i} style={{ display: "flex", gap: 12, marginBottom: 12, alignItems: "flex-start" }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: COLORS.accentDim, border: `1px solid ${COLORS.accent}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: COLORS.accent, flexShrink: 0 }}>{s.step}</div>
                  <p style={{ color: COLORS.text, fontSize: 13, lineHeight: 1.7, paddingTop: 4 }}>{s.text}</p>
                </div>
              ))}
            </div>

            <div style={{ background: "#f59e0b11", border: "1px solid #f59e0b44", borderRadius: 14, padding: 16, textAlign: "center" }}>
              <p style={{ color: "#f59e0b", fontSize: 13, fontWeight: 600 }}>⚠️ مهم للايفون: لازم تستخدم Safari مو Chrome حتى يشتغل الخيار</p>
            </div>
          </div>
        )}

      </div>

      {/* زر الرجوع */}
      <div style={{ textAlign: "center", padding: "0 16px" }}>
        <button onClick={() => window.location.href = "/"} style={{ background: "transparent", border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: "12px 32px", fontSize: 14, fontWeight: 700, cursor: "pointer", color: COLORS.muted, fontFamily: "Tajawal,sans-serif" }}>
          ← رجوع للرئيسية
        </button>
      </div>
    </div>
  );
}