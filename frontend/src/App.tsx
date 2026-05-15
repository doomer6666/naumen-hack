import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import AppLayout from "./components/common/AppLayout";
import LoginPage from "./pages/LoginPage";
import PlaceholderPage from "./pages/PlaceholderPage";
import Dashboard from "./pages/Dashboard/Dashboard";

const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Публичный маршрут */}
          <Route path="/login" element={<LoginPage />} />

          {/* Защищенные маршруты */}
          <Route element={<AppLayout />}>
            {/*Сотрудник*/}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/plan" element={<PlaceholderPage />} />
            <Route path="/directory" element={<PlaceholderPage />} />
            <Route path="/feedback" element={<PlaceholderPage />} />

            {/*HR*/}
            <Route path="/hr/dashboard" element={<PlaceholderPage />} />
            <Route path="/hr/templates" element={<PlaceholderPage />} />
            <Route
              path="/hr/templates/:id/edit"
              element={<PlaceholderPage />}
            />
            <Route path="/hr/employees" element={<PlaceholderPage />} />
            <Route
              path="/hr/employees/:id/plan"
              element={<PlaceholderPage />}
            />
            <Route path="/hr/feedbacks" element={<PlaceholderPage />} />
            <Route path="/hr/integrations" element={<PlaceholderPage />} />
            <Route path="/hr/settings" element={<PlaceholderPage />} />

            {/*Ментор*/}
            <Route path="/mentor/my-mentees" element={<PlaceholderPage />} />
            <Route
              path="/mentor/my-mentees/:id/progress"
              element={<PlaceholderPage />}
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
