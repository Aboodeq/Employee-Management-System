import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContextValue";

const REMEMBER_USERNAME_KEY = "ems_remember_username";

export default function LoginPage() {
  const rememberedUsername = localStorage.getItem(REMEMBER_USERNAME_KEY) || "";
  const [username, setUsername] = useState(rememberedUsername);
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [rememberMe, setRememberMe] = useState(Boolean(rememberedUsername));
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setNotice("");
    setLoading(true);
    try {
      const result = await login(username, password, rememberMe);
      if (result.success) {
        if (rememberMe) {
          localStorage.setItem(REMEMBER_USERNAME_KEY, username.trim());
        } else {
          localStorage.removeItem(REMEMBER_USERNAME_KEY);
        }

        navigate("/");
      } else setError(result.message || "اسم المستخدم أو كلمة المرور غير صحيحة");
    } catch {
      setError("تعذر الاتصال بالخادم، تأكد أن الباك اند يعمل");
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path
            d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
            stroke="#fff"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx="9" cy="7" r="4" stroke="#fff" strokeWidth="2" />
          <path
            d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
            stroke="#fff"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      ),
      title: "إدارة الموظفين",
      desc: "إضافة وتعديل وحذف بيانات الموظفين بسهولة تامة",
    },
    {
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <rect x="2" y="3" width="20" height="14" rx="2" stroke="#fff" strokeWidth="2" />
          <path d="M8 21h8M12 17v4" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
        </svg>
      ),
      title: "واجهة تفاعلية",
      desc: "تجربة مستخدم سلسة مبنية بـ React",
    },
    {
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 2L2 7l10 5 10-5-10-5z"
            stroke="#fff"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path
            d="M2 17l10 5 10-5M2 12l10 5 10-5"
            stroke="#fff"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>
      ),
      title: "RESTful API",
      desc: "باك إند متكامل بـ Laravel مع JSON responses",
    },
    {
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
            stroke="#fff"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>
      ),
      title: "نظام صلاحيات",
      desc: "تسجيل دخول آمن خاص بالمدير فقط",
    },
  ];

  return (
    <>
      <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&display=swap');
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(16px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .login-input:focus {
                    border-color: #2563eb !important;
                    background: #fff !important;
                    box-shadow: 0 0 0 3px rgba(37,99,235,0.1) !important;
                }
                .login-btn:hover:not(:disabled) {
                    transform: translateY(-1px);
                    box-shadow: 0 8px 30px rgba(37,99,235,0.4) !important;
                }
                .login-btn:active:not(:disabled) {
                    transform: translateY(0);
                }
                .login-page {
                    overflow-x: hidden;
                }
                .login-page,
                .login-page * {
                    box-sizing: border-box;
                }
                @media (max-width: 1180px) {
                    .login-hero {
                        padding: 52px 36px !important;
                    }
                    .login-hero-inner {
                        max-width: 460px !important;
                        gap: 30px !important;
                    }
                    .login-hero-title {
                        font-size: 38px !important;
                    }
                    .login-form-wrap {
                        padding: 72px clamp(40px, 6vw, 86px) !important;
                    }
                }
                @media (max-width: 980px) {
                    .login-page {
                        min-height: auto !important;
                        flex-direction: column !important;
                    }
                    .login-form-panel {
                        order: 1 !important;
                        min-height: auto !important;
                    }
                    .login-form-wrap {
                        min-height: auto !important;
                        padding: 56px clamp(28px, 8vw, 80px) !important;
                    }
                    .login-hero {
                        order: 2 !important;
                        min-height: auto !important;
                        padding: 48px clamp(28px, 8vw, 80px) !important;
                    }
                    .login-hero-inner {
                        max-width: 760px !important;
                        gap: 26px !important;
                    }
                    .login-hero-title {
                        font-size: 34px !important;
                    }
                    .login-hero-sub {
                        max-width: 620px !important;
                    }
                    .login-features {
                        grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
                    }
                }
                @media (max-width: 640px) {
                    .login-form-wrap {
                        padding: 36px 20px 30px !important;
                    }
                    .login-form-header {
                        margin-bottom: 30px !important;
                    }
                    .login-form-title {
                        font-size: 22px !important;
                    }
                    .login-form-sub {
                        font-size: 12px !important;
                    }
                    .login-form-icon {
                        width: 46px !important;
                        height: 46px !important;
                    }
                    .login-form {
                        gap: 20px !important;
                    }
                    .login-input {
                        min-height: 50px !important;
                        font-size: 14px !important;
                    }
                    .login-options {
                        align-items: flex-start !important;
                        flex-direction: column !important;
                        gap: 10px !important;
                    }
                    .login-forgot {
                        align-self: flex-start !important;
                    }
                    .login-btn {
                        padding: 15px !important;
                        font-size: 15px !important;
                    }
                    .login-hero {
                        padding: 34px 20px !important;
                    }
                    .login-hero-inner {
                        gap: 22px !important;
                    }
                    .login-brand {
                        align-items: flex-start !important;
                    }
                    .login-brand-name {
                        font-size: 11px !important;
                        line-height: 1.6 !important;
                    }
                    .login-hero-title {
                        font-size: 30px !important;
                        line-height: 1.25 !important;
                    }
                    .login-hero-sub {
                        font-size: 13px !important;
                        line-height: 1.8 !important;
                    }
                    .login-features {
                        grid-template-columns: 1fr !important;
                    }
                    .login-feature-card {
                        padding: 14px !important;
                    }
                    .login-bottom-tag {
                        font-size: 10px !important;
                        line-height: 1.7 !important;
                        word-break: break-word !important;
                    }
                }
                @media (max-width: 380px) {
                    .login-form-wrap,
                    .login-hero {
                        padding-left: 16px !important;
                        padding-right: 16px !important;
                    }
                    .login-form-header {
                        gap: 10px !important;
                    }
                    .login-hero-title {
                        font-size: 26px !important;
                    }
                }
            `}</style>

      <div className="login-page" style={s.page}>
        {/* ===== RIGHT: Colored panel ===== */}
        <div className="login-hero" style={s.right}>
          <div className="login-hero-inner" style={s.rightInner}>
            <div className="login-brand" style={s.brandRow}>
              <div style={s.brandDot} />
              <span className="login-brand-name" style={s.brandName}>
                EMS — Employee Management System
              </span>
            </div>

            <div style={s.heroBlock}>
              <h1 className="login-hero-title" style={s.heroTitle}>
                أدِر فريقك
                <br />
                باحترافية كاملة
              </h1>
              <p className="login-hero-sub" style={s.heroSub}>
                منصة متكاملة تجمع كل ما تحتاجه لإدارة موظفيك في مكان واحد — من بيانات التوظيف إلى
                الرواتب والمسميات.
              </p>
            </div>

            <div className="login-features" style={s.featuresGrid}>
              {features.map((f, i) => (
                <div
                  className="login-feature-card"
                  key={i}
                  style={{ ...s.featureCard, animationDelay: `${i * 0.08}s` }}
                >
                  <div style={s.featureIcon}>{f.icon}</div>
                  <div>
                    <p style={s.featureTitle}>{f.title}</p>
                    <p style={s.featureDesc}>{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="login-bottom-tag" style={s.bottomTag}>
              Laravel + React · CRUD Operations · REST API
            </div>
          </div>

          {/* Decorative blobs */}
          <div
            style={{ ...s.blob, width: 360, height: 360, top: -100, right: -100, opacity: 0.07 }}
          />
          <div
            style={{ ...s.blob, width: 240, height: 240, bottom: -60, left: -80, opacity: 0.05 }}
          />
        </div>

        {/* ===== LEFT: Form panel ===== */}
        <div className="login-form-panel" style={s.left}>
          <div className="login-form-wrap" style={s.formWrap}>
            <div className="login-form-header" style={s.formHeader}>
              <div className="login-form-icon" style={s.formIconWrap}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="11" width="18" height="11" rx="2" stroke="#fff" strokeWidth="2" />
                  <path
                    d="M7 11V7a5 5 0 0 1 10 0v4"
                    stroke="#fff"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <div>
                <h2 className="login-form-title" style={s.formTitle}>
                  تسجيل الدخول
                </h2>
                <p className="login-form-sub" style={s.formSub}>
                  مخصص للمدير فقط
                </p>
              </div>
            </div>

            <form className="login-form" onSubmit={handleSubmit} style={s.form}>
              {/* Username */}
              <div style={s.field}>
                <label style={s.label}>اسم المستخدم</label>
                <div style={s.inputRow}>
                  <span style={s.icoRight}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
                        stroke="#94a3b8"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                      <circle cx="12" cy="7" r="4" stroke="#94a3b8" strokeWidth="2" />
                    </svg>
                  </span>
                  <input
                    className="login-input"
                    style={s.input}
                    type="text"
                    placeholder="أدخل اسم المستخدم"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    autoComplete="username"
                  />
                </div>
              </div>

              {/* Password */}
              <div style={s.field}>
                <label style={s.label}>كلمة المرور</label>
                <div style={s.inputRow}>
                  <span style={s.icoRight}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                      <rect
                        x="3"
                        y="11"
                        width="18"
                        height="11"
                        rx="2"
                        stroke="#94a3b8"
                        strokeWidth="2"
                      />
                      <path
                        d="M7 11V7a5 5 0 0 1 10 0v4"
                        stroke="#94a3b8"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                  <input
                    className="login-input"
                    style={s.input}
                    type={showPass ? "text" : "password"}
                    placeholder="أدخل كلمة المرور"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} style={s.eyeBtn}>
                    {showPass ? (
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"
                          stroke="#94a3b8"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                        <line
                          x1="1"
                          y1="1"
                          x2="23"
                          y2="23"
                          stroke="#94a3b8"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                    ) : (
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
                          stroke="#94a3b8"
                          strokeWidth="2"
                        />
                        <circle cx="12" cy="12" r="3" stroke="#94a3b8" strokeWidth="2" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="login-options" style={s.formOptions}>
                <label style={s.rememberLabel}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    style={s.rememberCheckbox}
                  />
                  <span>تذكرني</span>
                </label>

                <button
                  className="login-forgot"
                  type="button"
                  style={s.forgotBtn}
                  onClick={() => {
                    setError("");
                    setNotice("يرجى التواصل مع مسؤول النظام لإعادة تعيين كلمة المرور.");
                  }}
                >
                  نسيت كلمة المرور؟
                </button>
              </div>

              {error && (
                <div style={s.errorBox}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="#dc2626" strokeWidth="2" />
                    <line
                      x1="12"
                      y1="8"
                      x2="12"
                      y2="12"
                      stroke="#dc2626"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <circle cx="12" cy="16" r="1" fill="#dc2626" />
                  </svg>
                  {error}
                </div>
              )}

              {notice && (
                <div style={s.noticeBox}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="#2563eb" strokeWidth="2" />
                    <line
                      x1="12"
                      y1="10"
                      x2="12"
                      y2="16"
                      stroke="#2563eb"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <circle cx="12" cy="7" r="1" fill="#2563eb" />
                  </svg>
                  {notice}
                </div>
              )}

              <button
                className="login-btn"
                style={{ ...s.btn, opacity: loading ? 0.75 : 1 }}
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <span style={s.btnInner}>
                    <span style={s.spinner} />
                    جاري تسجيل الدخول...
                  </span>
                ) : (
                  <span style={s.btnInner}>
                    تسجيل الدخول
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3"
                        stroke="#fff"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

const s = {
  page: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "row-reverse",
    fontFamily: "'Cairo', sans-serif",
    direction: "rtl",
  },

  /* ── Right colored panel ── */
  right: {
    flex: 1,
    background: "linear-gradient(150deg, #1e3a8a 0%, #2563eb 45%, #6d28d9 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "60px 48px",
    position: "relative",
    overflow: "hidden",
  },
  rightInner: {
    position: "relative",
    zIndex: 2,
    width: "100%",
    maxWidth: "500px",
    display: "flex",
    flexDirection: "column",
    gap: "36px",
  },
  brandRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  brandDot: {
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    background: "rgba(255,255,255,0.9)",
  },
  brandName: {
    fontSize: "13px",
    fontWeight: "600",
    color: "rgba(255,255,255,0.7)",
    letterSpacing: "0.04em",
    fontFamily: "'Cairo', sans-serif",
  },
  heroBlock: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  heroTitle: {
    fontSize: "44px",
    fontWeight: "900",
    color: "#fff",
    lineHeight: "1.15",
    letterSpacing: "-0.02em",
    fontFamily: "'Cairo', sans-serif",
  },
  heroSub: {
    fontSize: "15px",
    color: "rgba(255,255,255,0.7)",
    lineHeight: "1.8",
    fontWeight: "400",
    maxWidth: "400px",
    fontFamily: "'Cairo', sans-serif",
  },
  featuresGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
  },
  featureCard: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "14px",
    padding: "16px",
    backdropFilter: "blur(8px)",
    animation: "fadeUp 0.5s ease both",
  },
  featureIcon: {
    width: "40px",
    height: "40px",
    background: "rgba(255,255,255,0.15)",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  featureTitle: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#fff",
    marginBottom: "4px",
    fontFamily: "'Cairo', sans-serif",
  },
  featureDesc: {
    fontSize: "12px",
    color: "rgba(255,255,255,0.6)",
    lineHeight: "1.6",
    fontFamily: "'Cairo', sans-serif",
  },
  bottomTag: {
    fontSize: "12px",
    color: "rgba(255,255,255,0.35)",
    fontFamily: "monospace",
    letterSpacing: "0.04em",
  },
  blob: {
    position: "absolute",
    borderRadius: "50%",
    background: "#fff",
    pointerEvents: "none",
  },

  /* ── Left form panel ── */
  left: {
    flex: 1,
    background: "#fff",
    display: "flex",
    minHeight: "100vh",
    padding: 0,
  },
  formWrap: {
    width: "100%",
    minHeight: "100vh",
    maxWidth: "none",
    background: "#fff",
    padding: "80px clamp(56px, 7vw, 132px)",
    borderRadius: 0,
    border: "none",
    boxShadow: "none",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  formHeader: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    marginBottom: "36px",
    direction: "rtl",
  },
  formIconWrap: {
    width: "50px",
    height: "50px",
    background: "linear-gradient(135deg, #2563eb, #6d28d9)",
    borderRadius: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    boxShadow: "0 6px 20px rgba(37,99,235,0.3)",
  },
  formTitle: {
    fontSize: "24px",
    fontWeight: "800",
    color: "#0f172a",
    fontFamily: "'Cairo', sans-serif",
  },
  formSub: {
    fontSize: "13px",
    color: "#94a3b8",
    fontFamily: "'Cairo', sans-serif",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
    width: "100%",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    fontSize: "13px",
    fontWeight: "700",
    color: "#374151",
    direction: "rtl",
    fontFamily: "'Cairo', sans-serif",
  },
  inputRow: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  icoRight: {
    position: "absolute",
    right: "14px",
    display: "flex",
    alignItems: "center",
    pointerEvents: "none",
    zIndex: 1,
  },
  input: {
    width: "100%",
    padding: "13px 44px 13px 44px",
    borderRadius: "12px",
    border: "1.5px solid #e2e8f0",
    fontSize: "14px",
    outline: "none",
    textAlign: "right",
    direction: "rtl",
    background: "#f8fafc",
    color: "#0f172a",
    transition: "all 0.2s",
    fontFamily: "'Cairo', sans-serif",
    fontWeight: "500",
  },
  eyeBtn: {
    position: "absolute",
    left: "12px",
    background: "none",
    border: "none",
    padding: "4px",
    display: "flex",
    alignItems: "center",
    cursor: "pointer",
  },
  formOptions: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
    marginTop: "-4px",
  },
  rememberLabel: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: "#475569",
    fontSize: "13px",
    fontWeight: "700",
    cursor: "pointer",
    userSelect: "none",
    fontFamily: "'Cairo', sans-serif",
  },
  rememberCheckbox: {
    width: "16px",
    height: "16px",
    accentColor: "#2563eb",
    cursor: "pointer",
  },
  forgotBtn: {
    background: "transparent",
    border: "none",
    color: "#2563eb",
    fontSize: "13px",
    fontWeight: "800",
    cursor: "pointer",
    padding: 0,
    fontFamily: "'Cairo', sans-serif",
  },
  errorBox: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "#fef2f2",
    color: "#dc2626",
    padding: "12px 14px",
    borderRadius: "10px",
    fontSize: "13px",
    direction: "rtl",
    border: "1px solid #fecaca",
    fontFamily: "'Cairo', sans-serif",
  },
  noticeBox: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "#eff6ff",
    color: "#2563eb",
    padding: "12px 14px",
    borderRadius: "10px",
    fontSize: "13px",
    direction: "rtl",
    border: "1px solid #bfdbfe",
    fontFamily: "'Cairo', sans-serif",
  },
  btn: {
    background: "linear-gradient(135deg, #2563eb 0%, #6d28d9 100%)",
    color: "#fff",
    border: "none",
    padding: "16px",
    borderRadius: "12px",
    fontSize: "16px",
    fontWeight: "700",
    cursor: "pointer",
    transition: "all 0.25s",
    marginTop: "8px",
    boxShadow: "0 4px 20px rgba(37,99,235,0.3)",
    fontFamily: "'Cairo', sans-serif",
  },
  btnInner: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  },
  spinner: {
    width: "16px",
    height: "16px",
    border: "2.5px solid rgba(255,255,255,0.3)",
    borderTopColor: "#fff",
    borderRadius: "50%",
    animation: "spin 0.7s linear infinite",
    display: "inline-block",
    flexShrink: 0,
  },
};
