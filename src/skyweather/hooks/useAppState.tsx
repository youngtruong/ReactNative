import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
} from 'react';
import { toggleFavorite } from '../utils/state';
import { read, write } from '../services/storage';
import type { Place, Settings } from '../types';
export const defaultPlace: Place = {
  id: '1581130',
  name: 'Hà Nội',
  latitude: 21.0245,
  longitude: 105.8412,
  country: 'Việt Nam',
  admin1: 'Hà Nội',
};
const defaults: Settings = {
  temperature: 'celsius',
  wind: 'kmh',
  theme: 'system',
};
interface State {
  place: Place;
  favorites: Place[];
  settings: Settings;
}
interface Store extends State {
  ready: boolean;
  storageError: string | null;
  select: (p: Place) => void;
  toggleFavorite: (p: Place) => void;
  updateSettings: (s: Partial<Settings>) => void;
}
const Context = createContext<Store | null>(null);
function validPlace(p: unknown): p is Place {
  const v = p as Place;
  return (
    !!v &&
    typeof v.id === 'string' &&
    typeof v.name === 'string' &&
    Number.isFinite(v.latitude) &&
    Number.isFinite(v.longitude)
  );
}
export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<State>({
    place: defaultPlace,
    favorites: [],
    settings: defaults,
  });
  const [ready, setReady] = useState(false);
  const [storageError, setError] = useState<string | null>(null);
  const writes = useRef(Promise.resolve());
  useEffect(() => {
    read<State>('state')
      .then(s => {
        if (s)
          setState({
            place: validPlace(s.place) ? s.place : defaultPlace,
            favorites: Array.isArray(s.favorites)
              ? s.favorites.filter(validPlace)
              : [],
            settings: {
              temperature:
                s.settings?.temperature === 'fahrenheit'
                  ? 'fahrenheit'
                  : 'celsius',
              wind: s.settings?.wind === 'ms' ? 'ms' : 'kmh',
              theme: ['light', 'dark'].includes(s.settings?.theme)
                ? s.settings.theme
                : 'system',
            },
          });
      })
      .catch(() => setError('Không đọc được dữ liệu đã lưu.'))
      .finally(() => setReady(true));
  }, []);
  useEffect(() => {
    if (ready)
      writes.current = writes.current
        .catch(() => {})
        .then(() => write('state', state))
        .catch(() => setError('Không lưu được cài đặt trên thiết bị.'));
  }, [state, ready]);
  return (
    <Context.Provider
      value={{
        ...state,
        ready,
        storageError,
        select: p => setState(s => ({ ...s, place: p })),
        toggleFavorite: p =>
          setState(s => ({
            ...s,
            favorites: toggleFavorite(s.favorites, p),
          })),
        updateSettings: patch =>
          setState(s => ({ ...s, settings: { ...s.settings, ...patch } })),
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useAppState() {
  const value = useContext(Context);
  if (!value) throw new Error('Missing AppStateProvider');
  return value;
}
