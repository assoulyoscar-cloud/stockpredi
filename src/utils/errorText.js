// Erreur backend/Supabase (string, Error, {error}, {message}, {error_description}...)
// -> texte lisible : jamais "{}" ni "[object Object]".
export function errorText(err, fallback) {
  if (!err) return fallback;
  if (typeof err === "string") return err.trim() || fallback;
  const msg = err.message || err.error_description || err.msg || err.error;
  if (typeof msg === "string" && msg.trim()) return msg;
  if (msg && typeof msg === "object") return errorText(msg, fallback);
  return fallback;
}
