import axios from "axios";

export const API_BASE = process.env.REACT_APP_BACKEND_URL || "";

const api = axios.create({
  baseURL: `${API_BASE}/api`,
  withCredentials: true,
});

export function apiError(e) {
  const detail = e?.response?.data?.detail;
  if (detail == null) return "Une erreur est survenue. Merci de réessayer.";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail))
    return detail
      .map((d) => (d && typeof d.msg === "string" ? d.msg : null))
      .filter(Boolean)
      .join(" · ");
  if (typeof detail === "object" && detail.msg) return detail.msg;
  return "Une erreur est survenue. Merci de réessayer.";
}

export default api;
