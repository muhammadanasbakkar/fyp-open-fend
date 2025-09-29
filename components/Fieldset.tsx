export default function Fieldset({
    title,
    items,
    values,
    onToggle,
}: {
    title: string;
    items: string[];
    values: string[];
    onToggle: (v: string) => void;
}) {
    return (
        <div>
            <p className="mb-2 text-sm font-medium text-gray-900">{title}</p>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((label) => {
                    const id = `${title}-${label}`.replace(/\s+/g, "-").toLowerCase();
                    const checked = values.includes(label);
                    return (
                        <label
                            key={label}
                            htmlFor={id}
                            className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm cursor-pointer ${checked ? "border-[var(--brand,#4b7eff)] bg-white" : "border-gray-200 bg-white hover:bg-gray-50"
                                }`}
                        >
                            <input
                                id={id}
                                type="checkbox"
                                checked={checked}
                                onChange={() => onToggle(label)}
                                className="h-4 w-4 rounded border-gray-300"
                            />
                            <span className="truncate">{label}</span>
                        </label>
                    );
                })}
            </div>
        </div>
    );
}
