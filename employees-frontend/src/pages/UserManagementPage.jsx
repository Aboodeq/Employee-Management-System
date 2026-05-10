import { useCallback, useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { createUser, deleteUser, getUsers, updateUser } from "../api/employeeApi";
import { useAuth } from "../context/authContextValue";
import { useI18n } from "../i18n/i18n";

const blankForm = {
  name: "",
  username: "",
  email: "",
  role: "viewer",
  password: "",
};

export default function UserManagementPage() {
  const { dir, formatDate, t } = useI18n();
  const { refreshUser, user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(blankForm);
  const [editingId, setEditingId] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [toast, setToast] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const showToast = useCallback((msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const loadUsers = useCallback(() => {
    setLoading(true);
    getUsers()
      .then((res) => {
        if (!res.success) throw new Error(res.message || t("users.loadError"));
        setUsers(res.data || []);
      })
      .catch((error) => showToast(error.message || t("users.loadError"), "error"))
      .finally(() => setLoading(false));
  }, [showToast, t]);

  useEffect(() => {
    Promise.resolve().then(loadUsers);
  }, [loadUsers]);

  const adminCount = users.filter((item) => item.role === "admin").length;
  const isEditing = Boolean(editingId);

  const resetForm = () => {
    setForm(blankForm);
    setEditingId(null);
    setErrors({});
    setShowPassword(false);
  };

  const handleEdit = (user) => {
    setEditingId(user.id);
    setErrors({});
    setShowPassword(false);
    setForm({
      name: user.name || "",
      username: user.username || "",
      email: user.email || "",
      role: user.role || "viewer",
      password: "",
    });
  };

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
      const res = isEditing ? await updateUser(editingId, payload) : await createUser(payload);
      if (!res.success) {
        setErrors(res.errors || {});
        throw new Error(res.message || t("users.reviewData"));
      }

      showToast(isEditing ? t("users.updateSuccess") : t("users.createSuccess"));
      if (editingId === currentUser?.id) {
        await refreshUser();
      }
      resetForm();
      loadUsers();
    } catch (error) {
      showToast(error.message || t("users.saveError"), "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (target) => {
    const isSelf = target.id === currentUser?.id;
    const isLastAdmin = target.role === "admin" && adminCount <= 1;

    if (isSelf) {
      showToast(t("users.cannotDeleteSelf"), "error");
      return;
    }

    if (isLastAdmin) {
      showToast(t("users.lastAdminHint"), "error");
      return;
    }

    const confirmed = window.confirm(t("users.deleteText", { name: target.name }));
    if (!confirmed) return;

    setDeletingId(target.id);
    try {
      const res = await deleteUser(target.id);
      if (!res.success) throw new Error(res.message || t("users.deleteError"));
      showToast(t("users.deleteSuccess"));
      loadUsers();
    } catch (error) {
      showToast(error.message || t("users.deleteError"), "error");
    } finally {
      setDeletingId(null);
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
        .users-row:hover { background:#f8fafc !important; }
        @media (max-width: 980px) {
          .users-layout { grid-template-columns: 1fr !important; }
          .users-main { padding: 32px 24px !important; }
        }
        @media (max-width: 680px) {
          .users-main { padding: 28px 18px !important; }
          .users-card { padding: 20px !important; border-radius: 16px !important; }
          .users-form-grid { grid-template-columns: 1fr !important; }
          .users-table-scroll { overflow-x: auto !important; }
          .users-table { min-width: 760px !important; }
          .users-actions { flex-direction: column !important; }
          .users-actions button { width: 100% !important; justify-content: center !important; }
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
        <div style={s.header}>
          <div>
            <h1 style={s.title}>{t("users.title")}</h1>
            <p style={s.subtitle}>{t("users.subtitle")}</p>
          </div>
          <button type="button" style={s.secondaryBtn} onClick={resetForm}>
            {t("users.newUser")}
          </button>
        </div>

        <div className="users-layout" style={s.layout}>
          <section className="users-card" style={s.card}>
            <h2 style={s.sectionTitle}>
              {isEditing ? t("users.editTitle") : t("users.createTitle")}
            </h2>
            <form onSubmit={handleSubmit} style={s.form} noValidate>
              <div className="users-form-grid" style={s.formGrid}>
                <label style={s.field}>
                  <span style={s.label}>{t("users.fields.name")}</span>
                  <input
                    className="users-input"
                    style={s.input}
                    value={form.name}
                    onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  />
                  {fieldError("name") && <span style={s.error}>{fieldError("name")}</span>}
                </label>

                <label style={s.field}>
                  <span style={s.label}>{t("users.fields.username")}</span>
                  <input
                    className="users-input"
                    style={s.input}
                    value={form.username}
                    onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))}
                  />
                  {fieldError("username") && <span style={s.error}>{fieldError("username")}</span>}
                </label>

                <label style={s.field}>
                  <span style={s.label}>{t("users.fields.email")}</span>
                  <input
                    className="users-input"
                    style={s.input}
                    type="email"
                    value={form.email}
                    onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                  />
                  {fieldError("email") && <span style={s.error}>{fieldError("email")}</span>}
                </label>

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

                <label style={s.fieldWide}>
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
                  {fieldError("password") && <span style={s.error}>{fieldError("password")}</span>}
                </label>
              </div>

              <div className="users-actions" style={s.formActions}>
                <button type="submit" style={s.primaryBtn} disabled={saving}>
                  {saving ? t("common.saving") : isEditing ? t("users.saveChanges") : t("users.createUser")}
                </button>
                <button type="button" style={s.cancelBtn} onClick={resetForm}>
                  {t("users.clear")}
                </button>
              </div>
            </form>
          </section>

          <section className="users-card" style={s.card}>
            <h2 style={s.sectionTitle}>{t("users.listTitle")}</h2>
            {loading ? (
              <div style={s.empty}>{t("common.loading")}</div>
            ) : users.length === 0 ? (
              <div style={s.empty}>{t("users.empty")}</div>
            ) : (
              <div className="users-table-scroll" style={s.tableScroll}>
                <table className="users-table" style={s.table}>
                  <thead>
                    <tr>
                      <th style={s.th}>{t("users.table.name")}</th>
                      <th style={s.th}>{t("users.table.username")}</th>
                      <th style={s.th}>{t("users.table.email")}</th>
                      <th style={s.th}>{t("users.table.role")}</th>
                      <th style={s.th}>{t("users.table.created")}</th>
                      <th style={s.th}>{t("users.table.actions")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((item) => {
                      const isSelf = item.id === currentUser?.id;
                      const isLastAdmin = item.role === "admin" && adminCount <= 1;
                      const deleteDisabled = isSelf || isLastAdmin || deletingId === item.id;

                      return (
                        <tr key={item.id} className="users-row">
                          <td style={s.td}>
                            <div style={s.nameCell}>
                              <span style={s.avatar}>{item.name?.charAt(0)?.toUpperCase()}</span>
                              <span>{item.name}</span>
                              {isSelf && <span style={s.selfBadge}>{t("users.currentUser")}</span>}
                            </div>
                          </td>
                          <td style={s.td}>{item.username}</td>
                          <td style={s.td}>{item.email}</td>
                          <td style={s.td}>
                            <span style={{ ...s.roleBadge, ...roleColors[item.role] }}>
                              {t(`users.roles.${item.role}`)}
                            </span>
                          </td>
                          <td style={s.td}>{formatDate(item.created_at)}</td>
                          <td style={s.td}>
                            <div style={s.rowActions}>
                              <button type="button" style={s.editBtn} onClick={() => handleEdit(item)}>
                                {t("users.edit")}
                              </button>
                              <button
                                type="button"
                                style={{ ...s.deleteBtn, opacity: deleteDisabled ? 0.45 : 1 }}
                                disabled={deleteDisabled}
                                title={isSelf ? t("users.cannotDeleteSelf") : isLastAdmin ? t("users.lastAdminHint") : ""}
                                onClick={() => handleDelete(item)}
                              >
                                {deletingId === item.id ? "..." : t("users.delete")}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
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
    background: "#f8fafc",
    minHeight: "100vh",
    fontFamily: "'Cairo', sans-serif",
  },
  main: { maxWidth: "1280px", margin: "0 auto", padding: "36px 32px" },
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
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
    marginBottom: "24px",
  },
  title: { color: "#0f172a", fontSize: "26px", fontWeight: "800" },
  subtitle: { color: "#94a3b8", fontSize: "14px", fontWeight: "600", marginTop: "4px" },
  layout: { display: "grid", gridTemplateColumns: "360px 1fr", gap: "20px", alignItems: "start" },
  card: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: "18px",
    padding: "24px",
    boxShadow: "0 4px 16px rgba(15,23,42,0.04)",
  },
  sectionTitle: { color: "#0f172a", fontSize: "17px", fontWeight: "800", marginBottom: "18px" },
  form: { display: "flex", flexDirection: "column", gap: "18px" },
  formGrid: { display: "grid", gridTemplateColumns: "1fr", gap: "14px" },
  field: { display: "flex", flexDirection: "column", gap: "7px" },
  fieldWide: { display: "flex", flexDirection: "column", gap: "7px" },
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
  error: { color: "#dc2626", fontSize: "12px", fontWeight: "600" },
  formActions: { display: "flex", gap: "10px" },
  primaryBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #2563eb, #6d28d9)",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    padding: "11px 18px",
    fontSize: "13px",
    fontWeight: "800",
    cursor: "pointer",
    fontFamily: "'Cairo', sans-serif",
  },
  secondaryBtn: {
    background: "#eff6ff",
    color: "#2563eb",
    border: "1px solid #bfdbfe",
    borderRadius: "10px",
    padding: "10px 16px",
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
  tableScroll: { overflowX: "visible" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: {
    color: "#94a3b8",
    background: "#f8fafc",
    borderBottom: "1px solid #e2e8f0",
    padding: "12px",
    textAlign: "start",
    fontSize: "12px",
    fontWeight: "800",
  },
  td: {
    borderBottom: "1px solid #f1f5f9",
    padding: "13px 12px",
    color: "#334155",
    fontSize: "13px",
    fontWeight: "600",
    verticalAlign: "middle",
  },
  nameCell: { display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" },
  avatar: {
    width: "32px",
    height: "32px",
    borderRadius: "10px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#eff6ff",
    color: "#2563eb",
    fontWeight: "800",
    flexShrink: 0,
  },
  selfBadge: {
    background: "#ecfdf5",
    color: "#059669",
    borderRadius: "999px",
    padding: "2px 8px",
    fontSize: "11px",
    fontWeight: "800",
  },
  roleBadge: {
    display: "inline-flex",
    border: "1px solid",
    borderRadius: "999px",
    padding: "4px 10px",
    fontSize: "12px",
    fontWeight: "800",
  },
  rowActions: { display: "flex", gap: "8px", flexWrap: "wrap" },
  editBtn: {
    border: "1px solid #bfdbfe",
    background: "#eff6ff",
    color: "#2563eb",
    borderRadius: "8px",
    padding: "7px 10px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "800",
    fontFamily: "'Cairo', sans-serif",
  },
  deleteBtn: {
    border: "1px solid #fecaca",
    background: "#fef2f2",
    color: "#dc2626",
    borderRadius: "8px",
    padding: "7px 10px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "800",
    fontFamily: "'Cairo', sans-serif",
  },
  empty: { padding: "48px", textAlign: "center", color: "#94a3b8", fontWeight: "700" },
};
