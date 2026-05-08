import Header from "@/components/header";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Suspense } from "react";
import { BarLoader } from "react-spinners";

const AppLayout = () => {
  const { pathname } = useLocation();
  const isDashboard = pathname.startsWith("/employer/dashboard") || pathname.startsWith("/candidate/dashboard") || pathname.startsWith("/profile") || pathname === "/applications" || pathname === "/my-jobs" || pathname === "/saved-jobs" || pathname === "/resume";
  const isLanding = pathname === "/";
  const isAdmin = pathname.startsWith("/admin");
  const isAuthPage = pathname === "/employer/login" || pathname === "/candidate/login" ||
                     pathname === "/employer/register" || pathname === "/candidate/register";

  return (
    <div>
      <main className={`min-h-screen ${isDashboard || isLanding || isAdmin || isAuthPage ? "" : "container mx-auto px-4 sm:px-6 lg:px-8"}`}>
        {!isDashboard && !isAdmin && !isAuthPage && <Header />}
        <Suspense fallback={<div className="flex w-full mt-24 items-center justify-center"><BarLoader color="#36d7b7" width={"100%"} /></div>}>
          <Outlet />
        </Suspense>
      </main>
      {!isDashboard && !isAdmin && !isAuthPage && (
        <footer className="text-center py-6 border-t border-gray-100">
          <p className="text-gray-700 text-sm font-semibold">
            Copyright © 2026 CareerHub.
          </p>
          <Link
            to="/admin/login"
            className="inline-block mt-2 text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            Admin Login
          </Link>
        </footer>
      )}
    </div>
  );
};

export default AppLayout;
