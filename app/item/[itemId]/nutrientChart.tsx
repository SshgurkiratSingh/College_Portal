"use client";
import { useState, useEffect } from "react";
import {
  FaUtensils,
  FaBurn,
  FaDumbbell,
  FaPepperHot,
  FaRuler,
} from "react-icons/fa";

interface NutritionDataProps {
  title: string | undefined;
}

interface NutritionData {
  calories: number;
  serving_size_g: number;
  fat_total_g: number;
  protein_g: number;
  sodium_mg: number;
}

const NutritionData: React.FC<NutritionDataProps> = ({ title }) => {
  const [nutritionData, setNutritionData] = useState<NutritionData | null>(
    null
  );

  useEffect(() => {
    const fetchNutritionData = async (
      query: string
    ): Promise<NutritionData | null> => {
      const apiKey = "JdWD+IHdp6ezQgJxCJCVTA==RpWoNAALwQ3bnFHh";
      const url = `https://api.api-ninjas.com/v1/nutrition?query=${query}`;

      try {
        const response = await fetch(url, {
          method: "GET",
          headers: {
            "X-Api-Key": apiKey,
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data) && data.length > 0) {
            return data[0];
          }
        }
      } catch (error) {
        console.error("Error:", error);
      }

      return null;
    };

    if (title) {
      fetchNutritionData(title).then((data) => setNutritionData(data));
    }
  }, [title]);

  if (!title) {
    return <></>;
  }

  return (
    <div className="mt-4">
      <h3 className="text-lg font-bold mb-2 flex items-center">
        <FaUtensils className="mr-2" />
        Nutrition Data{" "}
        {nutritionData && (
          <span>
            <p className=""> {`📊 per ${nutritionData.serving_size_g}`}g</p>
          </span>
        )}
      </h3>

      {nutritionData && (
        <div>
          <div className="flex items-center mb-2"></div>

          <div className="flex items-center mb-2">
            <FaBurn className="mr-2" />
            <p className="text-info">Calories: {nutritionData.calories}</p>
          </div>

          <div className="flex items-center mb-2">
            <FaDumbbell className="mr-2" />
            <p className="text-info">Protein: {nutritionData.protein_g}g</p>
          </div>

          <div className="flex items-center mb-2">
            <FaPepperHot className="mr-2" />
            <p className="text-info">Fat: {nutritionData.fat_total_g}g</p>
          </div>

          <div className="flex items-center mb-2">
            <FaUtensils className="mr-2" />
            <p className="text-info">Sodium: {nutritionData.sodium_mg}mg</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default NutritionData;
