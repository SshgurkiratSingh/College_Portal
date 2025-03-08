"use client";

import { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import useUploadPaperModal, { PaperType } from "../../hooks/useUploadPaperModal";
import Modal from "./Modals";

const UploadPaperModal = () => {
  const uploadPaperModal = useUploadPaperModal();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [paperType, setPaperType] = useState<PaperType | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async () => {
    if (!selectedFile || !paperType || !uploadPaperModal.subjectId) {
      toast.error("Please select a file and paper type");
      return;
    }

    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("subjectId", uploadPaperModal.subjectId);
      formData.append("paperType", paperType);

      await axios.post("/api/subjects/upload-paper", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Paper uploaded successfully");
      uploadPaperModal.onClose();
    } catch (error) {
      console.error("Error uploading paper:", error);
      toast.error("Failed to upload paper");
    } finally {
      setIsLoading(false);
      setSelectedFile(null);
      setPaperType(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
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
      <div className="flex flex-col gap-2">
        <label className="font-medium">Upload File:</label>
        <input
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={handleFileChange}
          disabled={isLoading}
          className="border p-2 rounded-md"
        />
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={uploadPaperModal.isOpen}
      onClose={uploadPaperModal.onClose}
      onSubmit={onSubmit}
      title="Upload Paper"
      actionLabel="Upload"
      body={bodyContent}
      disabled={isLoading || !selectedFile || !paperType}
    />
  );
};

export default UploadPaperModal;