import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import { getPostAuthPath } from "@/lib/auth";

const spring = { type: "spring" as const, stiffness: 220, damping: 24, mass: 0.8 };

const Signup = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [role, setRole] = useState<"artisan" | "customer">("artisan");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!name.trim() || !email.trim() || !password.trim()) {
      toast.error("Please complete your name, email, and password.");
      return;
    }

    setIsSubmitting(true);

    const result = signup({
      name,
      email,
      password,
      role,
    });

    setIsSubmitting(false);

    if (!result.ok || !result.user) {
      toast.error(result.message ?? "We couldn't create your account.");
      return;
    }

    toast.success("Account created. Let's finish your setup.");
    navigate(getPostAuthPath(result.user), { replace: true });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container max-w-md pt-28 md:pt-32 pb-16">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={spring}>
          <h1 className="font-serif text-3xl font-bold text-foreground mb-2 text-center">Join CraftAI</h1>
          <p className="text-muted-foreground text-center mb-8">Start your journey as an artisan or customer.</p>

          {/* Role selector */}
          <div className="flex gap-2 mb-8 bg-muted rounded-full p-1">
            {(["artisan", "customer"] as const).map((r) => (
              <button
                type="button"
                key={r}
                onClick={() => setRole(r)}
                className={`flex-1 py-3 rounded-full text-sm font-medium transition-all capitalize ${
                  role === r ? "bg-surface card-shadow text-foreground" : "text-muted-foreground"
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <p className="text-sm text-muted-foreground text-center mb-6">
            {role === "artisan"
              ? "Artisan accounts unlock the seller dashboard, AI listing tools, and product publishing."
              : "Customer accounts are tailored for discovery, saved preferences, and a smoother buying flow."}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Full Name</label>
              <input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-14 px-5 rounded-2xl bg-surface card-shadow text-lg font-sans text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-14 px-5 rounded-2xl bg-surface card-shadow text-lg font-sans text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Password</label>
              <input
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-14 px-5 rounded-2xl bg-surface card-shadow text-lg font-sans text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            <Button type="submit" variant="hero" size="xl" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Creating Account..." : "Create Account"}
            </Button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
              <div className="relative flex justify-center"><span className="bg-background px-4 text-sm text-muted-foreground">or</span></div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="lg"
              className="w-full rounded-2xl h-14"
              onClick={() => toast("Google auth is the next backend step to wire up.")}
            >
              Continue with Google
            </Button>
          </form>

          <p className="text-sm text-muted-foreground text-center mt-8">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">Log in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Signup;
