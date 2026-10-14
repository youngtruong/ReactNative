import type { Place } from '../types';
export function toggleFavorite(favorites: Place[], place: Place): Place[] {
  return favorites.some(p => p.id === place.id)
    ? favorites.filter(p => p.id !== place.id)
    : [...favorites, place];
}
