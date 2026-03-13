export type UserRole = "artisan" | "buyer";

export interface ArtisanProfile {
  shopName: string;
  craftSpecialty: string;
  location: string;
  bio: string;
}

export interface CustomerProfile {
  favoriteCrafts: string;
  location: string;
  shoppingStyle: string;
  giftingNotes: string;
}

export type UserProfile = ArtisanProfile | CustomerProfile;

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  onboardingComplete: boolean;
  profile?: UserProfile;
}

interface StoredUser extends AuthUser {
  password: string;
}

interface AuthResult {
  ok: boolean;
  message?: string;
  user?: AuthUser;
}

// Frontend-only auth scaffold for this repo's prototype stage.
// Replace these keys and helpers with a real auth provider before production.
const USERS_STORAGE_KEY = "craftai_users";
const SESSION_STORAGE_KEY = "craftai_session";

const artisanOnlyPaths = ["/dashboard", "/create-product", "/social-generator", "/story-generator"];

const canUseStorage = () => typeof window !== "undefined" && typeof window.localStorage !== "undefined";

const createId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

const sanitizeUser = ({ password, ...user }: StoredUser): AuthUser => user;

const readUsers = () => {
  if (!canUseStorage()) {
    return [] as StoredUser[];
  }

  const raw = window.localStorage.getItem(USERS_STORAGE_KEY);

  if (!raw) {
    return [] as StoredUser[];
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as StoredUser[]) : [];
  } catch {
    return [] as StoredUser[];
  }
};

const writeUsers = (users: StoredUser[]) => {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
};

const writeSession = (user: AuthUser | null) => {
  if (!canUseStorage()) {
    return;
  }

  if (!user) {
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
};

export const getSessionUser = () => {
  if (!canUseStorage()) {
    return null;
  }

  const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
};

export const getRoleHomePath = (roleOrUser: UserRole | Pick<AuthUser, "role">) => {
  const role = typeof roleOrUser === "string" ? roleOrUser : roleOrUser.role;
  return role === "artisan" ? "/dashboard" : "/marketplace";
};

export const getPostAuthPath = (user: AuthUser, requestedPath?: string | null) => {
  if (!user.onboardingComplete) {
    return "/onboarding";
  }

  if (!requestedPath) {
    return getRoleHomePath(user);
  }

  if (user.role !== "artisan" && artisanOnlyPaths.some((path) => requestedPath.startsWith(path))) {
    return getRoleHomePath(user);
  }

  return requestedPath;
};

export const signupUser = ({
  name,
  email,
  password,
  role,
}: {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}): AuthResult => {
  const normalizedEmail = email.trim().toLowerCase();
  const users = readUsers();

  if (users.some((user) => user.email === normalizedEmail)) {
    return {
      ok: false,
      message: "An account with that email already exists.",
    };
  }

  const storedUser: StoredUser = {
    id: createId(),
    name: name.trim(),
    email: normalizedEmail,
    password,
    role,
    onboardingComplete: false,
  };

  users.push(storedUser);
  writeUsers(users);

  const user = sanitizeUser(storedUser);
  writeSession(user);

  return {
    ok: true,
    user,
  };
};

export const loginUser = ({
  email,
  password,
}: {
  email: string;
  password: string;
}): AuthResult => {
  const normalizedEmail = email.trim().toLowerCase();
  const user = readUsers().find((entry) => entry.email === normalizedEmail);

  if (!user) {
    return {
      ok: false,
      message: "We couldn't find an account with that email.",
    };
  }

  if (user.password !== password) {
    return {
      ok: false,
      message: "That password doesn't match our records.",
    };
  }

  const sessionUser = sanitizeUser(user);
  writeSession(sessionUser);

  return {
    ok: true,
    user: sessionUser,
  };
};

export const completeStoredUserOnboarding = ({
  userId,
  profile,
}: {
  userId: string;
  profile: UserProfile;
}): AuthResult => {
  const users = readUsers();
  const userIndex = users.findIndex((entry) => entry.id === userId);

  if (userIndex === -1) {
    return {
      ok: false,
      message: "We couldn't find your account. Please log in again.",
    };
  }

  const updatedUser: StoredUser = {
    ...users[userIndex],
    onboardingComplete: true,
    profile,
  };

  users[userIndex] = updatedUser;
  writeUsers(users);

  const sessionUser = sanitizeUser(updatedUser);
  writeSession(sessionUser);

  return {
    ok: true,
    user: sessionUser,
  };
};

export const logoutUser = () => {
  writeSession(null);
};
