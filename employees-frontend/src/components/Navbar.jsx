import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContextValue";
import { useI18n } from "../i18n/i18n";

export default function Navbar() {
  const navigate = useNavigate();
  const { can, logout, role } = useAuth();
  const { dir, t, toggleLanguage } = useI18n();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <nav className="app-nav" style={{ ...s.nav, direction: dir }} dir={dir}>
      <style>{`
        .app-nav,
        .app-nav * {
          box-sizing: border-box;
        }
        .app-nav-menu-btn {
          display: none;
        }
        @media (max-width: 760px) {
          .app-nav-inner {
            align-items: stretch !important;
            flex-direction: column !important;
            gap: 12px !important;
            padding: 12px 18px !important;
          }
          .app-nav-top {
            display: flex !important;
            align-items: center !important;
            justify-content: space-between !important;
            gap: 12px !important;
            width: 100% !important;
          }
          .app-nav-title {
            white-space: normal !important;
            font-size: 14px !important;
          }
          .app-nav-menu-btn {
            display: inline-flex !important;
          }
          .app-nav-links {
            display: none !important;
            width: 100% !important;
            grid-template-columns: 1fr !important;
            gap: 8px !important;
            padding-top: 10px !important;
            border-top: 1px solid #f1f5f9 !important;
          }
          .app-nav-links.is-open {
            display: grid !important;
          }
          .app-nav-link,
          .app-nav-logout {
            width: 100% !important;
            justify-content: center !important;
            text-align: center !important;
          }
        }
      `}</style>

      <div className="app-nav-inner" style={s.inner}>
        <div className="app-nav-top" style={s.topRow}>
          <div style={s.brand}>
            <span style={s.logo}>EMS</span>
            <div>
              <p className="app-nav-title" style={s.title}>
                {t("common.appName")}
              </p>
              <p style={s.subtitle}>{t(`common.roleSubtitle.${role || "viewer"}`)}</p>
            </div>
          </div>

          <button
            type="button"
            className="app-nav-menu-btn"
            style={s.menuBtn}
            aria-label={menuOpen ? t("common.closeMenu") : t("common.openMenu")}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              {menuOpen ? (
                <>
                  <line
                    x1="18"
                    y1="6"
                    x2="6"
                    y2="18"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  />
                  <line
                    x1="6"
                    y1="6"
                    x2="18"
                    y2="18"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  />
                </>
              ) : (
                <>
                  <line
                    x1="4"
                    y1="7"
                    x2="20"
                    y2="7"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  />
                  <line
                    x1="4"
                    y1="12"
                    x2="20"
                    y2="12"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  />
                  <line
                    x1="4"
                    y1="17"
                    x2="20"
                    y2="17"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  />
                </>
              )}
            </svg>
          </button>
        </div>

        <div className={`app-nav-links${menuOpen ? " is-open" : ""}`} style={s.links}>
          <NavLink
            className="app-nav-link"
            to="/"
            end
            style={({ isActive }) => linkStyle(isActive)}
            onClick={() => setMenuOpen(false)}
          >
            {t("common.dashboard")}
          </NavLink>
          <NavLink
            className="app-nav-link"
            to="/employees"
            style={({ isActive }) => linkStyle(isActive)}
            onClick={() => setMenuOpen(false)}
          >
            {t("common.employees")}
          </NavLink>
          <NavLink
            className="app-nav-link"
            to="/profile"
            style={({ isActive }) => linkStyle(isActive)}
            onClick={() => setMenuOpen(false)}
          >
            {t("common.profile")}
          </NavLink>
          {can("users.manage") && (
            <NavLink
              className="app-nav-link"
              to="/users"
              style={({ isActive }) => linkStyle(isActive)}
              onClick={() => setMenuOpen(false)}
            >
              {t("common.users")}
            </NavLink>
          )}
          <button
            type="button"
            className="app-nav-logout"
            style={s.languageBtn}
            title={t("common.language")}
            onClick={() => {
              toggleLanguage();
              setMenuOpen(false);
            }}
          >
            {t("common.switchToLanguage")}
          </button>
          <button type="button" className="app-nav-logout" style={s.logout} onClick={handleLogout}>
            {t("common.logout")}
          </button>
        </div>
      </div>
    </nav>
  );
}

const linkStyle = (isActive) => ({
  ...s.link,
  ...(isActive ? s.activeLink : {}),
});

const s = {
  nav: {
    background: "#fff",
    borderBottom: "1px solid #e2e8f0",
    position: "sticky",
    top: 0,
    zIndex: 20,
    direction: "rtl",
    fontFamily: "'Cairo', sans-serif",
  },
  inner: {
    maxWidth: "1280px",
    margin: "0 auto",
    padding: "14px 32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "24px",
  },
  topRow: {
    display: "contents",
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    minWidth: 0,
  },
  logo: {
    width: "42px",
    height: "42px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #2563eb, #7c3aed)",
    color: "#fff",
    fontSize: "13px",
    fontWeight: "800",
    letterSpacing: 0,
    flexShrink: 0,
  },
  title: {
    color: "#0f172a",
    fontSize: "15px",
    fontWeight: "800",
    lineHeight: 1.3,
    whiteSpace: "nowrap",
  },
  subtitle: {
    color: "#94a3b8",
    fontSize: "11px",
    fontWeight: "600",
    lineHeight: 1.3,
  },
  links: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flexWrap: "wrap",
  },
  link: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#475569",
    background: "transparent",
    border: "1px solid transparent",
    borderRadius: "10px",
    padding: "9px 14px",
    fontSize: "13px",
    fontWeight: "700",
    transition: "all 0.18s",
  },
  activeLink: {
    color: "#2563eb",
    background: "#eff6ff",
    borderColor: "#dbeafe",
  },
  logout: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#dc2626",
    background: "#fef2f2",
    border: "1px solid #fee2e2",
    borderRadius: "10px",
    padding: "9px 14px",
    fontSize: "13px",
    fontWeight: "700",
    cursor: "pointer",
    fontFamily: "'Cairo', sans-serif",
  },
  languageBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#2563eb",
    background: "#eff6ff",
    border: "1px solid #dbeafe",
    borderRadius: "10px",
    padding: "9px 14px",
    fontSize: "13px",
    fontWeight: "800",
    cursor: "pointer",
    fontFamily: "'Cairo', sans-serif",
  },
  menuBtn: {
    width: "42px",
    height: "42px",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    background: "#fff",
    color: "#475569",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    flexShrink: 0,
  },
};
