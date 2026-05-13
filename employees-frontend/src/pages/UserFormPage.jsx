import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { createUser, getUsers, updateUser } from "../api/employeeApi";
import { useAuth } from "../context/authContextValue";
import { useI18n } from "../i18n/i18n";

const blankForm = {
  name: "",
  username: "",
  email: "",
  role: "viewer",
  password: "",
};

export default function UserFormPage() {
  const { dir, t } = useI18n();
  const { refreshUser, user: currentUser } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const [form, setForm] = useState(blankForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const showToast = useCallback((msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  useEffect(() => {
    if (!isEditing) return;

    let isMounted = true;
    getUsers()
      .then((res) => {
        if (!res.success) throw new Error(res.message || t("users.loadError"));
        const targetUser = (res.data || []).find((item) => String(item.id) === String(id));
        if (!targetUser) throw new Error(t("detail.notFound"));

        if (!isMounted) return;
        setForm({
          name: targetUser.name || "",
          username: targetUser.username || "",
          email: targetUser.email || "",
          role: targetUser.role || "viewer",
          password: "",
        });
      })
      .catch((error) => showToast(error.message || t("users.loadError"), "error"))
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
      name: form.name.trim(),
      username: form.username.trim(),
      email: form.email.trim(),
      role: form.role,
      password: form.password,
    };

    if (isEditing && !payload.password) {
      delete payload.password;
    }

    try {
      const res = isEditing ? await updateUser(id, payload) : await createUser(payload);
      if (!res.success) {
        setErrors(res.errors || {});
        throw new Error(res.message || t("users.reviewData"));
      }

      showToast(isEditing ? t("users.updateSuccess") : t("users.createSuccess"));
      if (String(id) === String(currentUser?.id)) {
        await refreshUser();
      }
      setTimeout(() => navigate("/users"), 900);
    } catch (error) {
      showToast(error.message || t("users.saveError"), "error");
    } finally {
      setSaving(false);
    }
  };

  const fieldError = (name) => {
    const error = errors[name];
    return Array.isArray(error) ? error[0] : error;
  };

  return (
    <div className="users-page" style={{ ...s.page, direction: dir }} dir={dir}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800&display=swap');
        .users-page, .users-page * { box-sizing: border-box; }
        .users-input:focus { border-color:#2563eb !important; box-shadow:0 0 0 3px rgba(37,99,235,0.1) !important; background:#fff !important; }
        @media (max-width: 880px) {
          .users-main { padding: 28px 18px !important; }
        }
        @media (max-width: 640px) {
          .users-main { padding: 24px 14px !important; }
          .user-form-card { padding: 20px !important; }
          .users-form-grid { grid-template-columns: 1fr !important; }
          .users-form-actions { flex-direction: column !important; }
          .users-form-actions button { width: 100% !important; justify-content: center !important; }
          .users-toast { width: calc(100% - 32px) !important; text-align: center !important; justify-content: center !important; }
        }
      `}</style>

      <Navbar />

      {toast && (
        <div
          className="users-toast"
          style={{
            ...s.toast,
            background: toast.type === "error" ? "#fef2f2" : "#ecfdf5",
            borderColor: toast.type === "error" ? "#fecaca" : "#a7f3d0",
            color: toast.type === "error" ? "#dc2626" : "#059669",
          }}
        >
          {toast.msg}
        </div>
      )}

      <main className="users-main" style={s.main}>
        <button type="button" style={s.backBtn} onClick={() => navigate("/users")}>
          {t("common.backToList")}
        </button>

        <section className="user-form-card" style={s.card}>
          <div style={s.header}>
            <div>
              <h1 style={s.title}>{isEditing ? t("users.editTitle") : t("users.createTitle")}</h1>
              <p style={s.subtitle}>{t("users.subtitle")}</p>
            </div>
            {isEditing && <span style={s.editingBadge}>#{id}</span>}
          </div>

          {loading ? (
            <div style={s.empty}>{t("common.loading")}</div>
          ) : (
            <form onSubmit={handleSubmit} style={s.form} noValidate>
              <div className="users-form-grid" style={s.formGrid}>
                <Field
                  error={fieldError("name")}
                  label={t("users.fields.name")}
                  value={form.name}
                  onChange={(value) => setForm((current) => ({ ...current, name: value }))}
                />
                <Field
                  error={fieldError("username")}
                  label={t("users.fields.username")}
                  value={form.username}
                  onChange={(value) => setForm((current) => ({ ...current, username: value }))}
                />
                <Field
                  error={fieldError("email")}
                  label={t("users.fields.email")}
                  type="email"
                  value={form.email}
                  onChange={(value) => setForm((current) => ({ ...current, email: value }))}
                />

                <label style={s.field}>
                  <span style={s.label}>{t("users.fields.role")}</span>
                  <select
                    className="users-input"
                    style={s.input}
                    value={form.role}
                    onChange={(event) => setForm((current) => ({ ...current, role: event.target.value }))}
                  >
                    <option value="admin">{t("users.roles.admin")}</option>
                    <option value="hr">{t("users.roles.hr")}</option>
                    <option value="viewer">{t("users.roles.viewer")}</option>
                  </select>
                  {fieldError("role") && <span style={s.error}>{fieldError("role")}</span>}
                </label>
              </div>

              <label style={s.field}>
                <span style={s.label}>
                  {isEditing ? t("users.fields.passwordOptional") : t("users.fields.password")}
                </span>
                <div style={s.passwordWrap}>
                  <input
                    className="users-input"
                    style={{ ...s.input, paddingInlineEnd: "44px" }}
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                  />
                  <button
                    type="button"
                    style={s.eyeBtn}
                    aria-label={showPassword ? t("login.hidePassword") : t("login.showPassword")}
                    title={showPassword ? t("login.hidePassword") : t("login.showPassword")}
                    onClick={() => setShowPassword((current) => !current)}
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
                {fieldError("password") && <span style={s.error}>{fieldError("password")}</span>}
              </label>

              <div className="users-form-actions" style={s.formActions}>
                <button type="submit" style={s.primaryBtn} disabled={saving}>
                  {saving ? t("common.saving") : isEditing ? t("users.saveChanges") : t("users.createUser")}
                </button>
                <button type="button" style={s.cancelBtn} onClick={() => navigate("/users")}>
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

function Field({ error, label, onChange, type = "text", value }) {
  return (
    <label style={s.field}>
      <span style={s.label}>{label}</span>
      <input
        className="users-input"
        style={s.input}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      {error && <span style={s.error}>{error}</span>}
    </label>
  );
}

function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M2 12s3-8 10-8 10 8 10 8-3 8-10 8-10-8-10-8z" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M3 3l18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M10.58 10.58A2 2 0 0 0 13.42 13.42" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M9.88 5.09A10.6 10.6 0 0 1 12 4c7 0 10 8 10 8a15.8 15.8 0 0 1-3.03 4.54M6.61 6.61C3.93 8.41 2 12 2 12s3 8 10 8a10.8 10.8 0 0 0 4.39-.94" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const s = {
  page: { background: "#f8fafc", minHeight: "100vh", fontFamily: "'Cairo', sans-serif" },
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
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "14px",
    marginBottom: "20px",
  },
  title: { color: "#0f172a", fontSize: "24px", fontWeight: "800" },
  subtitle: { color: "#64748b", fontSize: "14px", fontWeight: "600", marginTop: "4px" },
  editingBadge: {
    background: "#f8fafc",
    color: "#64748b",
    border: "1px solid #e2e8f0",
    borderRadius: "999px",
    padding: "4px 10px",
    fontSize: "12px",
    fontWeight: "800",
  },
  form: { display: "flex", flexDirection: "column", gap: "16px" },
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
  passwordWrap: { position: "relative" },
  eyeBtn: {
    position: "absolute",
    insetInlineEnd: "8px",
    top: "50%",
    transform: "translateY(-50%)",
    width: "30px",
    height: "30px",
    border: "none",
    borderRadius: "8px",
    background: "transparent",
    color: "#2563eb",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  },
  error: { color: "#dc2626", fontSize: "12px", fontWeight: "700" },
  formActions: { display: "flex", gap: "10px", marginTop: "4px" },
  primaryBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    padding: "11px 18px",
    fontSize: "13px",
    fontWeight: "800",
    cursor: "pointer",
    fontFamily: "'Cairo', sans-serif",
  },
  cancelBtn: {
    background: "#fff",
    color: "#475569",
    border: "1.5px solid #e2e8f0",
    borderRadius: "10px",
    padding: "11px 18px",
    fontSize: "13px",
    fontWeight: "800",
    cursor: "pointer",
    fontFamily: "'Cairo', sans-serif",
  },
  empty: { padding: "48px", textAlign: "center", color: "#94a3b8", fontWeight: "800" },
};
