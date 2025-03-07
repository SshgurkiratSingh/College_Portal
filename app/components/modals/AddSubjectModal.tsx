"use client";

import { useCallback, useState, useEffect } from "react";
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
  name: string;
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
  const [programOutcomes, setProgramOutcomes] = useState<Record<string, string>>({});
  const [courseOutcomes, setCourseOutcomes] = useState<CourseOutcome[]>([
    { name: "CO1", description: "" }
  ]);
  const [mappings, setMappings] = useState<COMapping[]>([]);

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
      credits: 3,
    },
  });

  const name = watch("name");
  const code = watch("code");
  const studentListId = watch("studentListId");
  const description = watch("description");
  const credits = watch("credits");

  // Fetch student lists and program outcomes
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch student lists
        const listsResponse = await axios.get("/api/student-lists");
        setStudentLists(listsResponse.data);

        // Fetch program outcomes
        const outcomesResponse = await axios.get("/api/programOutcomes");
        setProgramOutcomes(outcomesResponse.data);

        // Initialize mappings for the first CO
        if (courseOutcomes.length > 0) {
          initializeMappings();
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load required data");
      }
    };

    if (subjectModal.isOpen) {
      fetchData();
    }
  }, [subjectModal.isOpen]);

  // Initialize mappings when course outcomes change
  useEffect(() => {
    initializeMappings();
  }, [courseOutcomes, programOutcomes]);

  const initializeMappings = () => {
    // Create an initial mapping structure for all COs
    const initialMappings: COMapping[] = courseOutcomes.map((co) => {
      // Check if a mapping already exists for this CO
      const existingMapping = mappings.find(
        (mapping) => mapping.coId === co.id
      );

      if (existingMapping) {
        return existingMapping;
      }

      // Create a new mapping with all program outcomes set to 0
      return {
        coId: co.id || `temp-${Math.random().toString(36).substr(2, 9)}`,
        mappings: Object.keys(programOutcomes).map((outcomeId) => ({
          outcomeId,
          value: 0,
        })),
      };
    });

    setMappings(initialMappings);
  };

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
      {
        name: `CO${newCONumber}`,
        description: "",
      },
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

    // Also update mappings
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

  const updateMapping = (coIndex: number, outcomeId: string, value: number) => {
    const updatedMappings = [...mappings];
    const mappingIndex = updatedMappings[coIndex].mappings.findIndex(
      (m) => m.outcomeId === outcomeId
    );

    if (mappingIndex !== -1) {
      updatedMappings[coIndex].mappings[mappingIndex].value = value;
      setMappings(updatedMappings);
    }
  };

  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    if (step !== STEPS.OUTCOME_MAPPING) {
      return onNext();
    }

    setIsLoading(true);

    // Prepare the final course outcomes with their IDs
    const finalCourseOutcomes = courseOutcomes.map((co, index) => ({
      ...co,
      id: mappings[index]?.coId || undefined,
    }));

    // Create the subject data to submit
    const subjectData = {
      name: data.name,
      code: data.code,
      studentListId: data.studentListId,
      description: data.description,
      credits: parseInt(data.credits) || 3,
      courseOutcomes: finalCourseOutcomes,
      mappings: mappings,
    };

    axios
      .post("/api/subjects", subjectData)
      .then(() => {
        toast.success("Subject created successfully!");
        router.refresh();
        reset();
        setStep(STEPS.SUBJECT_DETAILS);
        setCourseOutcomes([{ name: "CO1", description: "" }]);
        setMappings([]);
        subjectModal.onClose();
      })
      .catch((error) => {
        toast.error(error?.response?.data?.error || "Something went wrong.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  let bodyContent;
  let actionLabel = "Next";
  let secondaryActionLabel;

  // SUBJECT DETAILS STEP
  if (step === STEPS.SUBJECT_DETAILS) {
    bodyContent = (
      <div className="flex flex-col gap-4">
        <Heading
          title="Create a Subject"
          subtitle="Enter the details of your subject"
        />

        <div className="flex flex-col gap-4">
          <Input
            id="name"
            label="Subject Name"
            disabled={isLoading}
            register={register}
            errors={errors}
            required
            placeholderText="e.g., Digital Signal Processing"
          />

          <Input
            id="code"
            label="Subject Code"
            disabled={isLoading}
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
              disabled={isLoading}
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
            disabled={isLoading}
            register={register}
            errors={errors}
            placeholderText="Brief description of the subject"
          />

          <Input
            id="credits"
            label="Credits"
            type="number"
            min={1}
            max={10}
            disabled={isLoading}
            register={register}
            errors={errors}
            required
          />
        </div>
      </div>
    );
    actionLabel = "Next";
    secondaryActionLabel = undefined;
  }

  // COURSE OUTCOMES STEP
  else if (step === STEPS.COURSE_OUTCOMES) {
    bodyContent = (
      <div className="flex flex-col gap-4">
        <Heading
          title="Course Outcomes"
          subtitle="Define the Course Outcomes (COs) for this subject"
        />

        <div className="flex flex-col gap-6 max-h-[60vh] overflow-y-auto px-1">
          {courseOutcomes.map((co, index) => (
            <div key={index} className="border p-4 rounded-md">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium">Course Outcome {index + 1}</h3>
                <button
                  type="button"
                  onClick={() => removeCourseOutcome(index)}
                  className="text-red-500 hover:text-red-700"
                  disabled={courseOutcomes.length <= 1 || isLoading}
                >
                  Remove
                </button>
              </div>

              <div className="flex flex-col gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={co.name}
                    onChange={(e) =>
                      updateCourseOutcome(index, "name", e.target.value)
                    }
                    disabled={isLoading}
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
                    disabled={isLoading}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Describe this course outcome"
                    rows={3}
                  />
                </div>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addCourseOutcome}
            disabled={isLoading}
            className="bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition"
          >
            Add Course Outcome
          </button>
        </div>
      </div>
    );
    actionLabel = "Next";
    secondaryActionLabel = "Back";
  }

  // OUTCOME MAPPING STEP
  else if (step === STEPS.OUTCOME_MAPPING) {
    bodyContent = (
      <div className="flex flex-col gap-4">
        <Heading
          title="Outcome Mapping"
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
                          disabled={isLoading}
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
    actionLabel = "Create Subject";
    secondaryActionLabel = "Back";
  }

  return (
    <Modal
      disabled={isLoading}
      isOpen={subjectModal.isOpen}
      title="Subject Management"
      actionLabel={actionLabel}
      onClose={subjectModal.onClose}
      secondaryAction={step === STEPS.SUBJECT_DETAILS ? undefined : onBack}
      secondaryActionLabel={secondaryActionLabel}
      onSubmit={handleSubmit(onSubmit)}
      body={bodyContent}
    />
  );
};

export default AddSubjectModal;
