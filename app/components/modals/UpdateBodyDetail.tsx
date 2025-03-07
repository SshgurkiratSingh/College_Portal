"use client";
import axios from "axios";

import { useCallback, useState } from "react";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import useRegisterModal from "@/app/hooks/useRegisterModal";

import Modal from "./Modals";
import Heading from "../Heading";

import { toast } from "react-hot-toast";

import useProfilePicModal from "@/app/hooks/useProfilePicModal";
import ImageUpload from "../inputs/imageUpload";
import { useRouter } from "next/navigation";
import useUpdateBody from "@/app/hooks/useBodyModal";
import Input from "../inputs/Input";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { SafeUser } from "@/app/types";
interface BodyUpdateModalProps {
  currentUser: SafeUser;
}
const BodyUpdateModal = ({ currentUser }: BodyUpdateModalProps) => {
  const router = useRouter();
  const bodyUpdateModal = useUpdateBody();
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<FieldValues>({
    defaultValues: {
      dob: currentUser.DateOfBirth
        ? currentUser.DateOfBirth.toISOString().slice(0, 10)
        : "",
      weight: currentUser.weight,
      height: currentUser.Height,
      gender: currentUser.gender,
    },
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
      .post("/api/updateBody", data)
      .then((res) => {
        router.refresh;
        bodyUpdateModal.onClose();
      })
      .catch((err) => {
        toast.error("wrong.");
      });
    setIsLoading(false);
  };
  const imageSrc = watch("imageSrc");
  const bodyContent = (
    <div>
      <Heading
        title="Update Profile"
        subtitle="Update Your Profile From Here"
      />
      <Input
        id="weight"
        label="Weight (in kg)"
        disabled={isLoading}
        register={register}
        errors={errors}
        required
        type="number"
      />
      <br />
      <Input
        id="height"
        label="Height (in cm)"
        disabled={isLoading}
        register={register}
        errors={errors}
        required
        type="number"
      />
      <br />
      <Input
        id="dob"
        label="Date Of Birth"
        disabled={isLoading}
        register={register}
        errors={errors}
        required
        type="date"
      />
      <br />
      <label htmlFor="gender">Gender</label>
      <div>
        <div className="form-control">
          <label className="label cursor-pointer">
            {" "}
            <span className="label-text">Male</span>
            <input
              type="radio"
              className="radio checked:bg-red-500"
              value="male"
              {...register("gender", { required: true })}
            />
          </label>
        </div>
        <div className="form-control">
          <label className="label cursor-pointer">
            <span className="label-text">Female</span>
            <input
              type="radio"
              className="radio checked:bg-blue-500"
              value="female"
              {...register("gender", { required: true })}
            />
          </label>
        </div>
        <div className="form-control">
          <label className="label cursor-pointer">
            <span className="label-text">Other</span>{" "}
            <input
              type="radio"
              className="radio checked:bg-green-500"
              value="other"
              {...register("gender", { required: true })}
            />
          </label>
        </div>
      </div>

      {errors.gender && <p>This field is required</p>}
    </div>
  );
  return (
    <Modal
      disabled={isLoading}
      isOpen={bodyUpdateModal.isOpen}
      title="Update Profile"
      actionLabel="Continue"
      onClose={bodyUpdateModal.onClose}
      onSubmit={handleSubmit(onSubmit)}
      body={bodyContent}
      //   footer={footerContent}
    />
  );
};

export default BodyUpdateModal;
