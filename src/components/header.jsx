import { Link } from "react-router-dom";
import {
  SignedIn,
  SignedOut,
  UserButton,
  useUser,
} from "@/lib/auth";
import { Button } from "./ui/button";
import { BriefcaseBusiness, Heart, User } from "lucide-react";

const Header = () => {
  const { user } = useUser();
  const isRecruiter = user?.unsafeMetadata?.role === "recruiter";

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-black/5">
      
      {/* âœ… CENTER CONTAINER */}
      <div className="max-w-7xl mx-auto flex justify-between items-center py-4">
        
        {/* âœ… LEFT SIDE (Logo gap control) */}
        <div className="pl-6 sm:pl-0 lg:pl-0 flex items-center">
          <Link to="/" className="flex items-center">
            <img
              src="/logo.png"
              className="h-6 sm:h-8 lg:h-10"
              alt="CareerHub Logo"
            />
          </Link>
        </div>

        {/* âœ… RIGHT SIDE (Buttons gap control) */}
        <div className="pr-6 sm:pr-0 lg:pr-0 flex items-center gap-3 sm:gap-6 lg:gap-8">

          <Link to="/jobs">
            <button className="px-4 py-2 rounded-full bg-[#00529b] text-white font-medium shadow hover:scale-105 transition">
              Search Jobs
            </button>
          </Link>

          {/* NOT LOGGED IN */}
          <SignedOut>
            <div className="flex gap-3">
              
              <Link to="/candidate/login">
                <button className="px-5 py-2 rounded-full bg-[#00529b] text-white font-medium shadow hover:scale-105 transition">
                  Candidate Login â†’
                </button>
              </Link>

              <Link to="/employer/login">
                <button className="px-5 py-2 rounded-full bg-[#00529b] text-white font-medium shadow hover:scale-105 transition">
                  Employer Login â†’
                </button>
              </Link>

            </div>
          </SignedOut>

          {/* LOGGED IN */}
          <SignedIn>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-10 h-10",
                },
              }}
            >
              <UserButton.MenuItems>
                {isRecruiter ? (
                  <UserButton.Link
                    label="Profile"
                    labelIcon={<User size={15} />}
                    href="/employer/dashboard"
                  />
                ) : (
                  <UserButton.Link
                    label="Profile"
                    labelIcon={<User size={15} />}
                    href="/candidate/dashboard"
                  />
                )}
              </UserButton.MenuItems>
            </UserButton>
          </SignedIn>

        </div>
      </div>
    </nav>
  );
};

export default Header;