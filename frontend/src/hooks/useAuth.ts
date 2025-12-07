"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { setAuthToken } from "@/api";

export function useAuth() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (session?.accessToken) {
      setAuthToken(session.accessToken);
    } else {
      setAuthToken(null);
    }
  }, [session?.accessToken]);

  return {
    user: session?.user,
    isAuthenticated: status === "authenticated",
    isLoading: status === "loading",
    accessToken: session?.accessToken,
  };
}
