import { useState, useRef, useCallback } from "react";

export function useNfcScan() {
  const supported = typeof window !== "undefined" && "NDEFReader" in window;
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState(null);
  const cleanupRef = useRef(null);

  const cancel = useCallback(() => {
    if (cleanupRef.current) cleanupRef.current();
    cleanupRef.current = null;
    setScanning(false);
  }, []);

  const scan = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (!supported) {
        setError("NFC-støtte krever Android Chrome");
        reject(new Error("NFC-støtte krever Android Chrome"));
        return;
      }
      try {
        const reader = new window.NDEFReader();
        setScanning(true);
        setError(null);

        const cleanup = () => {
          reader.removeEventListener("reading", onReading);
          reader.removeEventListener("error", onError);
        };
        cleanupRef.current = cleanup;

        const onReading = ({ serialNumber }) => {
          cleanup();
          cleanupRef.current = null;
          setScanning(false);
          resolve(serialNumber);
        };
        const onError = (e) => {
          cleanup();
          cleanupRef.current = null;
          setScanning(false);
          const msg = e?.message || "Lesefeil";
          setError(msg);
          reject(new Error(msg));
        };

        reader.addEventListener("reading", onReading);
        reader.addEventListener("error", onError);
        reader.scan().catch((e) => {
          if (cleanupRef.current) cleanupRef.current();
          cleanupRef.current = null;
          setScanning(false);
          setError(e?.message || "Kunne ikke starte NFC");
          reject(e);
        });
      } catch (e) {
        setScanning(false);
        setError(e.message);
        reject(e);
      }
    });
  }, [supported]);

  return { supported, scanning, error, scan, cancel };
}