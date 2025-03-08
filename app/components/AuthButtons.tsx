// components/AuthButtons.tsx
"use client"; // This marks it as a client component

import React from "react";
import useLoginModal from "@/app/hooks/useLoginModal";
import useRegisterModal from "@/app/hooks/useRegisterModal";
import Button from "@/app/components/NavBar/Button";

const AuthButtons = () => {
  const loginModal = useLoginModal();
  const registerModal = useRegisterModal();

  return (
    <div className="flex justify-center space-x-4">
      <Button 
        label="Login" 
        onClick={loginModal.onOpen}
        outline
      />
      <Button 
        label="Sign up" 
        onClick={registerModal.onOpen}
      />
    </div>
  );
};

export default AuthButtons;
