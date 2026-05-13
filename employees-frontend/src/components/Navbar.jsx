import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContextValue";
import { useI18n } from "../i18n/i18n";

export default function Navbar() {
  const navigate = useNavigate();
  const { can, logout, role, user } = useAuth();
  const { dir, t, toggleLanguage } = useI18n();
  const [menuOpen, setMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () => localStorage.getItem("ems_sidebar_collapsed") === "1",
  );

  const navItems = [
    { to: "/", label: t("common.dashboard"), icon: DashboardIcon, end: true },
    { to: "/employees", label: t("common.employees"), icon: EmployeesIcon },
    { to: "/profile", label: t("common.profile"), icon: ProfileIcon },
    can("organization.manage") && {
      to: "/organization",
      label: t("common.organization"),
      icon: OrganizationIcon,
    },
    can("users.manage") && { to: "/users", label: t("common.users"), icon: UsersIcon },
  ].filter(Boolean);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const closeMenu = () => setMenuOpen(false);
  const initials = (user?.name || user?.username || "U").slice(0, 2).toUpperCase();
  const toggleSidebar = () => {
    setSidebarCollapsed((current) => {
      const next = !current;
      localStorage.setItem("ems_sidebar_collapsed", next ? "1" : "0");
      return next;
    });
  };

  return (
    <>
      <style>{`
        .dashboard-page,
        .employees-page,
        .employee-form-page,
        .employee-detail-page,
        .users-page,
        .profile-page,
        .organization-page {
          display: flex;
          align-items: stretch;
        }

        .dashboard-main,
        .employees-main,
        .employee-form-main,
        .employee-detail-main,
        .users-main,
        .profile-main,
        .organization-main {
          flex: 1 1 auto;
          min-width: 0;
          width: 100%;
        }

        .app-sidebar,
        .app-sidebar * {
          box-sizing: border-box;
        }

        .app-mobile-nav {
          display: none;
        }

        .app-sidebar-link:hover {
          background: #f8fafc !important;
          color: #0f172a !important;
        }

        .app-sidebar-action:hover {
          transform: translateY(-1px);
        }

        @media (max-width: 880px) {
          .dashboard-page,
          .employees-page,
          .employee-form-page,
          .employee-detail-page,
          .users-page,
          .profile-page,
          .organization-page {
            display: block;
          }

          .app-sidebar {
            display: none !important;
          }

          .app-mobile-nav {
            display: block !important;
            position: sticky;
            top: 0;
            z-index: 50;
          }

          .app-mobile-drawer {
            display: none !important;
          }

          .app-mobile-drawer.is-open {
            display: grid !important;
          }
        }
      `}</style>

      <aside
        className={`app-sidebar${sidebarCollapsed ? " is-collapsed" : ""}`}
        style={{ ...s.sidebar, ...(sidebarCollapsed ? s.sidebarCollapsed : {}), direction: dir }}
        dir={dir}
      >
        <div style={{ ...s.brand, ...(sidebarCollapsed ? s.brandCollapsed : {}) }}>
          <span style={s.logo}>EMS</span>
          {!sidebarCollapsed && (
            <div style={s.brandText}>
            <p style={s.title}>{t("common.appName")}</p>
            <p style={s.subtitle}>{t(`common.roleSubtitle.${role || "viewer"}`)}</p>
            </div>
          )}
          <button
            type="button"
            style={{ ...s.collapseBtn, ...(sidebarCollapsed ? s.collapseBtnCollapsed : {}) }}
            aria-label={sidebarCollapsed ? t("common.openMenu") : t("common.closeMenu")}
            title={sidebarCollapsed ? t("common.openMenu") : t("common.closeMenu")}
            onClick={toggleSidebar}
          >
            {sidebarCollapsed ? <ExpandSidebarIcon /> : <CollapseSidebarIcon />}
          </button>
        </div>

        <nav style={s.navList} aria-label={t("common.appName")}>
          {navItems.map((item) => (
            <SidebarLink key={item.to} collapsed={sidebarCollapsed} item={item} onClick={closeMenu} />
          ))}
        </nav>

        <div style={s.footer}>
          <div style={{ ...s.userBlock, ...(sidebarCollapsed ? s.userBlockCollapsed : {}) }}>
            <span style={s.userAvatar}>{initials}</span>
            {!sidebarCollapsed && (
              <div style={s.userText}>
                <p style={s.userName}>{user?.name || user?.username}</p>
                <p style={s.userRole}>{t(`users.roles.${role || "viewer"}`)}</p>
              </div>
            )}
          </div>

          <button
            type="button"
            className="app-sidebar-action"
            style={{ ...s.languageBtn, ...(sidebarCollapsed ? s.iconOnlyAction : {}) }}
            title={t("common.switchToLanguage")}
            onClick={toggleLanguage}
          >
            <LanguageIcon />
            {!sidebarCollapsed && t("common.switchToLanguage")}
          </button>
          <button
            type="button"
            className="app-sidebar-action"
            style={{ ...s.logoutBtn, ...(sidebarCollapsed ? s.iconOnlyAction : {}) }}
            title={t("common.logout")}
            onClick={handleLogout}
          >
            <LogoutIcon />
            {!sidebarCollapsed && t("common.logout")}
          </button>
        </div>
      </aside>

      <header className="app-mobile-nav" style={{ ...s.mobileNav, direction: dir }} dir={dir}>
        <div style={s.mobileBar}>
          <div style={s.mobileBrand}>
            <span style={s.mobileLogo}>EMS</span>
            <div>
              <p style={s.mobileTitle}>{t("common.appName")}</p>
              <p style={s.mobileSubtitle}>{t(`common.roleSubtitle.${role || "viewer"}`)}</p>
            </div>
          </div>

          <button
            type="button"
            style={s.menuBtn}
            aria-label={menuOpen ? t("common.closeMenu") : t("common.openMenu")}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>

        <div className={`app-mobile-drawer${menuOpen ? " is-open" : ""}`} style={s.mobileDrawer}>
          {navItems.map((item) => (
            <SidebarLink key={item.to} item={item} onClick={closeMenu} compact />
          ))}
          <button
            type="button"
            style={s.mobileAction}
            onClick={() => {
              toggleLanguage();
              closeMenu();
            }}
          >
            <LanguageIcon />
            {t("common.switchToLanguage")}
          </button>
          <button type="button" style={{ ...s.mobileAction, ...s.mobileLogout }} onClick={handleLogout}>
            <LogoutIcon />
            {t("common.logout")}
          </button>
        </div>
      </header>
    </>
  );
}

