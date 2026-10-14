import { useColorScheme } from 'react-native';
import { useAppState } from '../hooks/useAppState';
export function useTheme() {
  const system = useColorScheme();
  const { settings } = useAppState();
  const dark =
    settings.theme === 'dark' ||
    (settings.theme === 'system' && system === 'dark');
  return {
    dark,
    bg: dark ? '#0C172B' : '#F2F6FC',
    card: dark ? '#17253D' : '#FFFFFF',
    text: dark ? '#F2F6FF' : '#152746',
    muted: dark ? '#ABBCD5' : '#64758E',
    border: dark ? '#2C3D56' : '#E5ECF5',
    accent: dark ? '#83BAFF' : '#2563EB',
  };
}
export function skyColors(
  code: number | null | undefined,
  day: boolean,
): readonly [string, string] {
  if (!day) return ['#111D46', '#344479'];
  if (code != null && code >= 51) return ['#374B71', '#8299AE'];
  if (code === 3 || code === 45 || code === 48) return ['#4D729E', '#9CB7CC'];
  return ['#1463D9', '#64B8EF'];
}
