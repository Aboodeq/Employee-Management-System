import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { deleteUser, getUsers } from "../api/employeeApi";
import { useAuth } from "../context/authContextValue";
import { useI18n } from "../i18n/i18n";

export default function UserManagementPage() {
  const { dir, formatDate, formatNumber, t } = useI18n();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [toast, setToast] = useState(null);

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

  const stats = useMemo(
    () => [
      { label: t("users.listTitle"), value: users.length, accent: "#0f172a", bg: "#f8fafc" },
      {
        label: t("users.roles.admin"),
        value: users.filter((item) => item.role === "admin").length,
        accent: "#dc2626",
        bg: "#fef2f2",
      },
      {
        label: t("users.roles.hr"),
        value: users.filter((item) => item.role === "hr").length,
        accent: "#2563eb",
        bg: "#eff6ff",
      },
      {
        label: t("users.roles.viewer"),
        value: users.filter((item) => item.role === "viewer").length,
        accent: "#059669",
        bg: "#ecfdf5",
      },
    ],
    [t, users],
  );

  const adminCount = stats[1]?.value || 0;

  const handleDelete = async (targetUser) => {
    const isSelf = targetUser.id === currentUser?.id;
    const isLastAdmin = targetUser.role === "admin" && adminCount <= 1;

    if (isSelf) {
      showToast(t("users.cannotDeleteSelf"), "error");
      return;
    }

    if (isLastAdmin) {
      showToast(t("users.lastAdminHint"), "error");
      return;
    }

    const confirmed = window.confirm(t("users.deleteText", { name: targetUser.name }));
    if (!confirmed) return;

    setDeletingId(targetUser.id);
    try {
      const res = await deleteUser(targetUser.id);
      if (!res.success) throw new Error(res.message || t("users.deleteError"));
      showToast(t("users.deleteSuccess"));
      loadUsers();
    } catch (error) {
      showToast(error.message || t("users.deleteError"), "error");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="users-page" style={{ ...s.page, direction: dir }} dir={dir}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800&display=swap');
        .users-page, .users-page * { box-sizing: border-box; }
        .users-list-item:hover { border-color:#bfdbfe !important; box-shadow:0 10px 24px rgba(15,23,42,0.07) !important; }
        @media (max-width: 880px) {
          .users-main { padding: 28px 18px !important; }
        }
        @media (max-width: 640px) {
          .users-main { padding: 24px 14px !important; }
          .users-header { flex-direction: column !important; align-items: stretch !important; }
          .users-header button { width: 100% !important; justify-content: center !important; }
          .users-stats { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
          .users-item-head { align-items: flex-start !important; flex-direction: column !important; }
          .users-item-meta { grid-template-columns: 1fr !important; }
          .users-actions { width: 100% !important; }
          .users-actions button { flex: 1 !important; }
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
        <div className="users-header" style={s.header}>
          <div>
            <h1 style={s.title}>{t("users.title")}</h1>
            <p style={s.subtitle}>{t("users.subtitle")}</p>
          </div>
          <button type="button" style={s.secondaryBtn} onClick={() => navigate("/users/add")}>
            <PlusIcon />
            {t("users.newUser")}
          </button>
        </div>

        <section className="users-stats" style={s.statsGrid}>
          {stats.map((item) => (
            <div key={item.label} style={s.statCard}>
              <span style={{ ...s.statIcon, background: item.bg, color: item.accent }}>
                <UsersSmallIcon />
              </span>
              <div>
                <p style={s.statValue}>{formatNumber(item.value)}</p>
                <p style={s.statLabel}>{item.label}</p>
              </div>
            </div>
          ))}
        </section>

        <section style={s.listPanel}>
          <div style={s.panelHeader}>
            <h2 style={s.sectionTitle}>{t("users.listTitle")}</h2>
            <span style={s.countBadge}>{formatNumber(users.length)}</span>
          </div>

          {loading ? (
            <div style={s.empty}>{t("common.loading")}</div>
          ) : users.length === 0 ? (
            <div style={s.empty}>{t("users.empty")}</div>
          ) : (
            <div style={s.userList}>
              {users.map((item) => {
                const isSelf = item.id === currentUser?.id;
                const isLastAdmin = item.role === "admin" && adminCount <= 1;
                const deleteDisabled = isSelf || isLastAdmin || deletingId === item.id;

                return (
                  <article key={item.id} className="users-list-item" style={s.userItem}>
                    <div className="users-item-head" style={s.userHead}>
                      <div style={s.identity}>
                        <span style={s.avatar}>{item.name?.charAt(0)?.toUpperCase()}</span>
                        <div style={s.identityText}>
                          <div style={s.nameLine}>
                            <h3 style={s.userName}>{item.name}</h3>
                            {isSelf && <span style={s.selfBadge}>{t("users.currentUser")}</span>}
                          </div>
                          <p style={s.username}>@{item.username}</p>
                        </div>
                      </div>

                      <div className="users-actions" style={s.rowActions}>
                        <button type="button" style={s.editBtn} onClick={() => navigate(`/users/edit/${item.id}`)}>
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
                    </div>

                    <div className="users-item-meta" style={s.metaGrid}>
                      <Meta label={t("users.table.email")} value={item.email} />
                      <Meta
                        label={t("users.table.role")}
                        value={
                          <span style={{ ...s.roleBadge, ...roleColors[item.role] }}>
                            {t(`users.roles.${item.role}`)}
                          </span>
                        }
                      />
                      <Meta label={t("users.table.created")} value={formatDate(item.created_at)} />
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function Meta({ label, value }) {
  return (
    <div style={s.metaItem}>
      <span style={s.metaLabel}>{label}</span>
      <span style={s.metaValue}>{value}</span>
    </div>
  );
}

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

function UsersSmallIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" />
      <circle cx="10" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
      <path d="M21 21v-2a4 4 0 0 0-3-3.87" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

const roleColors = {
  admin: { background: "#fef2f2", color: "#dc2626", borderColor: "#fecaca" },
  hr: { background: "#eff6ff", color: "#2563eb", borderColor: "#bfdbfe" },
  viewer: { background: "#ecfdf5", color: "#059669", borderColor: "#a7f3d0" },
};

const s = {
  page: {
    background: "#f8fafc",
    minHeight: "100vh",
    fontFamily: "'Cairo', sans-serif",
  },
  main: { maxWidth: "1280px", margin: "0 auto", padding: "32px" },
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
    marginBottom: "20px",
  },
  title: { color: "#0f172a", fontSize: "26px", fontWeight: "800" },
  subtitle: { color: "#64748b", fontSize: "14px", fontWeight: "600", marginTop: "4px" },
  secondaryBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    background: "#fff",
    color: "#2563eb",
    border: "1.5px solid #bfdbfe",
    borderRadius: "10px",
    padding: "10px 16px",
    fontSize: "13px",
    fontWeight: "800",
    cursor: "pointer",
    fontFamily: "'Cairo', sans-serif",
  },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "12px", marginBottom: "18px" },
  statCard: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    padding: "14px",
  },
  statIcon: {
    width: "38px",
    height: "38px",
    borderRadius: "10px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  statValue: { color: "#0f172a", fontSize: "20px", fontWeight: "800", lineHeight: 1.1 },
  statLabel: { color: "#64748b", fontSize: "12px", fontWeight: "700", marginTop: "3px" },
  listPanel: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: "14px",
    padding: "18px",
  },
  panelHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    marginBottom: "16px",
  },
  sectionTitle: { color: "#0f172a", fontSize: "17px", fontWeight: "800" },
  countBadge: {
    minWidth: "34px",
    height: "28px",
    borderRadius: "999px",
    background: "#eff6ff",
    color: "#2563eb",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    fontWeight: "800",
  },
  userList: { display: "grid", gap: "10px" },
  userItem: {
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    padding: "14px",
    background: "#fff",
    transition: "all 0.18s",
  },
  userHead: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: "14px" },
  identity: { display: "flex", alignItems: "center", gap: "10px", minWidth: 0 },
  avatar: {
    width: "42px",
    height: "42px",
    borderRadius: "12px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#eff6ff",
    color: "#2563eb",
    fontSize: "15px",
    fontWeight: "800",
    flexShrink: 0,
  },
  identityText: { minWidth: 0 },
  nameLine: { display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" },
  userName: { color: "#0f172a", fontSize: "15px", fontWeight: "800" },
  username: { color: "#64748b", fontSize: "12px", fontWeight: "700", marginTop: "2px" },
  selfBadge: {
    background: "#ecfdf5",
    color: "#059669",
    borderRadius: "999px",
    padding: "2px 8px",
    fontSize: "11px",
    fontWeight: "800",
  },
  rowActions: { display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" },
  editBtn: {
    border: "1px solid #bfdbfe",
    background: "#eff6ff",
    color: "#2563eb",
    borderRadius: "9px",
    padding: "8px 12px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "800",
    fontFamily: "'Cairo', sans-serif",
  },
  deleteBtn: {
    border: "1px solid #fecaca",
    background: "#fef2f2",
    color: "#dc2626",
    borderRadius: "9px",
    padding: "8px 12px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "800",
    fontFamily: "'Cairo', sans-serif",
  },
  metaGrid: { display: "grid", gridTemplateColumns: "1.4fr 0.8fr 1fr", gap: "10px", marginTop: "14px" },
  metaItem: {
    minWidth: 0,
    background: "#f8fafc",
    border: "1px solid #f1f5f9",
    borderRadius: "10px",
    padding: "10px",
  },
  metaLabel: { display: "block", color: "#94a3b8", fontSize: "11px", fontWeight: "800", marginBottom: "4px" },
  metaValue: { display: "block", color: "#334155", fontSize: "13px", fontWeight: "700", overflowWrap: "anywhere" },
  roleBadge: {
    display: "inline-flex",
    border: "1px solid",
    borderRadius: "999px",
    padding: "3px 9px",
    fontSize: "12px",
    fontWeight: "800",
  },
  empty: { padding: "48px", textAlign: "center", color: "#94a3b8", fontWeight: "800" },
};
