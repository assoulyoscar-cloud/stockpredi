import { supabase } from "./supabaseClient";
import { errorText } from "../utils/errorText";

export const BACKEND_URL = (process.env.REACT_APP_BACKEND_URL || "https://stockpredi-backend.onrender.com").replace(/\/+$/, "");

// Render met ~50 s a sortir de veille : pendant ce temps son proxy repond sans
// en-tetes CORS (le navigateur affiche "Failed to fetch") ou en 502/503.
// On reessaie jusqu'a ~50 s avant d'afficher une erreur.
const RETRY_DELAYS = [3000, 7000, 15000, 25000];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function request(path, { retry = true, ...options } = {}) {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  const init = {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  };
  const maxAttempts = retry ? RETRY_DELAYS.length : 0;
  for (let attempt = 0; ; attempt++) {
    let res;
    try {
      res = await fetch(`${BACKEND_URL}${path}`, init);
    } catch {
      if (attempt >= maxAttempts) throw new Error("Serveur injoignable — vérifiez votre connexion et réessayez dans une minute.");
      await sleep(RETRY_DELAYS[attempt]);
      continue;
    }
    if ([502, 503, 504].includes(res.status) && attempt < maxAttempts) {
      await sleep(RETRY_DELAYS[attempt]);
      continue;
    }
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(errorText(err, `Erreur serveur (${res.status})`));
    }
    return res;
  }
}

const apiFetch = (path, options) => request(path, options).then((res) => res.json());
const apiBlob = (path, options) => request(path, options).then((res) => res.blob());

export const backendClient = {
  // Reveille Render des l'arrivee sur login/dashboard (sans attendre de reponse)
  wake: () => { fetch(`${BACKEND_URL}/health`).catch(() => {}); },
  subscriptionStatus: () => apiFetch("/api/stripe/status"),
  createSubscription: () => apiFetch("/api/stripe/create-subscription", { method: "POST" }),
  recommendations: (data, productName, periods, sector, sectorParams) =>
    apiFetch("/api/predictions/recommendations", {
      method: "POST",
      body: JSON.stringify({ data, product_name: productName, periods, sector: sector || "general", sector_params: sectorParams || {} }),
    }),
  rgpdExport:  () => apiBlob("/api/rgpd/export", { method: "POST" }),
  rgpdDelete:  () => apiFetch("/api/rgpd/delete", { method: "DELETE", retry: false }),
  rgpdStatus:  () => apiFetch("/api/rgpd/status"),
  rgpdContact: (payload) => apiFetch("/api/rgpd/contact", { method: "POST", body: JSON.stringify(payload) }),
  adminExportClients: () => apiBlob("/api/admin/export-clients"),
};
