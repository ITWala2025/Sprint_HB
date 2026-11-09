"use client";

import { useEffect, useRef, useState } from "react";
import { getContactPhoneError } from "@/lib/contact-phone";

export default function ContactPhoneField({
  id,
  label,
  placeholder,
  value,
  onChange,
}) {
  const inputRef = useRef(null);
  const [touched, setTouched] = useState(false);
  const error = getContactPhoneError(value);
  const errorId = `${id}-error`;

  useEffect(() => {
    inputRef.current?.setCustomValidity(error);
  }, [error]);

  const handleChange = (event) => {
    event.currentTarget.setCustomValidity(
      getContactPhoneError(event.currentTarget.value),
    );
    onChange(event);
  };

  return (
    <>
      <label htmlFor={id}>
        {label} <span aria-hidden="true">*</span>
      </label>
      <input
        ref={inputRef}
        id={id}
        name="phone"
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        onBlur={() => setTouched(true)}
        onInvalid={() => setTouched(true)}
        aria-invalid={touched && error ? "true" : undefined}
        aria-describedby={touched && error ? errorId : undefined}
        required
      />
      {touched && error ? (
        <p id={errorId} className="mt-1 text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}
    </>
  );
}
