import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import { getEmployee, deleteEmployee } from "../api/employeeApi";

export default function EmployeeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    getEmployee(id)
      .then((res) => {
        if (res.success) setEmployee(res.data);
        else showToast("لم يتم العثور على الموظف", "error");
      })
      .catch(() => showToast("حدث خطأ أثناء التحميل", "error"))
      .finally(() => setLoading(false));
  }, [id]);

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      const res = await deleteEmployee(id);
      if (!res.success) {
        throw new Error("Failed to delete employee");
      }

      setDeleteConfirmOpen(false);
      showToast("تم حذف الموظف بنجاح");
      setTimeout(() => navigate("/employees"), 1200);
    } catch {
      showToast("فشل الحذف، حاول مجدداً", "error");
      setDeleting(false);
    }
  };

  if (loading)
    return (
      <div style={s.page}>
        <Navbar />
        <div style={s.loadingWrap}>
          <div style={s.loadingSpinner} />
          <p style={s.loadingText}>جاري تحميل بيانات الموظف...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );

  if (!employee)
    return (
      <div style={s.page}>
        <Navbar />
        <div style={s.loadingWrap}>
          <p style={s.loadingText}>لم يتم العثور على الموظف</p>
          <button style={s.backBtnAlt} onClick={() => navigate("/employees")}>
            العودة للقائمة
          </button>
        </div>
      </div>
    );

  const initials = employee.name
    ?.split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const infoRows = [
    {
      label: "البريد الإلكتروني",
      value: employee.email,
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path
            d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
            stroke="#2563eb"
            strokeWidth="2"
          />
          <polyline points="22,6 12,13 2,6" stroke="#2563eb" strokeWidth="2" />
        </svg>
      ),
      color: "#2563eb",
      bg: "#eff6ff",
    },
    {
      label: "رقم الهاتف",
      value: employee.phone,
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path
            d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.83a16 16 0 0 0 6.26 6.26l1.58-1.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"
            stroke="#7c3aed"
            strokeWidth="2"
          />
        </svg>
      ),
      color: "#7c3aed",
      bg: "#f5f3ff",
    },
    {
      label: "المسمى الوظيفي",
      value: employee.position,
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <rect x="2" y="7" width="20" height="14" rx="2" stroke="#059669" strokeWidth="2" />
          <path
            d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"
            stroke="#059669"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      ),
      color: "#059669",
      bg: "#ecfdf5",
    },
    {
      label: "الراتب الشهري",
      value: `${parseFloat(employee.salary).toLocaleString()} ل.س`,
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <line
            x1="12"
            y1="1"
            x2="12"
            y2="23"
            stroke="#d97706"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"
            stroke="#d97706"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      ),
      color: "#d97706",
      bg: "#fffbeb",
      bold: true,
    },
    {
      label: "تاريخ التعيين",
      value: new Date(employee.hire_date).toLocaleDateString("en-GB", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="4" width="18" height="18" rx="2" stroke="#0891b2" strokeWidth="2" />
          <line
            x1="16"
            y1="2"
            x2="16"
            y2="6"
            stroke="#0891b2"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <line
            x1="8"
            y1="2"
            x2="8"
            y2="6"
            stroke="#0891b2"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <line x1="3" y1="10" x2="21" y2="10" stroke="#0891b2" strokeWidth="2" />
        </svg>
      ),
      color: "#0891b2",
      bg: "#ecfeff",
    },
    {
      label: "تاريخ الإضافة",
      value: new Date(employee.created_at).toLocaleDateString("en-GB", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="#94a3b8" strokeWidth="2" />
          <polyline
            points="12 6 12 12 16 14"
            stroke="#94a3b8"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      ),
      color: "#94a3b8",
      bg: "#f8fafc",
    },
  ];

  return (
    <div className="employee-detail-page" style={s.page}>
      <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800&display=swap');
                @keyframes spin    { to { transform: rotate(360deg); } }
                @keyframes fadeUp  { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
                .edit-btn:hover  { transform:translateY(-1px); box-shadow:0 8px 24px rgba(37,99,235,0.35) !important; }
                .del-btn:hover   { transform:translateY(-1px); box-shadow:0 8px 24px rgba(220,38,38,0.25) !important; }
                .info-row:hover  { background:#f8fafc !important; }
                .employee-detail-page,
                .employee-detail-page * { box-sizing: border-box; }
                @media (max-width: 920px) {
                    .employee-detail-main { padding: 32px 24px !important; }
                    .employee-detail-layout {
                        grid-template-columns: 1fr !important;
                    }
                    .employee-profile-card {
                        max-width: 520px !important;
                        width: 100% !important;
                        margin: 0 auto !important;
                    }
                }
                @media (max-width: 640px) {
                    .employee-detail-main { padding: 28px 18px !important; }
                    .employee-detail-back {
                        width: 100% !important;
                        justify-content: center !important;
                        margin-bottom: 18px !important;
                    }
                    .employee-profile-card,
                    .employee-info-card {
                        border-radius: 16px !important;
                    }
                    .employee-cover { height: 104px !important; }
                    .employee-avatar {
                        width: 112px !important;
                        height: 112px !important;
                        margin-top: -56px !important;
                        border-radius: 24px !important;
                    }
                    .employee-avatar img,
                    .employee-avatar > div:first-child {
                        border-radius: 18px !important;
                    }
                    .employee-profile-body {
                        padding: 16px 18px 22px !important;
                    }
                    .employee-profile-name {
                        font-size: 17px !important;
                    }
                    .employee-position-badge {
                        white-space: normal !important;
                        line-height: 1.6 !important;
                    }
                    .employee-id-badge {
                        align-items: flex-start !important;
                        flex-direction: column !important;
                        gap: 4px !important;
                    }
                    .employee-quick-stat-value {
                        font-size: 16px !important;
                        overflow-wrap: anywhere !important;
                    }
                    .employee-actions {
                        gap: 8px !important;
                    }
                    .employee-info-header {
                        align-items: flex-start !important;
                        flex-direction: column !important;
                        gap: 10px !important;
                        padding: 18px !important;
                    }
                    .employee-info-row {
                        align-items: flex-start !important;
                        padding: 16px 18px !important;
                        gap: 12px !important;
                    }
                    .employee-info-icon {
                        width: 40px !important;
                        height: 40px !important;
                    }
                    .employee-info-value {
                        font-size: 14px !important;
                        overflow-wrap: anywhere !important;
                        word-break: break-word !important;
                    }
                    .employee-toast {
                        width: calc(100% - 32px) !important;
                        text-align: center !important;
                    }
                }
                @media (max-width: 380px) {
                    .employee-detail-main { padding: 24px 14px !important; }
                    .employee-quick-stats {
                        flex-direction: column !important;
                    }
                    .employee-q-divider {
                        width: auto !important;
                        height: 1px !important;
                        margin: 0 12px !important;
                    }
                }
            `}</style>

      <Navbar />

      {toast && (
        <div
          className="employee-toast"
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

      <DeleteConfirmModal
        open={deleteConfirmOpen}
        employeeName={employee?.name}
        loading={deleting}
        onCancel={() => setDeleteConfirmOpen(false)}
        onConfirm={confirmDelete}
      />

      <main className="employee-detail-main" style={s.main}>
        {/* Back */}
        <button className="employee-detail-back" style={s.backBtn} onClick={() => navigate("/employees")}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="M19 12H5M12 19l-7-7 7-7"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          العودة للقائمة
        </button>

        <div className="employee-detail-layout" style={s.layout}>
          {/* Left: Profile card */}
          <div className="employee-profile-card" style={s.profileCard}>
            {/* Cover */}
            <div className="employee-cover" style={s.cover} />

            {/* Avatar */}
            <div className="employee-avatar" style={s.avatarWrap}>
              {employee.image ? (
                <img
                  src={`http://127.0.0.1:8000/storage/${employee.image}`}
                  alt={employee.name}
                  style={s.avatarImg}
                />
              ) : (
                <div style={s.avatarFallback}>{initials}</div>
              )}
              <div style={s.onlineDot} />
            </div>

            <div className="employee-profile-body" style={s.profileBody}>
              <h2 className="employee-profile-name" style={s.profileName}>
                {employee.name}
              </h2>
              <span className="employee-position-badge" style={s.positionBadge}>
                {employee.position}
              </span>

              <div className="employee-id-badge" style={s.idBadge}>
                <span style={s.idLabel}>رقم الموظف</span>
                <span style={s.idVal}>#{String(employee.id).padStart(4, "0")}</span>
              </div>

              {/* Quick stats */}
              <div className="employee-quick-stats" style={s.quickStats}>
                <div style={s.qStat}>
                  <p className="employee-quick-stat-value" style={s.qStatVal}>
                    {parseFloat(employee.salary).toLocaleString()}
                  </p>
                  <p style={s.qStatLabel}>الراتب ل.س</p>
                </div>
                <div className="employee-q-divider" style={s.qDivider} />
                <div style={s.qStat}>
                  <p className="employee-quick-stat-value" style={s.qStatVal}>
                    {Math.floor(
                      (new Date() - new Date(employee.hire_date)) / (1000 * 60 * 60 * 24 * 30),
                    )}
                  </p>
                  <p style={s.qStatLabel}>شهر في العمل</p>
                </div>
              </div>

              {/* Actions */}
              <div className="employee-actions" style={s.profileActions}>
                <button
                  className="edit-btn"
                  style={s.editBtn}
                  onClick={() => navigate(`/employees/edit/${employee.id}`)}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
                      stroke="#fff"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
                      stroke="#fff"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                  تعديل البيانات
                </button>
                <button
                  className="del-btn"
                  style={{ ...s.deleteBtn, opacity: deleting ? 0.7 : 1 }}
                  onClick={() => setDeleteConfirmOpen(true)}
                  disabled={deleting}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                    <polyline
                      points="3 6 5 6 21 6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M10 11v6M14 11v6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                  {deleting ? "جاري الحذف..." : "حذف الموظف"}
                </button>
              </div>
            </div>
          </div>

          {/* Right: Info card */}
          <div className="employee-info-card" style={s.infoCard}>
            <div className="employee-info-header" style={s.infoHeader}>
              <h3 style={s.infoTitle}>تفاصيل الموظف</h3>
              <span style={s.infoBadge}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M22 11.08V12a10 10 0 1 1-5.93-9.14"
                    stroke="#059669"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <polyline
                    points="22 4 12 14.01 9 11.01"
                    stroke="#059669"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                نشط
              </span>
            </div>

            <div style={s.infoList}>
              {infoRows.map((row, i) => (
                <div
                  key={i}
                  className="info-row employee-info-row"
                  style={{
                    ...s.infoRow,
                    animationDelay: `${i * 0.06}s`,
                    borderBottom: i < infoRows.length - 1 ? "1px solid #f1f5f9" : "none",
                  }}
                >
                  <div className="employee-info-icon" style={{ ...s.infoIconWrap, background: row.bg }}>
                    {row.icon}
                  </div>
                  <div style={s.infoContent}>
                    <p style={s.infoLabel}>{row.label}</p>
                    <p
                      className="employee-info-value"
                      style={{
                        ...s.infoValue,
                        color: row.bold ? row.color : "#0f172a",
                        fontWeight: row.bold ? "800" : "600",
                      }}
                    >
                      {row.value}
                    </p>
                  </div>
                </div>
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
  backBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 18px",
    borderRadius: "10px",
    border: "1.5px solid #e2e8f0",
    background: "#fff",
    fontSize: "13px",
    fontWeight: "700",
    color: "#475569",
    cursor: "pointer",
    marginBottom: "28px",
    fontFamily: "'Cairo', sans-serif",
    transition: "all 0.18s",
  },
  backBtnAlt: {
    padding: "11px 24px",
    borderRadius: "12px",
    background: "linear-gradient(135deg,#2563eb,#6d28d9)",
    color: "#fff",
    border: "none",
    fontSize: "14px",
    fontWeight: "700",
    cursor: "pointer",
    marginTop: "12px",
    fontFamily: "'Cairo', sans-serif",
  },
  layout: { display: "grid", gridTemplateColumns: "340px 1fr", gap: "24px", alignItems: "start" },

  /* Profile card */
  profileCard: {
    background: "#fff",
    borderRadius: "20px",
    border: "1px solid #e2e8f0",
    overflow: "hidden",
    boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
    animation: "fadeUp 0.4s ease both",
  },
  cover: {
    height: "128px",
    background: "linear-gradient(135deg, #1e40af 0%, #2563eb 54%, #7c3aed 100%)",
  },
  avatarWrap: {
    position: "relative",
    width: "132px",
    height: "132px",
    margin: "-66px auto 0",
    padding: "6px",
    borderRadius: "28px",
    background: "#fff",
    border: "1px solid #e2e8f0",
    boxShadow: "0 18px 36px rgba(15,23,42,0.16)",
  },
  avatarImg: {
    width: "100%",
    height: "100%",
    borderRadius: "22px",
    objectFit: "cover",
    display: "block",
    flexShrink: 0,
    background: "#f8fafc",
  },
  avatarFallback: {
    width: "100%",
    height: "100%",
    borderRadius: "22px",
    background: "linear-gradient(135deg, #2563eb, #7c3aed)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "34px",
    fontWeight: "800",
    color: "#fff",
    flexShrink: 0,
    whiteSpace: "nowrap",
    overflow: "hidden",
  },
  onlineDot: {
    position: "absolute",
    bottom: "12px",
    right: "12px",
    width: "18px",
    height: "18px",
    borderRadius: "50%",
    background: "#10b981",
    border: "3px solid #fff",
    boxShadow: "0 2px 8px rgba(16,185,129,0.45)",
  },
  profileBody: {
    padding: "18px 24px 28px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "14px",
  },
  profileName: {
    fontSize: "18px",
    fontWeight: "800",
    color: "#0f172a",
    marginTop: "4px",
    wordBreak: "break-word",
    lineHeight: "1.3",
    textAlign: "center",
  },
  positionBadge: {
    display: "inline-block",
    background: "#f5f3ff",
    color: "#7c3aed",
    fontSize: "13px",
    fontWeight: "700",
    padding: "5px 14px",
    borderRadius: "8px",
    width: "fit-content",
    maxWidth: "100%",
    textAlign: "center",
  },
  idBadge: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    background: "#f8fafc",
    borderRadius: "10px",
    padding: "10px 14px",
    border: "1px solid #f1f5f9",
  },
  idLabel: { fontSize: "12px", color: "#94a3b8", fontWeight: "600" },
  idVal: { fontSize: "14px", fontWeight: "800", color: "#0f172a", fontFamily: "monospace" },
  quickStats: {
    display: "flex",
    width: "100%",
    background: "#f8fafc",
    borderRadius: "12px",
    border: "1px solid #f1f5f9",
    overflow: "hidden",
  },
  qStat: { flex: 1, padding: "14px", textAlign: "center" },
  qStatVal: { fontSize: "18px", fontWeight: "800", color: "#0f172a" },
  qStatLabel: { fontSize: "11px", color: "#94a3b8", marginTop: "3px", fontWeight: "500" },
  qDivider: { width: "1px", background: "#e2e8f0", margin: "10px 0" },
  profileActions: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    width: "100%",
    marginTop: "4px",
  },
  editBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "13px",
    borderRadius: "12px",
    border: "none",
    background: "linear-gradient(135deg,#2563eb,#6d28d9)",
    color: "#fff",
    fontSize: "14px",
    fontWeight: "700",
    cursor: "pointer",
    transition: "all 0.22s",
    boxShadow: "0 4px 16px rgba(37,99,235,0.3)",
    fontFamily: "'Cairo', sans-serif",
  },
  deleteBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "12px",
    borderRadius: "12px",
    border: "1.5px solid #fecaca",
    background: "#fef2f2",
    color: "#dc2626",
    fontSize: "14px",
    fontWeight: "700",
    cursor: "pointer",
    transition: "all 0.22s",
    fontFamily: "'Cairo', sans-serif",
  },

  /* Info card */
  infoCard: {
    background: "#fff",
    borderRadius: "20px",
    border: "1px solid #e2e8f0",
    overflow: "hidden",
    boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
    animation: "fadeUp 0.4s ease 0.1s both",
  },
  infoHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "22px 28px",
    borderBottom: "1px solid #f1f5f9",
  },
  infoTitle: { fontSize: "17px", fontWeight: "800", color: "#0f172a" },
  infoBadge: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    background: "#ecfdf5",
    color: "#059669",
    fontSize: "13px",
    fontWeight: "700",
    padding: "5px 12px",
    borderRadius: "8px",
    border: "1px solid #a7f3d0",
  },
  infoList: { padding: "8px 0" },
  infoRow: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "18px 28px",
    transition: "background 0.15s",
    animation: "fadeUp 0.4s ease both",
    cursor: "default",
  },
  infoIconWrap: {
    width: "44px",
    height: "44px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  infoContent: { flex: 1, display: "flex", flexDirection: "column", gap: "3px" },
  infoLabel: { fontSize: "12px", fontWeight: "600", color: "#94a3b8" },
  infoValue: { fontSize: "15px", fontWeight: "600", color: "#0f172a" },

  /* Loading */
  loadingWrap: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "16px",
    padding: "120px 0",
  },
  loadingSpinner: {
    width: "44px",
    height: "44px",
    border: "3px solid #e2e8f0",
    borderTopColor: "#2563eb",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  loadingText: { color: "#94a3b8", fontSize: "14px", fontWeight: "600" },
};
