import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getAllEmployees } from "../api/employeeApi";
import { useAuth } from "../context/authContextValue";
import { useI18n } from "../i18n/i18n";

export default function DashboardPage() {
  const { dir, formatDate, formatNumber, t } = useI18n();
  const { can } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getAllEmployees()
      .then((res) => setEmployees(res.data || []))
      .catch(() => setEmployees([]))
      .finally(() => setLoading(false));
  }, []);

  const totalSalaries = employees.reduce((s, e) => s + parseFloat(e.salary || 0), 0);
  const positions = [...new Set(employees.map((e) => e.position))].length;
  const latest = [...employees].slice(0, 5);
  const canCreateEmployees = can("employees.create");

  const stats = [
    {
      label: t("dashboard.stats.totalEmployees"),
      value: loading ? "..." : formatNumber(employees.length),
      sub: t("dashboard.stats.registeredEmployees"),
      color: "#2563eb",
      bg: "#eff6ff",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path
            d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
            stroke="#2563eb"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx="9" cy="7" r="4" stroke="#2563eb" strokeWidth="2" />
          <path
            d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
            stroke="#2563eb"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      ),
    },
    {
      label: t("dashboard.stats.totalSalaries"),
      value: loading ? "..." : formatNumber(totalSalaries),
      sub: t("dashboard.stats.monthly"),
      color: "#059669",
      bg: "#ecfdf5",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <line
            x1="12"
            y1="1"
            x2="12"
            y2="23"
            stroke="#059669"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"
            stroke="#059669"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      ),
    },
    {
      label: t("dashboard.stats.positions"),
      value: loading ? "..." : formatNumber(positions),
      sub: t("dashboard.stats.differentPosition"),
      color: "#7c3aed",
      bg: "#f5f3ff",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <rect x="2" y="7" width="20" height="14" rx="2" stroke="#7c3aed" strokeWidth="2" />
          <path
            d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"
            stroke="#7c3aed"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      ),
    },
    {
      label: t("dashboard.stats.latestAddition"),
      value: loading
        ? "..."
        : employees.length > 0
          ? formatDate(employees[0].created_at)
          : t("common.notAvailable"),
      sub: t("dashboard.stats.latestEmployeeDate"),
      color: "#d97706",
      bg: "#fffbeb",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="4" width="18" height="18" rx="2" stroke="#d97706" strokeWidth="2" />
          <line
            x1="16"
            y1="2"
            x2="16"
            y2="6"
            stroke="#d97706"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <line
            x1="8"
            y1="2"
            x2="8"
            y2="6"
            stroke="#d97706"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <line x1="3" y1="10" x2="21" y2="10" stroke="#d97706" strokeWidth="2" />
        </svg>
      ),
    },
  ];

  return (
    <div className="dashboard-page" style={{ ...s.page, direction: dir }} dir={dir}>
      <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800&display=swap');
                @keyframes fadeUp {
                    from { opacity:0; transform:translateY(12px); }
                    to   { opacity:1; transform:translateY(0); }
                }
                .stat-card:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(0,0,0,0.08) !important; }
                .emp-row:hover { background: #f8fafc !important; }
                .quick-btn:hover { border-color: #2563eb !important; color: #2563eb !important; background: #eff6ff !important; }
                .dashboard-page,
                .dashboard-page * { box-sizing: border-box; }
                @media (max-width: 1100px) {
                    .dashboard-stats { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
                    .dashboard-bottom { grid-template-columns: 1fr !important; }
                }
                @media (max-width: 760px) {
                    .dashboard-main { padding: 28px 18px !important; }
                    .dashboard-header {
                        align-items: stretch !important;
                        flex-direction: column !important;
                        gap: 16px !important;
                        margin-bottom: 24px !important;
                    }
                    .dashboard-title { font-size: 23px !important; }
                    .dashboard-add-btn {
                        width: 100% !important;
                        justify-content: center !important;
                    }
                    .dashboard-stats {
                        grid-template-columns: 1fr !important;
                        gap: 12px !important;
                        margin-bottom: 18px !important;
                    }
                    .dashboard-stat-card {
                        padding: 18px !important;
                    }
                    .dashboard-stat-value {
                        font-size: 22px !important;
                        overflow-wrap: anywhere !important;
                    }
                    .dashboard-bottom { gap: 16px !important; }
                    .dashboard-table-header {
                        align-items: stretch !important;
                        flex-direction: column !important;
                        gap: 12px !important;
                        padding: 18px !important;
                    }
                    .dashboard-view-all {
                        justify-content: center !important;
                        width: 100% !important;
                        padding: 10px !important;
                        border-radius: 10px !important;
                        background: #eff6ff !important;
                    }
                    .dashboard-section-title { font-size: 15px !important; }
                    .dashboard-table-scroll {
                        overflow-x: auto !important;
                        -webkit-overflow-scrolling: touch !important;
                    }
                    .dashboard-table {
                        min-width: 680px !important;
                    }
                    .dashboard-quick-card {
                        padding: 18px !important;
                    }
                    .dashboard-quick-btn {
                        padding: 13px !important;
                    }
                }
                @media (max-width: 420px) {
                    .dashboard-main { padding: 24px 14px !important; }
                    .dashboard-stat-card {
                        align-items: flex-start !important;
                        gap: 12px !important;
                    }
                    .dashboard-stat-icon {
                        width: 46px !important;
                        height: 46px !important;
                    }
                    .dashboard-quick-sub {
                        display: none !important;
                    }
                }
            `}</style>

      <Navbar />

      <main className="dashboard-main" style={s.main}>
        {/* Header */}
        <div className="dashboard-header" style={s.header}>
          <div>
            <h1 className="dashboard-title" style={s.pageTitle}>
              {t("common.dashboard")}
            </h1>
            <p style={s.pageSub}>{t("dashboard.subtitle")}</p>
          </div>
          {canCreateEmployees && (
            <button className="dashboard-add-btn" style={s.addBtn} onClick={() => navigate("/employees/add")}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <line
                  x1="12"
                  y1="5"
                  x2="12"
                  y2="19"
                  stroke="#fff"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <line
                  x1="5"
                  y1="12"
                  x2="19"
                  y2="12"
                  stroke="#fff"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
              {t("dashboard.addEmployee")}
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="dashboard-stats" style={s.statsGrid}>
          {stats.map((st, i) => (
            <div
              key={i}
              className="stat-card dashboard-stat-card"
              style={{ ...s.statCard, animationDelay: `${i * 0.07}s` }}
            >
              <div className="dashboard-stat-icon" style={{ ...s.statIconWrap, background: st.bg }}>
                {st.icon}
              </div>
              <div style={s.statRight}>
                <p style={s.statLabel}>{st.label}</p>
                <p className="dashboard-stat-value" style={{ ...s.statValue, color: st.color }}>
                  {st.value}
                </p>
                <p style={s.statSub}>{st.sub}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="dashboard-bottom" style={s.bottom}>
          {/* Recent employees */}
          <div style={s.tableCard}>
            <div className="dashboard-table-header" style={s.tableHeader}>
              <h2 className="dashboard-section-title" style={s.sectionTitle}>
                {t("dashboard.recentEmployees")}
              </h2>
              <button className="dashboard-view-all" style={s.viewAll} onClick={() => navigate("/employees")}>
                {t("dashboard.viewAll")}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M15 18l-6-6 6-6"
                    stroke="#2563eb"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            {loading ? (
              <div style={s.emptyState}>{t("common.loading")}</div>
            ) : employees.length === 0 ? (
              <div style={s.emptyState}>{t("dashboard.noEmployees")}</div>
            ) : (
              <div className="dashboard-table-scroll" style={s.tableScroll}>
                <table className="dashboard-table" style={s.table}>
                  <thead>
                    <tr style={s.thead}>
                      <th style={s.th}>{t("dashboard.table.name")}</th>
                      <th style={s.th}>{t("dashboard.table.position")}</th>
                      <th style={s.th}>{t("dashboard.table.salary")}</th>
                      <th style={s.th}>{t("dashboard.table.hireDate")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {latest.map((emp, i) => (
                      <tr
                        key={emp.id}
                        className="emp-row"
                        style={s.tr}
                        onClick={() => navigate(`/employees/${emp.id}`)}
                      >
                        <td style={s.td}>
                          <div style={s.empName}>
                            <div
                              style={{
                                ...s.avatar,
                                background: [
                                  "#eff6ff",
                                  "#f5f3ff",
                                  "#ecfdf5",
                                  "#fffbeb",
                                  "#fef2f2",
                                ][i % 5],
                                color: ["#2563eb", "#7c3aed", "#059669", "#d97706", "#dc2626"][
                                  i % 5
                                ],
                              }}
                            >
                              {emp.name?.charAt(0)}
                            </div>
                            <div>
                              <p style={s.empNameText}>{emp.name}</p>
                              <p style={s.empEmail}>{emp.email}</p>
                            </div>
                          </div>
                        </td>
                        <td style={s.td}>
                          <span style={s.positionBadge}>{emp.position}</span>
                        </td>
                        <td style={s.td}>
                          <span style={s.salary}>
                            {formatNumber(parseFloat(emp.salary))} {t("common.syp")}
                          </span>
                        </td>
                        <td style={s.td}>
                          <span style={s.date}>
                            {formatDate(emp.hire_date)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Quick actions */}
          <div className="dashboard-quick-card" style={s.quickCard}>
            <h2 className="dashboard-section-title" style={s.sectionTitle}>
              {t("dashboard.quickActions")}
            </h2>
            <div style={s.quickList}>
              {[
                ...(canCreateEmployees
                  ? [
                      {
                        label: t("dashboard.quickAddLabel"),
                        sub: t("dashboard.quickAddSub"),
                        path: "/employees/add",
                        icon: (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                            <path
                              d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                            />
                            <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
                            <line
                              x1="19"
                              y1="8"
                              x2="19"
                              y2="14"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                            />
                            <line
                              x1="22"
                              y1="11"
                              x2="16"
                              y2="11"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                            />
                          </svg>
                        ),
                      },
                    ]
                  : []),
                {
                  label: t("dashboard.quickListLabel"),
                  sub: t("dashboard.quickListSub"),
                  path: "/employees",
                  icon: (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <line
                        x1="8"
                        y1="6"
                        x2="21"
                        y2="6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                      <line
                        x1="8"
                        y1="12"
                        x2="21"
                        y2="12"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                      <line
                        x1="8"
                        y1="18"
                        x2="21"
                        y2="18"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                      <circle cx="3" cy="6" r="1" fill="currentColor" />
                      <circle cx="3" cy="12" r="1" fill="currentColor" />
                      <circle cx="3" cy="18" r="1" fill="currentColor" />
                    </svg>
                  ),
                },
              ].map((q, i) => (
                <button
                  key={i}
                  className="quick-btn dashboard-quick-btn"
                  style={s.quickBtn}
                  onClick={() => navigate(q.path)}
                >
                  <div style={s.quickIcon}>{q.icon}</div>
                  <div style={s.quickText}>
                    <p style={s.quickLabel}>{q.label}</p>
                    <p className="dashboard-quick-sub" style={s.quickSub}>
                      {q.sub}
                    </p>
                  </div>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    style={{ marginRight: "auto", flexShrink: 0 }}
                  >
                    <path
                      d="M15 18l-6-6 6-6"
                      stroke="#cbd5e1"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              ))}
            </div>
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
  main: { maxWidth: "1280px", margin: "0 auto", padding: "36px 32px" },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "32px",
  },
  pageTitle: { fontSize: "26px", fontWeight: "800", color: "#0f172a" },
  pageSub: { fontSize: "14px", color: "#94a3b8", marginTop: "4px", fontWeight: "500" },
  addBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "linear-gradient(135deg, #2563eb, #6d28d9)",
    color: "#fff",
    border: "none",
    padding: "11px 22px",
    borderRadius: "12px",
    fontSize: "14px",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow: "0 4px 16px rgba(37,99,235,0.3)",
    fontFamily: "'Cairo', sans-serif",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4,1fr)",
    gap: "16px",
    marginBottom: "28px",
  },
  statCard: {
    background: "#fff",
    borderRadius: "16px",
    border: "1px solid #e2e8f0",
    padding: "22px",
    display: "flex",
    alignItems: "center",
    gap: "16px",
    cursor: "pointer",
    transition: "all 0.2s",
    animation: "fadeUp 0.4s ease both",
    direction: "rtl",
  },
  statIconWrap: {
    width: "52px",
    height: "52px",
    borderRadius: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  statRight: { display: "flex", flexDirection: "column", gap: "2px" },
  statLabel: { fontSize: "12px", fontWeight: "600", color: "#94a3b8" },
  statValue: { fontSize: "26px", fontWeight: "800", lineHeight: 1.1 },
  statSub: { fontSize: "11px", color: "#cbd5e1", fontWeight: "500" },
  bottom: { display: "grid", gridTemplateColumns: "1fr 320px", gap: "20px" },
  tableCard: {
    background: "#fff",
    borderRadius: "16px",
    border: "1px solid #e2e8f0",
    overflow: "hidden",
  },
  tableHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "20px 24px",
    borderBottom: "1px solid #f1f5f9",
  },
  sectionTitle: { fontSize: "16px", fontWeight: "800", color: "#0f172a" },
  viewAll: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    background: "none",
    border: "none",
    color: "#2563eb",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    fontFamily: "'Cairo', sans-serif",
  },
  tableScroll: { width: "100%", overflowX: "visible" },
  table: { width: "100%", borderCollapse: "collapse" },
  thead: { background: "#f8fafc" },
  th: {
    padding: "12px 24px",
    fontSize: "12px",
    fontWeight: "700",
    color: "#94a3b8",
    textAlign: "right",
    borderBottom: "1px solid #f1f5f9",
  },
  tr: { borderBottom: "1px solid #f8fafc", cursor: "pointer", transition: "background 0.15s" },
  td: { padding: "14px 24px", fontSize: "13px", verticalAlign: "middle" },
  empName: { display: "flex", alignItems: "center", gap: "10px" },
  avatar: {
    width: "34px",
    height: "34px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
    fontWeight: "800",
    flexShrink: 0,
  },
  empNameText: { fontSize: "13px", fontWeight: "700", color: "#0f172a" },
  empEmail: { fontSize: "11px", color: "#94a3b8" },
  positionBadge: {
    background: "#f5f3ff",
    color: "#7c3aed",
    fontSize: "12px",
    fontWeight: "600",
    padding: "4px 10px",
    borderRadius: "6px",
  },
  salary: { color: "#059669", fontWeight: "700", fontSize: "13px" },
  date: { color: "#94a3b8", fontSize: "12px" },
  emptyState: { padding: "48px", textAlign: "center", color: "#94a3b8", fontSize: "14px" },
  quickCard: {
    background: "#fff",
    borderRadius: "16px",
    border: "1px solid #e2e8f0",
    padding: "20px 24px",
  },
  quickList: { display: "flex", flexDirection: "column", gap: "10px", marginTop: "16px" },
  quickBtn: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "14px 16px",
    borderRadius: "12px",
    border: "1.5px solid #e2e8f0",
    background: "#fff",
    cursor: "pointer",
    transition: "all 0.18s",
    textAlign: "right",
    direction: "rtl",
    fontFamily: "'Cairo', sans-serif",
    width: "100%",
  },
  quickIcon: {
    width: "38px",
    height: "38px",
    background: "#f8fafc",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#475569",
    flexShrink: 0,
  },
  quickText: { flex: 1 },
  quickLabel: { fontSize: "13px", fontWeight: "700", color: "#0f172a" },
  quickSub: { fontSize: "11px", color: "#94a3b8", marginTop: "2px" },
};
