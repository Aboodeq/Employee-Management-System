import { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import { getImageUrl, updateProfile } from "../api/employeeApi";
import { useAuth } from "../context/authContextValue";
import { useI18n } from "../i18n/i18n";

export default function ProfilePage() {
  const { dir, formatDate, t } = useI18n();
  const { permissions, refreshUser, role, user } = useAuth();
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    current_password: "",
    password: "",
    password_confirmation: "",
    image: null,
  });
  const [preview, setPreview] = useState(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!user) return;

    let isMounted = true;

    Promise.resolve().then(() => {
      if (!isMounted) return;

      setForm((current) => ({
        ...current,
        name: user.name || "",
        username: user.username || "",
        email: user.email || "",
        image: null,
      }));
      setPreview(getImageUrl(user) || null);
      setRemoveImage(false);
    });

    return () => {
      isMounted = false;
    };
  }, [user]);

  const initials = useMemo(() => {
    const name = user?.name || user?.username || "";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [user]);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleChange = (event) => {
    const { name, value, files } = event.target;

    if (name === "image" && files[0]) {
      setForm((current) => ({ ...current, image: files[0] }));
      setPreview(URL.createObjectURL(files[0]));
      setRemoveImage(false);
    } else {
      setForm((current) => ({ ...current, [name]: value }));
    }

    setErrors((current) => ({ ...current, [name]: null }));
  };

  const handleRemoveImage = () => {
    setPreview(null);
    setRemoveImage(true);
    setForm((current) => ({ ...current, image: null }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setErrors({});

    const fd = new FormData();
    fd.append("_method", "PUT");
    fd.append("name", form.name.trim());
    fd.append("username", form.username.trim());
    fd.append("email", form.email.trim());

    if (form.current_password || form.password || form.password_confirmation) {
      fd.append("current_password", form.current_password);
      fd.append("password", form.password);
      fd.append("password_confirmation", form.password_confirmation);
    }

    if (form.image) fd.append("image", form.image);
    if (removeImage) fd.append("remove_image", "1");

    try {
      const res = await updateProfile(fd);
      if (!res.success) {
        setErrors(res.errors || {});
        throw new Error(res.message || t("profile.reviewData"));
      }

      showToast(t("profile.updateSuccess"));
      setForm((current) => ({
        ...current,
        current_password: "",
        password: "",
        password_confirmation: "",
        image: null,
      }));
      await refreshUser();
    } catch (error) {
      showToast(error.message || t("profile.saveError"), "error");
    } finally {
      setSaving(false);
    }
  };

  const fieldError = (name) => {
    const error = errors[name];
    return Array.isArray(error) ? error[0] : error;
  };

  const passwordType = showPassword ? "text" : "password";

  return (
    <div className="profile-page" style={{ ...s.page, direction: dir }} dir={dir}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800&display=swap');
        .profile-page, .profile-page * { box-sizing: border-box; }
        .profile-input:focus { border-color:#2563eb !important; box-shadow:0 0 0 3px rgba(37,99,235,0.1) !important; background:#fff !important; }
        .profile-upload:hover { border-color:#2563eb !important; background:#eff6ff !important; }
        @media (max-width: 980px) {
          .profile-layout { grid-template-columns: 1fr !important; }
          .profile-main { padding: 32px 24px !important; }
        }
        @media (max-width: 680px) {
          .profile-main { padding: 28px 18px !important; }
          .profile-card { border-radius: 16px !important; padding: 20px !important; }
          .profile-fields { grid-template-columns: 1fr !important; }
          .profile-actions { flex-direction: column !important; }
          .profile-actions button { width: 100% !important; justify-content: center !important; }
          .profile-toast { width: calc(100% - 32px) !important; text-align: center !important; justify-content: center !important; }
        }
      `}</style>

      <Navbar />

      {toast && (
        <div
          className="profile-toast"
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

      <main className="profile-main" style={s.main}>
        <div style={s.header}>
          <h1 style={s.title}>{t("profile.title")}</h1>
          <p style={s.subtitle}>{t("profile.subtitle")}</p>
        </div>

        <div className="profile-layout" style={s.layout}>
          <aside className="profile-card" style={s.sideCard}>
            <div style={s.cover} />
            <div style={s.avatarWrap}>
              {preview ? (
                <img src={preview} alt={t("profile.imageAlt")} style={s.avatarImg} />
              ) : (
                <div style={s.avatarFallback}>{initials || "U"}</div>
              )}
            </div>
            <h2 style={s.name}>{user?.name}</h2>
            <span style={{ ...s.roleBadge, ...roleColors[role] }}>{t(`users.roles.${role}`)}</span>
            <div style={s.metaList}>
              <div style={s.metaItem}>
                <span style={s.metaLabel}>{t("profile.email")}</span>
                <span style={s.metaValue}>{user?.email}</span>
              </div>
              <div style={s.metaItem}>
                <span style={s.metaLabel}>{t("profile.memberSince")}</span>
                <span style={s.metaValue}>{formatDate(user?.created_at)}</span>
              </div>
            </div>
            <div style={s.permissionsBlock}>
              <p style={s.permissionsTitle}>{t("profile.permissionsTitle")}</p>
              <div style={s.permissionList}>
                {permissions.map((permission) => (
                  <span key={permission} style={s.permissionPill}>
                    {t(`profile.permissions.${permission.replace(".", "_")}`)}
                  </span>
                ))}
              </div>
            </div>
          </aside>

          <section className="profile-card" style={s.formCard}>
            <h2 style={s.sectionTitle}>{t("profile.editTitle")}</h2>
            <form onSubmit={handleSubmit} style={s.form} noValidate>
              <div className="profile-fields" style={s.fieldsGrid}>
                <label style={s.field}>
                  <span style={s.label}>{t("users.fields.name")}</span>
                  <input
                    className="profile-input"
                    style={s.input}
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                  />
                  {fieldError("name") && <span style={s.error}>{fieldError("name")}</span>}
                </label>

                <label style={s.field}>
                  <span style={s.label}>{t("users.fields.username")}</span>
                  <input
                    className="profile-input"
                    style={s.input}
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                  />
                  {fieldError("username") && <span style={s.error}>{fieldError("username")}</span>}
                </label>

                <label style={s.fieldWide}>
                  <span style={s.label}>{t("users.fields.email")}</span>
                  <input
                    className="profile-input"
                    style={s.input}
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                  />
                  {fieldError("email") && <span style={s.error}>{fieldError("email")}</span>}
                </label>
              </div>

              <div style={s.uploadBlock}>
                <label className="profile-upload" style={s.uploadZone}>
                  <span>{t("profile.uploadImage")}</span>
                  <input type="file" name="image" accept="image/*" style={{ display: "none" }} onChange={handleChange} />
                </label>
                {(preview || user?.image) && (
                  <button type="button" style={s.removeBtn} onClick={handleRemoveImage}>
                    {t("profile.removeImage")}
                  </button>
                )}
                {fieldError("image") && <span style={s.error}>{fieldError("image")}</span>}
              </div>

              <div style={s.passwordCard}>
                <div style={s.passwordHeader}>
                  <div>
                    <h3 style={s.passwordTitle}>{t("profile.passwordTitle")}</h3>
                    <p style={s.passwordSubtitle}>{t("profile.passwordSubtitle")}</p>
                  </div>
                  <button
                    type="button"
                    style={s.showPasswordBtn}
                    aria-label={showPassword ? t("login.hidePassword") : t("login.showPassword")}
                    title={showPassword ? t("login.hidePassword") : t("login.showPassword")}
                    onClick={() => setShowPassword((current) => !current)}
                  >
                    {showPassword ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M3 3l18 18"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                        <path
                          d="M10.58 10.58A2 2 0 0 0 13.42 13.42"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                        <path
                          d="M9.88 5.09A10.6 10.6 0 0 1 12 4c7 0 10 8 10 8a15.8 15.8 0 0 1-3.03 4.54M6.61 6.61C3.93 8.41 2 12 2 12s3 8 10 8a10.8 10.8 0 0 0 4.39-.94"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M2 12s3-8 10-8 10 8 10 8-3 8-10 8-10-8-10-8z"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                      </svg>
                    )}
                  </button>
                </div>

                <div className="profile-fields" style={s.fieldsGrid}>
                  <label style={s.field}>
                    <span style={s.label}>{t("profile.fields.currentPassword")}</span>
                    <input
                      className="profile-input"
                      style={s.input}
                      type={passwordType}
                      name="current_password"
                      value={form.current_password}
                      onChange={handleChange}
                    />
                    {fieldError("current_password") && (
                      <span style={s.error}>{fieldError("current_password")}</span>
                    )}
                  </label>

                  <label style={s.field}>
                    <span style={s.label}>{t("profile.fields.newPassword")}</span>
                    <input
                      className="profile-input"
                      style={s.input}
                      type={passwordType}
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                    />
                    {fieldError("password") && <span style={s.error}>{fieldError("password")}</span>}
                  </label>

                  <label style={s.fieldWide}>
                    <span style={s.label}>{t("profile.fields.confirmPassword")}</span>
                    <input
                      className="profile-input"
                      style={s.input}
                      type={passwordType}
                      name="password_confirmation"
                      value={form.password_confirmation}
                      onChange={handleChange}
                    />
                  </label>
                </div>
              </div>

              <div className="profile-actions" style={s.actions}>
                <button type="submit" style={s.primaryBtn} disabled={saving}>
                  {saving ? t("common.saving") : t("profile.save")}
                </button>
                <button
                  type="button"
                  style={s.cancelBtn}
                  onClick={() =>
                    setForm((current) => ({
                      ...current,
                      current_password: "",
                      password: "",
                      password_confirmation: "",
                    }))
                  }
                >
                  {t("profile.clearPassword")}
                </button>
              </div>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}

const roleColors = {
  admin: { background: "#fef2f2", color: "#dc2626", borderColor: "#fecaca" },
  hr: { background: "#eff6ff", color: "#2563eb", borderColor: "#bfdbfe" },
  viewer: { background: "#f8fafc", color: "#475569", borderColor: "#e2e8f0" },
};

const s = {
  page: {
    minHeight: "100vh",
    background: "#f8fafc",
    fontFamily: "'Cairo', sans-serif",
  },
  main: { maxWidth: "1180px", margin: "0 auto", padding: "36px 32px" },
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
  header: { marginBottom: "24px" },
  title: { color: "#0f172a", fontSize: "26px", fontWeight: "800" },
  subtitle: { color: "#94a3b8", fontSize: "14px", fontWeight: "600", marginTop: "4px" },
  layout: { display: "grid", gridTemplateColumns: "320px 1fr", gap: "22px", alignItems: "start" },
  sideCard: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: "18px",
    padding: "0 22px 22px",
    overflow: "hidden",
    boxShadow: "0 4px 16px rgba(15,23,42,0.04)",
    textAlign: "center",
  },
  cover: {
    height: "108px",
    margin: "0 -22px",
    background: "linear-gradient(135deg, #1d4ed8, #7c3aed)",
  },
  avatarWrap: {
    width: "118px",
    height: "118px",
    margin: "-58px auto 14px",
    padding: "5px",
    borderRadius: "26px",
    background: "#fff",
    border: "1px solid #e2e8f0",
    boxShadow: "0 14px 32px rgba(15,23,42,0.16)",
  },
  avatarImg: { width: "100%", height: "100%", objectFit: "cover", borderRadius: "20px", display: "block" },
  avatarFallback: {
    width: "100%",
    height: "100%",
    borderRadius: "20px",
    background: "linear-gradient(135deg, #2563eb, #7c3aed)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "32px",
    fontWeight: "800",
  },
  name: { color: "#0f172a", fontSize: "18px", fontWeight: "800", marginBottom: "8px" },
  roleBadge: {
    display: "inline-flex",
    border: "1px solid",
    borderRadius: "999px",
    padding: "4px 12px",
    fontSize: "12px",
    fontWeight: "800",
    marginBottom: "18px",
  },
  metaList: { display: "grid", gap: "10px", textAlign: "start", marginBottom: "18px" },
  metaItem: {
    background: "#f8fafc",
    border: "1px solid #f1f5f9",
    borderRadius: "10px",
    padding: "10px 12px",
    display: "grid",
    gap: "3px",
  },
  metaLabel: { color: "#94a3b8", fontSize: "12px", fontWeight: "700" },
  metaValue: { color: "#334155", fontSize: "13px", fontWeight: "700", overflowWrap: "anywhere" },
  permissionsBlock: { textAlign: "start" },
  permissionsTitle: { color: "#0f172a", fontSize: "14px", fontWeight: "800", marginBottom: "10px" },
  permissionList: { display: "flex", flexWrap: "wrap", gap: "8px" },
  permissionPill: {
    background: "#ecfdf5",
    color: "#059669",
    border: "1px solid #a7f3d0",
    borderRadius: "999px",
    padding: "4px 10px",
    fontSize: "11px",
    fontWeight: "800",
  },
  formCard: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: "18px",
    padding: "26px",
    boxShadow: "0 4px 16px rgba(15,23,42,0.04)",
  },
  sectionTitle: { color: "#0f172a", fontSize: "18px", fontWeight: "800", marginBottom: "20px" },
  form: { display: "flex", flexDirection: "column", gap: "20px" },
  fieldsGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" },
  field: { display: "flex", flexDirection: "column", gap: "7px" },
  fieldWide: { display: "flex", flexDirection: "column", gap: "7px", gridColumn: "1 / -1" },
  label: { color: "#334155", fontSize: "13px", fontWeight: "700" },
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
    fontWeight: "600",
    fontFamily: "'Cairo', sans-serif",
  },
  error: { color: "#dc2626", fontSize: "12px", fontWeight: "600" },
  uploadBlock: { display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" },
  uploadZone: {
    border: "1.5px dashed #cbd5e1",
    background: "#f8fafc",
    color: "#475569",
    borderRadius: "10px",
    padding: "11px 16px",
    fontSize: "13px",
    fontWeight: "800",
    cursor: "pointer",
  },
  removeBtn: {
    border: "1px solid #fecaca",
    background: "#fef2f2",
    color: "#dc2626",
    borderRadius: "10px",
    padding: "11px 16px",
    fontSize: "13px",
    fontWeight: "800",
    cursor: "pointer",
    fontFamily: "'Cairo', sans-serif",
  },
  passwordCard: {
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "14px",
    padding: "18px",
  },
  passwordHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    alignItems: "flex-start",
    marginBottom: "16px",
  },
  passwordTitle: { color: "#0f172a", fontSize: "15px", fontWeight: "800" },
  passwordSubtitle: { color: "#94a3b8", fontSize: "12px", fontWeight: "600", marginTop: "3px" },
  showPasswordBtn: {
    width: "40px",
    height: "40px",
    border: "1px solid #bfdbfe",
    background: "#eff6ff",
    color: "#2563eb",
    borderRadius: "10px",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  actions: { display: "flex", gap: "10px" },
  primaryBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #2563eb, #6d28d9)",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    padding: "12px 20px",
    fontSize: "14px",
    fontWeight: "800",
    cursor: "pointer",
    fontFamily: "'Cairo', sans-serif",
  },
  cancelBtn: {
    background: "#fff",
    color: "#475569",
    border: "1.5px solid #e2e8f0",
    borderRadius: "10px",
    padding: "12px 20px",
    fontSize: "14px",
    fontWeight: "800",
    cursor: "pointer",
    fontFamily: "'Cairo', sans-serif",
  },
};
