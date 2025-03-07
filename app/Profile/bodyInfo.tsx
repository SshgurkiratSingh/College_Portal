import React from "react";
import {
  FaTransgender,
  FaBirthdayCake,
  FaRulerVertical,
  FaWeight,
} from "react-icons/fa";
import { formatDistanceToNow } from "date-fns";

interface InfoProps {
  gender: string;
  dob: Date;
  height: number;
  weight: number;
}

const BodyInfo: React.FC<InfoProps> = ({ gender, dob, height, weight }) => {
  return (
    <div className="flex flex-col space-y-4 p-4  shadow rounded-lg">
      <div className="flex items-center space-x-2">
        <FaTransgender className="text-blue-500" />
        <span className="text-blue-400">{gender}</span>
      </div>
      <div className="flex items-center space-x-2">
        <FaBirthdayCake className="text-pink-500" />
        <span className="text-pink-400">
          Born
          {formatDistanceToNow(dob, { addSuffix: true })}
        </span>
      </div>
      <div className="flex items-center space-x-2">
        <FaRulerVertical className="text-green-500" />
        <span className="text-green-400">{height} cm</span>
      </div>
      <div className="flex items-center space-x-2">
        <FaWeight className="text-red-500" />
        <span className="text-red-400">{weight} kg</span>
      </div>
    </div>
  );
};

export default BodyInfo;
