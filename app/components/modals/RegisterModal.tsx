"use client";

import { useCallback, useState } from "react";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import axios from "axios";
import { toast } from "react-hot-toast";
import useRegisterModal from "@/app/hooks/useRegisterModal";
import useLoginModal from "@/app/hooks/useLoginModal";
import Modal from "./Modals";
import Input from "../inputs/Input";
import Heading from "../Heading";

const RegisterModal = () => {
  const registerModal = useRegisterModal();
  const loginModal = useLoginModal();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FieldValues>({
    defaultValues: { name: "", email: "", password: "" },
  });

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    setIsLoading(true);
    try {
      await axios.post("/api/register", data);
      toast.success("Account Created! Please login to continue.");
      registerModal.onClose();
      loginModal.onOpen();
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const onToggle = useCallback(() => {
    registerModal.onClose();
    loginModal.onOpen();
  }, [loginModal, registerModal]);

  const bodyContent = (
    <div className="flex flex-col gap-3 bg-gradient-to-b from-[#0a192f] to-[#112240] p-4 rounded-lg text-white shadow-xl">
      <div className="flex flex-col items-center mb-1">
        <div className="bg-blue-500 rounded-full p-2 mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <Heading 
          title="Welcome to CCET CurriculumSync" 
          subtitle="Create an account to get started"
          background-color="text-white text-center"
        />
      </div>

      <div className="space-y-3">
        <div className="flex flex-col">
          <label htmlFor="name" className="text-white text-sm font-medium mb-1 ml-1">
            Full Name
          </label>
          <Input
            id="name"
            label=""
            disabled={isLoading}
            register={register}
            errors={errors}
            required
            background-color="bg-[#1e3a5f] text-white border-[#2d4a6a] rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
        </div>

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

        <button
          onClick={handleSubmit(onSubmit)}
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition-colors focus:ring-4 focus:ring-blue-500/50 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating account...
            </div>
          ) : (
            "Sign up"
          )}
        </button>
      </div>
    </div>
  );

  const footerContent = (
    <div className="flex flex-col pt-2 pb-3 px-4 bg-[#0a192f] rounded-b-lg text-gray-300 border-t border-[#2d4a6a]">
      <div className="text-center text-sm">
        <p>
          Already have an account?{" "}
          <span
            onClick={onToggle}
            className="text-blue-400 cursor-pointer hover:text-blue-300 font-semibold transition-colors"
          >
            Log in
          </span>
        </p>
      </div>
    </div>
  );

  return (
    <Modal
      disabled={isLoading}
      isOpen={registerModal.isOpen}
      title=""
      actionLabel=""
      onClose={registerModal.onClose}
      onSubmit={() => {}}
      body={bodyContent}
      footer={footerContent}
      background-color="max-w-md max-h-[80vh] bg-transparent border-none overflow-hidden"
    />
  );
};

export default RegisterModal;