"use client";

import { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import useUploadPaperModal, { PaperType } from "../../hooks/useUploadPaperModal";
import Modal from "./Modals";

interface Question {
  questionNumber: string;
  question: string;
  co: string;
  bloomLevel: string;
  marks: string; // New field for marks
}

const UploadPaperModal = () => {
  const uploadPaperModal = useUploadPaperModal();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [paperType, setPaperType] = useState<PaperType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([
    { questionNumber: "", question: "", co: "", bloomLevel: "", marks: "" }, // Initialize with marks field
  ]);

  const onSubmit = async () => {
    if (!paperType || !uploadPaperModal.subjectId) {
      toast.error("Please select a paper type");
      return;
    }

    if (
      questions.some(
        (q) =>
          !q.questionNumber ||
          !q.question ||
          !q.co ||
          !q.bloomLevel ||
          !q.marks // Validate marks field
      )
    ) {
      toast.error("Please fill all fields in the table");
      return;
    }

    try {
      setIsLoading(true);

      const payload = {
        subjectId: uploadPaperModal.subjectId,
        paperType,
        questions,
      };

      console.log("Payload being sent:", payload); // Debugging line

      await axios.post("/api/subjects/upload-paper", payload);

      toast.success("Paper details saved successfully");
      uploadPaperModal.onClose();
    } catch (error) {
      console.error("Error saving paper details:", error);
      toast.error("Failed to save paper details");
    } finally {
      setIsLoading(false);
      setQuestions([
        { questionNumber: "", question: "", co: "", bloomLevel: "", marks: "" }, // Reset with marks field
      ]);
      setPaperType(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleQuestionChange = (
    index: number,
    field: keyof Question,
    value: string
  ) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = { ...updatedQuestions[index], [field]: value };
    setQuestions(updatedQuestions);
  };

  const addQuestionRow = () => {
    setQuestions([
      ...questions,
      { questionNumber: "", question: "", co: "", bloomLevel: "", marks: "" }, // Add new row with marks field
    ]);
  };

  const removeQuestionRow = (index: number) => {
    if (questions.length === 1) {
      toast.error("At least one question is required");
      return;
    }
    const updatedQuestions = [...questions];
    updatedQuestions.splice(index, 1);
    setQuestions(updatedQuestions);
  };

  const bodyContent = (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label className="font-medium">Select Paper Type:</label>
        <div className="grid grid-cols-2 gap-2">
          {Object.values(PaperType).map((type) => (
            <button
              key={type}
              onClick={() => setPaperType(type)}
              className={`p-2 rounded-md border transition ${
                paperType === type
                  ? "bg-green-500 text-white"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
              disabled={isLoading}
            >
              {type.charAt(0) + type.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {paperType && (
        <div className="flex flex-col gap-4">
          <label className="font-medium">Enter Question Details:</label>
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border border-gray-300">Question No.</th>
                <th className="p-2 border border-gray-300">Question</th>
                <th className="p-2 border border-gray-300">CO</th>
                <th className="p-2 border border-gray-300">Bloom Level</th>
                <th className="p-2 border border-gray-300">Marks</th> {/* New column */}
                <th className="p-2 border border-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {questions.map((question, index) => (
                <tr key={index}>
                  <td className="p-2 border border-gray-300">
                    <input
                      type="text"
                      value={question.questionNumber}
                      onChange={(e) =>
                        handleQuestionChange(index, "questionNumber", e.target.value)
                      }
                      className="w-full p-1 border rounded-md"
                      placeholder="Q1"
                    />
                  </td>
                  <td className="p-2 border border-gray-300">
                    <input
                      type="text"
                      value={question.question}
                      onChange={(e) =>
                        handleQuestionChange(index, "question", e.target.value)
                      }
                      className="w-full p-1 border rounded-md"
                      placeholder="Enter question"
                    />
                  </td>
                  <td className="p-2 border border-gray-300">
                    <input
                      type="text"
                      value={question.co}
                      onChange={(e) =>
                        handleQuestionChange(index, "co", e.target.value)
                      }
                      className="w-full p-1 border rounded-md"
                      placeholder="CO1"
                    />
                  </td>
                  <td className="p-2 border border-gray-300">
                    <input
                      type="text"
                      value={question.bloomLevel}
                      onChange={(e) =>
                        handleQuestionChange(index, "bloomLevel", e.target.value)
                      }
                      className="w-full p-1 border rounded-md"
                      placeholder="Bloom Level"
                    />
                  </td>
                  <td className="p-2 border border-gray-300">
                    <input
                      type="text"
                      value={question.marks}
                      onChange={(e) =>
                        handleQuestionChange(index, "marks", e.target.value)
                      }
                      className="w-full p-1 border rounded-md"
                      placeholder="Marks"
                    />
                  </td>
                  <td className="p-2 border border-gray-300">
                    <button
                      type="button"
                      onClick={() => removeQuestionRow(index)}
                      className="text-red-500 hover:text-red-700"
                      disabled={questions.length === 1}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button
            type="button"
            onClick={addQuestionRow}
            className="bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition"
          >
            Add Question
          </button>
        </div>
      )}
    </div>
  );

  return (
    <Modal
      isOpen={uploadPaperModal.isOpen}
      onClose={uploadPaperModal.onClose}
      onSubmit={onSubmit}
      title="Upload Paper"
      actionLabel="Save"
      body={bodyContent}
      disabled={isLoading || !paperType}
    />
  );
};

export default UploadPaperModal;