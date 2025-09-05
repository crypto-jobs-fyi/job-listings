// Shared favorites helper utilities
// Handles loading/saving favorites and common ID generation in one place
export function makeJobId(job) {
  return `${job.company}-${job.title}-${job.link}`.replace(/\s+/g, '-');
}

export function loadFavoritesArray() {
  try {
    const stored = localStorage.getItem('favoriteJobs');
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error('Error loading favorites array:', e);
    return [];
  }
}

export function saveFavoritesArray(arr) {
  try {
    localStorage.setItem('favoriteJobs', JSON.stringify(arr));
  } catch (e) {
    console.error('Error saving favorites array:', e);
  }
}

export function loadFavoritesMap() {
  const arr = loadFavoritesArray();
  return new Map(arr.map(job => [job.id, job]));
}

export function saveFavoritesMap(map) {
  try {
    const arr = Array.from(map.values());
    saveFavoritesArray(arr);
  } catch (e) {
    console.error('Error saving favorites map:', e);
  }
}

export function toggleFavoriteInMap(map, job, category = '') {
  const id = makeJobId(job);
  const next = new Map(map);
  if (next.has(id)) next.delete(id);
  else next.set(id, { ...job, id, category });
  return next;
}

export function removeFavoriteByIdArray(arr, id) {
  return arr.filter(j => j.id !== id);
}
