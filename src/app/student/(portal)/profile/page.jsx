"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import StudentCard from "@/components/student/StudentCard";
import AuthButton from "@/components/student/auth/AuthButton";
import AuthField from "@/components/student/auth/AuthField";

export default function StudentProfilePage() {
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");
  const savingRef = useRef(false);

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const { data } = await supabase
        .from("profiles")
        .select("full_name, email, phone")
        .eq("id", user.id)
        .maybeSingle();
      setProfile(data);
      setForm(data ?? {});
      setLoading(false);
    })();
  }, []);

  const save = async () => {
    if (savingRef.current) return;

    const urlFields = ["github", "linkedin", "leetcode"];
    for (const f of urlFields) {
      const v = form[f];
      if (v && !/^https?:\/\//.test(v)) {
        alert(`${f} must be a valid URL starting with http:// or https://`);
        return;
      }
    }

    savingRef.current = true;
    setSaving(true);
    setSaveError("");
    setSaveSuccess("");

    try {
      const supabase = createClient();
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) throw new Error("Profile could not be saved.");

      const { error } = await supabase
        .from("profiles")
        .update(form)
        .eq("id", user.id);
      if (error) throw error;

      setProfile(form);
      setEditing(false);
      setSaveSuccess("Your changes were saved.");
    } catch {
      setSaveError("Could not save your changes. Please try again.");
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  if (loading) return <p className="text-sm text-brand-text-secondary">Loading profile…</p>;
  if (!profile) return <p className="text-sm text-brand-text-secondary">No profile found.</p>;

  const personal = [
    ["Full Name", profile.full_name],
    ["Email", profile.email],
    ["Mobile Number", profile.phone],
    ["College/University", profile.college],
  ];
  const education = [
    ["Degree", profile.degree],
    ["Semester/Year", profile.semester],
  ];
  const social = [
    ["GitHub", profile.github],
    ["LinkedIn", profile.linkedin],
    ["LeetCode", profile.leetcode],
  ];

  if (editing) {
    return (
      <StudentCard title="Edit Profile" description="Update your education and social details.">
        <div className="space-y-4">
          <AuthField id="college" label="College/University" value={form.college ?? ""} onChange={(e) => setForm({ ...form, college: e.target.value })} />
          <AuthField id="degree" label="Degree" value={form.degree ?? ""} onChange={(e) => setForm({ ...form, degree: e.target.value })} />
          <AuthField id="semester" label="Semester/Year" value={form.semester ?? ""} onChange={(e) => setForm({ ...form, semester: e.target.value })} />
          <AuthField id="github" label="GitHub URL" value={form.github ?? ""} onChange={(e) => setForm({ ...form, github: e.target.value })} />
          <AuthField id="linkedin" label="LinkedIn URL" value={form.linkedin ?? ""} onChange={(e) => setForm({ ...form, linkedin: e.target.value })} />
          <AuthField id="leetcode" label="LeetCode URL" value={form.leetcode ?? ""} onChange={(e) => setForm({ ...form, leetcode: e.target.value })} />
          {saveError ? (
            <p role="alert" className="text-sm font-medium text-brand-red">
              {saveError}
            </p>
          ) : null}
          <div className="flex gap-3">
            <AuthButton loading={saving} loadingLabel="Saving…" onClick={save}>Save</AuthButton>
            <AuthButton
              type="button"
              variant="secondary"
              disabled={saving}
              onClick={() => {
                setForm(profile);
                setSaveError("");
                setEditing(false);
              }}
            >
              Cancel
            </AuthButton>
          </div>
        </div>
      </StudentCard>
    );
  }

  const renderSection = (title, rows) => (
    <StudentCard title={title}>
      <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {rows.map(([label, value]) => (
          <div key={label}>
            <dt className="text-xs font-medium text-brand-text-muted">{label}</dt>
            <dd className="text-sm font-semibold text-brand-navy">{value || "—"}</dd>
          </div>
        ))}
      </dl>
    </StudentCard>
  );

  return (
    <div className="flex flex-col gap-5">
      {saveSuccess ? (
        <p role="status" className="text-sm font-medium text-brand-success">
          {saveSuccess}
        </p>
      ) : null}
      {renderSection("Personal Details", personal)}
      {renderSection("Education Details", education)}
      {renderSection("Social Accounts", social)}
      <AuthButton
        onClick={() => {
          setForm(profile);
          setSaveError("");
          setSaveSuccess("");
          setEditing(true);
        }}
      >
        Edit Profile
      </AuthButton>
    </div>
  );
}