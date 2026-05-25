"use client";
import { useState } from "react";

const COLORS = {
  bg: "#0a0e1a",
  surface: "#111827",
  card: "#1a2235",
  border: "#1e2d45",
  accent: "#00d4aa",
  accentDim: "#00d4aa22",
  accentHover: "#00ffcc",
  gold: "#f59e0b",
  red: "#ef4444",
  text: "#e2e8f0",
  muted: "#64748b",
  white: "#ffffff",
};

const SECTORS = [
  { id: "clinic", label: "عيادات", icon: "🏥", color: "#3b82f6", bookings: 24, revenue: "1,200,000" },
  { id: "salon", label: "صالونات", icon: "✂️", color: "#ec4899", bookings: 38, revenue: "950,000" },
  { id: "hotel", label: "فنادق / شاليهات", icon: "🏨", color: "#f59e0b", bookings: 12, revenue: "3,600,000" },
];

const PLANS = [
  {
    name: "أساسي",
    price: "25,000",
    color: "#64748b",
    features: ["حجز غير محدود", "تذكير واتساب", "لوحة تحكم", "دعم فني"],
    ideal: "صالون صغير",
  },
  {
    name: "احترافي",
    price: "60,000",
    color: "#00d4aa",
    features: ["كل مزايا الأساسي", "ملف عميل كامل", "تقارير شهرية", "أكثر من موظف", "تطبيق موبايل"],
    ideal: "عيادة / صالون كبير",
    popular: true,
  },
  {
    name: "بريميوم",
    price: "120,000",
    color: "#f59e0b",
    features: ["كل مزايا الاحترافي", "حجز غرف متعدد", "دفع أونلاين", "API مخصص", "مدير حساب"],
    ideal: "فندق / شاليه",
  },
];

const STEPS = [
  { num: "01", title: "سجّل على المنصة", desc: "أنشئ حساب مجاني خلال دقيقتين. لا تحتاج بطاقة ائتمان.", icon: "🚀", color: "#3b82f6" },
  { num: "02", title: "اختر قطاعك", desc: "عيادة، صالون، أو شاليه — كل واحد له لوحة تحكم مخصصة.", icon: "🎯", color: "#00d4aa" },
  { num: "03", title: "شارك رابط الحجز", desc: "أرسل رابطك لعملائك عبر واتساب أو انستغرام وابدأ فوراً.", icon: "🔗", color: "#ec4899" },
  { num: "04", title: "استلم الحجوزات", desc: "الحجوزات تصلك بالواتساب وتظهر في لوحتك تلقائياً.", icon: "✅", color: "#f59e0b" },
];

