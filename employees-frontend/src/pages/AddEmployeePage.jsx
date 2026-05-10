import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { createEmployee } from "../api/employeeApi";
import {
  firstEmployeeError,
  normalizePhone,
  todayDateInputValue,
  validateEmployeeForm,
} from "../utils/employeeValidation";
import { useI18n } from "../i18n/i18n";

const initialForm = {
  name: "",
  email: "",
  phone: "",
  position: "",
  salary: "",
  hire_date: "",
  image: null,
};

export default function AddEmployeePage() {
  const { dir, t } = useI18n();
  const today = todayDateInputValue();
  const [form, setForm] = useState(initialForm);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image" && files[0]) {
      setForm((p) => ({ ...p, image: files[0] }));
      setPreview(URL.createObjectURL(files[0]));
    } else if (name === "phone") {
      setForm((p) => ({ ...p, phone: normalizePhone(value) }));
    } else {
      setForm((p) => ({ ...p, [name]: value }));
    }
    setErrors((p) => ({ ...p, [name]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    const clientErrors = validateEmployeeForm(form, t);
    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      showToast(firstEmployeeError(clientErrors, t), "error");
      return;
    }

    setLoading(true);

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (v) fd.append(k, v);
    });

    try {
      const res = await createEmployee(fd);
      if (res.success) {
        showToast(t("form.addSuccess"));
        setTimeout(() => navigate("/employees"), 1200);
      } else {
        setErrors(res.errors || {});
        showToast(firstEmployeeError(res.errors || {}, t), "error");
      }
    } catch {
      showToast(t("form.serverUnavailable"), "error");
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    {
      name: "name",
      label: t("form.fields.name"),
      type: "text",
      placeholder: t("form.fields.namePlaceholder"),
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
          <path
            d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
            stroke="#94a3b8"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx="12" cy="7" r="4" stroke="#94a3b8" strokeWidth="2" />
        </svg>
      ),
    },
    {
      name: "email",
      label: t("form.fields.email"),
      type: "email",
      placeholder: t("form.fields.emailPlaceholder"),
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
          <path
            d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
            stroke="#94a3b8"
            strokeWidth="2"
          />
          <polyline points="22,6 12,13 2,6" stroke="#94a3b8" strokeWidth="2" />
        </svg>
      ),
    },
    {
      name: "phone",
      label: t("form.fields.phone"),
      type: "tel",
      placeholder: t("form.fields.phonePlaceholder"),
      inputMode: "numeric",
      maxLength: 10,
      pattern: "09[0-9]{8}",
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
          <path
            d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.83a16 16 0 0 0 6.26 6.26l1.58-1.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"
            stroke="#94a3b8"
            strokeWidth="2"
          />
        </svg>
      ),
    },
    {
      name: "position",
      label: t("form.fields.position"),
      type: "text",
      placeholder: t("form.fields.positionPlaceholder"),
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
          <rect x="2" y="7" width="20" height="14" rx="2" stroke="#94a3b8" strokeWidth="2" />
          <path
            d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"
            stroke="#94a3b8"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      ),
    },
    {
      name: "salary",
      label: t("form.fields.salary"),
      type: "number",
      placeholder: t("form.fields.salaryPlaceholder"),
      min: "1",
      step: "0.01",
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
          <line
            x1="12"
            y1="1"
            x2="12"
            y2="23"
            stroke="#94a3b8"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"
            stroke="#94a3b8"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      ),
    },
    {
      name: "hire_date",
      label: t("form.fields.hireDate"),
      type: "date",
      placeholder: "",
      min: "1990-01-01",
      max: today,
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="4" width="18" height="18" rx="2" stroke="#94a3b8" strokeWidth="2" />
          <line
            x1="16"
            y1="2"
            x2="16"
            y2="6"
            stroke="#94a3b8"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <line
            x1="8"
            y1="2"
            x2="8"
            y2="6"
            stroke="#94a3b8"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <line x1="3" y1="10" x2="21" y2="10" stroke="#94a3b8" strokeWidth="2" />
        </svg>
      ),
    },
  ];

  return (
    <div className="employee-form-page" style={{ ...s.page, direction: dir }} dir={dir}>
      <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800&display=swap');
                @keyframes slideIn { from{opacity:0;transform:translateX(20px)} to{opacity:1;transform:translateX(0)} }
                @keyframes fadeUp  { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
                .form-input:focus { border-color:#2563eb !important; box-shadow:0 0 0 3px rgba(37,99,235,0.1) !important; background:#fff !important; }
                .form-input.error { border-color:#dc2626 !important; background:#fff5f5 !important; }
                .submit-btn:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 8px 28px rgba(37,99,235,0.4) !important; }
                .cancel-btn:hover { background:#f1f5f9 !important; color:#0f172a !important; }
                .upload-zone:hover { border-color:#2563eb !important; background:#eff6ff !important; }
                .employee-form-page,
                .employee-form-page * { box-sizing: border-box; }
                @media (max-width: 940px) {
                    .employee-form-main { padding: 32px 24px !important; }
                    .employee-form-layout { grid-template-columns: 1fr !important; }
                    .employee-form-side { order: -1 !important; }
                    .employee-form-upload { min-height: 220px !important; }
                    .employee-form-preview { height: 220px !important; }
                }
                @media (max-width: 680px) {
                    .employee-form-main { padding: 28px 18px !important; }
                    .employee-form-header {
                        align-items: stretch !important;
                        flex-direction: column !important;
                        gap: 14px !important;
                        margin-bottom: 22px !important;
                    }
                    .employee-form-back {
                        width: 100% !important;
                        justify-content: center !important;
                    }
                    .employee-form-title { font-size: 22px !important; }
                    .employee-form-card,
                    .employee-form-side {
                        border-radius: 16px !important;
                        padding: 20px !important;
                    }
                    .employee-form-fields {
                        grid-template-columns: 1fr !important;
                        gap: 16px !important;
                    }
                    .employee-form-actions {
                        flex-direction: column !important;
                        gap: 10px !important;
                    }
                    .employee-form-submit,
                    .employee-form-cancel {
                        width: 100% !important;
                        justify-content: center !important;
                    }
                    .employee-form-toast {
                        width: calc(100% - 32px) !important;
                        text-align: center !important;
                        justify-content: center !important;
                    }
                    .employee-form-upload { min-height: 180px !important; }
                    .employee-form-preview { height: 180px !important; }
                }
                @media (max-width: 380px) {
                    .employee-form-main { padding: 24px 14px !important; }
                    .employee-form-card,
                    .employee-form-side { padding: 16px !important; }
                    .employee-form-input { font-size: 13px !important; }
                }
            `}</style>

      <Navbar />

      {toast && (
        <div
          className="employee-form-toast"
          style={{
            ...s.toast,
            background: toast.type === "error" ? "#fef2f2" : "#ecfdf5",
            border: `1px solid ${toast.type === "error" ? "#fecaca" : "#a7f3d0"}`,
            color: toast.type === "error" ? "#dc2626" : "#059669",
          }}
        >
          {toast.msg}
        </div>
      )}

      <main className="employee-form-main" style={s.main}>
        {/* Header */}
        <div className="employee-form-header" style={s.header}>
          <button className="employee-form-back" style={s.backBtn} onClick={() => navigate("/employees")}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M19 12H5M12 19l-7-7 7-7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {t("common.back")}
          </button>
          <div>
            <h1 className="employee-form-title" style={s.pageTitle}>
              {t("form.addTitle")}
            </h1>
            <p style={s.pageSub}>{t("form.addSubtitle")}</p>
          </div>
        </div>

        <div className="employee-form-layout" style={s.layout}>
          {/* Form Card */}
          <div className="employee-form-card" style={s.formCard}>
            <form onSubmit={handleSubmit} style={s.form} noValidate>
              <div className="employee-form-fields" style={s.fieldsGrid}>
                {fields.map((f) => (
                  <div key={f.name} style={s.field}>
                    <label style={s.label}>{f.label}</label>
                    <div style={s.inputWrap}>
                      <span style={s.inputIco}>{f.icon}</span>
                      <input
                        className={`form-input employee-form-input${errors[f.name] ? " error" : ""}`}
                        style={s.input}
                        type={f.type}
                        name={f.name}
                        placeholder={f.placeholder}
                        inputMode={f.inputMode}
                        maxLength={f.maxLength}
                        pattern={f.pattern}
                        min={f.min}
                        max={f.max}
                        step={f.step}
                        value={form[f.name]}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    {errors[f.name] && (
                      <span style={s.errorMsg}>
                        {Array.isArray(errors[f.name]) ? errors[f.name][0] : errors[f.name]}
                      </span>
                    )}
                  </div>
                ))}
              </div>

              <div className="employee-form-actions" style={s.actions}>
                <button
                  type="submit"
                  className="submit-btn employee-form-submit"
                  style={{ ...s.submitBtn, opacity: loading ? 0.75 : 1 }}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span style={s.spinner} />
                      {t("common.saving")}
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"
                          stroke="#fff"
                          strokeWidth="2"
                          strokeLinejoin="round"
                        />
                        <polyline
                          points="17 21 17 13 7 13 7 21"
                          stroke="#fff"
                          strokeWidth="2"
                          strokeLinejoin="round"
                        />
                        <polyline
                          points="7 3 7 8 15 8"
                          stroke="#fff"
                          strokeWidth="2"
                          strokeLinejoin="round"
                        />
                      </svg>
                      {t("form.saveEmployee")}
                    </>
                  )}
                </button>
                <button
                  type="button"
                  className="cancel-btn employee-form-cancel"
                  style={s.cancelBtn}
                  onClick={() => navigate("/employees")}
                >
                  {t("common.cancel")}
                </button>
              </div>
            </form>
          </div>

          {/* Image Upload Card */}
          <div className="employee-form-side" style={s.sideCard}>
            <h3 style={s.sideTitle}>{t("form.imageTitle")}</h3>
            <p style={s.sideSub}>{t("form.imageOptional")}</p>

            <label className="upload-zone employee-form-upload" style={s.uploadZone}>
              {preview ? (
                <img
                  className="employee-form-preview"
                  src={preview}
                  alt={t("common.previewAlt")}
                  style={s.previewImg}
                />
              ) : (
                <div style={s.uploadPlaceholder}>
                  <div style={s.uploadIcon}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
                        stroke="#94a3b8"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                      <polyline
                        points="17 8 12 3 7 8"
                        stroke="#94a3b8"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <line
                        x1="12"
                        y1="3"
                        x2="12"
                        y2="15"
                        stroke="#94a3b8"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                  <p style={s.uploadText}>{t("form.uploadImage")}</p>
                  <p style={s.uploadHint}>{t("form.uploadDrop")}</p>
                </div>
              )}
              <input
                type="file"
                name="image"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleChange}
              />
            </label>

            {errors.image && (
              <span style={s.errorMsg}>
                {Array.isArray(errors.image) ? errors.image[0] : errors.image}
              </span>
            )}

            {preview && (
              <button
                type="button"
                style={s.removeImg}
                onClick={() => {
                  setPreview(null);
                  setForm((p) => ({ ...p, image: null }));
                }}
              >
                {t("form.removeImage")}
              </button>
            )}

            {/* Tips */}
            <div style={s.tipsCard}>
              <p style={s.tipsTitle}>{t("form.reminder")}</p>
              {t("form.tips").map((tip, i) => (
                <div key={i} style={s.tipRow}>
                  <div style={s.tipDot} />
                  <span style={s.tipText}>{tip}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

const s = {
  page: {
    background: "#f8fafc",
    minHeight: "100vh",
    fontFamily: "'Cairo', sans-serif",
    direction: "rtl",
  },
  main: { maxWidth: "1100px", margin: "0 auto", padding: "36px 32px" },
  toast: {
    position: "fixed",
    top: "24px",
    left: "50%",
    transform: "translateX(-50%)",
    padding: "12px 24px",
    borderRadius: "12px",
    fontSize: "14px",
    fontWeight: "700",
    zIndex: 999,
    boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
    fontFamily: "'Cairo', sans-serif",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  header: { display: "flex", alignItems: "center", gap: "20px", marginBottom: "32px" },
  backBtn: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    padding: "10px 16px",
    borderRadius: "10px",
    border: "1.5px solid #e2e8f0",
    background: "#fff",
    fontSize: "13px",
    fontWeight: "700",
    color: "#475569",
    cursor: "pointer",
    fontFamily: "'Cairo', sans-serif",
    flexShrink: 0,
  },
  pageTitle: { fontSize: "24px", fontWeight: "800", color: "#0f172a" },
  pageSub: { fontSize: "13px", color: "#94a3b8", marginTop: "4px" },
  layout: { display: "grid", gridTemplateColumns: "1fr 300px", gap: "24px", alignItems: "start" },
  formCard: {
    background: "#fff",
    borderRadius: "20px",
    border: "1px solid #e2e8f0",
    padding: "32px",
    boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
  },
  form: { display: "flex", flexDirection: "column", gap: "28px" },
  fieldsGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" },
  field: { display: "flex", flexDirection: "column", gap: "8px" },
  label: { fontSize: "13px", fontWeight: "700", color: "#374151" },
  inputWrap: { position: "relative", display: "flex", alignItems: "center" },
  inputIco: {
    position: "absolute",
    right: "13px",
    display: "flex",
    alignItems: "center",
    pointerEvents: "none",
    zIndex: 1,
  },
  input: {
    width: "100%",
    padding: "12px 40px 12px 16px",
    borderRadius: "11px",
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
  errorMsg: { fontSize: "12px", color: "#dc2626", fontWeight: "600" },
  actions: { display: "flex", gap: "12px", paddingTop: "4px" },
  submitBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "linear-gradient(135deg,#2563eb,#6d28d9)",
    color: "#fff",
    border: "none",
    padding: "13px 28px",
    borderRadius: "12px",
    fontSize: "15px",
    fontWeight: "700",
    cursor: "pointer",
    transition: "all 0.22s",
    boxShadow: "0 4px 16px rgba(37,99,235,0.3)",
    fontFamily: "'Cairo', sans-serif",
  },
  cancelBtn: {
    padding: "13px 24px",
    borderRadius: "12px",
    border: "1.5px solid #e2e8f0",
    background: "#fff",
    fontSize: "14px",
    fontWeight: "700",
    color: "#64748b",
    cursor: "pointer",
    transition: "all 0.18s",
    fontFamily: "'Cairo', sans-serif",
  },
  spinner: {
    width: "16px",
    height: "16px",
    border: "2.5px solid rgba(255,255,255,0.3)",
    borderTopColor: "#fff",
    borderRadius: "50%",
    animation: "spin 0.7s linear infinite",
    display: "inline-block",
  },
  sideCard: {
    background: "#fff",
    borderRadius: "20px",
    border: "1px solid #e2e8f0",
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
  },
  sideTitle: { fontSize: "15px", fontWeight: "800", color: "#0f172a" },
  sideSub: { fontSize: "12px", color: "#94a3b8", marginTop: "-4px" },
  uploadZone: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "2px dashed #e2e8f0",
    borderRadius: "14px",
    padding: "24px",
    cursor: "pointer",
    transition: "all 0.2s",
    minHeight: "160px",
    overflow: "hidden",
  },
  uploadPlaceholder: { display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" },
  uploadIcon: {
    width: "56px",
    height: "56px",
    background: "#f8fafc",
    borderRadius: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1.5px solid #e2e8f0",
  },
  uploadText: { fontSize: "13px", fontWeight: "700", color: "#475569" },
  uploadHint: { fontSize: "11px", color: "#94a3b8" },
  previewImg: { width: "100%", height: "160px", objectFit: "cover", borderRadius: "10px" },
  removeImg: {
    padding: "8px",
    borderRadius: "8px",
    border: "1.5px solid #fecaca",
    background: "#fef2f2",
    color: "#dc2626",
    fontSize: "12px",
    fontWeight: "700",
    cursor: "pointer",
    fontFamily: "'Cairo', sans-serif",
  },
  tipsCard: {
    background: "#f8fafc",
    borderRadius: "12px",
    padding: "16px",
    border: "1px solid #f1f5f9",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    marginTop: "4px",
  },
  tipsTitle: {
    fontSize: "12px",
    fontWeight: "800",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  },
  tipRow: { display: "flex", alignItems: "center", gap: "8px" },
  tipDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: "#2563eb",
    flexShrink: 0,
  },
  tipText: { fontSize: "12px", color: "#64748b", fontWeight: "500" },
};
