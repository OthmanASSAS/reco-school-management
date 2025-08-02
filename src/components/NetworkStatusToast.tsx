"use client";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export function NetworkStatusToast() {
  const { toast } = useToast();

  useEffect(() => {
    function handleOffline() {
      toast({
        title: "Connexion perdue",
        description: "Vous n'êtes plus connecté à Internet.",
        variant: "destructive",
      });
    }
    function handleOnline() {
      toast({
        title: "Connexion rétablie",
        description: "Vous êtes de nouveau en ligne.",
        // No variant, use default
      });
    }
    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);
    if (!navigator.onLine) handleOffline();
    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, [toast]);
  return null;
}
