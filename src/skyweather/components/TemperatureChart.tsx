import React from 'react';
import { ScrollView, View, Text } from 'react-native';
import Svg, { Polyline, Line, Circle } from 'react-native-svg';
import type { ForecastResponse, Settings } from '../types';
import { nextHours, valid, temperature, clock } from '../utils/weather';
import { useTheme } from '../theme';
export function TemperatureChart({
  forecast,
  unit,
}: {
  forecast: ForecastResponse;
  unit: Settings['temperature'];
}) {
  const t = useTheme();
  const hours = nextHours(forecast);
  const values = hours
    .map(h => forecast.hourly.temperature_2m[h.i])
    .filter(valid);
  if (!values.length)
    return <Text style={{ color: t.muted }}>Chưa có dữ liệu</Text>;
  const min = Math.min(...values),
    span = Math.max(2, Math.max(...values) - min);
  const width = Math.max(320, hours.length * 52);
  const y = (v: number) => 100 - ((v - min) / span) * 70;
  const segments: string[] = [];
  let current: string[] = [];
  hours.forEach((h, i) => {
    const v = forecast.hourly.temperature_2m[h.i];
    if (valid(v)) current.push(`${26 + i * 52},${y(v)}`);
    else if (current.length) {
      segments.push(current.join(' '));
      current = [];
    }
  });
  if (current.length) segments.push(current.join(' '));
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      accessibilityLabel="Biểu đồ nhiệt độ 24 giờ"
    >
      <View>
        <Svg width={width} height={125}>
          <Line x1={0} y1={115} x2={width} y2={115} stroke={t.border} />
          {segments.map((points, i) => (
            <Polyline
              key={i}
              points={points}
              fill="none"
              stroke={t.accent}
              strokeWidth={3}
            />
          ))}
          {hours.map((h, i) => {
            const v = forecast.hourly.temperature_2m[h.i];
            return valid(v) ? (
              <Circle
                key={h.time}
                cx={26 + i * 52}
                cy={y(v)}
                r={3}
                fill={t.accent}
              />
            ) : null;
          })}
        </Svg>
        <View style={{ flexDirection: 'row' }}>
          {hours.map(h => (
            <View
              key={h.time}
              style={{ width: 52, alignItems: 'center', gap: 4 }}
            >
              <Text style={{ color: t.text, fontSize: 12 }}>
                {temperature(forecast.hourly.temperature_2m[h.i], unit)}
              </Text>
              <Text style={{ color: t.muted, fontSize: 11 }}>
                {clock(h.time)}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
