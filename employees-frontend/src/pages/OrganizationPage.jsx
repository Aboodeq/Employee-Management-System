import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  deleteDepartment,
  deleteJobTitle,
  getDepartments,
  getJobTitles,
} from "../api/employeeApi";
import Navbar from "../components/Navbar";
import { useI18n } from "../i18n/i18n";

export default function OrganizationPage() {
  const { dir, formatNumber, t } = useI18n();
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [jobTitles, setJobTitles] = useState([]);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletingDepartmentId, setDeletingDepartmentId] = useState(null);
  const [deletingJobTitleId, setDeletingJobTitleId] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const loadData = useCallback(() => {
    setLoading(true);
    Promise.all([getDepartments(), getJobTitles()])
      .then(([departmentRes, jobTitleRes]) => {
        if (!departmentRes.success || !jobTitleRes.success) {
          throw new Error(t("organization.loadError"));
        }

        const departmentData = departmentRes.data || [];
        setDepartments(departmentData);
        setJobTitles(jobTitleRes.data || []);
        setSelectedDepartmentId((current) => {
          if (departmentData.length === 0) return "";
          const selectedExists = departmentData.some((department) => String(department.id) === String(current));
          return selectedExists ? current : String(departmentData[0].id);
        });
      })
      .catch((error) => showToast(error.message || t("organization.loadError"), "error"))
      .finally(() => setLoading(false));
  }, [showToast, t]);

  useEffect(() => {
    Promise.resolve().then(loadData);
  }, [loadData]);

  const jobTitlesByDepartment = useMemo(
    () =>
      jobTitles.reduce((groups, jobTitle) => {
        const key = String(jobTitle.department_id);
        groups[key] = [...(groups[key] || []), jobTitle];
        return groups;
      }, {}),
    [jobTitles],
  );

  const selectedDepartment = departments.find(
    (department) => String(department.id) === String(selectedDepartmentId),
  );
  const selectedJobTitles = jobTitlesByDepartment[String(selectedDepartmentId)] || [];
  const activeDepartments = departments.filter((department) => department.is_active).length;
  const activeJobTitles = jobTitles.filter((jobTitle) => jobTitle.is_active).length;

  const removeDepartment = async (department) => {
    if (!window.confirm(t("organization.deleteDepartmentText", { name: department.name }))) return;

    setDeletingDepartmentId(department.id);
    try {
      const res = await deleteDepartment(department.id);
      if (!res.success) throw new Error(res.message || t("organization.deleteError"));
      showToast(t("organization.departmentDeleted"));
      loadData();
    } catch (error) {
      showToast(error.message || t("organization.deleteError"), "error");
    } finally {
      setDeletingDepartmentId(null);
    }
  };

  const removeJobTitle = async (jobTitle) => {
    if (!window.confirm(t("organization.deleteJobTitleText", { name: jobTitle.name }))) return;

    setDeletingJobTitleId(jobTitle.id);
    try {
      const res = await deleteJobTitle(jobTitle.id);
      if (!res.success) throw new Error(res.message || t("organization.deleteError"));
      showToast(t("organization.jobTitleDeleted"));
      loadData();
    } catch (error) {
      showToast(error.message || t("organization.deleteError"), "error");
    } finally {
      setDeletingJobTitleId(null);
    }
  };

  return (
    <div className="organization-page" style={{ ...s.page, direction: dir }} dir={dir}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800&display=swap');
        .organization-page, .organization-page * { box-sizing: border-box; }
        .organization-list-row:hover { border-color:#bfdbfe !important; box-shadow:0 10px 24px rgba(15,23,42,0.07) !important; }
        @media (max-width: 1080px) {
          .organization-board { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 880px) {
          .organization-main { padding: 28px 18px !important; }
        }
        @media (max-width: 640px) {
          .organization-main { padding: 24px 14px !important; }
          .organization-header { flex-direction: column !important; align-items: stretch !important; }
          .organization-actions-top { flex-direction: column !important; }
          .organization-actions-top button { width: 100% !important; justify-content: center !important; }
          .organization-stats { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
          .organization-row-head,
          .organization-title-row { flex-direction: column !important; align-items: stretch !important; }
          .organization-actions { width: 100% !important; }
          .organization-actions button { flex: 1 !important; }
          .organization-toast { width: calc(100% - 32px) !important; text-align: center !important; justify-content: center !important; }
        }
      `}</style>

      <Navbar />

      {toast && (
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
      )}

      <main className="organization-main" style={s.main}>
        <div className="organization-header" style={s.header}>
          <div>
            <h1 style={s.title}>{t("organization.title")}</h1>
            <p style={s.subtitle}>{t("organization.subtitle")}</p>
          </div>
          <div className="organization-actions-top" style={s.headerActions}>
            <button type="button" style={s.secondaryBtn} onClick={() => navigate("/organization/departments/add")}>
              {t("organization.newDepartment")}
            </button>
            <button
              type="button"
              style={s.primaryHeaderBtn}
              onClick={() =>
                navigate(
                  selectedDepartmentId
                    ? `/organization/job-titles/add?department_id=${selectedDepartmentId}`
                    : "/organization/job-titles/add",
                )
              }
            >
              {t("organization.newJobTitle")}
            </button>
          </div>
        </div>

        <section className="organization-stats" style={s.statsGrid}>
          <Stat label={t("organization.fields.department")} value={departments.length} color="#2563eb" bg="#eff6ff" />
          <Stat label={t("organization.fields.jobTitle")} value={jobTitles.length} color="#059669" bg="#ecfdf5" />
          <Stat label={t("organization.active")} value={activeDepartments} color="#7c3aed" bg="#f5f3ff" />
          <Stat label={t("organization.inactive")} value={jobTitles.length - activeJobTitles} color="#d97706" bg="#fffbeb" />
        </section>

        <div className="organization-board" style={s.board}>
          <section style={s.panel}>
            <div style={s.panelHeader}>
              <h2 style={s.sectionTitle}>{t("organization.structure")}</h2>
              <span style={s.countBadge}>{formatNumber(departments.length)}</span>
            </div>

            {loading ? (
              <div style={s.empty}>{t("common.loading")}</div>
            ) : departments.length === 0 ? (
              <div style={s.empty}>{t("organization.noJobTitles")}</div>
            ) : (
              <div style={s.list}>
                {departments.map((department) => {
                  const isSelected = String(department.id) === String(selectedDepartmentId);
                  const departmentJobs = jobTitlesByDepartment[String(department.id)] || [];

                  return (
                    <article
                      key={department.id}
                      className="organization-list-row"
                      style={{ ...s.departmentRow, ...(isSelected ? s.selectedRow : {}) }}
                      onClick={() => setSelectedDepartmentId(String(department.id))}
                    >
                      <div className="organization-row-head" style={s.rowHead}>
                        <div style={s.rowIdentity}>
                          <span style={s.departmentIcon}>{department.name?.charAt(0)?.toUpperCase()}</span>
                          <div style={s.rowText}>
                            <h3 style={s.rowTitle}>{department.name}</h3>
                            <p style={s.rowMeta}>{department.name_ar || t("common.notAvailable")}</p>
                          </div>
                        </div>
                        <StatusBadge active={department.is_active} t={t} />
                      </div>

                      <div style={s.rowFooter}>
                        <span style={s.miniMetric}>
                          {formatNumber(departmentJobs.length)} {t("organization.fields.jobTitle")}
                        </span>
                        <div className="organization-actions" style={s.rowActions}>
                          <button
                            type="button"
                            style={s.editBtn}
                            onClick={(event) => {
                              event.stopPropagation();
                              navigate(`/organization/departments/edit/${department.id}`);
                            }}
                          >
                            {t("organization.edit")}
                          </button>
                          <button
                            type="button"
                            style={s.deleteBtn}
                            disabled={deletingDepartmentId === department.id}
                            onClick={(event) => {
                              event.stopPropagation();
                              removeDepartment(department);
                            }}
                          >
                            {deletingDepartmentId === department.id ? "..." : t("organization.delete")}
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          <section style={s.panel}>
            <div style={s.panelHeader}>
              <div>
                <h2 style={s.sectionTitle}>{selectedDepartment?.name || t("organization.selectDepartment")}</h2>
                <p style={s.panelSub}>{selectedDepartment?.description || selectedDepartment?.name_ar || ""}</p>
              </div>
              <span style={s.countBadge}>{formatNumber(selectedJobTitles.length)}</span>
            </div>

            {selectedJobTitles.length === 0 ? (
              <div style={s.empty}>{t("organization.noJobTitles")}</div>
            ) : (
              <div style={s.list}>
                {selectedJobTitles.map((jobTitle) => (
                  <article key={jobTitle.id} style={s.jobTitleRow}>
                    <div className="organization-title-row" style={s.titleRowContent}>
                      <div style={s.rowText}>
                        <h3 style={s.rowTitle}>{jobTitle.name}</h3>
                        <p style={s.rowMeta}>
                          {jobTitle.name_ar || t("common.notAvailable")}
                          {jobTitle.employees_count ? ` - ${formatNumber(jobTitle.employees_count)} ${t("common.employee")}` : ""}
                        </p>
                      </div>
                      <StatusBadge active={jobTitle.is_active} t={t} />
                    </div>

                    <div className="organization-actions" style={s.rowActions}>
                      <button
                        type="button"
                        style={s.editBtn}
                        onClick={() => navigate(`/organization/job-titles/edit/${jobTitle.id}`)}
                      >
                        {t("organization.edit")}
                      </button>
                      <button
                        type="button"
                        style={s.deleteBtn}
                        disabled={deletingJobTitleId === jobTitle.id}
                        onClick={() => removeJobTitle(jobTitle)}
                      >
                        {deletingJobTitleId === jobTitle.id ? "..." : t("organization.delete")}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

function Stat({ bg, color, label, value }) {
  const { formatNumber } = useI18n();
  return (
    <div style={s.statCard}>
      <span style={{ ...s.statIcon, background: bg, color }}>
        <BriefcaseIcon />
      </span>
      <div>
        <p style={s.statValue}>{formatNumber(value)}</p>
        <p style={s.statLabel}>{label}</p>
      </div>
    </div>
  );
}

function StatusBadge({ active, t }) {
  return (
    <span style={active ? s.activeBadge : s.inactiveBadge}>
      {active ? t("organization.active") : t("organization.inactive")}
    </span>
  );
}

function BriefcaseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="7" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2M2 12h20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

const s = {
  page: { minHeight: "100vh", background: "#f8fafc", fontFamily: "'Cairo', sans-serif" },
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
  headerActions: { display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" },
  secondaryBtn: {
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
  primaryHeaderBtn: {
    background: "#2563eb",
    color: "#fff",
    border: "1.5px solid #2563eb",
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
  board: { display: "grid", gridTemplateColumns: "0.9fr 1.1fr", gap: "18px", alignItems: "start" },
  panel: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: "14px",
    padding: "18px",
    minWidth: 0,
  },
  panelHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    marginBottom: "16px",
  },
  sectionTitle: { color: "#0f172a", fontSize: "17px", fontWeight: "800" },
  panelSub: { color: "#94a3b8", fontSize: "12px", fontWeight: "700", marginTop: "3px" },
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
  list: { display: "grid", gap: "10px" },
  departmentRow: {
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    padding: "14px",
    cursor: "pointer",
    background: "#fff",
    transition: "all 0.18s",
  },
  selectedRow: {
    borderColor: "#2563eb",
    boxShadow: "0 0 0 3px rgba(37,99,235,0.08)",
  },
  rowHead: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" },
  rowIdentity: { display: "flex", alignItems: "center", gap: "10px", minWidth: 0 },
  departmentIcon: {
    width: "40px",
    height: "40px",
    borderRadius: "11px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#eff6ff",
    color: "#2563eb",
    fontSize: "15px",
    fontWeight: "800",
    flexShrink: 0,
  },
  rowText: { minWidth: 0 },
  rowTitle: { color: "#0f172a", fontSize: "15px", fontWeight: "800" },
  rowMeta: { color: "#64748b", fontSize: "12px", fontWeight: "700", marginTop: "3px", overflowWrap: "anywhere" },
  rowFooter: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "10px",
    marginTop: "14px",
    paddingTop: "12px",
    borderTop: "1px solid #f1f5f9",
  },
  miniMetric: {
    color: "#475569",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "999px",
    padding: "4px 10px",
    fontSize: "12px",
    fontWeight: "800",
  },
  jobTitleRow: {
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    padding: "14px",
    background: "#fff",
  },
  titleRowContent: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" },
  rowActions: { display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginTop: "12px" },
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
  activeBadge: {
    color: "#059669",
    background: "#ecfdf5",
    border: "1px solid #a7f3d0",
    borderRadius: "999px",
    padding: "3px 9px",
    fontSize: "11px",
    fontWeight: "800",
    whiteSpace: "nowrap",
  },
  inactiveBadge: {
    color: "#64748b",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "999px",
    padding: "3px 9px",
    fontSize: "11px",
    fontWeight: "800",
    whiteSpace: "nowrap",
  },
  empty: { padding: "46px 12px", textAlign: "center", color: "#94a3b8", fontWeight: "800" },
};
