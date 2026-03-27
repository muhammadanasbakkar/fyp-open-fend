import Swal, { SweetAlertIcon } from "sweetalert2";

// ── Brand palette ──────────────────────────────────────────────────────────
const C = {
  blue:    "#4b7eff",
  violet:  "#7c3aed",
  emerald: "#10b981",
  red:     "#ef4444",
  amber:   "#f59e0b",
  gray:    "#6b7280",
};

const confirmColorByIcon: Record<string, string> = {
  success:  C.emerald,
  error:    C.red,
  warning:  C.amber,
  info:     C.blue,
  question: C.violet,
};

// ── Shared base config ─────────────────────────────────────────────────────
const base = {
  background: "#ffffff",
  color: "#111827",
  confirmButtonColor: C.blue,
  denyButtonColor: "#e5e7eb",
  buttonsStyling: true,
  customClass: {
    popup:
      "!rounded-2xl !shadow-2xl !border !border-gray-100 !font-sans !p-0 !overflow-hidden",
    header: "!pt-7 !pb-0 !px-7",
    title: "!text-lg !font-semibold !text-gray-900 !pt-2",
    htmlContainer: "!text-sm !text-gray-500 !mt-2 !px-7 !pb-0",
    actions: "!px-7 !pb-7 !pt-5 !gap-2",
    confirmButton:
      "!rounded-xl !px-5 !py-2.5 !text-sm !font-semibold !text-white !shadow-sm !transition-all hover:!brightness-105",
    denyButton:
      "!rounded-xl !px-5 !py-2.5 !text-sm !font-semibold !text-gray-700 !bg-gray-100 hover:!bg-gray-200 !transition-all",
    cancelButton:
      "!rounded-xl !px-5 !py-2.5 !text-sm !font-semibold !text-gray-700 !bg-gray-100 hover:!bg-gray-200 !transition-all",
  },
};

// ── Types ──────────────────────────────────────────────────────────────────
interface MySwalOptions {
  icon?: SweetAlertIcon;
  title: string;
  text?: string;
  showDenyBtn?: boolean;
  showConfirmButton?: boolean;
  confirmButtonText?: string;
  denyButtonText?: string;
  onConfirm?: () => void;
  onDeny?: () => void;
}

// ── Main dialog ────────────────────────────────────────────────────────────
const MySwal = ({
  icon = "info",
  title,
  text,
  showDenyBtn = false,
  showConfirmButton = true,
  confirmButtonText = "OK",
  denyButtonText = "Cancel",
  onConfirm,
  onDeny,
}: MySwalOptions) =>
  Swal.fire({
    ...base,
    icon,
    title,
    text,
    confirmButtonColor: confirmColorByIcon[icon] ?? C.blue,
    showDenyButton: showDenyBtn,
    showConfirmButton,
    confirmButtonText,
    denyButtonText,
    showCloseButton: true,
  }).then((result) => {
    if (result.isConfirmed) onConfirm?.();
    if (result.isDenied) onDeny?.();
  });

// ── Toast (non-blocking, top-right, auto-dismisses) ───────────────────────
export const toast = (icon: SweetAlertIcon, title: string, timer = 3500) =>
  Swal.fire({
    icon,
    title,
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer,
    timerProgressBar: true,
    background: "#ffffff",
    color: "#111827",
    customClass: {
      popup:
        "!rounded-2xl !shadow-xl !border !border-gray-100 !font-sans !text-sm",
      timerProgressBar: "!bg-[#4b7eff]",
    },
  });

// ── Shorthand helpers ─────────────────────────────────────────────────────
export const alertSuccess = (title: string, text?: string) =>
  MySwal({ icon: "success", title, text });

export const alertError = (title: string, text?: string) =>
  MySwal({ icon: "error", title, text });

export const alertWarning = (title: string, text?: string) =>
  MySwal({ icon: "warning", title, text });

export const alertInfo = (title: string, text?: string) =>
  MySwal({ icon: "info", title, text });

// ── Confirm dialog (question icon, Confirm + Cancel) ─────────────────────
export const confirmDialog = (
  title: string,
  text: string,
  onConfirm: () => void,
  confirmButtonText = "Confirm"
) =>
  MySwal({
    icon: "question",
    title,
    text,
    showDenyBtn: true,
    confirmButtonText,
    denyButtonText: "Cancel",
    onConfirm,
  });

export default MySwal;
