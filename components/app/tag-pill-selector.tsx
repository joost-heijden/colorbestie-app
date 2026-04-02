import { cn } from "@/lib/utils";

type BaseProps = {
  label: string;
  options: string[];
  className?: string;
};

type SingleProps = BaseProps & {
  value: string;
  onChange: (value: string) => void;
  values?: never;
  onToggle?: never;
  maxSelected?: never;
  onClear?: never;
};

type MultiProps = BaseProps & {
  values: string[];
  onToggle: (value: string) => void;
  maxSelected?: number;
  onClear?: () => void;
  value?: never;
  onChange?: never;
};

type TagPillSelectorProps = SingleProps | MultiProps;

function isMultiProps(props: TagPillSelectorProps): props is MultiProps {
  return "values" in props;
}

export function TagPillSelector(props: TagPillSelectorProps) {
  const multi = isMultiProps(props) ? props : null;
  const selectedCount = multi ? multi.values.length : 1;

  return (
    <div className={cn("space-y-1", props.className)}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)]">{props.label}</p>
        {multi ? (
          <div className="flex items-center gap-2 text-[10px] text-[var(--muted)]">
            <span>{selectedCount} selected</span>
            <button type="button" onClick={props.onClear} className="underline underline-offset-2">
              Clear
            </button>
          </div>
        ) : null}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {props.options.map((option) => {
          const active = multi ? multi.values.includes(option) : option === props.value;
          const blocked = !!multi && !active && (multi.values.length >= (multi.maxSelected ?? 3));
          return (
            <button
              key={option}
              type="button"
              onClick={() => {
                if (multi) multi.onToggle(option);
                else (props as SingleProps).onChange(option);
              }}
              disabled={blocked}
              className={cn(
                "rounded-full border px-2.5 py-1 text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-50",
                active
                  ? "border-[var(--accent)] bg-[var(--accent-weak)] text-[var(--text)]"
                  : "border-[var(--border)] bg-white text-[var(--muted)] hover:bg-[var(--surface-2)]"
              )}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}
