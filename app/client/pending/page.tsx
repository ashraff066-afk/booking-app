"use client";
import { supabase } from "../../supabase";

const COLORS = {
  bg: "#0a0e1a", card: "#1a2235", border: "#1e2d45",
  accent: "#00d4aa", text: "#e2e8f0", muted: "#64748b", white: "#ffffff",
};

export default function PendingPage() {
  return (
    <div dir="rtl" style={{ minHeight: "100vh", background: COLORS.bg, color: COLORS.text, fontFamily: "'Tajawal','Cairo',sans-serif", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;800&display=swap'); *{box-sizing:border-box;margin:0;padding:0}`}</style>
      <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 24, padding: 40, maxWidth: 480, width: "100%", textAlign: "center" }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>⏳</div>
        <h2 style={{ fontSize: 24, fontWeight: 900, color: COLORS.white, marginBottom: 12 }}>حسابك قيد المراجعة</h2>
        <p style={{ color: COLORS.muted, fontSize: 14, lineHeight: 1.8, marginBottom: 24 }}>
          شكراً للتسجيل! حسابك سيتم تفعيله بعد إتمام الدفع والمراجعة. عادةً خلال 24 ساعة.
        </p>
        <button
          onClick={() => window.open("https://wa.me/9647739863056?text=مرحبا، سجلت حساب وأريد تفعيله", "_blank")}
          style={{ width: "100%", padding: "14px", background: "linear-gradient(90deg,#00d4aa,#0070f3)", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer", color: "#000", fontFamily: "Tajawal,sans-serif", marginBottom: 12 }}
        >
          💬 تواصل معنا على واتساب
        </button>
        <button
          onClick={async () => { await supabase.auth.signOut(); window.location.href = "/client"; }}
          style={{ width: "100%", padding: "12px", background: "transparent", border: `1px solid ${COLORS.border}`, borderRadius: 10, fontSize: 14, cursor: "pointer", color: COLORS.muted, fontFamily: "Tajawal,sans-serif" }}
        >
          خروج
        </button>
      </div>
    </div>
  );
}