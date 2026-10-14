import React from 'react';
import {
  ScrollView,
  View,
  Text,
  RefreshControl,
  Pressable,
  StyleSheet,
  Linking,
} from 'react-native';
import { SkyGradient as LinearGradient } from '../components/SkyGradient';
import { Icon as Ionicons } from '../components/Icon';
import { StatusBar } from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppState } from '../hooks/useAppState';
import { useWeather } from '../hooks/useWeather';
import { useTheme, skyColors } from '../theme';
import { Card, Label, Button, Skeleton } from '../components/UI';
import { TemperatureChart } from '../components/TemperatureChart';
import {
  temperature,
  valid,
  condition,
  clock,
  number,
  windDirection,
  dayLabel,
  nextHours,
} from '../utils/weather';
import type { Tabs } from '../SkyWeatherApp';
export default function WeatherScreen() {
  const focused = useIsFocused();
  const { place, settings, storageError } = useAppState();
  const q = useWeather(place);
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<BottomTabNavigationProp<Tabs>>();
  if (!q.data)
    return (
      <ScrollView
        style={{ backgroundColor: t.bg }}
        contentContainerStyle={{
          paddingTop: insets.top + 20,
          paddingHorizontal: 20,
        }}
      >
        <Label large>SkyWeather</Label>
        <Label muted>{place.name}</Label>
        {q.isError ? (
          <Card>
            <Label>{q.error.message}</Label>
            <Button label="Thử lại" onPress={() => void q.refetch()} />
            <Button
              label="Đổi địa điểm"
              onPress={() => navigation.navigate('Places')}
            />
          </Card>
        ) : (
          <Skeleton />
        )}
      </ScrollView>
    );
  const { forecast: f, updatedAt } = q.data,
    c = f.current,
    d = f.daily,
    description = condition(c.weather_code, c.is_day !== 0);
  const unit = settings.temperature;
  const metrics = [
    ['Độ ẩm', number(c.relative_humidity_2m, '%'), 'water-outline'],
    [
      'Gió',
      `${number(
        c.wind_speed_10m,
        settings.wind === 'ms' ? ' m/s' : ' km/h',
        settings.wind === 'ms' ? 3.6 : 1,
      )} · ${windDirection(c.wind_direction_10m)}`,
      'navigate-outline',
    ],
    ['Lượng mưa hiện tại', number(c.precipitation, ' mm'), 'rainy-outline'],
    [
      'Chỉ số UV theo giờ',
      number(f.hourly.uv_index[nextHours(f)[0]?.i ?? -1]),
      'sunny-outline',
    ],
    ['Tầm nhìn', number(c.visibility, ' km', 1000), 'eye-outline'],
    ['Áp suất biển', number(c.pressure_msl, ' hPa'), 'speedometer-outline'],
    ['Bình minh', clock(d.sunrise[0]), 'sunny-outline'],
    ['Hoàng hôn', clock(d.sunset[0]), 'moon-outline'],
  ] as const;
  return (
    <ScrollView
      style={{ backgroundColor: t.bg }}
      contentContainerStyle={{ paddingBottom: 24 }}
      refreshControl={
        <RefreshControl
          refreshing={q.isFetching}
          onRefresh={() => void q.refetch()}
          tintColor={t.accent}
        />
      }
    >
      {focused && <StatusBar barStyle="light-content" />}
      <LinearGradient
        colors={skyColors(c.weather_code, c.is_day !== 0)}
        style={[styles.hero, { paddingTop: insets.top + 20 }]}
      >
        <View style={styles.row}>
          <View style={styles.brandGroup}>
            <Ionicons name="cloud" size={22} color="white" />
            <Text style={styles.brand}>SkyWeather</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Đổi địa điểm"
            onPress={() => navigation.navigate('Places')}
            style={styles.change}
          >
            <Ionicons name="location-outline" size={17} color="white" />
            <Text style={{ color: 'white' }}>Địa điểm</Text>
          </Pressable>
        </View>
        <Text style={styles.city}>{place.name}</Text>
        <Text style={styles.sub}>
          {[place.admin1, place.country].filter(Boolean).join(' · ')}
        </Text>
        <View style={{ alignItems: 'center', paddingVertical: 18 }}>
          <Ionicons name={description.icon} size={74} color="#FFE7A0" />
          <Text
            style={[
              styles.temp,
              !valid(c.temperature_2m) && { fontSize: 22, letterSpacing: 0 },
            ]}
          >
            {temperature(c.temperature_2m, unit)}
          </Text>
          <Text style={styles.sub}>
            {unit === 'fahrenheit' ? 'Độ Fahrenheit · °F' : 'Độ Celsius · °C'}
          </Text>
          <Text style={{ color: 'white', fontSize: 20 }}>
            {description.label}
          </Text>
          <Text style={[styles.sub, { marginTop: 12 }]}>
            Cảm nhận {temperature(c.apparent_temperature, unit)} · Cao{' '}
            {temperature(d.temperature_2m_max[0], unit)} · Thấp{' '}
            {temperature(d.temperature_2m_min[0], unit)}
          </Text>
        </View>
        <Text style={styles.sub}>
          Dữ liệu lúc {clock(c.time)} · {f.timezone}
        </Text>
        <Text style={[styles.sub, { fontSize: 11, marginTop: 4 }]}>
          Tải lúc{' '}
          {new Intl.DateTimeFormat('vi-VN', {
            timeZone: f.timezone,
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          }).format(updatedAt)}
        </Text>
      </LinearGradient>
      <View style={{ padding: 20 }}>
        {(q.cached || q.isError) && (
          <Card>
            <Label>
              Đang hiển thị dữ liệu đã lưu
              {q.isError ? ' — không thể cập nhật.' : '.'}
            </Label>
            <Button
              label="Thử cập nhật"
              disabled={q.isFetching}
              onPress={() => void q.refetch()}
            />
          </Card>
        )}
        {(storageError || q.cacheError) && (
          <Card>
            <Label>
              {storageError ?? 'Không lưu được dự báo để xem ngoại tuyến.'}
            </Label>
          </Card>
        )}
        <Card title="24 giờ tiếp theo">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {nextHours(f).map(h => (
              <View
                key={h.time}
                style={{ width: 76, alignItems: 'center', gap: 12 }}
              >
                <Label muted>{clock(h.time)}</Label>
                <Ionicons
                  name={
                    condition(
                      f.hourly.weather_code[h.i],
                      f.hourly.is_day[h.i] !== 0,
                    ).icon
                  }
                  color={t.accent}
                  size={28}
                />
                <Label large>
                  {temperature(f.hourly.temperature_2m[h.i], unit)}
                </Label>
                <Text style={{ color: t.accent, fontSize: 12 }}>
                  {number(f.hourly.precipitation_probability[h.i], '%')}
                </Text>
              </View>
            ))}
          </ScrollView>
        </Card>
        <Card title="Nhịp nhiệt độ">
          <TemperatureChart forecast={f} unit={unit} />
        </Card>
        <Card title="Dự báo 7 ngày">
          {d.time.slice(0, 7).map((date, i) => (
            <View
              key={date}
              style={[
                styles.row,
                {
                  paddingVertical: 10,
                  borderBottomWidth: i === 6 ? 0 : 1,
                  borderBottomColor: t.border,
                },
              ]}
            >
              <Text style={{ width: 65, color: t.text, fontWeight: '500' }}>
                {dayLabel(date, i)}
              </Text>
              <Ionicons
                name={condition(d.weather_code[i]).icon}
                color={t.accent}
                size={25}
              />
              <Text
                style={{
                  color: t.accent,
                  fontSize: 12,
                  flex: 1,
                  textAlign: 'center',
                }}
              >
                {number(d.precipitation_probability_max[i], '%')}
              </Text>
              <Text style={{ color: t.muted, width: 46, textAlign: 'right' }}>
                {temperature(d.temperature_2m_min[i], unit)}
              </Text>
              <Text
                style={{
                  color: t.text,
                  width: 46,
                  textAlign: 'right',
                  fontWeight: '600',
                }}
              >
                {temperature(d.temperature_2m_max[i], unit)}
              </Text>
            </View>
          ))}
        </Card>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          {metrics.map(([title, value, icon]) => (
            <View
              key={title}
              style={{
                width: '48%',
                flexGrow: 1,
                backgroundColor: t.card,
                borderRadius: 22,
                padding: 18,
                gap: 10,
                marginBottom: 2,
              }}
            >
              <Ionicons name={icon} size={22} color={t.accent} />
              <Label muted>{title}</Label>
              <Label>{value}</Label>
            </View>
          ))}
        </View>
        <Pressable
          accessibilityRole="link"
          onPress={() => void Linking.openURL('https://open-meteo.com/')}
          style={{ paddingTop: 24, alignItems: 'center' }}
        >
          <Label muted>Dữ liệu bởi Open-Meteo · CC BY 4.0</Label>
        </Pressable>
      </View>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  hero: {
    padding: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  brandGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 1,
  },
  brand: { color: 'white', fontSize: 18, fontWeight: '700', flexShrink: 1 },
  change: {
    flexDirection: 'row',
    gap: 6,
    padding: 10,
    borderRadius: 14,
    backgroundColor: '#FFFFFF22',
  },
  city: { color: 'white', fontSize: 32, fontWeight: '700', marginTop: 28 },
  sub: { color: '#E2F0FF', fontSize: 13, lineHeight: 20 },
  temp: { color: 'white', fontSize: 96, fontWeight: '200', letterSpacing: -5 },
});
