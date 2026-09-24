"use client";
import { useEffect, useId, useRef, useState } from "react";
import { CircleHelp } from "lucide-react";
import { getUiTerm, type UiTermKey } from "@/lib/assist/registry";
import { useAssist } from "./AssistProvider";

type Props = { term?: UiTermKey; korean?: string; vietnamese?: string; description?: string; className?: string };

/**
 * Hiển thị thuật ngữ giao diện kèm giải thích tiếng Việt khi người học cần.
 * Nhãn trợ năng dùng tiếng Việt; tiếng Hàn ở đây là nội dung học song ngữ.
 */
export function KoreanAssist({ term, korean, vietnamese, description, className = "" }: Props) {
  const { mode, record } = useAssist();
  const entry = term ? getUiTerm(term) : undefined;
  const ko = korean ?? entry?.ko ?? term ?? "";
  const vi = vietnamese ?? entry?.vi;
  const detail = description ?? entry?.description;
  const [open, setOpen] = useState(false);
  const id = useId();
  const root = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [open]);

  if (mode === "off" || !vi) return <span className={className}>{ko}</span>;
  if (mode === "always")
    return (
      <span className={`assist-always ${className}`}>
        <span>{ko}</span>
        <span className="assist-vi" lang="vi" aria-hidden="true">
          {vi}
        </span>
      </span>
    );

  const show = () => {
    setOpen(true);
    if (term) record(term);
  };
  const toggle = (event: React.SyntheticEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setOpen((value) => {
      if (!value && term) record(term);
      return !value;
    });
  };

  return (
    <span
      className={`assist-wrap ${className}`}
      ref={root}
      onMouseEnter={show}
      onMouseLeave={() => setOpen(false)}
      onFocus={show}
      onBlur={(event) => {
        if (!root.current?.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      <span>{ko}</span>
      <span
        role="button"
        tabIndex={0}
        className="assist-trigger"
        aria-label={`Xem giải thích tiếng Việt cho “${ko}”`}
        aria-expanded={open}
        aria-controls={id}
        onClick={toggle}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") toggle(event);
        }}
      >
        <CircleHelp size={13} />
      </span>
      {open && (
        <span role="tooltip" id={id} className="assist-popover">
          <strong lang="vi">{vi}</strong>
          {detail && <small lang="vi">{detail}</small>}
        </span>
      )}
    </span>
  );
}
