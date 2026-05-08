export type ParsedParentName = {
  parent_first_name: string | null;
  parent_last_name: string | null;
  parent_name: string;
};

/** Split optional "First Last"; keeps full name trimmed. */
export function parseParentName(full: string): ParsedParentName {
  const trimmed = full.trim();
  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return {
      parent_name: trimmed,
      parent_first_name: null,
      parent_last_name: null,
    };
  }
  if (parts.length === 1) {
    return {
      parent_name: trimmed,
      parent_first_name: parts[0],
      parent_last_name: null,
    };
  }
  return {
    parent_name: trimmed,
    parent_first_name: parts[0],
    parent_last_name: parts.slice(1).join(" "),
  };
}
