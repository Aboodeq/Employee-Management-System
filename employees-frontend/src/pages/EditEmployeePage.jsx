import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import EmployeeOrganizationFields from "../components/EmployeeOrganizationFields";
import Navbar from "../components/Navbar";
import { getEmployee, getImageUrl, updateEmployee } from "../api/employeeApi";
import {
  firstEmployeeError,
  normalizePhone,
  todayDateInputValue,
  validateEmployeeForm,
} from "../utils/employeeValidation";
import { useI18n } from "../i18n/i18n";

export default function EditEmployeePage() {
  const { dir, t } = useI18n();
  const { id } = useParams();
  const navigate = useNavigate();
  const today = todayDateInputValue();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    department_id: "",
    job_title_id: "",
    position: "",
    salary: "",
    hire_date: "",
    image: null,
  });
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);
  const [removeImage, setRemoveImage] = useState(false);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    getEmployee(id)
      .then((res) => {
        if (res.success) {
          const e = res.data;
          setForm({
            name: e.name || "",
            email: e.email || "",
            phone: e.phone || "",
            department_id: e.department_id || e.department?.id || "",
            job_title_id: e.job_title_id || e.job_title?.id || "",
            position: e.position || "",
            salary: e.salary || "",
            hire_date: e.hire_date || "",
            image: null,
          });
          setPreview(getImageUrl(e) || null);
          setRemoveImage(false);
        }
      })
      .catch(() => showToast(t("form.loadError"), "error"))
      .finally(() => setFetching(false));
  }, [id, t]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image" && files[0]) {
      setForm((p) => ({ ...p, image: files[0] }));
      setPreview(URL.createObjectURL(files[0]));
      setRemoveImage(false);
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
    fd.append("_method", "PUT");
    Object.entries(form).forEach(([k, v]) => {
      if (v) fd.append(k, v);
    });
    if (removeImage) fd.append("remove_image", "1");

    try {
      const res = await updateEmployee(id, fd);
      if (res.success) {
        showToast(t("form.updateSuccess"));
        setTimeout(() => navigate(`/employees/${id}`), 1200);
      } else {
        setErrors(res.errors || {});
        showToast(res.message || firstEmployeeError(res.errors || {}, t), "error");
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

  if (fetching)
    return (
      <div style={{ ...s.page, direction: dir }} dir={dir}>
        <Navbar />
        <div style={s.loadingWrap}>
          <div style={s.spinner} />
          <p style={s.loadingText}>{t("form.fetching")}</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );

  return (
    <div className="employee-form-page" style={{ ...s.page, direction: dir }} dir={dir}>
      <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800&display=swap');
                @keyframes spin { to { transform: rotate(360deg); } }
                .form-input:focus { border-color:#2563eb !important; box-shadow:0 0 0 3px rgba(37,99,235,0.1) !important; background:#fff !important; }
                .form-input.error { border-color:#dc2626 !important; }
                .submit-btn:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 8px 28px rgba(37,99,235,0.4) !important; }
                .cancel-btn:hover { background:#f1f5f9 !important; }
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
        <div className="employee-form-header" style={s.header}>
          <button className="employee-form-back" style={s.backBtn} onClick={() => navigate(`/employees/${id}`)}>
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
              {t("form.editTitle")}
            </h1>
            <p style={s.pageSub}>{t("form.editSubtitle")}</p>
          </div>
        </div>

        <div className="employee-form-layout" style={s.layout}>
          <div className="employee-form-card" style={s.formCard}>
            <form onSubmit={handleSubmit} style={s.form} noValidate>
              <div className="employee-form-fields" style={s.fieldsGrid}>
                <EmployeeOrganizationFields
                  errors={errors}
                  form={form}
                  setErrors={setErrors}
                  setForm={setForm}
                  t={t}
                />
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
                      <span style={s.spinnerSm} />
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
                      {t("form.saveChanges")}
                    </>
                  )}
                </button>
                <button
                  type="button"
                  className="cancel-btn employee-form-cancel"
                  style={s.cancelBtn}
                  onClick={() => navigate(`/employees/${id}`)}
                >
                  {t("common.cancel")}
                </button>
              </div>
            </form>
          </div>

          {/* Image */}
          <div className="employee-form-side" style={s.sideCard}>
            <h3 style={s.sideTitle}>{t("form.imageTitle")}</h3>
            <p style={s.sideSub}>{t("form.imageOptionalEdit")}</p>
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
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
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
                  setRemoveImage(true);
                }}
              >
                {t("form.removeImage")}
              </button>
            )}
          </div>
        </div>
      </main>
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
  layout: { display: "grid", gridTemplateColumns: "1fr 280px", gap: "24px", alignItems: "start" },
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
  actions: { display: "flex", gap: "12px" },
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
  spinnerSm: {
    width: "15px",
    height: "15px",
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
    padding: "20px",
    cursor: "pointer",
    transition: "all 0.2s",
    minHeight: "150px",
    overflow: "hidden",
  },
  uploadPlaceholder: { display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" },
  uploadIcon: {
    width: "52px",
    height: "52px",
    background: "#f8fafc",
    borderRadius: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1.5px solid #e2e8f0",
  },
  uploadText: { fontSize: "13px", fontWeight: "700", color: "#475569" },
  previewImg: { width: "100%", height: "150px", objectFit: "cover", borderRadius: "10px" },
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
  loadingWrap: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "16px",
    padding: "120px 0",
  },
  spinner: {
    width: "44px",
    height: "44px",
    border: "3px solid #e2e8f0",
    borderTopColor: "#2563eb",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  loadingText: { color: "#94a3b8", fontSize: "14px", fontWeight: "600" },
};
