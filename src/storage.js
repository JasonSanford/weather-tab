export function getItem(key, fallback) {
  const item = window.localStorage.getItem(key);

  if (item) {
    return JSON.parse(item);
  }

  return fallback || null;
}

export function setItem(key, value) {
  window.localStorage.setItem(key, JSON.stringify(value));
}
