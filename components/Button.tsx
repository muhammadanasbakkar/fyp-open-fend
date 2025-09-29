import { ButtonHTMLAttributes } from "react";

export default function Button(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  const { className = "", ...rest } = props;
  return (
    <button
      {...rest}
      className={[
        "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold",
        "bg-[var(--brand)] text-white hover:brightness-95 disabled:opacity-50",
        className,
      ].join(" ")}
    />
  );
}