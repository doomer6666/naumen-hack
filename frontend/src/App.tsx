import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import AppLayout from "./components/common/AppLayout";
import LoginPage from "./pages/LoginPage";
import PlaceholderPage from "./pages/PlaceholderPage";
import Dashboard from "./pages/Dashboard/Dashboard";
import { PlanPage } from "./pages/Plan/Plan";
import { DirectoryPage } from "./pages/Directory/Directory";
import HrDashboard from "./pages/Hr/HrDashboard";
import HrTemplates from "./pages/Hr/HrTemplates";
import HrTemplateEditor from "./pages/Hr/HrTemplateEditor";
import { AchievementsPage } from "./pages/Achievements/Achievements";
import { ProfilePage } from "./pages/Profile/ProfilePage";
import HrEmployees from "./pages/Hr/HrEmployees";
import HrEmployeePlan from "./pages/Hr/HrEmployeePlan";
import HrFeedbacks from "./pages/Hr/HrFeedbacks";
import MenteesList from "./pages/Mentor/MenteesList";
import MenteeProgress from "./pages/Mentor/MenteeProgress";

const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Публичный маршрут */}
          <Route path="/login" element={<LoginPage />} />

          {/* Защищенные маршруты */}
          <Route element={<AppLayout />}>
            <Route path="/profile" element={<ProfilePage />} />

            {/*Сотрудник*/}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/plan" element={<PlanPage />} />
            <Route path="/directory" element={<DirectoryPage />} />
            <Route path="/feedback" element={<PlaceholderPage />} />
            <Route path="/achievements" element={<AchievementsPage />} />

            {/*HR*/}
            <Route path="/hr/dashboard" element={<HrDashboard />} />
            <Route path="/hr/templates" element={<HrTemplates />} />
            <Route
              path="/hr/templates/:id/edit"
              element={<HrTemplateEditor />}
            />
            <Route path="/hr/employees" element={<HrEmployees />} />
            <Route path="/hr/employees/:id/plan" element={<HrEmployeePlan />} />
            <Route path="/hr/feedbacks" element={<HrFeedbacks />} />
            <Route path="/hr/integrations" element={<PlaceholderPage />} />
            <Route path="/hr/settings" element={<PlaceholderPage />} />

            {/*Ментор*/}
            <Route path="/mentor/my-mentees" element={<MenteesList />} />
            <Route
              path="/mentor/my-mentees/:id/progress"
              element={<PlanPage />}
            />
          </Route>

          {/* Редирект по умолчанию */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
