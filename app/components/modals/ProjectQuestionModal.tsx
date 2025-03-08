"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import useProjectQuestionModal from "../../hooks/useProjectQuestionModal";
import Modal from "./Modals";

interface CourseOutcome {
  code: string;
  description: string;
}

interface QuestionItem {
  id: string; // Unique identifier for UI management
  questionNum: string;
  maxMarks: number;
  description: string;
  coCode: string;
}

const ProjectQuestionModal = () => {
  const projectQuestionModal = useProjectQuestionModal();
  const [isLoading, setIsLoading] = useState(false);
  const [questions, setQuestions] = useState<QuestionItem[]>([
    {
      id: Date.now().toString(),
      questionNum: "",
      maxMarks: 1,
      description: "",
      coCode: "",
    },
  ]);
  const [courseOutcomes, setCourseOutcomes] = useState<CourseOutcome[]>([]);
  const [projectData, setProjectData] = useState<any>(null);

  // Fetch project data and course outcomes when modal opens
  useEffect(() => {
    if (projectQuestionModal.isOpen && projectQuestionModal.projectId) {
      fetchProjectData();
    }
  }, [projectQuestionModal.isOpen, projectQuestionModal.projectId]);

  // Fetch question data when in edit mode
  useEffect(() => {
    if (
      projectQuestionModal.isOpen &&
      projectQuestionModal.editMode &&
      projectQuestionModal.questionId
    ) {
      fetchQuestionData();
    } else if (projectQuestionModal.isOpen && !projectQuestionModal.editMode) {
      // Reset to a single empty question when opening in add mode
      setQuestions([
        {
          id: Date.now().toString(),
          questionNum: "",
          maxMarks: 0,
          description: "",
          coCode: "",
        },
      ]);
    }
  }, [
    projectQuestionModal.isOpen,
    projectQuestionModal.editMode,
    projectQuestionModal.questionId,
  ]);

  const fetchProjectData = async () => {
    try {
      setIsLoading(true);
      // Fetch project details
      const response = await axios.get(
        `/api/projects/${projectQuestionModal.projectId}`
      );
      const project = response.data;
      setProjectData(project);

      // Fetch subject details to get course outcomes
      const subjectResponse = await axios.get(
        `/api/subjects/${project.subjectId}`
      );
      const subject = subjectResponse.data;

      if (subject.courseOutcomes) {
        // Extract course outcomes from subject data
        try {
          const outcomes = Array.isArray(subject.courseOutcomes)
            ? subject.courseOutcomes
            : JSON.parse(subject.courseOutcomes);

          setCourseOutcomes(
            outcomes.map((co: any) => ({
              code: co.code,
              description: co.description,
            }))
          );
        } catch (error) {
          console.error("Error parsing course outcomes:", error);
          toast.error("Failed to load course outcomes");
          setCourseOutcomes([]);
        }
      }
    } catch (error) {
      console.error("Error fetching project data:", error);
      toast.error("Failed to load project data");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchQuestionData = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `/api/projects/questions/${projectQuestionModal.questionId}`
      );
      const question = response.data;

      // In edit mode, we only have one question
      setQuestions([
        {
          id: question.id || Date.now().toString(),
          questionNum: question.questionNum.toString(),
          maxMarks: question.maxMarks,
          description: question.description || "",
          coCode: question.coCode || "",
        },
      ]);
    } catch (error) {
      console.error("Error fetching question data:", error);
      toast.error("Failed to load question data");
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    // Check if any question has empty required fields
    const hasEmptyFields = questions.some(
      (q) => !q.questionNum || q.maxMarks <= 0
    );
    if (hasEmptyFields) {
      toast.error(
        "All questions must have a question number and maximum marks greater than 0"
      );
      return false;
    }

    // Check for duplicate question numbers
    const questionNums = questions.map((q) => q.questionNum);
    if (new Set(questionNums).size !== questionNums.length) {
      toast.error("Question numbers must be unique");
      return false;
    }

    // Ensure total marks don't exceed project total marks
    if (projectData) {
      const totalQuestionMarks = questions.reduce(
        (sum, q) => sum + q.maxMarks,
        0
      );
      if (totalQuestionMarks > projectData.totalMarks) {
        toast.error(
          `Total marks (${totalQuestionMarks}) cannot exceed project total marks (${projectData.totalMarks})`
        );
        return false;
      }
    }

    return true;
  };

  const onSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);

      if (projectQuestionModal.editMode && projectQuestionModal.questionId) {
        // Update single question
        const questionData = {
          projectId: projectQuestionModal.projectId,
          questionNum: questions[0].questionNum,
          maxMarks: questions[0].maxMarks,
          description: questions[0].description,
          coCode: questions[0].coCode,
        };

        await axios.put(
          `/api/projects/questions/${projectQuestionModal.questionId}`,
          questionData
        );
        toast.success("Question updated successfully");
      } else {
        // Add multiple questions
        const questionDataArray = questions.map((q) => ({
          projectId: projectQuestionModal.projectId,
          questionNum: q.questionNum,
          maxMarks: q.maxMarks,
          description: q.description,
          coCode: q.coCode,
        }));

        await axios.post("/api/projects/questions/bulk", questionDataArray);
        toast.success(`${questions.length} questions added successfully`);
      }

      resetForm();
      projectQuestionModal.setDataChanged(); // Signal that data has changed
      projectQuestionModal.onClose();
    } catch (error) {
      console.error("Error saving questions:", error);
      toast.error("Failed to save questions");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setQuestions([
      {
        id: Date.now().toString(),
        questionNum: "",
        maxMarks: 0,
        description: "",
        coCode: "",
      },
    ]);
  };

  // Generate the next question number based on pattern detection
  const generateNextQuestionNumber = (prevQuestionNum: string): string => {
    if (!prevQuestionNum) return "1";

    // Check if the question number follows a pattern like "1a", "2b", etc.
    const match = prevQuestionNum.match(/^(\d+)([a-z])$/i);

    if (match) {
      const [_, numPart, letterPart] = match;
      // Get the next letter in sequence (a -> b, b -> c, etc.)
      const nextLetter = String.fromCharCode(letterPart.charCodeAt(0) + 1);
      return `${numPart}${nextLetter}`;
    }

    // If it's just a number, increment it
    if (/^\d+$/.test(prevQuestionNum)) {
      return (parseInt(prevQuestionNum) + 1).toString();
    }

    // If we can't determine a pattern, just return the same number
    return prevQuestionNum;
  };

  const addQuestion = () => {
    const lastQuestion = questions[questions.length - 1];
    const nextQuestionNum = generateNextQuestionNumber(
      lastQuestion.questionNum
    );

    setQuestions([
      ...questions,
      {
        id: Date.now().toString(),
        questionNum: nextQuestionNum,
        maxMarks: lastQuestion.maxMarks, // Copy the marks from the previous question
        description: "",
        coCode: lastQuestion.coCode, // Optionally copy the CO code as well
      },
    ]);
  };

  const removeQuestion = (id: string) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((q) => q.id !== id));
    }
  };

  const updateQuestion = (
    id: string,
    field: keyof QuestionItem,
    value: string | number
  ) => {
    setQuestions(
      questions.map((q) => (q.id === id ? { ...q, [field]: value } : q))
    );
  };

  const bodyContent = (
    <div className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto">
      {questions.map((question, index) => (
        <div key={question.id} className="p-4 border rounded-md">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold">Question {index + 1}</h3>
            {!projectQuestionModal.editMode && questions.length > 1 && (
              <button
                onClick={() => removeQuestion(question.id)}
                className="text-red-500 hover:text-red-700"
                type="button"
                disabled={isLoading}
              >
                Remove
              </button>
            )}
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="font-medium">Question Number*</label>
              <input
                type="text"
                value={question.questionNum}
                onChange={(e) =>
                  updateQuestion(question.id, "questionNum", e.target.value)
                }
                className="p-2 border rounded-md"
                placeholder="e.g., 1, 1b, 2a"
                disabled={isLoading}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-medium">Maximum Marks*</label>
              <input
                type="number"
                value={question.maxMarks}
                onChange={(e) =>
                  updateQuestion(
                    question.id,
                    "maxMarks",
                    parseInt(e.target.value) || 0
                  )
                }
                className="p-2 border rounded-md"
                placeholder="Enter maximum marks"
                disabled={isLoading}
                min="0"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-medium">Description (Optional)</label>
              <textarea
                value={question.description}
                onChange={(e) =>
                  updateQuestion(question.id, "description", e.target.value)
                }
                className="p-2 border rounded-md h-24"
                placeholder="Enter question description or instructions"
                disabled={isLoading}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-medium">CO Mapping</label>
              <select
                value={question.coCode}
                onChange={(e) =>
                  updateQuestion(question.id, "coCode", e.target.value)
                }
                className="p-2 border rounded-md bg-black"
                disabled={isLoading}
              >
                <option value="">Select a CO</option>
                {courseOutcomes.map((co) => (
                  <option key={co.code} value={co.code}>
                    {co.code}: {co.description.substring(0, 50)}
                    {co.description.length > 50 ? "..." : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      ))}

      {projectData && (
        <div className="text-sm text-gray-500 mt-2">
          Project total marks: {projectData.totalMarks} | Current allocated:{" "}
          {questions.reduce((sum, q) => sum + q.maxMarks, 0)} marks
        </div>
      )}

      {!projectQuestionModal.editMode && (
        <button
          onClick={addQuestion}
          className="mt-4 p-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
          type="button"
          disabled={isLoading}
        >
          Add Another Question
        </button>
      )}
    </div>
  );

  return (
    <Modal
      isOpen={projectQuestionModal.isOpen}
      onClose={projectQuestionModal.onClose}
      onSubmit={onSubmit}
      title={projectQuestionModal.editMode ? "Edit Question" : "Add Questions"}
      actionLabel={projectQuestionModal.editMode ? "Update" : "Save All"}
      body={bodyContent}
      disabled={isLoading}
    />
  );
};

export default ProjectQuestionModal;
