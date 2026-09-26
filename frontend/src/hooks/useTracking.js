import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { API_BASE } from "../lib/api";

const GA4_ID = process.env.REACT_APP_GA4_ID;

function audienceConsent() {
  try {
    const raw = window.localStorage.getItem("aef_cookie_consent");
    return raw ? Boolean(JSON.parse(raw).audience) : false;
  } catch {
    return false;
  }
}

function loadGa4() {
  if (!GA4_ID || window.__aefGa4Loaded) return;
  window.__aefGa4Loaded = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() { window.dataLayer.push(arguments); };
  window.gtag("js", new Date());
  window.gtag("config", GA4_ID, { anonymize_ip: true, send_page_view: false });
  const s = document.createElement("script");
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`;
  document.head.appendChild(s);
}

function sendHit(pathname, search) {
  const params = new URLSearchParams(search);
  const body = JSON.stringify({
    path: pathname,
    referrer: document.referrer || "",
    screen: window.innerWidth,
    utm_source: params.get("utm_source") || "",
  });
  const url = `${API_BASE}/api/analytics/hit`;
  if (navigator.sendBeacon) {
    navigator.sendBeacon(url, new Blob([body], { type: "application/json" }));
  } else {
    fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true }).catch(() => {});
  }
}

export default function useTracking() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    if (pathname.startsWith("/administration")) return;
    sendHit(pathname, search);
    if (GA4_ID && audienceConsent()) {
      loadGa4();
      window.gtag("event", "page_view", { page_path: pathname + search, page_location: window.location.href });
    }
  }, [pathname, search]);

  useEffect(() => {
    const onConsent = () => {
      if (GA4_ID && audienceConsent()) loadGa4();
    };
    window.addEventListener("aef-cookie-consent", onConsent);
    return () => window.removeEventListener("aef-cookie-consent", onConsent);
  }, []);
}
