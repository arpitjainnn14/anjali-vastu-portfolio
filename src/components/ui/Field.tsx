'use client';

import { AlertIcon } from '@/components/ui/Icons';

/**
 * Form field. Section 5 and 6.
 *
 * Ruled fields, not boxes: each control is a line you write on, the way a
 * printed form is ruled. Six outlined rectangles stacked in an outlined card
 * is the most boxed-in shape on a page, and it made the friendliest part of
 * the site look like a tax return.
 *
 * Text stays 16px — below that iOS Safari zooms the viewport on focus.
 * Focus thickens the rule to a 2px ink line and warms the field behind it,
 * so the line you are writing on is obvious on a phone; the keyboard outline
 * is the global one.
 * Errors are sindoor, with `aria-invalid` and an icon, so colour never
 * carries the meaning alone.
 *
 * Every field gets a real <label>. A placeholder is never a label.
 */

const CONTROL =
  'ruled-field w-full rounded-none border-0 border-b bg-transparent px-0 text-[16px] text-ink ' +
  'transition-[border-color,box-shadow,background-color] duration-[160ms] ease-out ' +
  'placeholder:text-muted/70 focus:bg-paper/50 ' +
  'disabled:opacity-60 disabled:cursor-not-allowed';

function border(error?: string) {
  return error
    ? 'border-sindoor shadow-[inset_0_-1px_0_0_var(--color-sindoor)]'
    : 'border-line-strong hover:border-muted focus:border-ink focus:shadow-[inset_0_-1px_0_0_var(--color-ink)]';
}

function Label({
  htmlFor,
  children,
  optional,
}: {
  htmlFor: string;
  children: React.ReactNode;
  /** The "optional" tag, from content. Absent on required fields. */
  optional?: string;
}) {
  return (
    <label htmlFor={htmlFor} className="t-small font-medium text-ink">
      {children}
      {optional && <span className="font-normal text-muted"> · {optional}</span>}
    </label>
  );
}

/** Help under a field. Hidden while an error is showing, which says more. */
function Hint({ id, text }: { id: string; text: string }) {
  return (
    <span id={id} className="t-caption text-muted">
      {text}
    </span>
  );
}

function describedBy(id: string, error?: string, hint?: string) {
  if (error) return `${id}-error`;
  if (hint) return `${id}-hint`;
  return undefined;
}

function FieldError({ id, message }: { id: string; message: string }) {
  return (
    <span id={id} className="flex items-center gap-2 t-small text-sindoor">
      <AlertIcon size={15} />
      {message}
    </span>
  );
}

type Common = {
  id: string;
  name: string;
  label: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  /** Shown after the label on fields that can be left empty. */
  optional?: string;
  hint?: string;
};

export function TextField({
  id,
  name,
  label,
  error,
  required,
  disabled,
  optional,
  hint,
  type = 'text',
  inputMode,
  autoComplete,
  defaultValue,
}: Common & {
  type?: string;
  inputMode?: 'tel' | 'email' | 'text';
  autoComplete?: string;
  defaultValue?: string;
}) {
  const errorId = `${id}-error`;
  return (
    <div className="flex flex-col gap-2" data-form-field>
      <Label htmlFor={id} optional={optional}>{label}</Label>
      <input
        id={id}
        name={name}
        type={type}
        inputMode={inputMode}
        autoComplete={autoComplete}
        defaultValue={defaultValue}
        required={required}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, error, hint)}
        className={`h-12 ${CONTROL} ${border(error)}`}
      />
      {error ? <FieldError id={errorId} message={error} /> : hint && <Hint id={`${id}-hint`} text={hint} />}
    </div>
  );
}

export function SelectField({
  id,
  name,
  label,
  error,
  required,
  disabled,
  optional,
  options,
  placeholder,
  defaultValue = '',
}: Common & {
  options: readonly string[];
  /** A first, unselectable line ("Choose one") so nothing is pre-chosen for the visitor. */
  placeholder: string;
  defaultValue?: string;
}) {
  const errorId = `${id}-error`;
  return (
    <div className="flex flex-col gap-2" data-form-field>
      <Label htmlFor={id} optional={optional}>{label}</Label>
      <select
        id={id}
        name={name}
        defaultValue={defaultValue}
        required={required}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={`h-12 appearance-none pr-6 ${CONTROL} ${border(error)} [&:has(option[value='']:checked)]:text-muted`}
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%236C6053' stroke-width='2' stroke-linecap='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")",
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 2px center',
        }}
      >
        <option value="" disabled className="bg-card">
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option} value={option} className="bg-card text-ink">
            {option}
          </option>
        ))}
      </select>
      {error && <FieldError id={errorId} message={error} />}
    </div>
  );
}

export function TextAreaField({
  id,
  name,
  label,
  error,
  required,
  disabled,
  optional,
  hint,
  rows = 4,
  defaultValue,
}: Common & { rows?: number; defaultValue?: string }) {
  const errorId = `${id}-error`;
  return (
    <div className="flex flex-col gap-2" data-form-field>
      <Label htmlFor={id} optional={optional}>{label}</Label>
      <textarea
        id={id}
        name={name}
        rows={rows}
        defaultValue={defaultValue}
        required={required}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, error, hint)}
        className={`field-sizing-content max-h-[22rem] min-h-[7.5rem] resize-none py-2.5 leading-[1.55] ${CONTROL} ${border(error)}`}
      />
      {error ? <FieldError id={errorId} message={error} /> : hint && <Hint id={`${id}-hint`} text={hint} />}
    </div>
  );
}

/**
 * The honeypot. Visually offscreen, never `display: none` — some bots check
 * for that and skip the field. tabindex -1 and autocomplete off keep it away
 * from real people and from password managers.
 */
export function Honeypot({ id, name, label }: { id: string; name: string; label: string }) {
  return (
    <div aria-hidden="true" className="visually-offscreen">
      <label htmlFor={id}>{label}</label>
      <input id={id} name={name} type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
    </div>
  );
}

export function CheckboxField({
  id,
  name,
  error,
  required,
  disabled,
  defaultChecked,
  children,
  aside,
}: Omit<Common, 'label'> & {
  defaultChecked?: boolean;
  children: React.ReactNode;
  /**
   * Anything interactive that belongs beside the consent text — the privacy
   * link. It sits outside the <label> deliberately: a nested <a> also toggles
   * the checkbox in some browsers, and inline it cannot reach a 44px target.
   */
  aside?: React.ReactNode;
}) {
  const errorId = `${id}-error`;
  return (
    <div className="flex flex-col gap-2" data-form-field>
      <label
        htmlFor={id}
        className="flex cursor-pointer items-start gap-3 t-small text-body"
      >
        <input
          id={id}
          name={name}
          type="checkbox"
          required={required}
          disabled={disabled}
          defaultChecked={defaultChecked}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={
            'mt-0.5 h-5 w-5 shrink-0 cursor-pointer appearance-none rounded-[3px] border bg-card ' +
            'bg-center bg-no-repeat transition-colors duration-[160ms] ' +
            'form-check checked:border-sindoor checked:bg-sindoor ' +
            'disabled:cursor-not-allowed disabled:opacity-60 ' +
            (error ? 'border-sindoor' : 'border-muted hover:border-ink')
          }
        />
        <span>{children}</span>
      </label>
      {aside && <div className="pl-8">{aside}</div>}
      {error && <FieldError id={errorId} message={error} />}
    </div>
  );
}
