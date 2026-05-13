import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import { getAllEmployees, deleteEmployee, getEmployeeFilterOptions, getImageUrl } from "../api/employeeApi";
import { useAuth } from "../context/authContextValue";
import { useI18n } from "../i18n/i18n";

const PAGE_SIZE = 12;
const initialFilters = {
  departmentId: "",
  jobTitleId: "",
  salaryMin: "",
  salaryMax: "",
  hireFrom: "",
  hireTo: "",
};

export default function EmployeeListPage() {
  const { dir, formatDate, formatNumber, t } = useI18n();
  const { can } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filters, setFilters] = useState(initialFilters);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [jobTitleOptions, setJobTitleOptions] = useState([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: PAGE_SIZE,
    total: 0,
    from: 0,
    to: 0,
  });
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();
  const canCreateEmployees = can("employees.create");
  const canUpdateEmployees = can("employees.update");
  const canDeleteEmployees = can("employees.delete");
  const actionColumns = 1 + Number(canUpdateEmployees) + Number(canDeleteEmployees);
  const filteredJobTitleOptions = jobTitleOptions.filter(
    (item) => String(item.department_id) === String(filters.departmentId),
  );

  const showToast = useCallback((msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const fetchEmployees = useCallback(
    (targetPage = page) => {
      getAllEmployees({
        page: targetPage,
        perPage: PAGE_SIZE,
        search: debouncedSearch,
        ...filters,
      })
        .then((res) => {
          if (!res.success) {
            throw new Error("Failed to fetch employees");
          }

          setEmployees(res.data || []);
          setPagination(
            res.meta || {
              current_page: targetPage,
              last_page: 1,
              per_page: PAGE_SIZE,
              total: res.data?.length || 0,
              from: res.data?.length ? 1 : 0,
              to: res.data?.length || 0,
            },
          );
        })
        .catch(() => showToast(t("employees.fetchError"), "error"))
        .finally(() => setLoading(false));
    },
    [debouncedSearch, filters, page, showToast, t],
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    let isMounted = true;

    getEmployeeFilterOptions()
      .then((res) => {
        if (isMounted && res.success) {
          setDepartmentOptions(res.data?.departments || []);
          setJobTitleOptions(res.data?.job_titles || []);
        }
      })
      .catch(() => null);

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    fetchEmployees(page);
  }, [fetchEmployees, page]);

  const handlePageChange = (nextPage) => {
    if (nextPage < 1 || nextPage > pagination.last_page || nextPage === page) return;
    setLoading(true);
    setPage(nextPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleFilterChange = (name, value) => {
    setLoading(true);
    setPage(1);
    setFilters((current) =>
      name === "departmentId"
        ? { ...current, departmentId: value, jobTitleId: "" }
        : { ...current, [name]: value },
    );
  };

  const hasActiveFilters = Boolean(search.trim()) || Object.values(filters).some(Boolean);

  const clearFilters = () => {
    setLoading(true);
    setPage(1);
    setSearch("");
    setDebouncedSearch("");
    setFilters(initialFilters);
  };

  const requestDelete = (id, name) => {
    setPendingDelete({ id, name });
  };

  const openEmployee = (id) => {
    navigate(`/employees/${id}`);
  };

  const handleCardKeyDown = (event, id) => {
    if (event.key !== "Enter" && event.key !== " ") return;

    event.preventDefault();
    openEmployee(id);
  };

  const stopCardClick = (event, action) => {
    event.stopPropagation();
    action();
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;

    const { id } = pendingDelete;
    setDeleting(id);
    try {
      const res = await deleteEmployee(id);
      if (!res.success) {
        throw new Error(res.message || t("employees.deleteError"));
      }

      setPendingDelete(null);
      showToast(t("employees.deleteSuccess"));
      if (employees.length === 1 && page > 1) {
        setLoading(true);
        setPage((p) => p - 1);
      } else {
        setLoading(true);
        fetchEmployees(page);
      }
    } catch (error) {
      showToast(error.message || t("employees.deleteError"), "error");
    } finally {
      setDeleting(null);
    }
  };

  const colors = [
    { bg: "#eff6ff", text: "#2563eb" },
    { bg: "#f5f3ff", text: "#7c3aed" },
    { bg: "#ecfdf5", text: "#059669" },
    { bg: "#fffbeb", text: "#d97706" },
    { bg: "#fef2f2", text: "#dc2626" },
  ];

  return (
    <div className="employees-page" style={{ ...s.page, direction: dir }} dir={dir}>
      <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800&display=swap');
                @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
                @keyframes slideIn { from{opacity:0;transform:translateX(20px)} to{opacity:1;transform:translateX(0)} }
                @keyframes spin { to { transform: rotate(360deg); } }
                .emp-card:hover { transform:translateY(-3px); box-shadow:0 12px 36px rgba(0,0,0,0.09) !important; }
                .emp-card:focus-visible { outline:3px solid rgba(37,99,235,0.24); outline-offset:3px; }
                .action-btn:hover { opacity:0.8; }
                .search-input:focus { border-color:#2563eb !important; box-shadow:0 0 0 3px rgba(37,99,235,0.1) !important; background:#fff !important; }
                .employees-page,
                .employees-page * { box-sizing: border-box; }
                @media (max-width: 980px) {
                    .employees-main { padding: 32px 24px !important; }
                    .employees-grid { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
                    .employees-filters { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
                    .employees-clear-filters { grid-column: 1 / -1 !important; }
                }
                @media (max-width: 700px) {
                    .employees-main { padding: 28px 18px !important; }
                    .employees-header {
                        align-items: stretch !important;
                        flex-direction: column !important;
                        gap: 16px !important;
                    }
                    .employees-title { font-size: 23px !important; }
                    .employees-add-btn {
                        width: 100% !important;
                        justify-content: center !important;
                    }
                    .employees-search { max-width: none !important; width: 100% !important; }
                    .employees-filters { grid-template-columns: 1fr !important; gap: 10px !important; }
                    .employees-grid { grid-template-columns: minmax(0, 1fr) !important; gap: 14px !important; }
                    .employees-card { padding: 18px !important; border-radius: 14px !important; }
                    .employees-card-top { gap: 12px !important; margin-bottom: 14px !important; }
                    .employees-avatar { width: 56px !important; height: 56px !important; border-radius: 16px !important; }
                    .employees-avatar img,
                    .employees-avatar > div { border-radius: 12px !important; }
                    .employees-card-name {
                        white-space: normal !important;
                        line-height: 1.35 !important;
                    }
                    .employees-position {
                        max-width: 100% !important;
                        white-space: normal !important;
                        line-height: 1.5 !important;
                    }
                    .employees-detail-value {
                        white-space: normal !important;
                        overflow-wrap: anywhere !important;
                    }
                    .employees-pagination { margin-top: 22px !important; }
                    .employees-page-btn { min-width: 38px !important; height: 38px !important; padding: 0 12px !important; }
                    .employees-toast {
                        width: calc(100% - 32px) !important;
                        justify-content: center !important;
                        text-align: center !important;
                    }
                }
                @media (max-width: 380px) {
                    .employees-main { padding: 24px 14px !important; }
                    .employees-card-actions { grid-template-columns: 1fr !important; }
                    .employees-page-btn { flex: 1 1 auto !important; }
                    .employees-empty { padding: 64px 12px !important; }
                }
            `}</style>

      <Navbar />

      {toast && (
        <div
          className="employees-toast"
          style={{
            ...s.toast,
            background: toast.type === "error" ? "#fef2f2" : "#ecfdf5",
            border: `1px solid ${toast.type === "error" ? "#fecaca" : "#a7f3d0"}`,
            color: toast.type === "error" ? "#dc2626" : "#059669",
            animation: "slideIn 0.3s ease",
          }}
        >
          {toast.type === "error" ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="#dc2626" strokeWidth="2" />
              <line
                x1="12"
                y1="8"
                x2="12"
                y2="12"
                stroke="#dc2626"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <circle cx="12" cy="16" r="1" fill="#dc2626" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M22 11.08V12a10 10 0 1 1-5.93-9.14"
                stroke="#059669"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <polyline
                points="22 4 12 14.01 9 11.01"
                stroke="#059669"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
          {toast.msg}
        </div>
      )}

      <DeleteConfirmModal
        open={Boolean(pendingDelete)}
        employeeName={pendingDelete?.name}
        loading={deleting === pendingDelete?.id}
        onCancel={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
      />

      <main className="employees-main" style={s.main}>
        <div className="employees-header" style={s.header}>
          <div>
            <h1 className="employees-title" style={s.pageTitle}>
              {t("employees.title")}
            </h1>
            <p style={s.pageSub}>
              {loading
                ? t("common.loading")
                : t("employees.summary", {
                    total: formatNumber(pagination.total),
                    from: formatNumber(pagination.from || 0),
                    to: formatNumber(pagination.to || 0),
                  })}
            </p>
          </div>
          {canCreateEmployees && (
            <button className="employees-add-btn" style={s.addBtn} onClick={() => navigate("/employees/add")}>
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
              {t("employees.addEmployee")}
            </button>
          )}
        </div>

        <div className="employees-search" style={s.searchWrap}>
          <span style={s.searchIco}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="8" stroke="#94a3b8" strokeWidth="2" />
              <path d="m21 21-4.35-4.35" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </span>
          <input
            className="search-input"
            style={s.searchInput}
            placeholder={t("employees.searchPlaceholder")}
            value={search}
            onChange={(e) => {
              setLoading(true);
              setPage(1);
              setSearch(e.target.value);
            }}
          />
          {search && (
            <button
              style={s.clearBtn}
              onClick={() => {
                setLoading(true);
                setPage(1);
                setSearch("");
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <line
                  x1="18"
                  y1="6"
                  x2="6"
                  y2="18"
                  stroke="#94a3b8"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <line
                  x1="6"
                  y1="6"
                  x2="18"
                  y2="18"
                  stroke="#94a3b8"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          )}
        </div>

        <div className="employees-filters" style={s.filtersBar}>
          <label style={s.filterField}>
            <span style={s.filterLabel}>{t("employees.filters.department")}</span>
            <select
              style={s.filterSelect}
              value={filters.departmentId}
              onChange={(e) => handleFilterChange("departmentId", e.target.value)}
            >
              <option value="">{t("employees.filters.all")}</option>
              {departmentOptions.map((department) => (
                <option key={department.id} value={department.id}>
                  {department.name}
                </option>
              ))}
            </select>
          </label>

          <label style={s.filterField}>
            <span style={s.filterLabel}>{t("employees.filters.jobTitle")}</span>
            <select
              style={s.filterSelect}
              value={filters.jobTitleId}
              onChange={(e) => handleFilterChange("jobTitleId", e.target.value)}
              disabled={!filters.departmentId}
            >
              <option value="">
                {filters.departmentId ? t("employees.filters.all") : t("organization.selectDepartmentFirst")}
              </option>
              {filteredJobTitleOptions.map((jobTitle) => (
                <option key={jobTitle.id} value={jobTitle.id}>
                  {jobTitle.name}
                </option>
              ))}
            </select>
          </label>

          <label style={s.filterField}>
            <span style={s.filterLabel}>{t("employees.filters.salaryFrom")}</span>
            <input
              style={s.filterInput}
              type="number"
              min="0"
              step="1000"
              value={filters.salaryMin}
              onChange={(e) => handleFilterChange("salaryMin", e.target.value)}
            />
          </label>

          <label style={s.filterField}>
            <span style={s.filterLabel}>{t("employees.filters.salaryTo")}</span>
            <input
              style={s.filterInput}
              type="number"
              min="0"
              step="1000"
              value={filters.salaryMax}
              onChange={(e) => handleFilterChange("salaryMax", e.target.value)}
            />
          </label>

          <label style={s.filterField}>
            <span style={s.filterLabel}>{t("employees.filters.dateFrom")}</span>
            <input
              style={s.filterInput}
              type="date"
              value={filters.hireFrom}
              onChange={(e) => handleFilterChange("hireFrom", e.target.value)}
            />
          </label>

          <label style={s.filterField}>
            <span style={s.filterLabel}>{t("employees.filters.dateTo")}</span>
            <input
              style={s.filterInput}
              type="date"
              value={filters.hireTo}
              onChange={(e) => handleFilterChange("hireTo", e.target.value)}
            />
          </label>

          {hasActiveFilters && (
            <button className="employees-clear-filters" style={s.filterClearBtn} onClick={clearFilters}>
              {t("employees.filters.clear")}
            </button>
          )}
        </div>

        {loading ? (
          <div style={s.loadingWrap}>
            <div style={s.loadingSpinner} />
            <p style={s.loadingText}>{t("employees.loadingEmployees")}</p>
          </div>
        ) : employees.length === 0 ? (
          <div className="employees-empty" style={s.emptyWrap}>
            <div style={s.emptyIcon}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                <path
                  d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
                  stroke="#cbd5e1"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <circle cx="9" cy="7" r="4" stroke="#cbd5e1" strokeWidth="1.5" />
                <path
                  d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
                  stroke="#cbd5e1"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <p style={s.emptyTitle}>{t("employees.emptyTitle")}</p>
            <p style={s.emptySub}>
              {hasActiveFilters ? t("employees.emptyFiltered") : t("employees.emptyAddFirst")}
            </p>
            {!hasActiveFilters && canCreateEmployees && (
              <button style={s.emptyBtn} onClick={() => navigate("/employees/add")}>
                {t("employees.addEmployee")}
              </button>
            )}
          </div>
        ) : (
          <>
          <div className="employees-grid" style={s.grid}>
            {employees.map((emp, i) => {
              const c = colors[i % colors.length];
              const imageUrl = getImageUrl(emp);
              return (
                <div
                  key={emp.id}
                  className="emp-card employees-card"
                  style={{ ...s.card, animationDelay: `${i * 0.05}s` }}
                  role="button"
                  tabIndex={0}
                  aria-label={`${t("employees.view")} ${emp.name}`}
                  onClick={() => openEmployee(emp.id)}
                  onKeyDown={(event) => handleCardKeyDown(event, emp.id)}
                >
                  <div className="employees-card-top" style={s.cardTop}>
                    <div className="employees-avatar" style={s.cardAvatarFrame}>
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={emp.name}
                          style={s.cardAvatarImg}
                        />
                      ) : (
                        <div style={{ ...s.cardAvatarFallback, background: c.bg, color: c.text }}>
                          {emp.name?.charAt(0)?.toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div style={s.cardInfo}>
                      <p className="employees-card-name" style={s.cardName}>
                        {emp.name}
                      </p>
                      <span
                        className="employees-position"
                        style={{ ...s.positionBadge, background: c.bg, color: c.text }}
                      >
                        {emp.job_title?.name || emp.position}
                      </span>
                    </div>
                  </div>

                  <div style={s.cardDivider} />

                  <div style={s.cardDetails}>
                    {[
                      {
                        icon: (
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                            <rect x="3" y="4" width="18" height="16" rx="2" stroke="#94a3b8" strokeWidth="2" />
                            <path d="M9 4V2h6v2" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
                          </svg>
                        ),
                        val: emp.department?.name || t("common.notAvailable"),
                      },
                      {
                        icon: (
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                            <path
                              d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
                              stroke="#94a3b8"
                              strokeWidth="2"
                            />
                            <polyline points="22,6 12,13 2,6" stroke="#94a3b8" strokeWidth="2" />
                          </svg>
                        ),
                        val: emp.email,
                      },
                      {
                        icon: (
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                            <path
                              d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.83a16 16 0 0 0 6.26 6.26l1.58-1.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"
                              stroke="#94a3b8"
                              strokeWidth="2"
                            />
                          </svg>
                        ),
                        val: emp.phone,
                      },
                      {
                        icon: (
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
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
                        val: `${formatNumber(parseFloat(emp.salary))} ${t("common.syp")}`,
                        bold: true,
                        color: "#059669",
                      },
                      {
                        icon: (
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                            <rect
                              x="3"
                              y="4"
                              width="18"
                              height="18"
                              rx="2"
                              stroke="#94a3b8"
                              strokeWidth="2"
                            />
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
                        val: formatDate(emp.hire_date),
                      },
                    ].map((row, j) => (
                      <div key={j} style={s.detailRow}>
                        {row.icon}
                        <span
                          style={{
                            ...s.detailVal,
                            fontWeight: row.bold ? "700" : "500",
                            color: row.color || "#475569",
                          }}
                          className="employees-detail-value"
                        >
                          {row.val}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div
                    className="employees-card-actions"
                    style={{ ...s.cardActions, gridTemplateColumns: `repeat(${actionColumns}, 1fr)` }}
                  >
                    <button
                      className="action-btn"
                      style={s.viewBtn}
                      onClick={(event) => stopCardClick(event, () => openEmployee(emp.id))}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                      </svg>
                      {t("employees.view")}
                    </button>
                    {canUpdateEmployees && (
                      <button
                        className="action-btn"
                        style={s.editBtn}
                        onClick={(event) => stopCardClick(event, () => navigate(`/employees/edit/${emp.id}`))}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                          <path
                            d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                          <path
                            d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                        </svg>
                        {t("employees.edit")}
                      </button>
                    )}
                    {canDeleteEmployees && (
                      <button
                        className="action-btn"
                        style={{ ...s.deleteBtn, opacity: deleting === emp.id ? 0.6 : 1 }}
                        onClick={(event) => stopCardClick(event, () => requestDelete(emp.id, emp.name))}
                        disabled={deleting === emp.id}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
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
                        {deleting === emp.id ? "..." : t("employees.delete")}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          {pagination.last_page > 1 && (
            <div className="employees-pagination" style={s.paginationWrap}>
              <button
                className="employees-page-btn"
                style={{
                  ...s.pageBtn,
                  ...(page <= 1 ? s.pageBtnDisabled : {}),
                }}
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1}
              >
                {t("employees.previous")}
              </button>

              {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map((pageNumber) => (
                <button
                  className="employees-page-btn"
                  key={pageNumber}
                  style={{
                    ...s.pageBtn,
                    ...(pageNumber === page ? s.pageBtnActive : {}),
                  }}
                  onClick={() => handlePageChange(pageNumber)}
                >
                  {formatNumber(pageNumber)}
                </button>
              ))}

              <button
                className="employees-page-btn"
                style={{
                  ...s.pageBtn,
                  ...(page >= pagination.last_page ? s.pageBtnDisabled : {}),
                }}
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= pagination.last_page}
              >
                {t("employees.next")}
              </button>
            </div>
          )}
          </>
        )}
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
  toast: {
    position: "fixed",
    top: "24px",
    left: "50%",
    transform: "translateX(-50%)",
    padding: "12px 20px",
    borderRadius: "12px",
    fontSize: "14px",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    zIndex: 999,
    boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
    fontFamily: "'Cairo', sans-serif",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "24px",
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
  searchWrap: { position: "relative", marginBottom: "14px", maxWidth: "480px" },
  searchIco: {
    position: "absolute",
    right: "14px",
    top: "50%",
    transform: "translateY(-50%)",
    display: "flex",
    alignItems: "center",
    pointerEvents: "none",
  },
  searchInput: {
    width: "100%",
    padding: "13px 44px 13px 44px",
    borderRadius: "12px",
    border: "1.5px solid #e2e8f0",
    fontSize: "14px",
    outline: "none",
    background: "#fff",
    color: "#0f172a",
    direction: "rtl",
    textAlign: "right",
    transition: "all 0.2s",
    fontFamily: "'Cairo', sans-serif",
    fontWeight: "500",
  },
  clearBtn: {
    position: "absolute",
    left: "14px",
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    padding: "4px",
  },
  filtersBar: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "12px",
    alignItems: "end",
    marginBottom: "28px",
  },
  filterField: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    minWidth: 0,
  },
  filterLabel: {
    color: "#64748b",
    fontSize: "12px",
    fontWeight: "700",
  },
  filterInput: {
    width: "100%",
    height: "44px",
    padding: "0 12px",
    borderRadius: "10px",
    border: "1.5px solid #e2e8f0",
    background: "#fff",
    color: "#0f172a",
    fontSize: "13px",
    fontWeight: "600",
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "'Cairo', sans-serif",
  },
  filterSelect: {
    width: "100%",
    height: "44px",
    padding: "0 12px",
    borderRadius: "10px",
    border: "1.5px solid #e2e8f0",
    background: "#fff",
    color: "#0f172a",
    fontSize: "13px",
    fontWeight: "600",
    outline: "none",
    boxSizing: "border-box",
    cursor: "pointer",
    fontFamily: "'Cairo', sans-serif",
  },
  filterClearBtn: {
    height: "44px",
    borderRadius: "10px",
    border: "1.5px solid #fecaca",
    background: "#fff",
    color: "#dc2626",
    fontSize: "13px",
    fontWeight: "800",
    cursor: "pointer",
    fontFamily: "'Cairo', sans-serif",
    whiteSpace: "nowrap",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "20px",
  },
  paginationWrap: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: "8px",
    marginTop: "28px",
  },
  pageBtn: {
    minWidth: "40px",
    height: "40px",
    padding: "0 14px",
    borderRadius: "10px",
    border: "1.5px solid #e2e8f0",
    background: "#fff",
    color: "#475569",
    fontSize: "13px",
    fontWeight: "700",
    cursor: "pointer",
    fontFamily: "'Cairo', sans-serif",
    transition: "all 0.18s",
  },
  pageBtnActive: {
    borderColor: "#2563eb",
    background: "#2563eb",
    color: "#fff",
    boxShadow: "0 4px 14px rgba(37,99,235,0.24)",
  },
  pageBtnDisabled: {
    opacity: 0.45,
    cursor: "not-allowed",
  },
  card: {
    background: "#fff",
    borderRadius: "18px",
    border: "1px solid #e2e8f0",
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    transition: "all 0.22s",
    animation: "fadeUp 0.4s ease both",
    cursor: "pointer",
  },
  cardTop: { display: "flex", alignItems: "center", gap: "16px", marginBottom: "18px" },
  cardAvatarFrame: {
    width: "66px",
    height: "66px",
    padding: "4px",
    borderRadius: "18px",
    background: "#fff",
    border: "1px solid #e2e8f0",
    boxShadow: "0 8px 18px rgba(15,23,42,0.08)",
    flexShrink: 0,
  },
  cardAvatarImg: {
    width: "100%",
    height: "100%",
    borderRadius: "14px",
    objectFit: "cover",
    display: "block",
    background: "#f8fafc",
  },
  cardAvatarFallback: {
    width: "100%",
    height: "100%",
    borderRadius: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "22px",
    fontWeight: "800",
  },
  cardInfo: { display: "flex", flexDirection: "column", gap: "6px", flex: 1, minWidth: 0 },
  cardName: {
    fontSize: "16px",
    fontWeight: "800",
    color: "#0f172a",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  positionBadge: {
    display: "inline-block",
    fontSize: "12px",
    fontWeight: "700",
    padding: "3px 10px",
    borderRadius: "6px",
    width: "fit-content",
  },
  cardDivider: { height: "1px", background: "#f1f5f9", margin: "0 0 16px" },
  cardDetails: { display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" },
  detailRow: { display: "flex", alignItems: "center", gap: "8px" },
  detailVal: {
    fontSize: "13px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  cardActions: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: "8px",
    marginTop: "auto",
  },
  viewBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "5px",
    padding: "9px",
    borderRadius: "10px",
    border: "1.5px solid #e2e8f0",
    background: "#fff",
    fontSize: "13px",
    fontWeight: "700",
    color: "#475569",
    cursor: "pointer",
    transition: "all 0.18s",
    fontFamily: "'Cairo', sans-serif",
  },
  editBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "5px",
    padding: "9px",
    borderRadius: "10px",
    border: "1.5px solid #dbeafe",
    background: "#eff6ff",
    fontSize: "13px",
    fontWeight: "700",
    color: "#2563eb",
    cursor: "pointer",
    transition: "all 0.18s",
    fontFamily: "'Cairo', sans-serif",
  },
  deleteBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "5px",
    padding: "9px",
    borderRadius: "10px",
    border: "1.5px solid #fecaca",
    background: "#fef2f2",
    fontSize: "13px",
    fontWeight: "700",
    color: "#dc2626",
    cursor: "pointer",
    transition: "all 0.18s",
    fontFamily: "'Cairo', sans-serif",
  },
  loadingWrap: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "16px",
    padding: "80px 0",
  },
  loadingSpinner: {
    width: "40px",
    height: "40px",
    border: "3px solid #e2e8f0",
    borderTopColor: "#2563eb",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  loadingText: { color: "#94a3b8", fontSize: "14px", fontWeight: "600" },
  emptyWrap: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "12px",
    padding: "80px 0",
  },
  emptyIcon: {
    width: "80px",
    height: "80px",
    background: "#f8fafc",
    borderRadius: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1.5px solid #e2e8f0",
    marginBottom: "8px",
  },
  emptyTitle: { fontSize: "18px", fontWeight: "800", color: "#0f172a" },
  emptySub: { fontSize: "14px", color: "#94a3b8", fontWeight: "500" },
  emptyBtn: {
    marginTop: "8px",
    padding: "11px 24px",
    background: "linear-gradient(135deg,#2563eb,#6d28d9)",
    color: "#fff",
    border: "none",
    borderRadius: "12px",
    fontSize: "14px",
    fontWeight: "700",
    cursor: "pointer",
    fontFamily: "'Cairo', sans-serif",
  },
};
