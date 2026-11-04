"use client";

import { useState } from "react";

const toText = (n: number) => (Number.isFinite(n) && n !== 0 ? String(n).replace(".", ",") : "");
const toNum = (t: string) => {
  const n = parseFloat(t.replace(",", "."));
  return Number.isFinite(n) ? n : 0;
};

/**
 * Campo numérico que aceita vírgula (ou ponto), pode ficar vazio e não deixa zero à esquerda.
 * `value` 0 = vazio.
 */
export function NumField({
  value,
  onChange,
  label,
  className,
  placeholder,
  max = 99999,
}: {
  value: number;
  onChange: (n: number) => void;
  label: string;
  className?: string;
  placeholder?: string;
  max?: number;
}) {
  const [text, setText] = useState(toText(value));
  const [prev, setPrev] = useState(value);
  // se o valor mudou por fora (ex.: trocar de modelo), o texto acompanha
  if (prev !== value && toNum(text) !== value) {
    setPrev(value);
    setText(toText(value));
  } else if (prev !== value) setPrev(value);

  return (
    <input
      type="text"
      inputMode="decimal"
      aria-label={label}
      className={className}
      placeholder={placeholder ?? "0"}
      value={text}
      onFocus={(e) => e.currentTarget.select()}
      onChange={(e) => {
        let t = e.target.value.replace(/\./g, ",").replace(/[^0-9,]/g, "");
        const first = t.indexOf(",");
        if (first >= 0) t = t.slice(0, first + 1) + t.slice(first + 1).replace(/,/g, "");
        t = t.replace(/^0+(?=\d)/, ""); // "010" -> "10"
        if (first === 0) t = "0" + t; // ",5" -> "0,5"
        const decimals = t.split(",")[1];
        if (decimals && decimals.length > 2) t = t.slice(0, t.indexOf(",") + 3);
        let n = toNum(t);
        if (n > max) {
          n = max;
          t = toText(max);
        }
        setText(t);
        setPrev(n);
        onChange(n);
      }}
      onBlur={() => setText(toText(toNum(text)))}
    />
  );
}
