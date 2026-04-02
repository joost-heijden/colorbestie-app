"use client";

import { useState } from "react";

const SKILLS = ["beginner", "learning", "experienced", "pro"] as const;

export default function DebugSkillPage() {
  const [email, setEmail] = useState("");
  const [skill, setSkill] = useState<(typeof SKILLS)[number]>("beginner");
  const [status, setStatus] = useState<string>("");

  const load = async () => {
    try {
      setStatus("Laden...");
      const res = await fetch(`/api/debug/skill?email=${encodeURIComponent(email)}`, { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus(`Fout: ${data?.error || `HTTP ${res.status}`}`);
        return;
      }
      setSkill((data?.user?.skillLevel as (typeof SKILLS)[number]) || "beginner");
      setStatus(data?.user ? `Gevonden: ${data.user.email} (${data.user.skillLevel || "null"})` : "User niet gevonden");
    } catch (error) {
      setStatus(`Fout: ${error instanceof Error ? error.message : "network"}`);
    }
  };

  const save = async () => {
    try {
      setStatus("Opslaan...");
      const res = await fetch("/api/debug/skill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, skillLevel: skill }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus(`Fout: ${data?.error || `HTTP ${res.status}`}`);
        return;
      }
      setStatus(`Opgeslagen: ${data.user.email} -> ${data.user.skillLevel}`);
    } catch (error) {
      setStatus(`Fout: ${error instanceof Error ? error.message : "network"}`);
    }
  };

  return (
    <main className="mx-auto max-w-xl p-6">
      <h1 className="text-2xl font-bold">Debug Skill Level (staging)</h1>
      <p className="mt-2 text-sm text-gray-600">Tijdelijke testpagina zonder OAuth voor skill-level debug.</p>

      <div className="mt-6 space-y-3">
        <input
          className="w-full rounded border p-2"
          placeholder="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <select className="w-full rounded border p-2" value={skill} onChange={(e) => setSkill(e.target.value as (typeof SKILLS)[number])}>
          {SKILLS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <div className="flex gap-2">
          <button className="rounded bg-gray-200 px-3 py-2" onClick={load}>
            Load
          </button>
          <button className="rounded bg-pink-400 px-3 py-2 text-white" onClick={save}>
            Save
          </button>
        </div>

        <p className="text-sm">{status}</p>
      </div>
    </main>
  );
}
