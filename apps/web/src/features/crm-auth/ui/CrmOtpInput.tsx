import { useEffect, useRef, type ClipboardEvent, type KeyboardEvent } from "react";

type CrmOtpInputProps = {
  value: string;
  disabled?: boolean;
  hasError?: boolean;
  digitLabel?: (index: number) => string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
};

const CELL_COUNT = 6;

export function CrmOtpInput({
  value,
  disabled,
  hasError,
  digitLabel,
  onChange,
  onComplete,
}: CrmOtpInputProps) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const prevLength = useRef(value.length);
  const digits = Array.from({ length: CELL_COUNT }, (_, index) => value[index] ?? "");

  useEffect(() => {
    if (prevLength.current < CELL_COUNT && value.length === CELL_COUNT) {
      onComplete?.(value);
    }
    prevLength.current = value.length;
  }, [onComplete, value]);

  useEffect(() => {
    refs.current[0]?.focus();
  }, []);

  const focusCell = (index: number) => {
    const target = refs.current[Math.max(0, Math.min(index, CELL_COUNT - 1))];
    target?.focus();
    target?.select();
  };

  const updateDigits = (nextDigits: string[]) => {
    onChange(nextDigits.join("").slice(0, CELL_COUNT));
  };

  const handleInput = (index: number, raw: string) => {
    const chunk = raw.replace(/\D/g, "");
    if (!chunk) {
      const next = [...digits];
      next[index] = "";
      updateDigits(next);
      return;
    }

    const next = [...digits];
    let cursor = index;
    for (const char of chunk) {
      if (cursor >= CELL_COUNT) break;
      next[cursor] = char;
      cursor += 1;
    }
    updateDigits(next);
    focusCell(Math.min(cursor, CELL_COUNT - 1));
  };

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      event.preventDefault();
      const next = [...digits];
      next[index - 1] = "";
      updateDigits(next);
      focusCell(index - 1);
      return;
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      focusCell(index - 1);
      return;
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      focusCell(index + 1);
    }
  };

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, CELL_COUNT);
    if (!pasted) return;
    onChange(pasted);
    focusCell(Math.min(pasted.length, CELL_COUNT - 1));
  };

  return (
    <div className={`crm-otp${hasError ? " crm-otp--error" : ""}${value.length === CELL_COUNT ? " crm-otp--complete" : ""}`}>
      {digits.map((digit, index) => (
        <label key={index} className={`crm-otp__cell${digit ? " crm-otp__cell--filled" : ""}`}>
          <input
            ref={(node) => {
              refs.current[index] = node;
            }}
            className="crm-otp__input"
            type="text"
            inputMode="numeric"
            autoComplete={index === 0 ? "one-time-code" : "off"}
            maxLength={CELL_COUNT}
            value={digit}
            disabled={disabled}
            aria-label={digitLabel ? digitLabel(index) : `Digit ${index + 1}`}
            onFocus={(event) => event.currentTarget.select()}
            onChange={(event) => handleInput(index, event.target.value)}
            onKeyDown={(event) => handleKeyDown(index, event)}
            onPaste={handlePaste}
          />
          <span className="crm-otp__glyph" aria-hidden="true">
            {digit || "·"}
          </span>
        </label>
      ))}
    </div>
  );
}
