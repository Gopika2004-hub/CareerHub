/* eslint-disable react/prop-types */
import { Navigate, useLocation } from "react-router-dom";
import { useUser, useClerk } from "@/lib/auth";
import { useEffect, useRef, useState } from "react";

// Module-level cache: avoids re-fetching the same user_id on every route change
const archiveCache = {}; // userId -> boolean (true = archived)

const ProtectedRoute = ({ children }) => {
  const { isSignedIn, isLoaded, user } = useUser();
  const { signOut } = useClerk();
  const { pathname } = useLocation();

  const [archiveChecked, setArchiveChecked] = useState(false);
  const [isArchived,     setIsArchived]     = useState(false);
  const checkingRef = useRef(false);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user?.id) {
      setArchiveChecked(true);
      return;
    }

    // Already cached this session
    if (user.id in archiveCache) {
      setIsArchived(archiveCache[user.id]);
      setArchiveChecked(true);
      if (archiveCache[user.id]) signOut();
      return;
    }

    // Prevent duplicate in-flight requests
    if (checkingRef.current) return;
    checkingRef.current = true;

    fetch(`/api/check-archived?user_id=${encodeURIComponent(user.id)}`)
      .then(r => r.json())
      .then(data => {
        const role = user?.unsafeMetadata?.role;
        // Only block if archive type matches the user's actual role.
        // Prevents stale candidate archives from blocking employer accounts.
        const archived = data.archived === true && (
          (role === 'recruiter' && data.type === 'employer') ||
          (role === 'candidate' && data.type === 'candidate') ||
          (!role)
        );
        archiveCache[user.id] = archived;
        setIsArchived(archived);
        setArchiveChecked(true);
        if (archived) signOut();
      })
      .catch(() => {
        archiveCache[user.id] = false;
        setArchiveChecked(true);
      })
      .finally(() => { checkingRef.current = false; });
  }, [user?.id, isLoaded, isSignedIn]);

  // Allow job detail pages without login so Apply Now is always accessible
  if (pathname.startsWith("/job/")) return children;

  if (isLoaded && !isSignedIn) {
    return <Navigate to="/candidate/login" />;
  }

  // Wait for the archive check before rendering
  if (isSignedIn && !archiveChecked) return null;

  if (isArchived) {
    return (
      <Navigate
        to="/candidate/login"
        state={{ archived: true }}
        replace
      />
    );
  }

  if (
    user !== undefined &&
    !user?.unsafeMetadata?.role &&
    pathname !== "/onboarding"
  )
    return <Navigate to="/onboarding" />;

  return children;
};

export default ProtectedRoute;
