"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    turnstile: any;
  }
}

export default function Turnstile({ siteKey, onVerify }: { siteKey: string; onVerify: (token: string) => void }) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let mounted = true;

    function render() {
      try {
        if (!mounted) return;
        if (!ref.current) return;
        if (!window.turnstile || !window.turnstile.render) return;

        // Render the Turnstile widget into the container
        window.turnstile.render(ref.current, {
          sitekey: siteKey,
          callback: (token: string) => onVerify(token),
          "expired-callback": () => onVerify("")
        });
      } catch (e) {
        // ignore
        // console.error('turnstile render error', e);
      }
    }

    // If script already loaded, render immediately
    if ((window as any).turnstile) {
      render();
      return () => {
        mounted = false;
      };
    }

    // Otherwise inject the Turnstile script and render when ready
    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      render();
    };
    document.head.appendChild(script);

    return () => {
      mounted = false;
    };
  }, [siteKey, onVerify]);

  return <div ref={ref} />;
}
