import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { useAuth } from "@/context/AuthContext";
import { getPostAuthPath } from "@/lib/auth";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  const navLinks = [
    { label: "Home", path: "/" },
    { label: "Marketplace", path: "/marketplace" },
    ...(user?.role === "artisan"
      ? [{ label: "My Shop", path: "/dashboard" }]
      : !user
        ? [{ label: "For Artisans", path: "/signup" }]
        : []),
  ];

  const accountPath = user ? getPostAuthPath(user) : "/signup";
  const accountLabel = user
    ? user.onboardingComplete
      ? user.role === "artisan"
        ? "Dashboard"
        : "Browse"
      : "Finish Setup"
    : "Start Selling";

  const handleLogout = () => {
    logout();
    setOpen(false);
    toast.success("You have been logged out.");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg">
      <div className="container flex items-center justify-between h-16 md:h-20">
        <Link to="/" className="font-serif text-2xl font-bold tracking-tight text-foreground">
          Craft<span className="text-primary">AI</span>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                location.pathname === link.path ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <span className="text-sm text-muted-foreground">Hi, {user.name}</span>
                <Button variant="ghost" size="sm" asChild>
                  <Link to={accountPath}>{accountLabel}</Link>
                </Button>
                <Button size="sm" onClick={handleLogout}>
                  Log out
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/login">Log in</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link to="/signup">Start Selling</Link>
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden p-2" onClick={() => setOpen(!open)}>
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-surface border-b border-border overflow-hidden"
          >
            <div className="container py-4 flex flex-col gap-3">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setOpen(false)}
                  className="text-base font-medium py-2 text-foreground"
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex gap-3 pt-2">
                {user ? (
                  <>
                    <Button variant="outline" size="sm" className="flex-1" asChild>
                      <Link to={accountPath} onClick={() => setOpen(false)}>
                        {accountLabel}
                      </Link>
                    </Button>
                    <Button size="sm" className="flex-1" onClick={handleLogout}>
                      Log out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" size="sm" className="flex-1" asChild>
                      <Link to="/login" onClick={() => setOpen(false)}>
                        Log in
                      </Link>
                    </Button>
                    <Button size="sm" className="flex-1" asChild>
                      <Link to="/signup" onClick={() => setOpen(false)}>
                        Start Selling
                      </Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
