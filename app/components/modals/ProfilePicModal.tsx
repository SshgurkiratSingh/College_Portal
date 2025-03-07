"use client";
import axios from "axios";

import { useCallback, useState } from "react";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import useRegisterModal from "@/app/hooks/useRegisterModal";

import Modal from "./Modals";
import Heading from "../Heading";

import { toast } from "react-hot-toast";
import Button from "../NavBar/Button";

import useLoginModal from "@/app/hooks/useLoginModal";
import useProfilePicModal from "@/app/hooks/useProfilePicModal";
import ImageUpload from "../inputs/imageUpload";
import { useRouter } from "next/navigation";
const ProfilePicModal = () => {
  const router = useRouter();
  const ProfilePicModal = useProfilePicModal();
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<FieldValues>({
    defaultValues: { ProfilePicModal: "" },
  });
  const setCustomValue = (id: string, value: any) => {
    setValue(id, value, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  };
  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    setIsLoading(true);
    axios
      .post("/api/updatePic", data)
      .then((res) => {
        router.refresh;
        ProfilePicModal.onClose();
      })
      .catch((err) => {
        toast.error("wrong.");
      });
    setIsLoading(false);
  };
  const imageSrc = watch("imageSrc");
  const bodyContent = (
    <div>
      <ImageUpload
        value={imageSrc}
        onChange={(value) => setCustomValue("imageSrc", value)}
      />
    </div>
  );
  return (
    <Modal
      disabled={isLoading}
      isOpen={ProfilePicModal.isOpen}
      title="Update Profile"
      actionLabel="Continue"
      onClose={ProfilePicModal.onClose}
      onSubmit={handleSubmit(onSubmit)}
      body={bodyContent}
      //   footer={footerContent}
    />
  );
};

export default ProfilePicModal;
