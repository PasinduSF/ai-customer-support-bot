const normalizeId = (id: string) => {
  if (!id) return "";
  return id.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
};

export { normalizeId };
