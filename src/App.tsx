import type { ReactNode } from "react";
import { RouterProvider, Routes, Route, Navigate } from "./lib/router";
import { ToastProvider } from "./hooks/useToast";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { AppLayout } from "./components/layout/AppLayout";
import { useStudent } from "./hooks/useAppData";

import { Landing } from "./pages/Landing";
import { Onboarding } from "./pages/Onboarding";
import { Dashboard } from "./pages/Dashboard";
import { Subjects } from "./pages/Subjects";
import { Capture } from "./pages/Capture";
import { StudyGuide } from "./pages/StudyGuide";
import { Quiz } from "./pages/Quiz";
import { QuizResult } from "./pages/QuizResult";
import { Performance } from "./pages/Performance";
import { Profile } from "./pages/Profile";
import { NotFound } from "./pages/NotFound";

/** Só deixa passar quem já fez o cadastro (perfil do aluno salvo). */
function RequireStudent({ children }: { children: ReactNode }) {
  const student = useStudent();
  if (!student) return <Navigate to="/onboarding" />;
  return <AppLayout>{children}</AppLayout>;
}

/** Quem já tem perfil não precisa passar pelo cadastro de novo. */
function OnboardingRoute() {
  const student = useStudent();
  if (student) return <Navigate to="/dashboard" />;
  return <Onboarding />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/onboarding" element={<OnboardingRoute />} />
      <Route
        path="/dashboard"
        element={
          <RequireStudent>
            <Dashboard />
          </RequireStudent>
        }
      />
      <Route
        path="/subjects"
        element={
          <RequireStudent>
            <Subjects />
          </RequireStudent>
        }
      />
      <Route
        path="/capture/:subjectId"
        element={
          <RequireStudent>
            <Capture />
          </RequireStudent>
        }
      />
      <Route
        path="/capture"
        element={
          <RequireStudent>
            <Capture />
          </RequireStudent>
        }
      />
      <Route
        path="/materials/:materialId/quiz"
        element={
          <RequireStudent>
            <Quiz />
          </RequireStudent>
        }
      />
      <Route
        path="/materials/:materialId"
        element={
          <RequireStudent>
            <StudyGuide />
          </RequireStudent>
        }
      />
      <Route
        path="/attempts/:attemptId"
        element={
          <RequireStudent>
            <QuizResult />
          </RequireStudent>
        }
      />
      <Route
        path="/performance"
        element={
          <RequireStudent>
            <Performance />
          </RequireStudent>
        }
      />
      <Route
        path="/profile"
        element={
          <RequireStudent>
            <Profile />
          </RequireStudent>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export function App() {
  return (
    <RouterProvider>
      <ToastProvider>
        <ErrorBoundary>
          <AppRoutes />
        </ErrorBoundary>
      </ToastProvider>
    </RouterProvider>
  );
}
