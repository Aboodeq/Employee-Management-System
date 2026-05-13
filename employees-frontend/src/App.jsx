import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./context/authContextValue";
import { I18nProvider } from "./i18n/i18n";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import EmployeeListPage from "./pages/EmployeeListPage";
import EmployeeDetailPage from "./pages/EmployeeDetailPage";
import AddEmployeePage from "./pages/AddEmployeePage";
import EditEmployeePage from "./pages/EditEmployeePage";
import UserManagementPage from "./pages/UserManagementPage";
import UserFormPage from "./pages/UserFormPage";
import ProfilePage from "./pages/ProfilePage";
import OrganizationPage from "./pages/OrganizationPage";
import DepartmentFormPage from "./pages/DepartmentFormPage";
import JobTitleFormPage from "./pages/JobTitleFormPage";

const ProtectedRoute = ({ children, permission }) => {
  const { authLoading, can, isAuthenticated } = useAuth();

  if (authLoading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (permission && !can(permission)) return <Navigate to="/" replace />;

  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/employees"
        element={
          <ProtectedRoute>
            <EmployeeListPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/employees/add"
        element={
          <ProtectedRoute permission="employees.create">
            <AddEmployeePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/employees/edit/:id"
        element={
          <ProtectedRoute permission="employees.update">
            <EditEmployeePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/users"
        element={
          <ProtectedRoute permission="users.manage">
            <UserManagementPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/users/add"
        element={
          <ProtectedRoute permission="users.manage">
            <UserFormPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/users/edit/:id"
        element={
          <ProtectedRoute permission="users.manage">
            <UserFormPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/organization"
        element={
          <ProtectedRoute permission="organization.manage">
            <OrganizationPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/organization/departments/add"
        element={
          <ProtectedRoute permission="organization.manage">
            <DepartmentFormPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/organization/departments/edit/:id"
        element={
          <ProtectedRoute permission="organization.manage">
            <DepartmentFormPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/organization/job-titles/add"
        element={
          <ProtectedRoute permission="organization.manage">
            <JobTitleFormPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/organization/job-titles/edit/:id"
        element={
          <ProtectedRoute permission="organization.manage">
            <JobTitleFormPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/employees/:id"
        element={
          <ProtectedRoute>
            <EmployeeDetailPage />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <I18nProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </I18nProvider>
  );
}

export default App;
