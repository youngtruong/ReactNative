import React from 'react';
import UserRound from 'lucide-react-native/icons/user-round';
import Sun from 'lucide-react-native/icons/sun';
import Moon from 'lucide-react-native/icons/moon';
import CloudSun from 'lucide-react-native/icons/cloud-sun';
import CloudMoon from 'lucide-react-native/icons/cloud-moon';
import Cloud from 'lucide-react-native/icons/cloud';
import CloudRain from 'lucide-react-native/icons/cloud-rain';
import CloudLightning from 'lucide-react-native/icons/cloud-lightning';
import Snowflake from 'lucide-react-native/icons/snowflake';
import Droplets from 'lucide-react-native/icons/droplets';
import Navigation from 'lucide-react-native/icons/navigation';
import Eye from 'lucide-react-native/icons/eye';
import Gauge from 'lucide-react-native/icons/gauge';
import MapPin from 'lucide-react-native/icons/map-pin';
import Search from 'lucide-react-native/icons/search';
import X from 'lucide-react-native/icons/x';
import Star from 'lucide-react-native/icons/star';
import LocateFixed from 'lucide-react-native/icons/locate-fixed';
import SlidersHorizontal from 'lucide-react-native/icons/sliders-horizontal';
const icons = {
  'person-outline': UserRound,
  sunny: Sun,
  moon: Moon,
  'partly-sunny': CloudSun,
  'cloudy-night': CloudMoon,
  cloud: Cloud,
  rainy: CloudRain,
  thunderstorm: CloudLightning,
  snow: Snowflake,
  'water-outline': Droplets,
  'navigate-outline': Navigation,
  'rainy-outline': CloudRain,
  'sunny-outline': Sun,
  'eye-outline': Eye,
  'speedometer-outline': Gauge,
  'moon-outline': Moon,
  'location-outline': MapPin,
  search: Search,
  close: X,
  star: Star,
  'star-outline': Star,
  'locate-outline': LocateFixed,
  'partly-sunny-outline': CloudSun,
  'options-outline': SlidersHorizontal,
} as const;
export function Icon({
  name,
  color,
  size = 24,
}: {
  name: keyof typeof icons;
  color?: string;
  size?: number;
}) {
  const Component = icons[name];
  return (
    <Component
      size={size}
      color={color}
      strokeWidth={1.8}
      fill={name === 'star' ? color : 'none'}
    />
  );
}
