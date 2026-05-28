"use client";
import { useState } from "react";
import { supabase } from "../../supabase";

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

export default function ClientRegister() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [businessName, setBusinessName] = useState("");
  const [phone, setPhone] = useState("");
  const [sector, setSector] = useState("clinic");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async () => {
    if (!email || !password || !businessName || !phone) {
      setError("يرجى إدخال جميع البيانات");
      return;
    }
    if (password.length < 6) {
      setError("كلمة السر يجب أن تكون 6 أحرف على الأقل");
      return;
    }
    setLoading(true);
    setError("");

    const { data, error: signUpError } = await supabase.auth.signUp({ email, password });

    if (signUpError) {
      if (signUpError.message.includes("already registered")) {
        setError("هذا الإيميل مسجل مسبقاً — جرب تسجيل الدخول");
      } else {
        setError(`خطأ: ${signUpError.message}`);
      }
      setLoading(false);
      return;
    }

    if (data.user) {
      const { error: insertError } = await supabase.from("clients").insert([{
        user_id: data.user.id,
        business_name: businessName,
        sector,
        phone,
        is_active: false,
      }]);
      if (insertError) {
        setError(`خطأ في حفظ البيانات: ${insertError.message}`);
        setLoading(false);
        return;
      }
      window.location.href = "/client/dashboard";
    } else {
      setError("تأكد من إيميلك — راجع البريد الإلكتروني للتفعيل");
    }
    setLoading(false);
  };

  return (
    <div dir="rtl" style={{
      minHeight: "100vh", background: COLORS.bg, color: COLORS.text,
      fontFamily: "'Tajawal', 'Cairo', sans-serif",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
    }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;800&display=swap'); * { box-sizing: border-box; margin: 0; padding: 0; }`}</style>
      <div style={{
        background: COLORS.card, border: `1px solid ${COLORS.border}`,
        borderRadius: 20, padding: 40, width: 420, maxWidth: "100%",
      }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14, margin: "0 auto 16px",
            background: "linear-gradient(135deg, #00d4aa, #0070f3)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 24, fontWeight: 900, color: "#000",
          }}>م</div>
          <h2 style={{ fontWeight: 800, fontSize: 22, color: COLORS.white }}>إنشاء حساب جديد</h2>
          <p style={{ color: COLORS.muted, fontSize: 14, marginTop: 8 }}>سجل عملك وابدأ تستقبل الحجوزات</p>
        </div>

        {error && (
          <div style={{
            background: "#ef444422", border: "1px solid #ef4444",
            borderRadius: 10, padding: "10px 14px", marginBottom: 16,
            color: "#ef4444", fontSize: 13,
          }}>{error}</div>
        )}

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 13, color: COLORS.muted, marginBottom: 6 }}>اسم العمل</label>
          <input type="text" placeholder="مثال: عيادة د. أحمد" value={businessName} onChange={e => setBusinessName(e.target.value)} style={{ width: "100%", padding: "12px 16px", borderRadius: 10, background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.text, fontSize: 14, outline: "none", fontFamily: "Tajawal, sans-serif" }} />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 13, color: COLORS.muted, marginBottom: 6 }}>نوع العمل</label>
          <select value={sector} onChange={e => setSector(e.target.value)} style={{ width: "100%", padding: "12px 16px", borderRadius: 10, background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.text, fontSize: 14, outline: "none", fontFamily: "Tajawal, sans-serif" }}>
            <option value="clinic">🏥 عيادة</option>
            <option value="salon">✂️ صالون</option>
            <option value="hotel">🏨 شاليه / فندق</option>
          </select>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 13, color: COLORS.muted, marginBottom: 6 }}>رقم الهاتف</label>
          <input type="tel" placeholder="07xx xxx xxxx" value={phone} onChange={e => setPhone(e.target.value)} style={{ width: "100%", padding: "12px 16px", borderRadius: 10, background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.text, fontSize: 14, outline: "none", fontFamily: "Tajawal, sans-serif" }} />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 13, color: COLORS.muted, marginBottom: 6 }}>الإيميل</label>
          <input type="email" placeholder="example@email.com" value={email} onChange={e => setEmail(e.target.value)} style={{ width: "100%", padding: "12px 16px", borderRadius: 10, background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.text, fontSize: 14, outline: "none", fontFamily: "Tajawal, sans-serif" }} />
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ display: "block", fontSize: 13, color: COLORS.muted, marginBottom: 6 }}>كلمة السر</label>
          <div style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{ width: "100%", padding: "12px 48px 12px 16px", borderRadius: 10, background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.text, fontSize: 14, outline: "none", fontFamily: "Tajawal, sans-serif" }}
            />
            <button
              onClick={() => setShowPassword(!showPassword)}
              style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", background: "transparent", border: "none", cursor: "pointer", color: COLORS.muted, fontSize: 18 }}
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>
          <p style={{ fontSize: 11, color: COLORS.muted, marginTop: 4 }}>على الأقل 6 أحرف</p>
        </div>

        <button onClick={handleRegister} disabled={loading} style={{
          width: "100%", padding: "14px",
          background: "linear-gradient(90deg, #00d4aa, #0070f3)",
          border: "none", borderRadius: 10, fontSize: 16,
          fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", color: "#000",
          fontFamily: "Tajawal, sans-serif", marginBottom: 16,
        }}>{loading ? "جاري التسجيل..." : "إنشاء الحساب"}</button>

        <p style={{ textAlign: "center", fontSize: 14, color: COLORS.muted }}>
          عندك حساب؟{" "}
          <a href="/client" style={{ color: COLORS.accent, textDecoration: "none", fontWeight: 700 }}>سجل دخول</a>
        </p>
      </div>
    </div>
  );
}