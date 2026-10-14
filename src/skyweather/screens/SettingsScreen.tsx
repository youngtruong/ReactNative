import React from 'react';
import { ScrollView, View, Pressable, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppState } from '../hooks/useAppState';
import { useTheme } from '../theme';
import { Card, Label } from '../components/UI';
function Options<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: readonly (readonly [T, string])[];
  onChange: (v: T) => void;
}) {
  const t = useTheme();
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {options.map(([id, label]) => (
        <Pressable
          key={id}
          accessibilityRole="radio"
          accessibilityState={{ checked: value === id }}
          onPress={() => onChange(id)}
          style={{
            flexGrow: 1,
            minHeight: 48,
            padding: 12,
            borderRadius: 14,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: value === id ? t.accent : t.bg,
          }}
        >
          <Text
            style={{
              color: value === id ? (t.dark ? '#152746' : 'white') : t.text,
              fontWeight: '600',
            }}
          >
            {label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
export default function SettingsScreen() {
  const { settings, updateSettings, storageError } = useAppState();
  const t = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <ScrollView
      style={{ backgroundColor: t.bg }}
      contentContainerStyle={{
        padding: 20,
        paddingTop: insets.top + 20,
        gap: 8,
      }}
    >
      <Label large>Cài đặt</Label>
      <Label muted>Bầu trời của bạn, theo cách của bạn.</Label>
      <View style={{ height: 16 }} />
      <Card title="Nhiệt độ">
        <Options
          value={settings.temperature}
          options={[
            ['celsius', 'Độ C · °C'],
            ['fahrenheit', 'Độ F · °F'],
          ]}
          onChange={temperature => updateSettings({ temperature })}
        />
      </Card>
      <Card title="Tốc độ gió">
        <Options
          value={settings.wind}
          options={[
            ['kmh', 'km/h'],
            ['ms', 'm/s'],
          ]}
          onChange={wind => updateSettings({ wind })}
        />
      </Card>
      <Card title="Giao diện">
        <Options
          value={settings.theme}
          options={[
            ['light', 'Sáng'],
            ['dark', 'Tối'],
            ['system', 'Hệ thống'],
          ]}
          onChange={theme => updateSettings({ theme })}
        />
      </Card>
      {storageError && (
        <Card>
          <Label>{storageError}</Label>
        </Card>
      )}
      <Card title="SkyWeather 1.0">
        <Label muted>
          Cài đặt và địa điểm được lưu trên thiết bị. Vị trí chỉ được yêu cầu
          khi bạn chọn sử dụng vị trí hiện tại.
        </Label>
        <Label muted>
          Dự báo từ Open-Meteo. Khi mất mạng, ứng dụng hiển thị bản dự báo gần
          nhất đã tải thành công.
        </Label>
      </Card>
    </ScrollView>
  );
}
