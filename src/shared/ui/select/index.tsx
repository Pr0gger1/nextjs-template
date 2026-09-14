import clsx from 'clsx';
import { forwardRef, useId } from 'react';
import type { ComponentProps, ChangeEvent } from 'react';

import css from './index.module.css';

export type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

export type SelectProps = Omit<ComponentProps<'select'>, 'onChange'> & {
  options: Array<string | SelectOption>;
  label?: string;
  helperText?: string;
  error?: boolean;
  fullWidth?: boolean;
  placeholder?: string;
  selectClassName?: string;
  onChange?: (event: ChangeEvent<HTMLSelectElement>) => void;
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      id,
      name,
      label,
      className,
      selectClassName,
      options,
      helperText,
      error = false,
      disabled = false,
      fullWidth = false,
      placeholder,
      required,
      value,
      defaultValue,
      onChange,
      ...rest
    },
    ref,
  ) => {
    const generatedId = useId();
    const selectId = id ?? `${generatedId}-select`;
    const describedById = helperText ? `${selectId}-helper` : undefined;

    const normalizedOptions = options.map((option) => {
      if (typeof option === 'string') {
        return { value: option, label: option, disabled: false };
      }
      return option;
    });

    const hasPlaceholder = Boolean(placeholder);

    return (
      <div
        className={clsx(
          css.root,
          fullWidth && css.fullWidth,
          error && css.error,
          className,
        )}
      >
        {label && (
          <label htmlFor={selectId} className={css.label}>
            {label}
            {required ? <span className={css.requiredMark} aria-hidden>
              *
            </span> : null}
          </label>
        )}

        <div className={css.control}>
          <select
            id={selectId}
            ref={ref}
            name={name}
            className={clsx(css.select, selectClassName)}
            disabled={disabled}
            aria-invalid={error || undefined}
            aria-describedby={describedById}
            aria-required={required || undefined}
            required={required}
            value={value}
            defaultValue={value === undefined ? defaultValue : undefined}
            onChange={onChange}
            {...rest}
          >
            {hasPlaceholder && (
              <option value="" disabled={required}>
                {placeholder}
              </option>
            )}
            {normalizedOptions.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {helperText && (
          <div id={describedById} className={clsx(css.helper, error && css.helperError)}>
            {helperText}
          </div>
        )}
      </div>
    );
  },
);

Select.displayName = 'Select';