const BOOKINGS = [
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

  return (
    <div
      dir="rtl"
      style={{
        minHeight: "100vh",
        background: COLORS.bg,
        color: COLORS.text,
        fontFamily: "'Tajawal', 'Cairo', sans-serif",
        overflowX: "hidden",
      }}
    >
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
        .step-num { background: linear-gradient(135deg, #00d4aa22, #00d4aa44); }
        .pulse { animation: pulse 2s infinite; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.6} }
        .fade-in { animation: fadeIn 0.5s ease; }
        @keyframes fadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        .badge-live { animation: badgePulse 1.5s infinite; }
        @keyframes badgePulse { 0%,100%{box-shadow:0 0 0 0 #00d4aa44} 50%{box-shadow:0 0 0 6px #00d4aa00} }
      `}</style>

      {/* NAV */}
      <nav style={{
        background: "#0d1424",
        borderBottom: `1px solid ${COLORS.border}`,
        padding: "0 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: 64,
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: "linear-gradient(135deg, #00d4aa, #0070f3)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18, fontWeight: 900,
          }}>ح</div>
          <span style={{ fontSize: 20, fontWeight: 800, color: COLORS.white }}>حجوزاتي</span>
          <span style={{
            fontSize: 10, background: COLORS.accent, color: "#000",
            padding: "2px 8px", borderRadius: 20, fontWeight: 700, marginRight: 4,
          }}>BETA</span>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {[
            { id: "dashboard", label: "لوحة التحكم" },
            { id: "demo", label: "جرب المنصة" },
            { id: "plans", label: "الأسعار" },
            { id: "start", label: "ابدأ الآن" },
          ].map(t => (
            <button
              key={t.id}
              className="tab-btn"
              onClick={() => setActiveTab(t.id)}
              style={{
                padding: "8px 16px",
                borderRadius: 8,
                border: "none",
                cursor: "pointer",
                fontSize: 14,
                fontFamily: "Tajawal, sans-serif",
                fontWeight: activeTab === t.id ? 700 : 400,
                background: activeTab === t.id ? COLORS.accentDim : "transparent",
                color: activeTab === t.id ? COLORS.accent : COLORS.muted,
                borderBottom: activeTab === t.id ? `2px solid ${COLORS.accent}` : "2px solid transparent",
              }}
            >{t.label}</button>
          ))}
        </div>
        <div style={{
          background: "linear-gradient(90deg, #00d4aa, #0070f3)",
          padding: "8px 20px", borderRadius: 8, fontSize: 14,
          fontWeight: 700, cursor: "pointer", color: "#000",
        }}>ابدأ مجاناً</div>
      </nav>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }} className="fade-in">

        {/* DASHBOARD TAB */}
        {activeTab === "dashboard" && (
          <div>
            <div style={{
              background: "linear-gradient(135deg, #0d1a2e 0%, #0a1628 50%, #0d1a2e 100%)",
              border: `1px solid ${COLORS.border}`,
              borderRadius: 20,
              padding: "48px 40px",
              marginBottom: 32,
              position: "relative",
              overflow: "hidden",
            }}>
              <div style={{
                position: "absolute", top: -60, left: -60,
                width: 300, height: 300, borderRadius: "50%",
                background: "radial-gradient(circle, #00d4aa15, transparent 70%)",
                pointerEvents: "none",
              }} />
              <div style={{
                position: "absolute", bottom: -80, right: 100,
                width: 400, height: 400, borderRadius: "50%",
                background: "radial-gradient(circle, #0070f315, transparent 70%)",
                pointerEvents: "none",
              }} />
              <div style={{ position: "relative", zIndex: 1 }}>
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  background: COLORS.accentDim, border: `1px solid ${COLORS.accent}44`,
                  borderRadius: 20, padding: "6px 16px", marginBottom: 20,
                }}>
                  <span className="pulse" style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS.accent, display: "inline-block" }} />
                  <span style={{ fontSize: 13, color: COLORS.accent, fontWeight: 600 }}>منصة SaaS للحجوزات — العراق</span>
                </div>
                <h1 style={{ fontSize: 42, fontWeight: 900, lineHeight: 1.3, marginBottom: 16 }}>
                  نظام حجوزات ذكي<br />
                  <span style={{ background: "linear-gradient(90deg, #00d4aa, #0070f3)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                    لكل قطاع بالعراق
                  </span>
                </h1>
                <p style={{ fontSize: 18, color: COLORS.muted, maxWidth: 500, lineHeight: 1.8, marginBottom: 28 }}>
                  عيادات، صالونات، فنادق وشاليهات — منصة واحدة، اشتراك شهري، تذكير تلقائي بالواتساب
                </p>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <button onClick={() => setActiveTab("demo")} style={{
                    background: "linear-gradient(90deg, #00d4aa, #0070f3)",
                    border: "none", borderRadius: 10, padding: "14px 28px",
                    fontSize: 16, fontWeight: 700, cursor: "pointer", color: "#000",
                    fontFamily: "Tajawal, sans-serif",
                  }}>جرب المنصة الآن</button>
                  <button onClick={() => setActiveTab("plans")} style={{
                    background: "transparent", border: `1px solid ${COLORS.border}`,
                    borderRadius: 10, padding: "14px 28px", fontSize: 16,
                    fontWeight: 600, cursor: "pointer", color: COLORS.text,
                    fontFamily: "Tajawal, sans-serif",
                  }}>شوف الأسعار</button>
                </div>
              </div>
            </div>

            {/* STATS */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 32 }}>
              {[
                { label: "عملاء مسجلين", value: "1,240", icon: "👥", trend: "+12%" },
                { label: "حجوزات اليوم", value: "74", icon: "📅", trend: "+8%" },
                { label: "الإيرادات (د.ع)", value: "5.7M", icon: "💰", trend: "+22%" },
                { label: "نسبة الرضا", value: "98%", icon: "⭐", trend: "+2%" },
              ].map((s, i) => (
                <div key={i} className="card-hover" style={{
                  background: COLORS.card, border: `1px solid ${COLORS.border}`,
                  borderRadius: 14, padding: "20px 20px",
                }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
                  <div style={{ fontSize: 26, fontWeight: 800, color: COLORS.white }}>{s.value}</div>
                  <div style={{ fontSize: 13, color: COLORS.muted, marginTop: 4 }}>{s.label}</div>
                  <div style={{ fontSize: 12, color: COLORS.accent, marginTop: 6, fontWeight: 600 }}>{s.trend} هذا الشهر</div>
                </div>
              ))}
            </div>

            {/* SECTORS + RECENT BOOKINGS */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 24 }}>
                <h3 style={{ fontWeight: 700, marginBottom: 20, color: COLORS.white }}>القطاعات المدعومة</h3>
                {SECTORS.map(s => (
                  <div key={s.id} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "14px 16px", borderRadius: 10, marginBottom: 10,
                    background: activeSector === s.id ? `${s.color}18` : "#ffffff08",
                    border: `1px solid ${activeSector === s.id ? s.color + "55" : "transparent"}`,
                    cursor: "pointer", transition: "all 0.2s",
                  }} onClick={() => setActiveSector(s.id)}>
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
                  <span className="badge-live" style={{
                    background: COLORS.accentDim, color: COLORS.accent,
                    fontSize: 11, padding: "3px 10px", borderRadius: 20, fontWeight: 600,
                    border: `1px solid ${COLORS.accent}44`,
                  }}>● مباشر</span>
                </div>
                {BOOKINGS.map((b, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "10px 0", borderBottom: i < BOOKINGS.length - 1 ? `1px solid ${COLORS.border}` : "none",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: "50%",
                        background: COLORS.surface, display: "flex",
                        alignItems: "center", justifyContent: "center", fontSize: 16,
                      }}>{b.sector}</div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14, color: COLORS.white }}>{b.name}</div>
                        <div style={{ fontSize: 12, color: COLORS.muted }}>{b.service} · {b.time}</div>
                      </div>
                    </div>
                    <span style={{
                      fontSize: 11, padding: "4px 10px", borderRadius: 20, fontWeight: 600,
                      background: `${statusColor[b.status]}22`,
                      color: statusColor[b.status],
                      border: `1px solid ${statusColor[b.status]}44`,
                    }}>{statusLabel[b.status]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* DEMO TAB */}
        {activeTab === "demo" && (
          <div>
            <h2 style={{ fontSize: 30, fontWeight: 800, marginBottom: 8 }}>جرب نظام الحجز</h2>
            <p style={{ color: COLORS.muted, marginBottom: 28 }}>هذا مثال على شكل صفحة الحجز اللي تشوفها عملائك</p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
              <div style={{
                background: COLORS.card, border: `1px solid ${COLORS.border}`,
                borderRadius: 16, padding: 28,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 12,
                    background: "linear-gradient(135deg, #3b82f6, #0070f3)",
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
                  }}>🏥</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 18, color: COLORS.white }}>عيادة د. أحمد سالم</div>
                    <div style={{ fontSize: 13, color: COLORS.muted }}>طب عام — بغداد، الكرادة</div>
                  </div>
                </div>

                {[
                  { label: "اسمك الكامل", placeholder: "مثال: محمد علي", type: "text" },
                  { label: "رقم الهاتف (واتساب)", placeholder: "07xx xxx xxxx", type: "tel" },
                ].map((f, i) => (
                  <div key={i} style={{ marginBottom: 16 }}>
                    <label style={{ display: "block", fontSize: 13, color: COLORS.muted, marginBottom: 6, fontWeight: 500 }}>{f.label}</label>
                    <input
                      type={f.type}
                      placeholder={f.placeholder}
                      style={{
                        width: "100%", padding: "12px 16px", borderRadius: 10,
                        background: COLORS.surface, border: `1px solid ${COLORS.border}`,
                        color: COLORS.text, fontSize: 14, outline: "none",
                        fontFamily: "Tajawal, sans-serif",
                      }}
                    />
                  </div>
                ))}

                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", fontSize: 13, color: COLORS.muted, marginBottom: 6, fontWeight: 500 }}>نوع الخدمة</label>
                  <select style={{
                    width: "100%", padding: "12px 16px", borderRadius: 10,
                    background: COLORS.surface, border: `1px solid ${COLORS.border}`,
                    color: COLORS.text, fontSize: 14, outline: "none",
                    fontFamily: "Tajawal, sans-serif",
                  }}>
                    <option>كشف عام</option>
                    <option>استشارة طبية</option>
                    <option>فحوصات</option>
                    <option>متابعة</option>
                  </select>
                </div>

                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: "block", fontSize: 13, color: COLORS.muted, marginBottom: 10, fontWeight: 500 }}>اختر الموعد</label>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
                    {["9:00 ص", "10:00 ص", "11:00 ص", "12:00 م", "2:00 م", "3:00 م"].map((t, i) => (
                      <div key={i} style={{
                        padding: "10px", borderRadius: 8, textAlign: "center",
                        background: i === 1 ? COLORS.accentDim : COLORS.surface,
                        border: `1px solid ${i === 1 ? COLORS.accent : COLORS.border}`,
                        color: i === 1 ? COLORS.accent : COLORS.text,
                        fontSize: 13, cursor: "pointer", fontWeight: i === 1 ? 700 : 400,
                        transition: "all 0.2s",
                      }}>{t}</div>
                    ))}
                  </div>
                </div>

                <button style={{
                  width: "100%", padding: "14px",
                  background: "linear-gradient(90deg, #00d4aa, #0070f3)",
                  border: "none", borderRadius: 10, fontSize: 16,
                  fontWeight: 700, cursor: "pointer", color: "#000",
                  fontFamily: "Tajawal, sans-serif",
                }}>✅ تأكيد الحجز</button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{
                  background: COLORS.card, border: `1px solid ${COLORS.border}`,
                  borderRadius: 16, padding: 24,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                    <span style={{ fontSize: 24 }}>💬</span>
                    <span style={{ fontWeight: 700, color: COLORS.white }}>تذكير تلقائي بالواتساب</span>
                  </div>
                  <div style={{ background: "#075e54", borderRadius: 12, padding: 16 }}>
                    <div style={{
                      background: "#dcf8c6", borderRadius: "12px 12px 2px 12px",
                      padding: "10px 14px", maxWidth: "80%", marginRight: "auto",
                      color: "#111", fontSize: 13, lineHeight: 1.6,
                    }}>
                      <div style={{ fontWeight: 700, marginBottom: 4 }}>تذكير موعدك 🏥</div>
                      <div>السلام عليكم محمد،</div>
                      <div>موعدك غداً الساعة 10:00 ص</div>
                      <div>د. أحمد سالم — الكرادة</div>
                      <div style={{ marginTop: 6, color: "#128C7E", fontWeight: 600 }}>تأكيد الحضور؟ اضغط هنا ✓</div>
                      <div style={{ fontSize: 10, color: "#666", marginTop: 4, textAlign: "left" }}>9:00 م ✓✓</div>
                    </div>
                  </div>
                </div>

                <div style={{
                  background: COLORS.card, border: `1px solid ${COLORS.border}`,
                  borderRadius: 16, padding: 24,
                }}>
                  <h4 style={{ fontWeight: 700, marginBottom: 16, color: COLORS.white }}>⚡ الميزات الرئيسية</h4>
                  {[
                    "تذكير تلقائي بالواتساب قبل الموعد بساعة",
                    "لوحة تحكم عربية كاملة",
                    "رابط حجز خاص بكل عمل",
                    "تقارير يومية وشهرية",
                    "دعم فني عراقي",
                    "دفع بالدينار العراقي",
                  ].map((f, i) => (
                    <div key={i} style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "8px 0", borderBottom: i < 5 ? `1px solid ${COLORS.border}` : "none",
                    }}>
                      <span style={{ color: COLORS.accent, fontSize: 16 }}>✓</span>
                      <span style={{ fontSize: 14, color: COLORS.text }}>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PLANS TAB */}
        {activeTab === "plans" && (
          <div>
            <h2 style={{ fontSize: 30, fontWeight: 800, marginBottom: 8, textAlign: "center" }}>باقات الاشتراك</h2>
            <p style={{ color: COLORS.muted, marginBottom: 32, textAlign: "center" }}>اشتراك شهري بالدينار العراقي — ألغِ وقت ما تريد</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20, marginBottom: 40 }}>
              {PLANS.map((p, i) => (
                <div key={i} className="plan-card" onClick={() => setSelectedPlan(p.name)} style={{
                  background: COLORS.card,
                  border: `2px solid ${selectedPlan === p.name ? p.color : COLORS.border}`,
                  borderRadius: 18, padding: 28, position: "relative",
                  boxShadow: selectedPlan === p.name ? `0 0 30px ${p.color}33` : "none",
                }}>
                  {p.popular && (
                    <div style={{
                      position: "absolute", top: -12, right: 20,
                      background: p.color, color: "#000", fontSize: 11,
                      padding: "4px 14px", borderRadius: 20, fontWeight: 700,
                    }}>الأكثر مبيعاً</div>
                  )}
                  <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.white, marginBottom: 8 }}>{p.name}</div>
                  <div style={{ marginBottom: 4 }}>
                    <span style={{ fontSize: 36, fontWeight: 900, color: p.color }}>{p.price}</span>
                    <span style={{ fontSize: 13, color: COLORS.muted }}> د.ع / شهر</span>
                  </div>
                  <div style={{ fontSize: 12, color: COLORS.muted, marginBottom: 20 }}>مثالي لـ {p.ideal}</div>
                  <div style={{ borderTop: `1px solid ${COLORS.border}`, paddingTop: 16 }}>
                    {p.features.map((f, j) => (
                      <div key={j} style={{
                        display: "flex", alignItems: "center", gap: 8,
                        fontSize: 13, color: COLORS.text, padding: "6px 0",
                      }}>
                        <span style={{ color: p.color }}>✓</span> {f}
                      </div>
                    ))}
                  </div>
                  <button style={{
                    width: "100%", marginTop: 20, padding: "12px",
                    background: selectedPlan === p.name ? p.color : "transparent",
                    border: `1px solid ${p.color}`,
                    borderRadius: 10, fontSize: 14, fontWeight: 700,
                    cursor: "pointer", color: selectedPlan === p.name ? "#000" : p.color,
                    fontFamily: "Tajawal, sans-serif", transition: "all 0.2s",
                  }}>اختر هذه الباقة</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* START TAB */}
        {activeTab === "start" && (
          <div>
            <h2 style={{ fontSize: 30, fontWeight: 800, marginBottom: 8 }}>🗺️ خارطة طريقك</h2>
            <p style={{ color: COLORS.muted, marginBottom: 32 }}>شسوي بالضبط حتى تبلش وتبيع هالنظام</p>

            <div style={{ marginBottom: 40 }}>
              <h3 style={{ fontWeight: 700, marginBottom: 20, fontSize: 18, color: COLORS.accent }}>المرحلة 1 — البناء (أسبوعين)</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 16 }}>
                {[
                  { step: "1", title: "سجّل دومين وهوستينج", desc: "namecheap.com أو GoDaddy — دومين مثل hojozati.com بـ 15$ سنوياً. هوستينج Vercel مجاني للبداية.", icon: "🌐" },
                  { step: "2", title: "بنِ الواجهة (Frontend)", desc: "استخدم Next.js + Tailwind. الصفحات: الرئيسية، صفحة حجز، لوحة تحكم العميل. انسخ هالنظام وطوّره.", icon: "💻" },
                  { step: "3", title: "بنِ الباكند + قاعدة البيانات", desc: "Node.js + Supabase (مجاني). جداول: عملاء، حجوزات، خدمات، تذكيرات.", icon: "🗄️" },
                  { step: "4", title: "ربط الواتساب API", desc: "استخدم WhatsApp Business API أو Twilio. أرسل تذكير تلقائي قبل الموعد بساعة.", icon: "📲" },
                ].map((s, i) => (
                  <div key={i} style={{
                    background: COLORS.card, border: `1px solid ${COLORS.border}`,
                    borderRadius: 14, padding: 20, display: "flex", gap: 16,
                  }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                      background: COLORS.accentDim, border: `1px solid ${COLORS.accent}44`,
                      display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
                    }}>{s.icon}</div>
                    <div>
                      <div style={{ fontSize: 11, color: COLORS.accent, fontWeight: 700, marginBottom: 4 }}>خطوة {s.step}</div>
                      <div style={{ fontWeight: 700, color: COLORS.white, marginBottom: 6 }}>{s.title}</div>
                      <div style={{ fontSize: 13, color: COLORS.muted, lineHeight: 1.7 }}>{s.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 40 }}>
              <h3 style={{ fontWeight: 700, marginBottom: 20, fontSize: 18, color: "#f59e0b" }}>المرحلة 2 — الإطلاق (الأسبوع 3)</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
                {[
                  { icon: "🎁", title: "5 عملاء مجانيين", desc: "روّح على صالون أو عيادة قريبة منك وعرّف النظام مجاناً شهر." },
                  { icon: "📱", title: "فيديو على تيك توك", desc: "صوّر فيديو قصير كيف يشتغل النظام. الناس تحب تشوف النتيجة." },
                  { icon: "💬", title: "مجموعات واتساب", desc: "انضم لمجموعات أصحاب المحلات والعيادات وشارك رابطك." },
                ].map((s, i) => (
                  <div key={i} style={{
                    background: COLORS.card, border: `1px solid ${COLORS.border}`,
                    borderRadius: 14, padding: 20,
                  }}>
                    <div style={{ fontSize: 32, marginBottom: 12 }}>{s.icon}</div>
                    <div style={{ fontWeight: 700, color: COLORS.white, marginBottom: 8 }}>{s.title}</div>
                    <div style={{ fontSize: 13, color: COLORS.muted, lineHeight: 1.7 }}>{s.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 32 }}>
              <h3 style={{ fontWeight: 700, marginBottom: 20, fontSize: 18, color: "#ec4899" }}>المرحلة 3 — التحويل لمدفوع (الشهر 2)</h3>
              <div style={{
                background: COLORS.card, border: `1px solid ${COLORS.border}`,
                borderRadius: 16, padding: 24,
              }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
                  {[
                    { label: "5 عملاء × 25K", value: "125,000 د.ع", note: "باقة أساسي" },
                    { label: "5 عملاء × 60K", value: "300,000 د.ع", note: "باقة احترافي" },
                    { label: "2 عملاء × 120K", value: "240,000 د.ع", note: "باقة بريميوم" },
                    { label: "المجموع الشهري", value: "665,000 د.ع", note: "≈ 500$ شهرياً", highlight: true },
                  ].map((r, i) => (
                    <div key={i} style={{
                      background: r.highlight ? COLORS.accentDim : COLORS.surface,
                      border: `1px solid ${r.highlight ? COLORS.accent : COLORS.border}`,
                      borderRadius: 12, padding: 16, textAlign: "center",
                    }}>
                      <div style={{ fontSize: 12, color: COLORS.muted, marginBottom: 8 }}>{r.label}</div>
                      <div style={{ fontSize: 18, fontWeight: 800, color: r.highlight ? COLORS.accent : COLORS.white }}>{r.value}</div>
                      <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 4 }}>{r.note}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{
              background: "linear-gradient(135deg, #0d1a2e, #0a1628)",
              border: `1px solid ${COLORS.accent}44`,
              borderRadius: 16, padding: 32, textAlign: "center",
            }} className="glow">
              <div style={{ fontSize: 32, marginBottom: 12 }}>🚀</div>
              <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8, color: COLORS.white }}>جاهز تبلش؟</h3>
              <p style={{ color: COLORS.muted, marginBottom: 20 }}>ابعتلي رسالة وأساعدك تبني النظام خطوة بخطوة</p>
              <button style={{
                background: "linear-gradient(90deg, #00d4aa, #0070f3)",
                border: "none", borderRadius: 10, padding: "14px 40px",
                fontSize: 16, fontWeight: 700, cursor: "pointer", color: "#000",
                fontFamily: "Tajawal, sans-serif",
              }}>ابدأ مشروعك الآن ✓</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}