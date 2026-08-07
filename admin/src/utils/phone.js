export const normalizePhone = (value) => {
  const digits = String(value ?? "").replace(/\D/g, "").slice(0, 15);
  return digits ? `+${digits}` : "";
};

export const isValidPhone = (value) => {
  const digits = String(value ?? "").replace(/\D/g, "");
  return digits.length >= 9 && digits.length <= 15;
};
