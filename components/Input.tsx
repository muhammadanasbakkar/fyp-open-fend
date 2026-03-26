import { InputHTMLAttributes } from "react";
export default function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  const { className = "", ...rest } = props;
  return (
    <input
      {...rest}
      className={`w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#4b7eff] focus:border-[#4b7eff] disabled:opacity-50 ${className}`}
    />
  );
}
