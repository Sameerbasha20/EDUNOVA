import { createContext, useContext, useState } from "react";
import * as otpAuth from "../../../lib/useOtpAuth";

const AuthContext = createContext(null);

const KEYS = {
  access: "edunova_student_access",
  refresh: "edunova_student_refresh",
  user: "edunova_student_user",
};

function isTokenValid(token) {
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

function loadStoredUser() {
  const access = localStorage.getItem(KEYS.access);
  const refresh = localStorage.getItem(KEYS.refresh);
  const raw = localStorage.getItem(KEYS.user);
  if (!raw) return null;
  // Accept session only if access token OR refresh token is still valid
  if (isTokenValid(access) || isTokenValid(refresh)) {
    try { return JSON.parse(raw); } catch { /* fall through */ }
  }
  // Stale — wipe everything so the login page shows
  Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
  return null;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadStoredUser);

  async function requestOtp(identifier, password) {
    const data = await otpAuth.requestOtp(identifier, password);
    if (data.user_type !== "Student") {
      throw { response: { data: { detail: "This portal is for students only." } } };
    }
    return data;
  }

  async function verifyOtp(userId, otp) {
    const data = await otpAuth.verifyOtp(userId, otp);
    if (data.user?.user_type !== "Student") {
      throw { response: { data: { detail: "This portal is for students only." } } };
    }
    localStorage.setItem(KEYS.access, data.access);
    localStorage.setItem(KEYS.refresh, data.refresh);
    localStorage.setItem(KEYS.user, JSON.stringify(data.user));
    setUser(data.user);
    return data;
  }

  async function resendOtp(userId) {
    return otpAuth.resendOtp(userId);
  }

  function logout() {
    Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, requestOtp, verifyOtp, resendOtp, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
