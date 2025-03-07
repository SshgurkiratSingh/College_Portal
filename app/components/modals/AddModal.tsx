"use client";

import { useCallback, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { categories } from "../Categories/Categories";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import axios from "axios";
import { useRouter } from "next/navigation";

import Modal from "./Modals";

import useAddModal from "@/app/hooks/useAddModal";
import Heading from "../Heading";
import CategoryInput from "../CategoryInput";
import Input from "../inputs/Input";
import ImageUpload from "../inputs/imageUpload";
enum STEPS {
  CATEGORY = 0,
  TITLEANDDESCRIPTION = 1,
  IMAGE1 = 2,
  IMAGE2 = 3,
  AVAILIBILITYANDCALORIES = 4,
  COUNTER = 5,
  SUBDES = 6,
}
const AddModal = () => {
  const router = useRouter();
  const AddModal = useAddModal();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(STEPS.CATEGORY);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<FieldValues>({
    defaultValues: {
      category: "",
      calories: 0,
      availability: 1,
      SubDes: "",
      counter: 2,
      imageSrc1: "",
      imageSrc2: "",
      price: 10,
      title: "",
      description: "",
    },
  });
  const category = watch("category");
  const SubDes = watch("SubDes");
  const imageSrc1 = watch("imageSrc1");
  const imageSrc2 = watch("imageSrc2");

  const setCustomValue = (id: string, value: any) => {
    setValue(id, value, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  };
  const onBack = () => {
    setStep((v) => v - 1);
  };
  const onNext = () => {
    setStep((v) => v + 1);
  };
  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    if (step !== STEPS.SUBDES) {
      return onNext();
    }

    setIsLoading(true);

    axios
      .post("/api/addNew", data)
      .then(() => {
        toast.success("Listing created!");
        router.refresh();
        reset();
        setStep(STEPS.CATEGORY);
        AddModal.onClose();
      })
      .catch(() => {
        toast.error("Something went wrong.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const onToggle = useCallback(() => {
    AddModal.onClose();
  }, [AddModal]);

  let bodyContent = (
    <div className="flex flex-col gap-8">
      <Heading
        title="which of these best describes your property?"
        subtitle="Pick a Category"
      />
      <div
        className="
        grid 
        grid-cols-1 
        md:grid-cols-2 
        gap-3
        max-h-[50vh]
        overflow-y-auto
      "
      >
        {categories.map((i) => (
          <div key={i.label} className="col-span-1">
            <CategoryInput
              onClick={(category) => setCustomValue("category", category)}
              selected={category === i.label}
              icon={i.icon}
              label={i.label}
            />
          </div>
        ))}
      </div>
    </div>
  );
  if (step === STEPS.TITLEANDDESCRIPTION) {
    bodyContent = (
      <div className="flex flex-col gap-8">
        <Heading
          title="Add Title and Description"
          subtitle="Enter Title And Description for The item"
        />

        <Input
          id="title"
          label="Title"
          register={register}
          errors={errors}
          required
        />

        <Input
          id="description"
          label="Description"
          register={register}
          errors={errors}
          required
        />
      </div>
    );
  }
  if (step === STEPS.IMAGE1) {
    bodyContent = (
      <div className="flex flex-col gap-8">
        <Heading title="Add Image 1" subtitle="Upload Image 1" />
        <ImageUpload
          value={imageSrc1}
          onChange={(value) => setCustomValue("imageSrc1", value)}
        />
      </div>
    );
  }
  if (step === STEPS.IMAGE2) {
    bodyContent = (
      <div className="flex flex-col gap-8">
        <Heading title="Add Image 2" subtitle="Upload Image 2" />
        <ImageUpload
          value={imageSrc2}
          onChange={(value) => setCustomValue("imageSrc2", value)}
        />
      </div>
    );
  }
  if (step === STEPS.AVAILIBILITYANDCALORIES) {
    bodyContent = (
      <div className="flex flex-col gap-8">
        <Heading
          title="Add Availability and Calories"
          subtitle="Enter Availability and Calories"
        />
        <Input
          id="availability"
          label="Availability"
          register={register}
          errors={errors}
          required
        />
        <Input
          id="calories"
          label="Calories"
          register={register}
          errors={errors}
          required
        />
      </div>
    );
  }
  if (step === STEPS.COUNTER) {
    bodyContent = (
      <div className="flex flex-col gap-8">
        <Heading
          title="Add Counter and Price"
          subtitle="Enter Counter and Price"
        />
        <Input
          id="counter"
          label="Counter"
          register={register}
          errors={errors}
          type="number"
          required
        />
        <Input
          id="price"
          label="Price"
          type="number"
          register={register}
          errors={errors}
          required
          formatPrice
        />
      </div>
    );
  }
  if (step === STEPS.SUBDES) {
    bodyContent = (
      <div className="flex flex-col gap-8">
        <Heading title="Add Sub Des" subtitle="Enter Sub Des" />
        <Input
          id="SubDes"
          label="Sub Des"
          register={register}
          errors={errors}
          required
        />
      </div>
    );
  }
  const footerContent = <div></div>;
  let actionLabel = useMemo(() => {
    if (step === STEPS.SUBDES) {
      return "UPLOAD TO DATABASE";
    }
    return "Next";
  }, [step]);
  const secondaryActionLabel = useMemo(() => {
    if (step === STEPS.CATEGORY) {
      return undefined;
    }
    return "Previous Config";
  }, [step]);
  return (
    <Modal
      disabled={isLoading}
      isOpen={AddModal.isOpen}
      title="Add New Item"
      actionLabel={actionLabel}
      onClose={AddModal.onClose}
      secondaryAction={step === STEPS.CATEGORY ? undefined : onBack}
      secondaryActionLabel={secondaryActionLabel}
      onSubmit={handleSubmit(onSubmit)}
      body={bodyContent}
      footer={footerContent}
    />
  );
};

export default AddModal;
