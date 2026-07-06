"use client";

import { use, useEffect, useState } from "react";
import type { Work } from "@darbha/types";
import { adminApi } from "@/lib/api";
import { useSession } from "../../session";
import { WorkEditor } from "../work-editor";

export default function EditWorkPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { token } = useSession();
  const [work, setWork] = useState<Work | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    adminApi
      .getWork(token, id)
      .then(setWork)
      .catch((e) => setError(e.message));
  }, [token, id]);

  if (error) return <p className="text-red-700">{error}</p>;
  if (!work) return <p className="text-[#7d7468]">Loading&hellip;</p>;

  return (
    <div>
      <h1 className="font-[family-name:var(--font-serif)] text-3xl">Edit work</h1>
      <div className="mt-8 rounded-2xl bg-white p-8 shadow-sm">
        <WorkEditor work={work} />
      </div>
    </div>
  );
}
