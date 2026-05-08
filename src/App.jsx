import { RouterProvider, createBrowserRouter } from "react-router-dom";

import AppLayout from "./layouts/app-layout";
import ProtectedRoute from "./components/protected-route";
import AdminRoute from "./components/admin-route";
import { ThemeProvider } from "./components/theme-provider";

import { lazy } from "react";

const LandingPage = lazy(() => import("./pages/landing"));
const Onboarding = lazy(() => import("./pages/onboarding"));
const PostJob = lazy(() => import("./pages/post-job"));
const JobListing = lazy(() => import("./pages/jobListing"));
const MyJobs = lazy(() => import("./pages/my-jobs"));
const SavedJobs = lazy(() => import("./pages/saved-jobs"));
const JobPage = lazy(() => import("./pages/job"));
const EmployerLogin = lazy(() => import("./pages/employer-login"));
const EmployerRegister = lazy(() => import("./pages/employer-register"));
const EmployerDashboard = lazy(() => import("./pages/employer-dashboard"));
const EmployerSettings = lazy(() => import("./pages/employer-settings"));
const CandidateLogin = lazy(() => import("./pages/candidate-login"));
const CandidateRegister = lazy(() => import("./pages/candidate-register"));
const CandidateDashboard = lazy(() => import("./pages/candidate-dashboard"));
const CandidateProfile = lazy(() => import("./pages/candidate-profile"));
const ApplicationsPage = lazy(() => import("./pages/applications"));
const ResumePage = lazy(() => import("./pages/resume"));
const AdminLogin = lazy(() => import("./pages/admin-login"));
const AdminDashboard = lazy(() => import("./pages/admin-dashboard"));
const AdminEmployers = lazy(() => import("./pages/admin-employers"));
const AdminCandidates = lazy(() => import("./pages/admin-candidates"));
const AdminApplications = lazy(() => import("./pages/admin-applications"));
const AdminEditJob = lazy(() => import("./pages/admin-edit-job"));
const ForgotPassword = lazy(() => import("./pages/forgot-password"));
const AdminForgotPassword = lazy(() => import("./pages/admin-forgot-password"));
const AdminResetPassword = lazy(() => import("./pages/admin-reset-password"));
const AdminArchiveEmployers = lazy(() => import("./pages/admin-archive-employers"));
const AdminArchiveCandidates = lazy(() => import("./pages/admin-archive-candidates"));

import "./App.css";

const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      {
        path: "/",
        element: <LandingPage />,
      },
      {
        path: "/candidate/login",
        element: <CandidateLogin />,
      },
      {
        path: "/candidate/register",
        element: <CandidateRegister />,
      },
      {
        path: "/forgot-password",
        element: <ForgotPassword />,
      },
      {
        path: "/employer/login",
        element: <EmployerLogin />,
      },
      {
        path: "/employer/register",
        element: <EmployerRegister />,
      },
      {
        path: "/employer/dashboard",
        element: (
          <ProtectedRoute>
            <EmployerDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "/employer/settings",
        element: (
          <ProtectedRoute>
            <EmployerSettings />
          </ProtectedRoute>
        ),
      },
      {
        path: "/candidate/dashboard",
        element: (
          <ProtectedRoute>
            <CandidateDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "/profile",
        element: (
          <ProtectedRoute>
            <CandidateProfile />
          </ProtectedRoute>
        ),
      },
      {
        path: "/onboarding",
        element: (
          <ProtectedRoute>
            <Onboarding />
          </ProtectedRoute>
        ),
      },
      {
        path: "/jobs",
        element: (
          <ProtectedRoute>
            <JobListing />
          </ProtectedRoute>
        ),
      },
      {
        path: "/post-job",
        element: (
          <ProtectedRoute>
            <PostJob />
          </ProtectedRoute>
        ),
      },
      {
        path: "/my-jobs",
        element: (
          <ProtectedRoute>
            <MyJobs />
          </ProtectedRoute>
        ),
      },
      {
        path: "/saved-jobs",
        element: (
          <ProtectedRoute>
            <SavedJobs />
          </ProtectedRoute>
        ),
      },
      {
        path: "/job/:id",
        element: (
          <ProtectedRoute>
            <JobPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/applications",
        element: (
          <ProtectedRoute>
            <ApplicationsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/resume",
        element: (
          <ProtectedRoute>
            <ResumePage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/admin/login",
        element: <AdminLogin />,
      },
      {
        path: "/admin/forgot-password",
        element: <AdminForgotPassword />,
      },
      {
        path: "/admin/reset-password",
        element: <AdminResetPassword />,
      },
      {
        path: "/admin/dashboard",
        element: <AdminRoute><AdminDashboard /></AdminRoute>,
      },
      {
        path: "/admin/employers",
        element: <AdminRoute><AdminEmployers /></AdminRoute>,
      },
      {
        path: "/admin/candidates",
        element: <AdminRoute><AdminCandidates /></AdminRoute>,
      },
      {
        path: "/admin/applications",
        element: <AdminRoute><AdminApplications /></AdminRoute>,
      },
      {
        path: "/admin/edit-job",
        element: <AdminRoute><AdminEditJob /></AdminRoute>,
      },
      {
        path: "/admin/archives/employers",
        element: <AdminRoute><AdminArchiveEmployers /></AdminRoute>,
      },
      {
        path: "/admin/archives/candidates",
        element: <AdminRoute><AdminArchiveCandidates /></AdminRoute>,
      },
    ],
  },
]);

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}

export default App;
