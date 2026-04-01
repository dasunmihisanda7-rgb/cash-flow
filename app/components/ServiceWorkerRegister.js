"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      window.addEventListener("load", function () {
        navigator.serviceWorker
          .register("/sw.js")
          .then(function (registration) {
            console.log("Service Worker registration successful with scope: ", registration.scope);
          })
          .catch(function (err) {
            console.error("Service Worker registration failed: ", err);
          });
      });
    }
  }, []);

  return null;
}
