// components/AuthButtons.jsx
"use client"; // This marks it as a client component

import React from "react";

const AuthButtons = () => {
  return (
    <div className="flex justify-center space-x-4">
      <button
        onClick={() =>
          document.dispatchEvent(new CustomEvent("open-login-modal"))
        }
        className="btn btn-primary px-6 py-2"
      >
        Sign In
      </button>
      <button
        onClick={() =>
          document.dispatchEvent(new CustomEvent("open-register-modal"))
        }
        className="btn btn-outline px-6 py-2"
      >
        Register
      </button>
    </div>
  );
};

export default AuthButtons;
