"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import useLoginModal from "./useLoginModal";

export default function useRequireAuth() {
  const { data: session, status } = useSession();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const router = useRouter();
  const loginModal = useLoginModal();
  
  useEffect(() => {
    if (status === "loading") {
      // Still loading, don't do anything yet
      return;
    }
    
    if (!session) {
      setIsAuthenticated(false);
      loginModal.onOpen();
    } else {
      setIsAuthenticated(true);
    }
  }, [session, status, loginModal]);

  return {
    isAuthenticated,
    isLoading: status === "loading",
    session
  };
}