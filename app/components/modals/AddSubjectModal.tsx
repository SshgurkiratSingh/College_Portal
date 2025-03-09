"use client";

import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import axios from "axios";
import { useRouter } from "next/navigation";

import Modal from "./Modals";
import useSubjectModal, { SubjectModalMode } from "@/app/hooks/useSubjectModal";
import Heading from "../Heading";
import Input from "../inputs/Input";

enum STEPS {
  SUBJECT_DETAILS = 0,
  COURSE_OUTCOMES = 1,
  OUTCOME_MAPPING = 2,
}

interface Student {
  id: string;
  rollNo: string;
  name: string;
  email?: string;
}

interface StudentList {
  id: string;
  name: string;
  description: string;
  students: Student[];
}

interface CourseOutcome {
  id?: string;
  name: string; // will be mapped to "code" when submitting
  description: string;
}

interface OutcomeMapping {
  outcomeId: string;
  value: number; // 0-3
}

interface COMapping {
  coId: string;
  mappings: OutcomeMapping[];
}

const AddSubjectModal = () => {
  const router = useRouter();
  const subjectModal = useSubjectModal();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(STEPS.SUBJECT_DETAILS);
  const [studentLists, setStudentLists] = useState<StudentList[]>([]);
  const [programOutcomes, setProgramOutcomes] = useState<
    Record<string, string>
  >({});
  const [courseOutcomes, setCourseOutcomes] = useState<CourseOutcome[]>([
    { name: "CO1", description: "" },
  ]);
  const [mappings, setMappings] = useState<COMapping[]>([]);
  const [isFetching, setIsFetching] = useState(true);

  // Determine mode flags
  const isViewMode = subjectModal.mode === SubjectModalMode.VIEW;
  const isEditMode = subjectModal.mode === SubjectModalMode.EDIT;
  const isCreateMode = subjectModal.mode === SubjectModalMode.CREATE;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<FieldValues>({
    defaultValues: {
      name: "",
      code: "",
      studentListId: "",
      description: "",
    },
  });

  const name = watch("name");
  const code = watch("code");
  const studentListId = watch("studentListId");
  const description = watch("description");

  // Helper to initialize mappings (only in create mode)
  const initializeMappings = () => {
    if (!isCreateMode || mappings.length > 0) return;
    if (Object.keys(programOutcomes).length === 0) return; // wait until outcomes are available
    const initialMappings: COMapping[] = courseOutcomes.map((co, index) => ({
      coId: co.id || `temp-${index}`,
      mappings: Object.keys(programOutcomes).map((outcomeId) => ({
        outcomeId,
        value: 0,
      })),
    }));
    setMappings(initialMappings);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsFetching(true);
        // Fetch student lists and program outcomes concurrently
        const [listsResponse, outcomesResponse] = await Promise.all([
          axios.get("/api/student-lists"),
          axios.get("/api/programOutcomes"),
        ]);
        setStudentLists(listsResponse.data);
        const outcomesData: Record<string, string> = outcomesResponse.data;
        setProgramOutcomes(outcomesData);

        if (!isCreateMode && subjectModal.subjectId) {
          // In Edit or View mode, fetch subject data.
          const subjectResponse = await axios.get(
            `/api/subjects/${subjectModal.subjectId}`
          );
          const subjectData = subjectResponse.data;
          // Set form values
          setValue("name", subjectData.name);
          setValue("code", subjectData.code);
          setValue("studentListId", subjectData.studentListId);
          setValue("description", subjectData.description || "");

          if (Array.isArray(subjectData.courseOutcomes)) {
            // Map stored "code" to "name" for form display.
            setCourseOutcomes(
              subjectData.courseOutcomes.map((co: any) => ({
                name: co.code,
                description: co.description,
              }))
            );
            // Build mappings using outcomesData.
            setMappings(
              subjectData.courseOutcomes.map((co: any, index: number) => ({
                coId: co.id || `temp-${index}`,
                mappings: Object.keys(outcomesData).map((outcomeId) => ({
                  outcomeId,
                  value:
                    (co.mappings &&
                      (
                        co.mappings.find(
                          (m: any) => m.outcomeId === outcomeId
                        ) || { value: 0 }
                      ).value) ||
                    0,
                })),
              }))
            );
          }
        } else {
          // For Create mode, reset the form
          reset();
          setCourseOutcomes([{ name: "CO1", description: "" }]);
          setMappings([]);
        }
        // Initialize mappings if needed (for create mode)
        if (isCreateMode) {
          initializeMappings();
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load required data");
      } finally {
        setIsFetching(false);
      }
    };

    if (subjectModal.isOpen) {
      fetchData();
    }
  }, [
    subjectModal.isOpen,
    subjectModal.mode,
    subjectModal.subjectId,
    setValue,
    reset,
    isCreateMode,
  ]);

  // Re-initialize mappings when course outcomes or program outcomes change (for create mode)
  useEffect(() => {
    if (isCreateMode) {
      initializeMappings();
    }
  }, [courseOutcomes, programOutcomes, isCreateMode]);

  const setCustomValue = (id: string, value: any) => {
    setValue(id, value, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  };

  const onBack = () => {
    setStep((value) => value - 1);
  };

  const onNext = () => {
    setStep((value) => value + 1);
  };

  const addCourseOutcome = () => {
    const newCONumber = courseOutcomes.length + 1;
    setCourseOutcomes([
      ...courseOutcomes,
      { name: `CO${newCONumber}`, description: "" },
    ]);
  };

  const removeCourseOutcome = (index: number) => {
    if (courseOutcomes.length <= 1) {
      toast.error("At least one Course Outcome is required");
      return;
    }
    const updatedCOs = [...courseOutcomes];
    updatedCOs.splice(index, 1);
    setCourseOutcomes(updatedCOs);

    const updatedMappings = [...mappings];
    updatedMappings.splice(index, 1);
    setMappings(updatedMappings);
  };

  const updateCourseOutcome = (
    index: number,
    field: keyof CourseOutcome,
    value: string
  ) => {
    const updatedCOs = [...courseOutcomes];
    updatedCOs[index] = { ...updatedCOs[index], [field]: value };
    setCourseOutcomes(updatedCOs);
  };

  // Updated updateMapping function with a guard in case mappings[coIndex] is undefined.
  const updateMapping = (coIndex: number, outcomeId: string, value: number) => {
    setMappings((prevMappings) => {
      const newMappings = [...prevMappings];
      // Initialize mapping for this course outcome if it doesn't exist.
      if (!newMappings[coIndex]) {
        newMappings[coIndex] = {
          coId: courseOutcomes[coIndex]?.id || `temp-${coIndex}`,
          mappings: Object.keys(programOutcomes).map((oid) => ({
            outcomeId: oid,
            value: 0,
          })),
        };
      }
      const mappingIndex = newMappings[coIndex].mappings.findIndex(
        (m) => m.outcomeId === outcomeId
      );
      if (mappingIndex !== -1) {
        newMappings[coIndex].mappings[mappingIndex].value = value;
      }
      return newMappings;
    });
  };

  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    // In view mode, simply close the modal.
    if (isViewMode) {
      subjectModal.onClose();
      return;
    }
    if (step !== STEPS.OUTCOME_MAPPING) return onNext();

    setIsLoading(true);

    // Prepare final course outcomes: map "name" to "code", include description and mappings.
    const finalCourseOutcomes = courseOutcomes.map((co, index) => ({
      code: co.name,
      description: co.description,
      mappings: mappings[index]?.mappings || [],
    }));

    const subjectData = {
      name: data.name,
      code: data.code,
      studentListId: data.studentListId,
      description: data.description,
      courseOutcomes: finalCourseOutcomes,
    };

    const isEditMode = subjectModal.mode === SubjectModalMode.EDIT;
    const endpoint = isEditMode
      ? `/api/subjects/${subjectModal.subjectId}`
      : "/api/subjects";
    const method = isEditMode ? axios.patch : axios.post;

    method(endpoint, subjectData)
      .then(() => {
        toast.success(
          isEditMode
            ? "Subject updated successfully!"
            : "Subject created successfully!"
        );
        router.refresh();
        reset();
        setStep(STEPS.SUBJECT_DETAILS);
        setCourseOutcomes([{ name: "CO1", description: "" }]);
        setMappings([]);
        subjectModal.setDataChanged(); // Signal that data has changed
        subjectModal.onClose();
      })
      .catch((error) => {
        toast.error(error?.response?.data?.error || "Something went wrong.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  // Set action labels based on mode and step.
  let actionLabel: string;
  let secondaryActionLabel: string | undefined;

  if (isViewMode) {
    actionLabel = "Close";
    secondaryActionLabel = undefined;
  } else if (step === STEPS.OUTCOME_MAPPING) {
    actionLabel = isEditMode ? "Update Subject" : "Create Subject";
    secondaryActionLabel = "Back";
  } else {
    actionLabel = "Next";
    secondaryActionLabel = step === STEPS.SUBJECT_DETAILS ? undefined : "Back";
  }

  // In view mode, disable form inputs.
  const inputDisabled = isLoading || isFetching || isViewMode;

  let bodyContent;
  if (step === STEPS.SUBJECT_DETAILS) {
    bodyContent = (
      <div className="flex flex-col gap-4">
        <Heading
          title={isViewMode ? "View Subject" : "Create a Subject"}
          subtitle="Enter the details of your subject"
        />
        <div className="flex flex-col gap-4">
          <Input
            id="name"
            label="Subject Name"
            disabled={inputDisabled}
            register={register}
            errors={errors}
            required
            placeholderText="e.g., Digital Signal Processing"
          />
          <Input
            id="code"
            label="Subject Code"
            disabled={inputDisabled}
            register={register}
            errors={errors}
            required
            placeholderText="e.g., EC301"
          />
          <div className="w-full">
            <label className="block text-sm font-medium mb-2">
              Student List
            </label>
            <select
              id="studentListId"
              disabled={inputDisabled}
              {...register("studentListId", { required: true })}
              className={`
                w-full p-2 border rounded-md
                ${errors.studentListId ? "border-red-500" : "border-gray-300"}
              `}
            >
              <option value="">Select a student list</option>
              {studentLists.map((list) => (
                <option key={list.id} value={list.id}>
                  {list.name}
                </option>
              ))}
            </select>
            {errors.studentListId && (
              <span className="text-red-500 text-sm">
                This field is required
              </span>
            )}
          </div>
          <Input
            id="description"
            label="Description"
            disabled={inputDisabled}
            register={register}
            errors={errors}
            placeholderText="Brief description of the subject"
          />
        </div>
      </div>
    );
  } else if (step === STEPS.COURSE_OUTCOMES) {
    bodyContent = (
      <div className="flex flex-col gap-4">
        <Heading
          title={isViewMode ? "View Course Outcomes" : "Course Outcomes"}
          subtitle="Define the Course Outcomes (COs) for this subject"
        />
        <div className="flex flex-col gap-6 max-h-[60vh] overflow-y-auto px-1">
          {courseOutcomes.map((co, index) => (
            <div key={index} className="border p-4 rounded-md">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium">Course Outcome {index + 1}</h3>
                {!isViewMode && (
                  <button
                    type="button"
                    onClick={() => removeCourseOutcome(index)}
                    className="text-red-500 hover:text-red-700"
                    disabled={courseOutcomes.length <= 1 || isLoading}
                  >
                    Remove
                  </button>
                  
                )}
              </div>
              <div className="flex flex-col gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input
                    type="text"
                    value={co.name}
                    onChange={(e) =>
                      updateCourseOutcome(index, "name", e.target.value)
                    }
                    disabled={inputDisabled}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="e.g., CO1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Description
                  </label>
                  <textarea
                    value={co.description}
                    onChange={(e) =>
                      updateCourseOutcome(index, "description", e.target.value)
                    }
                    disabled={inputDisabled}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Describe this course outcome"
                    rows={3}
                  />
                </div>
              </div>
            </div>
          ))}
          {!isViewMode && (
            <button
              type="button"
              onClick={addCourseOutcome}
              disabled={isLoading}
              className="bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition"
            >
              Add Course Outcome
            </button>
          )}
        </div>
      </div>
    );
  } else if (step === STEPS.OUTCOME_MAPPING) {
    bodyContent = (
      <div className="flex flex-col gap-4">
        <Heading
          title={isViewMode ? "View Outcome Mapping" : "Outcome Mapping"}
          subtitle="Map each Course Outcome to Program Outcomes with a value from 0 to 3"
        />
        <div className="text-sm text-gray-500 mb-2">
          <p>Mapping values:</p>
          <p>0 - No correlation (default)</p>
          <p>1 - Low correlation</p>
          <p>2 - Medium correlation</p>
          <p>3 - High correlation</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full border divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Program Outcome
                </th>
                {courseOutcomes.map((co, index) => (
                  <th
                    key={index}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {co.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Object.entries(programOutcomes).map(
                ([outcomeId, outcomeDesc]) => (
                  <tr key={outcomeId}>
                    <td className="px-4 py-2 whitespace-nowrap text-sm">
                      <div>
                        <strong>{outcomeId}</strong>
                      </div>
                      <div className="text-xs text-gray-500">
                        {outcomeDesc.length > 50
                          ? `${outcomeDesc.substring(0, 50)}...`
                          : outcomeDesc}
                      </div>
                    </td>
                    {courseOutcomes.map((_, coIndex) => (
                      <td key={coIndex} className="px-4 py-2">
                        <select
                          value={
                            mappings[coIndex]?.mappings.find(
                              (m) => m.outcomeId === outcomeId
                            )?.value || 0
                          }
                          onChange={(e) =>
                            updateMapping(
                              coIndex,
                              outcomeId,
                              parseInt(e.target.value)
                            )
                          }
                          disabled={inputDisabled}
                          className="w-full p-1 border border-gray-300 rounded-md"
                        >
                          <option value={0}>0</option>
                          <option value={1}>1</option>
                          <option value={2}>2</option>
                          <option value={3}>3</option>
                        </select>
                      </td>
                    ))}
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Determine submit behavior: in view mode, just close; otherwise submit the form.
  const onAction = isViewMode ? subjectModal.onClose : handleSubmit(onSubmit);

  return (
    <Modal
      disabled={isLoading}
      isOpen={subjectModal.isOpen}
      title="Subject Management"
      actionLabel={actionLabel}
      onClose={subjectModal.onClose}  
      secondaryAction={step === STEPS.SUBJECT_DETAILS ? undefined : onBack}
      secondaryActionLabel={secondaryActionLabel}
      onSubmit={onAction}
      body={bodyContent}
    />
  );
};

export default AddSubjectModal;