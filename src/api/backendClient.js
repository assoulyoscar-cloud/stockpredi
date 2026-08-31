import { supabase } from "./supabaseClient";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "https://stockpredi-backend.onrender.com";
async function getAuthHeaders() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) throw new Error("Non authentifié");
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${session.access_token}`
  };
}

async function apiFetch(path, options = {}) {
  const headers = await getAuthHeaders();
  const res = await fetch(`${BACKEND_URL}${path}`, { ...options, headers });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
  return json;
}

export const backendClient = {
  // Auth
  signup: (email, password) =>
    fetch(`${BACKEND_URL}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    }).then(r => r.json()),

  login: (email, password) =>
    fetch(`${BACKEND_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    }).then(r => r.json()),

  // Predictions
  forecast: (data, periods = 30) =>
    apiFetch("/api/predictions/forecast", {
      method: "POST",
      body: JSON.stringify({ data, periods })
    }),

  recommendations: (data, product_name = "Produit", periods = 30) =>
    apiFetch("/api/predictions/recommendations", {
      method: "POST",
      body: JSON.stringify({ data, product_name, periods })
    }),

  // User
  getProfile: () => apiFetch("/api/user/profile"),
  updateProfile: (updates) => apiFetch("/api/user/profile", {
    method: "PATCH",
    body: JSON.stringify(updates)
  }),
  getPredictions: (limit = 20) => apiFetch(`/api/user/predictions?limit=${limit}`),

  // Stripe
  createSubscription: () => apiFetch("/api/stripe/create-subscription", { method: "POST" }),
  cancelSubscription: () => apiFetch("/api/stripe/cancel-subscription", { method: "POST" }),
  subscriptionStatus: () => apiFetch("/api/stripe/status"),

  // RGPD
  rgpdExport: () => apiFetch("/api/rgpd/export", { method: "POST" }),
  rgpdStatus: () => apiFetch("/api/rgpd/status"),
  rgpdDelete: () => apiFetch("/api/rgpd/delete", { method: "DELETE" }),

  // Health
  health: () => fetch(`${BACKEND_URL}/health`).then(r => r.json())
};
