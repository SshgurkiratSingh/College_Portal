"use client";

import { useCallback, useState } from "react";
import { toast } from "react-hot-toast";
import { signIn } from "next-auth/react";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

import useRegisterModal from "@/app/hooks/useRegisterModal";
import useLoginModal from "@/app/hooks/useLoginModal";

import Modal from "./Modals";
import Input from "../inputs/Input";
import Heading from "../Heading";
import Button from "../Button";

const LoginModal = () => {
  const router = useRouter();
  const loginModal = useLoginModal();
  const registerModal = useRegisterModal();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FieldValues>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    setIsLoading(true);

    try {
      const callback = await signIn("credentials", {
        ...data,
        redirect: false,
      });

      if (callback?.ok) {
        toast.success("Welcome back! 🎉");
        router.refresh();
        loginModal.onClose();
      } else if (callback?.error) {
        toast.error(callback.error);
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const onToggle = useCallback(() => {
    loginModal.onClose();
    registerModal.onOpen();
  }, [loginModal, registerModal]);

  const bodyContent = (
    <div className="flex flex-col gap-3 bg-gradient-to-b from-[#0a192f] to-[#112240] p-6 rounded-lg text-white shadow-xl">
      <div className="flex flex-col items-center mb-1">
        <div className="bg-blue-500 rounded-full p-2 mb-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <Heading 
          title="Welcome Back 👋" 
          subtitle="Log in to your account to continue"
          background-color="text-white text-center"
        />
      </div>

      <div className="space-y-4">
        <div className="flex flex-col">
          <label htmlFor="email" className="text-white text-sm font-medium mb-1 ml-1">
            Email Address
          </label>
          <Input
            id="email"
            type="email"
            label=""
            disabled={isLoading}
            register={register}
            errors={errors}
            required
            background-color="bg-[#1e3a5f] text-white border-[#2d4a6a] rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="password" className="text-white text-sm font-medium mb-1 ml-1">
            Password
          </label>
          <Input
            id="password"
            type="password"
            label=""
            disabled={isLoading}
            register={register}
            errors={errors}
            required
            background-color="bg-[#1e3a5f] text-white border-[#2d4a6a] rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
        </div>
        
    
      </div>
      
      <button
        onClick={handleSubmit(onSubmit)}
        disabled={isLoading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium mt-1 transition-colors focus:ring-4 focus:ring-blue-500/50 disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Logging in...
          </div>
        ) : (
          "Sign in"
        )}
      </button>
    </div>
  );

  const footerContent = (
    <div className="flex flex-col pt-3 pb-4 px-6 bg-[#0a192f] rounded-b-lg text-gray-300 border-t border-[#2d4a6a]">
      <div className="text-center">
        <p>
          First time here?{" "}
          <span
            onClick={onToggle}
            className="text-blue-400 cursor-pointer hover:text-blue-300 font-semibold transition-colors"
          >
            Create an account
          </span>
        </p>
      </div>
    </div>
  );

  return (
    <Modal
      disabled={isLoading}
      isOpen={loginModal.isOpen}
      title=""
      actionLabel=""
      onClose={loginModal.onClose}
      onSubmit={() => {}}
      body={bodyContent}
      footer={footerContent}
      background-color="max-w-md bg-transparent border-none"
    />
  );
};

export default LoginModal;