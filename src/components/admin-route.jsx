import { Navigate } from "react-router-dom";

export const ADMIN_TOKEN = "CAREERHUB_ADMIN_2026";

export function isAdminLoggedIn() {
  return localStorage.getItem("admin_token") === ADMIN_TOKEN;
}

export default function AdminRoute({ children }) {
  return isAdminLoggedIn() ? children : <Navigate to="/admin/login" replace />;
}
