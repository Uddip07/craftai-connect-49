import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";

const spring = { type: "spring" as const, stiffness: 220, damping: 24, mass: 0.8 };

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.trim()) {
      toast.error("Enter your email to request a reset.");
      return;
    }

    setIsSubmitting(true);

    window.setTimeout(() => {
      setIsSubmitting(false);
      toast.success("Password reset instructions sent. Check your inbox.");
    }, 900);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container max-w-md pt-28 md:pt-32 pb-16">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={spring}>
          <h1 className="font-serif text-3xl font-bold text-foreground mb-2 text-center">Reset your password</h1>
          <p className="text-muted-foreground text-center mb-8">
            This is a frontend-only placeholder flow for now, but the route is wired and ready for a real auth provider.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full h-14 px-5 rounded-2xl bg-surface card-shadow text-lg font-sans text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            <Button type="submit" variant="hero" size="xl" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Sending..." : "Send reset instructions"}
            </Button>
          </form>

          <p className="text-sm text-muted-foreground text-center mt-8">
            Remembered it?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Back to login
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default ForgotPassword;
