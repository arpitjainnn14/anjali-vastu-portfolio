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
 * Focus darkens the rule to ink; the keyboard outline is the global one.
 * Errors are sindoor, with `aria-invalid` and an icon, so colour never
 * carries the meaning alone.
 *
 * Every field gets a real <label>. A placeholder is never a label.
 */

const CONTROL =
  'w-full rounded-none border-0 border-b bg-transparent px-0 text-[16px] text-ink ' +
  'transition-colors duration-[160ms] ease-out ' +
  'placeholder:text-muted hover:border-muted focus:border-ink ' +
  'disabled:opacity-60 disabled:cursor-not-allowed';

function border(error?: string) {
  return error ? 'border-sindoor' : 'border-line-strong hover:border-muted';
}

function Label({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label
      htmlFor={htmlFor}
      className="t-caption text-muted"
    >
      {children}
    </label>
  );
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
};

export function TextField({
  id,
  name,
  label,
  error,
  required,
  disabled,
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
      <Label htmlFor={id}>{label}</Label>
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
        aria-describedby={error ? errorId : undefined}
        className={`h-11 ${CONTROL} ${border(error)}`}
      />
      {error && <FieldError id={errorId} message={error} />}
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
  options,
  defaultValue,
}: Common & { options: readonly string[]; defaultValue?: string }) {
  const errorId = `${id}-error`;
  return (
    <div className="flex flex-col gap-2" data-form-field>
      <Label htmlFor={id}>{label}</Label>
      <select
        id={id}
        name={name}
        defaultValue={defaultValue}
        required={required}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={`h-11 appearance-none ${CONTROL} ${border(error)}`}
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%236C6053' stroke-width='2' stroke-linecap='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")",
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 2px center',
        }}
      >
        {options.map((option) => (
          <option key={option} value={option} className="bg-card">
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
  rows = 4,
  defaultValue,
}: Common & { rows?: number; defaultValue?: string }) {
  const errorId = `${id}-error`;
  return (
    <div className="flex flex-col gap-2" data-form-field>
      <Label htmlFor={id}>{label}</Label>
      <textarea
        id={id}
        name={name}
        rows={rows}
        defaultValue={defaultValue}
        required={required}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={`resize-y py-2 leading-[1.55] ${CONTROL} ${border(error)}`}
      />
      {error && <FieldError id={errorId} message={error} />}
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
          className="mt-0.5 h-5 w-5 shrink-0 accent-sindoor"
        />
        <span>{children}</span>
      </label>
      {aside && <div className="pl-8">{aside}</div>}
      {error && <FieldError id={errorId} message={error} />}
    </div>
  );
}
