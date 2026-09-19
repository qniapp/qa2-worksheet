// Locale selection for worksheet copy. Read once at process start.
export function getLocale() {
  return process.env.QA2_LOCALE === 'en' ? 'en' : 'ja';
}

export function isEnglish() {
  return getLocale() === 'en';
}
