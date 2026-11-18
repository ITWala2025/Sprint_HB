"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const StudentDataContext = createContext(null);

export function StudentDataProvider({ children }) {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function fetchStudent() {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          if (mounted) setLoading(false);
          return;
        }

        const [{ data: profile }, { data: studentRecord }] = await Promise.all([
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
        ]);

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
          setLoading(false);
        }
      } catch {
        if (mounted) {
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
    <StudentDataContext.Provider value={{ student, loading }}>
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