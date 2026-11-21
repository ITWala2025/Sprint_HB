"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getStudentAssignmentsAction } from "@/app/student/(portal)/assignments/actions";

const StudentDataContext = createContext(null);

async function getPendingAssignmentCount() {
  const result = await getStudentAssignmentsAction();
  if (!result.success) return { count: null, error: result.error };

  const submittedIds = new Set(
    result.submissions.map((submission) => submission.assessment_id),
  );
  return {
    count: result.assessments.filter(
      (assessment) => assessment.status === "active" && !submittedIds.has(assessment.id),
    ).length,
    error: null,
  };
}

export function StudentDataProvider({ children }) {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pendingAssignmentCount, setPendingAssignmentCount] = useState(null);

  const refreshPendingAssignmentCount = useCallback(async () => {
    try {
      const result = await getPendingAssignmentCount();
      if (result.error) {
        console.error(
          "[StudentDataProvider] Could not load pending assignments:",
          result.error,
        );
        return;
      }
      setPendingAssignmentCount(result.count);
    } catch (error) {
      console.error(
        "[StudentDataProvider] Could not refresh pending assignments:",
        error,
      );
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    async function fetchStudent() {
      try {
        const supabase = createClient();
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();
        if (authError) throw authError;

        if (!user) {
          if (mounted) {
            setPendingAssignmentCount(null);
            setLoading(false);
          }
          return;
        }

        const [profileResult, studentResult, pendingCountResult] = await Promise.all([
          supabase
            .from("profiles")
            .select("id, full_name, email")
            .eq("id", user.id)
            .maybeSingle(),
          supabase
            .from("students")
            .select("registration_number")
            .eq("id", user.id)
            .maybeSingle(),
          getPendingAssignmentCount(),
        ]);
        const profile = profileResult.data;
        const studentRecord = studentResult.data;

        if (mounted) {
          if (profile) {
            const fullName = profile.full_name || "Student";
            const parts = fullName.trim().split(/\s+/).filter(Boolean);
            const initials =
              parts.length === 0
                ? "S"
                : parts.length === 1
                  ? parts[0].slice(0, 2).toUpperCase()
                  : `${parts[0][0]}${parts[1][0]}`.toUpperCase();

            setStudent({
              id: profile.id,
              fullName,
              initials,
              email: profile.email || "",
              registrationNumber: studentRecord?.registration_number || null,
            });
          } else {
            setStudent({ fullName: "Student", initials: "S", registrationNumber: null });
          }
          if (pendingCountResult.error) {
            console.error(
              "[StudentDataProvider] Could not load pending assignments:",
              pendingCountResult.error,
            );
          } else {
            setPendingAssignmentCount(pendingCountResult.count);
          }
          setLoading(false);
        }
      } catch (error) {
        console.error("[StudentDataProvider] Could not load student data:", error);
        if (mounted) {
          setPendingAssignmentCount(null);
          setStudent({ fullName: "Student", initials: "S", registrationNumber: null });
          setLoading(false);
        }
      }
    }

    fetchStudent();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <StudentDataContext.Provider
      value={{
        student,
        loading,
        pendingAssignmentCount,
        refreshPendingAssignmentCount,
      }}
    >
      {children}
    </StudentDataContext.Provider>
  );
}

export function useStudentData() {
  const context = useContext(StudentDataContext);
  if (!context) {
    throw new Error("useStudentData must be used within a StudentDataProvider");
  }
  return context;
}