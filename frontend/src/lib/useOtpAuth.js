/**
 * useOtpAuth — shared authentication service for all portals.
 *
 * All four portals (Student, Teacher, Parent, Admin) call the same three
 * backend endpoints. This hook is the single place that knows about those
 * endpoints. Portal AuthContexts import this and add only their own
 * portal-specific state (localStorage keys, role guard, child list, etc.).
 *
 * Endpoints used:
 *   POST /api/auth/login/        → { user_id, user_type, detail }
 *   POST /api/auth/verify-otp/   → { access, refresh, user: { user_type, … } }
 *   POST /api/auth/resend-otp/   → { detail }
 */
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

// Bare axios instance — no auth header needed for these public endpoints.
const authClient = axios.create({ baseURL: BASE_URL });

/**
 * Step 1 — validate credentials, trigger OTP email.
 * Returns { user_id, user_type, detail }.
 */
export async function requestOtp(identifier, password) {
  const { data } = await authClient.post("/auth/login/", {
    email: identifier,
    password,
  });
  return data;
}

/**
 * Step 2 — submit OTP, receive JWT tokens + user payload.
 * Returns { access, refresh, user }.
 */
export async function verifyOtp(userId, otp) {
  const { data } = await authClient.post("/auth/verify-otp/", {
    user_id: userId,
    otp,
  });
  return data;
}

/**
 * Resend — invalidates previous OTP and sends a fresh email.
 * Returns { detail }.
 */
export async function resendOtp(userId) {
  const { data } = await authClient.post("/auth/resend-otp/", {
    user_id: userId,
  });
  return data;
}
