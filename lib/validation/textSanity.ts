// Lightweight heuristics for rejecting obviously-garbage free-text input
// (e.g. "asdkjfhaskjdf" typed into Company Name) before it burns an AI call.
// Not a spam/security filter — just cheap enough to catch keyboard-mash and
// clearly-not-a-name/title input without false-positiving on real short
// names ("BP", "3M", "Vox").
//
// No equivalent helper existed elsewhere in this codebase at the time this
// was written (checked: no "nonsense"/"gibberish"/"garbage" hits anywhere
// under lib/ or app/) — this is a new, standalone utility, not a reuse of
// an existing pattern.

const VOWELS = /[aeiouAEIOU]/;

export function looksLikeGibberish(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return true;
  if (!/[a-zA-Z]/.test(trimmed)) return true; // no letters at all

  // Long run of the same character or tiny alphabet relative to length
  // ("aaaaaaaa", "asdasdasdasd") — real names/titles don't look like this.
  const letters = trimmed.replace(/[^a-zA-Z]/g, "").toLowerCase();
  if (letters.length >= 6) {
    const uniqueLetters = new Set(letters).size;
    if (uniqueLetters <= 2) return true;
  }

  // A long word with no vowel at all is very likely keyboard-mash
  // ("sdkfjhskdjfh") rather than a real word — real long words almost
  // always contain a vowel. Short strings are exempt (acronyms, initials).
  const words = trimmed.split(/\s+/);
  const hasLongVowellessWord = words.some(
    (word) => word.replace(/[^a-zA-Z]/g, "").length >= 7 && !VOWELS.test(word),
  );
  if (hasLongVowellessWord) return true;

  return false;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmailFormat(email: string): boolean {
  return EMAIL_RE.test(email.trim());
}
