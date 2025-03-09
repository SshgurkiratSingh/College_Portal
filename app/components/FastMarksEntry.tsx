"use client";

import {
  useState,
  useEffect,
  useRef,
  KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { toast } from "react-hot-toast";
import { debounce } from "lodash";
import Container from "../components/container";
import Heading from "../components/Heading";
import EmptyState from "../components/EmptyState";
import apiClient from "../utils/apiClient";
import { useNetworkStatus } from "../utils/networkStatus";

interface ProjectQuestion {
  id: string;
  projectId: string;
  questionNum: number | string;
  maxMarks: number;
  description?: string;
  coCode?: string;
}

interface Student {
  id: string;
  rollNo: string;
  name: string;
  email?: string;
  section?: string;
}

interface Score {
  id?: string;
  projectQuestionId: string;
  studentId: string;
  score: number;
}

interface FastMarksEntryProps {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
}

const FastMarksEntry = ({
  projectId,
  isOpen,
  onClose,
}: FastMarksEntryProps) => {
  // States for students, questions, scores, etc.
  const [students, setStudents] = useState<Student[]>([]);
  const [questions, setQuestions] = useState<ProjectQuestion[]>([]);
  const [scores, setScores] = useState<Score[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [totalScore, setTotalScore] = useState(0);
  const [totalMaxScore, setTotalMaxScore] = useState(0);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");

  // Refs for input fields and search input
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Use our network status hook to check if we're online
  const isOnline = useNetworkStatus();
  const [offlineSaved, setOfflineSaved] = useState<boolean>(false);
  
  // Create a unique session ID when component opens
  useEffect(() => {
    if (isOpen) {
      setSessionId(`mark-entry-${Date.now()}`);
      fetchQuestions();
      fetchStudents();
      
      // If we're online, prefetch all scores for the project for faster access
      if (isOnline) {
        prefetchAllScores();
      }
      
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, projectId]);
  
  // Process any pending offline actions when we come back online
  useEffect(() => {
    if (isOnline && offlineSaved) {
      toast.success("Back online. Syncing your offline changes...");
      apiClient.processPendingOfflineActions().then((processed) => {
        if (processed > 0) {
          toast.success(`Successfully synchronized ${processed} offline changes`);
        }
        setOfflineSaved(false);
      });
    }
  }, [isOnline, offlineSaved]);

  // Calculate total possible marks
  useEffect(() => {
    if (questions.length > 0) {
      const max = questions.reduce((sum, q) => sum + q.maxMarks, 0);
      setTotalMaxScore(max);
    }
  }, [questions]);

  // Calculate total score
  useEffect(() => {
    if (scores.length > 0) {
      const total = scores.reduce((sum, s) => sum + s.score, 0);
      setTotalScore(total);
    } else {
      setTotalScore(0);
    }
  }, [scores]);

  // Filter students based on search term
  useEffect(() => {
    if (searchTerm) {
      const filtered = students.filter(
        (student) =>
          student.rollNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredStudents(filtered);
    } else {
      setFilteredStudents([]);
    }
  }, [searchTerm, students]);

  const prefetchAllScores = async () => {
    try {
      console.log("Prefetching all scores for caching");
      await apiClient.get(`/api/projects/${projectId}/scores/all`);
    } catch (error) {
      console.error("Error prefetching scores:", error);
      // Silent fail - this is just a performance optimization
    }
  };

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      // Use our apiClient with caching
      const data = await apiClient.get<ProjectQuestion[]>(`/api/projects/${projectId}/questions`);
      setQuestions(data);
    } catch (error) {
      console.error("Error fetching questions:", error);
      toast.error("Failed to load project questions");
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      // Use our apiClient with caching
      const data = await apiClient.get<Student[]>(`/api/projects/${projectId}/students`);
      setStudents(data);
    } catch (error) {
      console.error("Error fetching students:", error);
      toast.error("Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  const fetchScoresForStudent = async (studentId: string) => {
    try {
      setLoading(true);
      
      // Use our apiClient with caching
      const response = await apiClient.get<any[]>(
        `/api/projects/${projectId}/scores?studentId=${studentId}`
      );
      
      // Map the scores to our internal format
      const existingScores: Score[] = response.map((score: any) => ({
        id: score.id,
        projectQuestionId: score.projectQuestionId,
        studentId: score.studentId,
        score: score.score,
      }));
      
      // If not all questions have scores, create empty ones
      const allScores = questions.map((question) => {
        const existingScore = existingScores.find(
          (s) => s.projectQuestionId === question.id
        );
        return (
          existingScore || {
            projectQuestionId: question.id,
            studentId,
            score: 0,
          }
        );
      });
      setScores(allScores);
    } catch (error) {
      console.error("Error fetching scores:", error);
      
      // If offline and error, try to get from cache
      if (!isOnline) {
        try {
          // Try to find scores in the prefetched all scores
          const allScores = await apiClient.get<any[]>(`/api/projects/${projectId}/scores/all`);
          if (allScores) {
            const studentScores = allScores.filter(score => score.studentId === studentId);
            if (studentScores.length > 0) {
              setScores(studentScores.map(score => ({
                id: score.id,
                projectQuestionId: score.projectQuestionId,
                studentId: score.studentId,
                score: score.score,
              })));
              return;
            }
          }
        } catch {
          // If no cached data, show empty scores
          toast.error("You're offline and scores for this student aren't cached");
        }
      } else {
        toast.error("Failed to load student scores");
      }
      
      // Create empty scores if we couldn't get any
      const emptyScores = questions.map(question => ({
        projectQuestionId: question.id,
        studentId,
        score: 0,
      }));
      setScores(emptyScores);
    } finally {
      setLoading(false);
    }
  };

  const saveScores = async () => {
    try {
      setSaving(true);
      // Send only scores with a value greater than 0
      const scoresToSave = scores.filter((score) => score.score > 0);
      
      // Use our apiClient with offline support
      await apiClient.post(`/api/projects/${projectId}/scores/batch`, {
        scores: scoresToSave,
        sessionId,
      }, { offlineEnabled: true });
      
      setUnsavedChanges(false);
      
      if (!isOnline) {
        setOfflineSaved(true);
        toast.success("Scores saved offline. Will sync when back online.");
      } else {
        toast.success("Scores saved successfully");
      }
    } catch (error) {
      console.error("Error saving scores:", error);
      toast.error("Failed to save scores");
    } finally {
      setSaving(false);
    }
  };

  // Debounced save (30 seconds debounce for auto-save)
  const debouncedSave = useRef(
    debounce(() => {
      if (unsavedChanges && selectedStudent) {
        console.log("Auto-saving scores...");
        saveScores();
      }
    }, 30000) // Changed from 60 seconds to 30 seconds
  ).current;

  useEffect(() => {
    if (unsavedChanges) {
      debouncedSave();
    }
    return () => {
      debouncedSave.cancel();
    };
  }, [unsavedChanges, scores, debouncedSave]);

  const handleScoreChange = (questionIndex: number, value: string) => {
    const numValue = parseFloat(value);
    const question = questions[questionIndex];
    if (isNaN(numValue)) return;
    const validScore = Math.max(0, Math.min(numValue, question.maxMarks));
    setScores((prevScores) => {
      const newScores = [...prevScores];
      if (!newScores[questionIndex]) {
        newScores[questionIndex] = {
          projectQuestionId: question.id,
          studentId: selectedStudent ? selectedStudent.id : "",
          score: validScore,
        };
      } else {
        newScores[questionIndex] = {
          ...newScores[questionIndex],
          score: validScore,
        };
      }
      return newScores;
    });
    setUnsavedChanges(true);
  };

  const handleSelectStudent = (student: Student) => {
    if (unsavedChanges && selectedStudent) {
      saveScores();
    }
    setSelectedStudent(student);
    fetchScoresForStudent(student.id);
    setSearchTerm("");
    setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 100);
  };

  const handleKeyDown = (
    e: ReactKeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.ctrlKey && e.key === "s") {
      e.preventDefault();
      saveScores();
      return;
    }
    switch (e.key) {
      case "ArrowUp":
        e.preventDefault();
        if (index > 0) inputRefs.current[index - 1]?.focus();
        break;
      case "ArrowDown":
        e.preventDefault();
        if (index < questions.length - 1) inputRefs.current[index + 1]?.focus();
        break;
      case "Enter":
        e.preventDefault();
        if (index < questions.length - 1) {
          inputRefs.current[index + 1]?.focus();
        } else {
          saveScores();
          setSelectedStudent(null);
          searchInputRef.current?.focus();
        }
        break;
    }
  };

  const handleSearchKeyDown = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown" && filteredStudents.length > 0) {
      e.preventDefault();
      const firstResult = document.querySelector(".student-search-result");
      if (firstResult) (firstResult as HTMLElement).focus();
    }
    if (e.key === "Enter" && filteredStudents.length > 0) {
      e.preventDefault();
      handleSelectStudent(filteredStudents[0]);
    }
  };

  useEffect(() => {
    if (searchTerm) {
      const filtered = students.filter(
        (student) =>
          student.rollNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredStudents(filtered);
    } else {
      setFilteredStudents([]);
    }
  }, [searchTerm, students]);

  useEffect(() => {
    if (questions.length > 0) {
      const max = questions.reduce((sum, q) => sum + q.maxMarks, 0);
      setTotalMaxScore(max);
    }
  }, [questions]);

  useEffect(() => {
    if (scores.length > 0) {
      const total = scores.reduce((sum, s) => sum + s.score, 0);
      setTotalScore(total);
    } else {
      setTotalScore(0);
    }
  }, [scores]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
      <div className="bg-black p-6 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Fast Marks Entry</h2>
          <button
            onClick={() => {
              if (unsavedChanges) {
                if (
                  window.confirm(
                    "You have unsaved changes. Save before closing?"
                  )
                ) {
                  saveScores().then(() => onClose());
                } else {
                  onClose();
                }
              } else {
                onClose();
              }
            }}
            className="text-white hover:text-gray-300"
          >
            ✕
          </button>
        </div>
        <div className="mb-4">
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search student by roll number or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            className="w-full p-2 border border-gray-300 rounded"
          />
          {filteredStudents.length > 0 && !selectedStudent && (
            <div className="mt-2 bg-black border border-gray-800 rounded max-h-60 overflow-y-auto">
              {filteredStudents.map((student) => (
                <button
                  key={student.id}
                  onClick={() => handleSelectStudent(student)}
                  className="student-search-result w-full text-left p-2 hover:bg-gray-500 focus:bg-gray-100 focus:outline-none text-white"
                >
                  <span className="font-bold">{student.rollNo}</span> -{" "}
                  {student.name}
                </button>
              ))}
            </div>
          )}
        </div>
        {selectedStudent && (
          <div className="mb-4 p-4 bg-gray-900 rounded">
            <h3 className="text-lg font-semibold text-white">
              {selectedStudent.rollNo} - {selectedStudent.name}
            </h3>
            {selectedStudent.section && (
              <p className="text-sm text-gray-300">
                Section: {selectedStudent.section}
              </p>
            )}
          </div>
        )}
        {selectedStudent && questions.length > 0 && (
          <div>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-black">
                <thead>
                  <tr className="bg-gray-600 text-white">
                    <th className="py-2 px-4 text-left">Question</th>
                    <th className="py-2 px-4 text-left">Max Marks</th>
                    <th className="py-2 px-4 text-left">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {questions.map((question, index) => (
                    <tr
                      key={question.id}
                      className="border-b border-gray-700 hover:bg-gray-700"
                    >
                      <td className="py-2 px-4 text-white">
                        {question.questionNum}
                        {question.description && (
                          <span className="text-sm text-gray-400 ml-2">
                            {question.description}
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-4 text-white">
                        {question.maxMarks}
                      </td>
                      <td className="py-2 px-4">
                        <input
                          ref={(el) => (inputRefs.current[index] = el)}
                          type="number"
                          min="0"
                          max={question.maxMarks}
                          value={scores[index]?.score || ""}
                          onChange={(e) =>
                            handleScoreChange(index, e.target.value)
                          }
                          onKeyDown={(e) => handleKeyDown(e, index)}
                          className="w-16 p-1 border border-gray-800 rounded text-center"
                        />
                        {scores[index]?.score > question.maxMarks && (
                          <span className="text-red-500 ml-2">Exceeds max</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-800 font-bold text-white">
                    <td className="py-2 px-4">Total</td>
                    <td className="py-2 px-4">{totalMaxScore}</td>
                    <td className="py-2 px-4">{totalScore}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
            <div className="flex justify-between items-center mt-4">
              <div>
                {unsavedChanges && (
                  <span className="text-amber-500">Unsaved changes</span>
                )}
                {saving && (
                  <span className="text-blue-500 ml-2">Saving...</span>
                )}
              </div>
              <button
                onClick={saveScores}
                disabled={saving || !unsavedChanges}
                className={`px-4 py-2 rounded ${
                  saving || !unsavedChanges
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                } text-white`}
              >
                Save Scores
              </button>
            </div>
          </div>
        )}
        <div className="mt-6 text-sm text-gray-400">
          <p className="font-medium mb-1">Keyboard shortcuts:</p>
          <ul className="list-disc pl-5">
            <li>Tab / Shift+Tab: Navigate between fields</li>
            <li>↑ / ↓: Navigate between rows</li>
            <li>Enter: Move to next field</li>
            <li>Ctrl+S: Save scores</li>
            <li>/ : Focus search</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FastMarksEntry;
