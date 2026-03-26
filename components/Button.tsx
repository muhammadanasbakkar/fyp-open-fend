import { ButtonHTMLAttributes } from "react";

export default function Button(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  const { className = "", ...rest } = props;
  return (
    <button
      {...rest}
      className={[
        "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold text-white",
        "bg-gradient-to-r from-[#4b7eff] to-[#6aa7ff] shadow-sm",
        "hover:brightness-105 active:brightness-95 disabled:opacity-50 disabled:cursor-not-allowed",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4b7eff] focus-visible:ring-offset-2",
        "transition-all",
        className,
      ].join(" ")}
    />
  );
}