import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContextValue";

export default function Navbar() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <nav style={s.nav}>
      <div style={s.inner}>
        <div style={s.brand}>
          <span style={s.logo}>EMS</span>
          <div>
            <p style={s.title}>نظام إدارة الموظفين</p>
            <p style={s.subtitle}>لوحة المدير</p>
          </div>
        </div>

        <div style={s.links}>
          <NavLink to="/" end style={({ isActive }) => linkStyle(isActive)}>
            لوحة التحكم
          </NavLink>
          <NavLink to="/employees" style={({ isActive }) => linkStyle(isActive)}>
            الموظفون
          </NavLink>
          <button type="button" style={s.logout} onClick={handleLogout}>
            تسجيل الخروج
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
};
