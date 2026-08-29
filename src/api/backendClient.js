const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "https://stockpredi-backend.onrender.com";

async function apiFetch(path, options = {}) {
  const { data: { session } } = await import("../api/supabaseClient").then(m => m.supabase.auth.getSession());
  const token = session?.access_token;
  const res = await fetch(`${BACKEND_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || `Erreur ${res.status}`);
  }
  return res.json();
}

export const backendClient = {
  subscriptionStatus: () => apiFetch("/api/stripe/status"),
  createSubscription: () => apiFetch("/api/stripe/create-subscription", { method: "POST" }),
  recommendations: (data, productName, periods) =>
    apiFetch("/api/predictions/recommendations", {
      method: "POST",
      body: JSON.stringify({ data, product_name: productName, periods }),
    }),
  rgpdExport:  () => apiFetch("/api/rgpd/export",  { method: "POST" }),
  rgpdDelete:  () => apiFetch("/api/rgpd/delete",  { method: "DELETE" }),
  rgpdStatus:  () => apiFetch("/api/rgpd/status"),
  rgpdContact: (payload) => apiFetch("/api/rgpd/contact", { method: "POST", body: JSON.stringify(payload) }),
};
