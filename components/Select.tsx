import { SelectHTMLAttributes } from "react";
export default function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  const { className = "", children, ...rest } = props;
  return (
    <select
      {...rest}
      className={`w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#4b7eff] focus:border-[#4b7eff] disabled:opacity-50 ${className}`}
    >
      {children}
    </select>
  );
}
