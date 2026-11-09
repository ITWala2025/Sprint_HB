export const CONTACT_PHONE_ERROR =
  "Enter a valid 10-digit Indian mobile number starting with 6 to 9, optionally with the +91 country code.";

export function isValidContactPhone(value) {
  if (typeof value !== "string") {
    return false;
  }

  const phone = value.trim();
  if (!phone || !/^\+?\d[\d\s().-]*\d$/.test(phone)) {
    return false;
  }

  const hasCountryCode = phone.startsWith("+");
  if (hasCountryCode && !phone.startsWith("+91")) {
    return false;
  }

  let inParentheses = false;
  let parenthesesContainDigit = false;

  for (const character of phone) {
    if (character === "(") {
      if (inParentheses) {
        return false;
      }
      inParentheses = true;
      parenthesesContainDigit = false;
    } else if (character === ")") {
      if (!inParentheses || !parenthesesContainDigit) {
        return false;
      }
      inParentheses = false;
    } else if (inParentheses && /\d/.test(character)) {
      parenthesesContainDigit = true;
    }
  }

  if (inParentheses) {
    return false;
  }

  const nationalNumber = hasCountryCode ? phone.slice(3) : phone;
  const digits = nationalNumber.replace(/\D/g, "");
  return /^[6-9]\d{9}$/.test(digits);
}

export function getContactPhoneError(value) {
  if (!value.trim() || isValidContactPhone(value)) {
    return "";
  }

  return CONTACT_PHONE_ERROR;
}
