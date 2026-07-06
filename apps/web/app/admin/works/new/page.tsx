"use client";

import { WorkEditor } from "../work-editor";

export default function NewWorkPage() {
  return (
    <div>
      <h1 className="font-[family-name:var(--font-serif)] text-3xl">New work</h1>
      <div className="mt-8 rounded-2xl bg-white p-8 shadow-sm">
        <WorkEditor />
      </div>
    </div>
  );
}
