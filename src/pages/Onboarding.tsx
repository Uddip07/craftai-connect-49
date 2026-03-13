import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Compass, Store } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { useAuth } from "@/context/AuthContext";
import { getRoleHomePath, type ArtisanProfile, type CustomerProfile } from "@/lib/auth";

const spring = { type: "spring" as const, stiffness: 220, damping: 24, mass: 0.8 };

const emptyArtisanProfile: ArtisanProfile = {
  shopName: "",
  craftSpecialty: "",
  location: "",
  bio: "",
};

const emptyCustomerProfile: CustomerProfile = {
  favoriteCrafts: "",
  location: "",
  shoppingStyle: "",
  giftingNotes: "",
};

const Onboarding = () => {
  const { user, completeOnboarding } = useAuth();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [artisanProfile, setArtisanProfile] = useState<ArtisanProfile>(emptyArtisanProfile);
  const [customerProfile, setCustomerProfile] = useState<CustomerProfile>(emptyCustomerProfile);

  useEffect(() => {
    if (!user) {
      return;
    }

    if (user.onboardingComplete) {
      navigate(getRoleHomePath(user), { replace: true });
      return;
    }

    if (user.role === "artisan") {
      const profile = (user.profile ?? {}) as Partial<ArtisanProfile>;

      setArtisanProfile({
        shopName: profile.shopName ?? "",
        craftSpecialty: profile.craftSpecialty ?? "",
        location: profile.location ?? "",
        bio: profile.bio ?? "",
      });

      return;
    }

    const profile = (user.profile ?? {}) as Partial<CustomerProfile>;

    setCustomerProfile({
      favoriteCrafts: profile.favoriteCrafts ?? "",
      location: profile.location ?? "",
      shoppingStyle: profile.shoppingStyle ?? "",
      giftingNotes: profile.giftingNotes ?? "",
    });
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  const isArtisan = user.role === "artisan";
  const currentProfile = isArtisan ? artisanProfile : customerProfile;
  const hasEmptyField = Object.values(currentProfile).some((value) => !value.trim());

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (hasEmptyField) {
      toast.error("Please complete every onboarding field.");
      return;
    }

    setIsSaving(true);

    const result = completeOnboarding(currentProfile);

    setIsSaving(false);

    if (!result.ok || !result.user) {
      toast.error(result.message ?? "We couldn't save your onboarding details.");
      return;
    }

    toast.success(isArtisan ? "Your artisan studio is ready." : "Your account is ready to explore.");
    navigate(getRoleHomePath(result.user), { replace: true });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container max-w-3xl pt-28 md:pt-32 pb-16">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={spring}>
          <div className="bg-surface rounded-[2rem] p-6 md:p-8 card-shadow mb-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-medium text-primary uppercase tracking-widest mb-2">Complete setup</p>
                <h1 className="font-serif text-3xl font-bold text-foreground">
                  {isArtisan ? "Build your artisan storefront" : "Personalize your shopping profile"}
                </h1>
                <p className="text-muted-foreground mt-3 max-w-xl">
                  {isArtisan
                    ? "Tell us about your craft so we can shape the seller dashboard and AI tools around your studio."
                    : "Tell us what you love so we can tailor discovery, collections, and gifting recommendations."}
                </p>
              </div>
              <div className="rounded-2xl bg-primary/10 px-4 py-3 text-sm text-foreground">
                <p className="font-medium">{user.name}</p>
                <p className="text-muted-foreground">{user.email}</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="bg-surface rounded-[2rem] p-6 md:p-8 card-shadow">
            <div className="grid gap-6 md:grid-cols-2 mb-8">
              <div className="rounded-3xl bg-primary/5 p-5">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                  {isArtisan ? <Store className="w-5 h-5 text-primary" /> : <Compass className="w-5 h-5 text-primary" />}
                </div>
                <h2 className="font-serif text-xl font-semibold text-foreground mb-2">
                  {isArtisan ? "Seller setup" : "Buyer setup"}
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {isArtisan
                    ? "We use this to tune listing prompts, dashboard copy, and your public artisan identity."
                    : "We use this to shape discovery, recommendations, and seasonal gift ideas."}
                </p>
              </div>
              <div className="rounded-3xl bg-secondary/5 p-5">
                <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-5 h-5 text-secondary" />
                </div>
                <h2 className="font-serif text-xl font-semibold text-foreground mb-2">What happens next</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {isArtisan
                    ? "You'll land in your dashboard with protected access to product creation and AI marketing tools."
                    : "You'll head straight into the marketplace with a customer-ready account and saved preferences."}
                </p>
              </div>
            </div>

            {isArtisan ? (
              <div className="space-y-5">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Shop Name</label>
                  <input
                    type="text"
                    value={artisanProfile.shopName}
                    onChange={(event) => setArtisanProfile({ ...artisanProfile, shopName: event.target.value })}
                    placeholder="e.g., Blue Earth Studio"
                    className="w-full h-14 px-5 rounded-2xl bg-background card-shadow text-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Craft Specialty</label>
                    <input
                      type="text"
                      value={artisanProfile.craftSpecialty}
                      onChange={(event) => setArtisanProfile({ ...artisanProfile, craftSpecialty: event.target.value })}
                      placeholder="e.g., Blue pottery and ceramic decor"
                      className="w-full h-14 px-5 rounded-2xl bg-background card-shadow text-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Location</label>
                    <input
                      type="text"
                      value={artisanProfile.location}
                      onChange={(event) => setArtisanProfile({ ...artisanProfile, location: event.target.value })}
                      placeholder="e.g., Jaipur, Rajasthan"
                      className="w-full h-14 px-5 rounded-2xl bg-background card-shadow text-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Brand Story Starter</label>
                  <textarea
                    value={artisanProfile.bio}
                    onChange={(event) => setArtisanProfile({ ...artisanProfile, bio: event.target.value })}
                    placeholder="Share a few lines about your workshop, process, or family tradition."
                    rows={5}
                    className="w-full px-5 py-4 rounded-2xl bg-background card-shadow text-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Favorite Crafts</label>
                  <input
                    type="text"
                    value={customerProfile.favoriteCrafts}
                    onChange={(event) => setCustomerProfile({ ...customerProfile, favoriteCrafts: event.target.value })}
                    placeholder="e.g., Textiles, pottery, home decor"
                    className="w-full h-14 px-5 rounded-2xl bg-background card-shadow text-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Location</label>
                    <input
                      type="text"
                      value={customerProfile.location}
                      onChange={(event) => setCustomerProfile({ ...customerProfile, location: event.target.value })}
                      placeholder="e.g., Kolkata, West Bengal"
                      className="w-full h-14 px-5 rounded-2xl bg-background card-shadow text-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Shopping Style</label>
                    <input
                      type="text"
                      value={customerProfile.shoppingStyle}
                      onChange={(event) => setCustomerProfile({ ...customerProfile, shoppingStyle: event.target.value })}
                      placeholder="e.g., Gifts, home styling, collecting"
                      className="w-full h-14 px-5 rounded-2xl bg-background card-shadow text-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Gift Notes</label>
                  <textarea
                    value={customerProfile.giftingNotes}
                    onChange={(event) => setCustomerProfile({ ...customerProfile, giftingNotes: event.target.value })}
                    placeholder="Tell us who you usually shop for or the occasions you care about."
                    rows={5}
                    className="w-full px-5 py-4 rounded-2xl bg-background card-shadow text-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                  />
                </div>
              </div>
            )}

            <Button type="submit" variant="hero" size="xl" className="w-full mt-8" disabled={isSaving}>
              {isSaving ? "Saving your setup..." : isArtisan ? "Finish artisan setup" : "Finish customer setup"}
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Onboarding;
