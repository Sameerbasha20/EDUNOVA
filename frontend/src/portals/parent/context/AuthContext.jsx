import { createContext, useContext, useEffect, useState } from "react";
import api from "../lib/api";
import * as otpAuth from "../../../lib/useOtpAuth";

const AuthContext = createContext(null);

const KEYS = {
  access: "edunova_parent_access",
  refresh: "edunova_parent_refresh",
  user: "edunova_parent_user",
  child: "edunova_parent_active_child",
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
  if (isTokenValid(access) || isTokenValid(refresh)) {
    try { return JSON.parse(raw); } catch { /* fall through */ }
  }
  Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
  return null;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadStoredUser);
  const [kids, setKids] = useState([]);
  const [activeChildId, setActiveChildId] = useState(
    () => localStorage.getItem(KEYS.child) || null
  );

  useEffect(() => {
    if (!user) return;
    api
      .get("/parent/children/")
      .then(({ data }) => {
        setKids(data);
        if (!activeChildId && data.length) {
          const id = String(data[0].id);
          setActiveChildId(id);
          localStorage.setItem(KEYS.child, id);
        }
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  function selectChild(id) {
    const sid = String(id);
    setActiveChildId(sid);
    localStorage.setItem(KEYS.child, sid);
  }

  async function requestOtp(identifier, password) {
    const data = await otpAuth.requestOtp(identifier, password);
    if (data.user_type !== "Parent") {
      throw { response: { data: { detail: "This portal is for parents only." } } };
    }
    return data;
  }

  async function verifyOtp(userId, otp) {
    const data = await otpAuth.verifyOtp(userId, otp);
    if (data.user?.user_type !== "Parent") {
      throw { response: { data: { detail: "This portal is for parents only." } } };
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
    setKids([]);
    setActiveChildId(null);
  }

  return (
    <AuthContext.Provider
      value={{ user, kids, activeChildId, selectChild, requestOtp, verifyOtp, resendOtp, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
