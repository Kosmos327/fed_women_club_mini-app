export function getRawVkLaunchParams(): string {
  const { search } = window.location;
  if (!search || search === '?') {
    return '';
  }

  return search.startsWith('?') ? search.slice(1) : search;
}
