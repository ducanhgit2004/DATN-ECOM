export const normalizePhone = (value) => {
  const digits = String(value ?? "").replace(/\D/g, "");
  return digits ? `+${digits}` : "";
};

export const isValidPhone = (value) => {
  const raw = String(value ?? "").trim();
  const digits = raw.replace(/\D/g, "");
  return /^\+?[\d\s()-]+$/.test(raw) && digits.length >= 9 && digits.length <= 15;
};
