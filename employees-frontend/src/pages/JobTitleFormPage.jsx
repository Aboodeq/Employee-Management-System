import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  createJobTitle,
  getDepartments,
  getJobTitles,
  updateJobTitle,
} from "../api/employeeApi";
import Navbar from "../components/Navbar";
import { useI18n } from "../i18n/i18n";

const blankForm = { department_id: "", name: "", name_ar: "", description: "", is_active: true };

export default function JobTitleFormPage() {
  const { dir, t } = useI18n();
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isEditing = Boolean(id);
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState({
    ...blankForm,
    department_id: searchParams.get("department_id") || "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const requests = isEditing ? [getDepartments(), getJobTitles()] : [getDepartments()];
    Promise.all(requests)
      .then(([departmentRes, jobTitleRes]) => {
        if (!departmentRes.success || (jobTitleRes && !jobTitleRes.success)) {
          throw new Error(t("organization.loadError"));
        }

        const departmentData = departmentRes.data || [];
        if (!isMounted) return;
        setDepartments(departmentData);

        if (isEditing) {
          const jobTitle = (jobTitleRes.data || []).find((item) => String(item.id) === String(id));
          if (!jobTitle) throw new Error(t("detail.notFound"));
          setForm({
            department_id: jobTitle.department_id || "",
            name: jobTitle.name || "",
            name_ar: jobTitle.name_ar || "",
            description: jobTitle.description || "",
            is_active: Boolean(jobTitle.is_active),
          });
          return;
        }

        setForm((current) => ({
          ...current,
          department_id: current.department_id || departmentData[0]?.id || "",
        }));
      })
      .catch((error) => showToast(error.message || t("organization.loadError"), "error"))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id, isEditing, showToast, t]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setErrors({});

    const payload = {
      department_id: form.department_id,
      name: form.name.trim(),
      name_ar: form.name_ar.trim(),
      description: form.description.trim(),
      is_active: form.is_active,
    };

    try {
      const res = isEditing ? await updateJobTitle(id, payload) : await createJobTitle(payload);
      if (!res.success) {
        setErrors(res.errors || {});
        throw new Error(res.message || t("organization.reviewData"));
      }

      showToast(isEditing ? t("organization.jobTitleUpdated") : t("organization.jobTitleCreated"));
      setTimeout(() => navigate("/organization"), 900);
    } catch (error) {
      showToast(error.message || t("organization.saveError"), "error");
    } finally {
      setSaving(false);
    }
  };

  const fieldError = (name) => {
    const error = errors[name];
    return Array.isArray(error) ? error[0] : error;
  };

  return (
    <div className="organization-page" style={{ ...s.page, direction: dir }} dir={dir}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800&display=swap');
        .organization-page, .organization-page * { box-sizing: border-box; }
        .organization-input:focus { border-color:#2563eb !important; box-shadow:0 0 0 3px rgba(37,99,235,0.1) !important; background:#fff !important; }
        @media (max-width: 880px) { .organization-main { padding: 28px 18px !important; } }
        @media (max-width: 640px) {
          .organization-main { padding: 24px 14px !important; }
          .organization-form-card { padding: 20px !important; }
          .organization-form-grid { grid-template-columns: 1fr !important; }
          .organization-form-actions { flex-direction: column !important; }
          .organization-form-actions button { width: 100% !important; justify-content: center !important; }
          .organization-toast { width: calc(100% - 32px) !important; text-align: center !important; justify-content: center !important; }
        }
      `}</style>

      <Navbar />
      {toast && <Toast toast={toast} />}

      <main className="organization-main" style={s.main}>
        <button type="button" style={s.backBtn} onClick={() => navigate("/organization")}>
          {t("common.backToList")}
        </button>

        <section className="organization-form-card" style={s.card}>
          <h1 style={s.title}>{isEditing ? t("organization.editJobTitle") : t("organization.newJobTitle")}</h1>
          <p style={s.subtitle}>{t("organization.subtitle")}</p>

          {loading ? (
            <div style={s.empty}>{t("common.loading")}</div>
          ) : (
            <form onSubmit={handleSubmit} style={s.form}>
              <label style={s.field}>
                <span style={s.label}>{t("organization.fields.department")}</span>
                <select
                  className="organization-input"
                  style={s.input}
                  value={form.department_id}
                  onChange={(event) => setForm((current) => ({ ...current, department_id: event.target.value }))}
                >
                  <option value="">{t("organization.selectDepartment")}</option>
                  {departments.map((department) => (
                    <option key={department.id} value={department.id}>
                      {department.name}
                    </option>
                  ))}
                </select>
                {fieldError("department_id") && <span style={s.error}>{fieldError("department_id")}</span>}
              </label>

              <div className="organization-form-grid" style={s.formGrid}>
                <Field
                  error={fieldError("name")}
                  label={t("organization.fields.jobTitle")}
                  value={form.name}
                  onChange={(value) => setForm((current) => ({ ...current, name: value }))}
                />
                <Field
                  error={fieldError("name_ar")}
                  label={t("organization.fields.nameAr")}
                  value={form.name_ar}
                  onChange={(value) => setForm((current) => ({ ...current, name_ar: value }))}
                />
              </div>
              <Field
                error={fieldError("description")}
                label={t("organization.fields.description")}
                value={form.description}
                onChange={(value) => setForm((current) => ({ ...current, description: value }))}
              />
              <Toggle
                checked={form.is_active}
                label={t("organization.fields.active")}
                onChange={(checked) => setForm((current) => ({ ...current, is_active: checked }))}
              />
              <div className="organization-form-actions" style={s.actions}>
                <button type="submit" style={s.primaryBtn} disabled={saving}>
                  {saving ? t("common.saving") : t("organization.saveJobTitle")}
                </button>
                <button type="button" style={s.cancelBtn} onClick={() => navigate("/organization")}>
                  {t("common.cancel")}
                </button>
              </div>
            </form>
          )}
        </section>
      </main>
    </div>
  );
}

function Field({ error, label, onChange, value }) {
  return (
    <label style={s.field}>
      <span style={s.label}>{label}</span>
      <input
        className="organization-input"
        style={s.input}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      {error && <span style={s.error}>{error}</span>}
    </label>
  );
}

function Toggle({ checked, label, onChange }) {
  return (
    <label style={s.toggleRow}>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <span>{label}</span>
    </label>
  );
}

function Toast({ toast }) {
  return (
    <div
      className="organization-toast"
      style={{
        ...s.toast,
        background: toast.type === "error" ? "#fef2f2" : "#ecfdf5",
        borderColor: toast.type === "error" ? "#fecaca" : "#a7f3d0",
        color: toast.type === "error" ? "#dc2626" : "#059669",
      }}
    >
      {toast.msg}
    </div>
  );
}

const s = {
  page: { minHeight: "100vh", background: "#f8fafc", fontFamily: "'Cairo', sans-serif" },
  main: { maxWidth: "980px", margin: "0 auto", padding: "32px" },
  toast: {
    position: "fixed",
    top: "24px",
    left: "50%",
    transform: "translateX(-50%)",
    padding: "12px 20px",
    border: "1px solid",
    borderRadius: "12px",
    fontSize: "14px",
    fontWeight: "700",
    zIndex: 999,
    boxShadow: "0 8px 24px rgba(15,23,42,0.1)",
  },
  backBtn: {
    marginBottom: "18px",
    border: "1.5px solid #e2e8f0",
    background: "#fff",
    color: "#475569",
    borderRadius: "10px",
    padding: "10px 14px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "800",
    fontFamily: "'Cairo', sans-serif",
  },
  card: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: "14px",
    padding: "24px",
  },
  title: { color: "#0f172a", fontSize: "24px", fontWeight: "800" },
  subtitle: { color: "#64748b", fontSize: "14px", fontWeight: "600", marginTop: "4px", marginBottom: "20px" },
  form: { display: "flex", flexDirection: "column", gap: "14px" },
  formGrid: { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "14px" },
  field: { display: "flex", flexDirection: "column", gap: "7px", minWidth: 0 },
  label: { color: "#334155", fontSize: "13px", fontWeight: "800" },
  input: {
    width: "100%",
    height: "44px",
    border: "1.5px solid #e2e8f0",
    borderRadius: "10px",
    background: "#f8fafc",
    color: "#0f172a",
    outline: "none",
    padding: "0 12px",
    fontSize: "13px",
    fontWeight: "700",
    fontFamily: "'Cairo', sans-serif",
  },
  error: { color: "#dc2626", fontSize: "12px", fontWeight: "700" },
  toggleRow: { display: "flex", alignItems: "center", gap: "8px", color: "#334155", fontSize: "13px", fontWeight: "800" },
  actions: { display: "flex", gap: "10px", marginTop: "4px" },
  primaryBtn: {
    border: "none",
    borderRadius: "10px",
    padding: "11px 18px",
    background: "#2563eb",
    color: "#fff",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "800",
    fontFamily: "'Cairo', sans-serif",
  },
  cancelBtn: {
    border: "1.5px solid #e2e8f0",
    borderRadius: "10px",
    padding: "11px 18px",
    background: "#fff",
    color: "#475569",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "800",
    fontFamily: "'Cairo', sans-serif",
  },
  empty: { padding: "48px", textAlign: "center", color: "#94a3b8", fontWeight: "800" },
};
