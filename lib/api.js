// Simple centralized API helper for client-side usage
export async function get(path) {
  const res = await fetch(path, { method: 'GET', credentials: 'include' });
  const text = await res.text();
  let json = null;
  try { json = text ? JSON.parse(text) : {}; } catch (e) { throw new Error('Invalid JSON response'); }
  if (!res.ok) {
    throw new Error(json?.error || json?.message || 'Request failed');
  }
  return json;
}

export async function post(path, body) {
  const res = await fetch(path, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body ?? {}),
  });
  const text = await res.text();
  let json = null;
  try { json = text ? JSON.parse(text) : {}; } catch (e) { throw new Error('Invalid JSON response'); }
  if (!res.ok) {
    throw new Error(json?.error || json?.message || 'Request failed');
  }
  return json;
}
