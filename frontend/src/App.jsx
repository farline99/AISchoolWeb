import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ConfigProvider } from "antd";
import ruRU from "antd/locale/ru_RU";

import MainLayout from "./layouts/MainLayout";
import PrivateRoute from "./components/PrivateRoute";

import LoginPage from "./pages/LoginPage";
import TeachersPage from "./pages/TeachersPage";
import ClassesPage from "./pages/ClassesPage";
import StudyPlansPage from "./pages/StudyPlansPage";
import WorkloadPage from "./pages/WorkloadPage";
import ReportsPage from "./pages/ReportsPage";
import TeacherJournalPage from "./pages/TeacherJournalPage";
import StudentProfilePage from "./pages/StudentProfilePage";

const HomeRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;

  if (user.role === "admin") return <Navigate to="/teachers" />;
  if (user.role === "teacher") return <Navigate to="/journal" />;
  if (["student", "parent"].includes(user.role))
    return <Navigate to="/profile" />;

  return <div>Unknown role</div>;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<PrivateRoute />}>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomeRedirect />} />

          <Route element={<PrivateRoute allowedRoles={["admin"]} />}>
            <Route path="teachers" element={<TeachersPage />} />
            <Route path="classes" element={<ClassesPage />} />
            <Route path="plans" element={<StudyPlansPage />} />
            <Route path="workload" element={<WorkloadPage />} />
            <Route path="reports" element={<ReportsPage />} />
          </Route>

          <Route element={<PrivateRoute allowedRoles={["teacher", "admin"]} />}>
            <Route path="journal" element={<TeacherJournalPage />} />
          </Route>

          <Route
            element={<PrivateRoute allowedRoles={["student", "parent"]} />}
          >
            <Route path="profile" element={<StudentProfilePage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

function App() {
  return (
    <ConfigProvider locale={ruRU}>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ConfigProvider>
  );
}

export default App;
