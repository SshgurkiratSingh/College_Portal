"use client";
import { useState } from "react";
import Button from "../components/Button";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

const AddMoney = () => {
  const [code, setCode] = useState("");
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    setSuccess(false);
    setDisabled(true);
    try {
      const res = await fetch("/api/addmoney", {
        method: "POST",
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        if (data.status === "success") {
          setSuccess(true);
          toast.success(data.message);
          router.refresh();
        } else {
          setError("Something went wrong");
          toast.error(data.message);
        }
      }
    } catch (error) {
      setError("Something went wrong");
      toast.error("Something went wrong,Please check the code ");
    }
    setLoading(false);
    setDisabled(false);
  };
  return (
    <div className="flex flex-col justify-center align-middle items-center">
      <input
        disabled={disabled}
        className="border-2 border-black p-2 "
        type="text"
        placeholder="Enter Code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />
      <Button s1 label="Submit" onClick={handleSubmit} />
    </div>
  );
};
export default AddMoney;