function SidebarLink({ collapsed = false, compact = false, item, onClick }) {
  const Icon = item.icon;

  return (
    <NavLink
      className="app-sidebar-link"
      to={item.to}
      end={item.end}
      onClick={onClick}
      title={collapsed ? item.label : undefined}
      style={({ isActive }) => ({
        ...s.link,
        ...(compact ? s.mobileLink : {}),
        ...(collapsed ? s.collapsedLink : {}),
        ...(isActive ? s.activeLink : {}),
      })}
    >
      <Icon />
      {!collapsed && <span>{item.label}</span>}
    </NavLink>
  );
}

function DashboardIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="2" />
      <rect x="14" y="3" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="2" />
      <rect x="14" y="14" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="2" />
      <rect x="3" y="14" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function EmployeesIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" />
      <circle cx="10" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
      <path d="M21 21v-2a4 4 0 0 0-3-3.87M17 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function ProfileIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
      <path d="M4 21a8 8 0 0 1 16 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function OrganizationIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M9 4V2h6v2M8 10h8M8 15h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" />
      <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function LanguageIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 0 20M12 2a15.3 15.3 0 0 0 0 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none">
      <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none">
      <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

function CollapseSidebarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ExpandSidebarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const s = {
  sidebar: {
    width: "246px",
    minHeight: "100vh",
    position: "sticky",
    top: 0,
    alignSelf: "flex-start",
    display: "flex",
    flexDirection: "column",
    gap: "18px",
    padding: "18px",
    background: "#ffffff",
    borderInlineEnd: "1px solid #e2e8f0",
    fontFamily: "'Cairo', sans-serif",
    zIndex: 30,
    transition: "width 0.22s ease, padding 0.22s ease",
    overflow: "visible",
  },
  sidebarCollapsed: {
    width: "76px",
    padding: "16px 12px",
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    minWidth: 0,
    padding: "4px 2px 14px",
    borderBottom: "1px solid #f1f5f9",
    position: "relative",
  },
  brandCollapsed: {
    justifyContent: "center",
    padding: "2px 0 14px",
  },
  logo: {
    width: "44px",
    height: "44px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#2563eb",
    color: "#fff",
    fontSize: "13px",
    fontWeight: "800",
    flexShrink: 0,
  },
  brandText: { minWidth: 0 },
  title: { color: "#0f172a", fontSize: "15px", fontWeight: "800", lineHeight: 1.35 },
  subtitle: { color: "#64748b", fontSize: "11px", fontWeight: "700", marginTop: "2px" },
  collapseBtn: {
    width: "30px",
    height: "30px",
    borderRadius: "9px",
    border: "1px solid #e2e8f0",
    background: "#fff",
    color: "#475569",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    flexShrink: 0,
    marginInlineStart: "auto",
  },
  collapseBtnCollapsed: {
    position: "absolute",
    insetInlineEnd: "-8px",
    top: "8px",
    boxShadow: "0 6px 16px rgba(15,23,42,0.12)",
  },
  navList: { display: "grid", gap: "6px" },
  link: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    minHeight: "42px",
    padding: "10px 12px",
    borderRadius: "10px",
    color: "#475569",
    textDecoration: "none",
    fontSize: "13px",
    fontWeight: "800",
    border: "1px solid transparent",
    transition: "all 0.18s",
  },
  collapsedLink: {
    justifyContent: "center",
    padding: "10px",
  },
  activeLink: {
    color: "#2563eb",
    background: "#eff6ff",
    borderColor: "#bfdbfe",
  },
  footer: {
    marginTop: "auto",
    display: "grid",
    gap: "8px",
    paddingTop: "14px",
    borderTop: "1px solid #f1f5f9",
  },
  userBlock: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    minWidth: 0,
    padding: "10px",
    borderRadius: "12px",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
  },
  userBlockCollapsed: {
    justifyContent: "center",
    padding: "8px",
  },
  userAvatar: {
    width: "34px",
    height: "34px",
    borderRadius: "10px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#0f172a",
    color: "#fff",
    fontSize: "12px",
    fontWeight: "800",
    flexShrink: 0,
  },
  userText: { minWidth: 0 },
  userName: {
    color: "#0f172a",
    fontSize: "12px",
    fontWeight: "800",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  userRole: { color: "#64748b", fontSize: "11px", fontWeight: "700", marginTop: "1px" },
  languageBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    minHeight: "40px",
    borderRadius: "10px",
    border: "1px solid #dbeafe",
    background: "#eff6ff",
    color: "#2563eb",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "800",
    fontFamily: "'Cairo', sans-serif",
    transition: "all 0.18s",
  },
  iconOnlyAction: {
    width: "100%",
    padding: 0,
    gap: 0,
  },
  logoutBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    minHeight: "40px",
    borderRadius: "10px",
    border: "1px solid #fee2e2",
    background: "#fef2f2",
    color: "#dc2626",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "800",
    fontFamily: "'Cairo', sans-serif",
    transition: "all 0.18s",
  },
  mobileNav: {
    background: "#fff",
    borderBottom: "1px solid #e2e8f0",
    fontFamily: "'Cairo', sans-serif",
  },
  mobileBar: {
    minHeight: "64px",
    padding: "10px 16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
  },
  mobileBrand: { display: "flex", alignItems: "center", gap: "10px", minWidth: 0 },
  mobileLogo: {
    width: "38px",
    height: "38px",
    borderRadius: "11px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#2563eb",
    color: "#fff",
    fontSize: "12px",
    fontWeight: "800",
    flexShrink: 0,
  },
  mobileTitle: { color: "#0f172a", fontSize: "14px", fontWeight: "800", lineHeight: 1.35 },
  mobileSubtitle: { color: "#64748b", fontSize: "11px", fontWeight: "700" },
  menuBtn: {
    width: "40px",
    height: "40px",
    borderRadius: "10px",
    border: "1px solid #e2e8f0",
    background: "#fff",
    color: "#0f172a",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  },
  mobileDrawer: {
    padding: "0 16px 14px",
    gap: "8px",
    borderTop: "1px solid #f1f5f9",
  },
  mobileLink: {
    width: "100%",
    minHeight: "44px",
  },
  mobileAction: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    width: "100%",
    minHeight: "42px",
    borderRadius: "10px",
    border: "1px solid #dbeafe",
    background: "#eff6ff",
    color: "#2563eb",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "800",
    fontFamily: "'Cairo', sans-serif",
  },
  mobileLogout: {
    borderColor: "#fee2e2",
    background: "#fef2f2",
    color: "#dc2626",
  },
};
