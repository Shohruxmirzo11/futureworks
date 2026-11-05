"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function PasswordInput({
  value,
  onChange,
  placeholder,
  autoComplete,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
}) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required
        className="w-full rounded-xl border border-line bg-panel px-4 py-3 pr-12 text-snow outline-none transition placeholder:text-mist/60 focus:border-team focus:shadow-[0_0_0_3px_rgba(0,213,255,0.18)]"
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        aria-label={show ? "Parolni yashirish" : "Parolni ko’rsatish"}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-mist transition hover:text-snow"
      >
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}
