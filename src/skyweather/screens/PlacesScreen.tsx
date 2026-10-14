import React, { useState } from 'react';
import {
  View,
  ScrollView,
  TextInput,
  Pressable,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Icon as Ionicons } from '../components/Icon';
import { nativeLocationDriver } from '../services/nativeLocation';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Tabs } from '../SkyWeatherApp';
import type { Place } from '../types';
import { useAppState } from '../hooks/useAppState';
import { useDebounce } from '../hooks/useDebounce';
import { useWeather } from '../hooks/useWeather';
import { currentPlace } from '../services/location';
import { searchPlaces } from '../services/api';
import { useTheme } from '../theme';
import { Card, Label, Button } from '../components/UI';
import { condition, temperature } from '../utils/weather';
function PlaceRow({
  place,
  onSelect,
  summary = false,
}: {
  place: Place;
  onSelect: () => void;
  summary?: boolean;
}) {
  const t = useTheme();
  const state = useAppState();
  const saved = state.favorites.some(p => p.id === place.id);
  return (
    <Card>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Xem thời tiết ${place.name}`}
          onPress={onSelect}
          style={{ flex: 1, gap: 4, minHeight: 48 }}
        >
          <Label large>{place.name}</Label>
          <Label muted>
            {[place.admin1, place.country].filter(Boolean).join(' · ') ||
              `${place.latitude.toFixed(2)}, ${place.longitude.toFixed(2)}`}
          </Label>
          {summary && <Summary place={place} />}
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${saved ? 'Xóa' : 'Thêm'} ${place.name} ${
            saved ? 'khỏi' : 'vào'
          } yêu thích`}
          onPress={() => state.toggleFavorite(place)}
          style={{ padding: 12 }}
        >
          <Ionicons
            name={saved ? 'star' : 'star-outline'}
            color={t.accent}
            size={25}
          />
        </Pressable>
      </View>
    </Card>
  );
}
function Summary({ place }: { place: Place }) {
  const q = useWeather(place);
  const { settings } = useAppState();
  return (
    <Label muted>
      {q.data
        ? `${temperature(
            q.data.forecast.current.temperature_2m,
            settings.temperature,
          )} · ${condition(q.data.forecast.current.weather_code).label}${
            q.cached ? ' · Đã lưu' : ''
          }`
        : q.isError
        ? 'Không tải được dự báo'
        : 'Đang tải…'}
    </Label>
  );
}
export default function PlacesScreen() {
  const [text, setText] = useState('');
  const debounced = useDebounce(text.trim());
  const [locating, setLocating] = useState(false);
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const state = useAppState();
  const nav = useNavigation<BottomTabNavigationProp<Tabs>>();
  const q = useQuery({
    queryKey: ['places', debounced],
    queryFn: ({ signal }) => searchPlaces(debounced, signal),
    enabled: debounced.length >= 2,
    networkMode: 'always',
    staleTime: 30 * 60 * 1000,
    retry: 1,
  });
  const select = (p: Place) => {
    state.select(p);
    nav.navigate('Weather');
  };
  async function locate() {
    setLocating(true);
    try {
      const p = await currentPlace(nativeLocationDriver, 1);
      if (!p) {
        Alert.alert(
          'Chưa được cấp quyền',
          'Bạn vẫn có thể tìm và chọn thành phố bên dưới.',
        );
        return;
      }
      select(p);
    } catch (error) {
      Alert.alert(
        'Không lấy được vị trí',
        error instanceof Error
          ? error.message
          : 'Vui lòng tìm thành phố thủ công.',
      );
    } finally {
      setLocating(false);
    }
  }

  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      style={{ backgroundColor: t.bg }}
      contentContainerStyle={{
        padding: 20,
        paddingTop: insets.top + 20,
        paddingBottom: 40,
      }}
    >
      <Label large>Địa điểm của bạn</Label>
      <Label muted>Tìm một thành phố, khám phá bầu trời.</Label>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: t.card,
          borderRadius: 18,
          paddingHorizontal: 16,
          marginVertical: 20,
          gap: 10,
        }}
      >
        <Ionicons name="search" size={22} color={t.muted} />
        <TextInput
          accessibilityLabel="Tìm thành phố"
          value={text}
          onChangeText={setText}
          placeholder="Hà Nội, Đà Nẵng, Tokyo…"
          placeholderTextColor={t.muted}
          autoCorrect={false}
          style={{ flex: 1, color: t.text, minHeight: 54, fontSize: 16 }}
        />
        {text.length > 0 && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Xóa tìm kiếm"
            onPress={() => setText('')}
            style={{ padding: 10 }}
          >
            <Ionicons name="close" size={20} color={t.muted} />
          </Pressable>
        )}
      </View>
      <Button
        label={locating ? 'Đang lấy vị trí…' : 'Dùng vị trí hiện tại'}
        icon="locate-outline"
        onPress={() => void locate()}
        disabled={locating}
      />
      <View style={{ marginTop: 24 }}>
        {text.trim().length > 0 ? (
          <>
            <Label large>Kết quả tìm kiếm</Label>
            <View style={{ height: 16 }} />
            {text.trim().length < 2 ? (
              <Label muted>Nhập ít nhất 2 ký tự.</Label>
            ) : text.trim() !== debounced || q.isPending ? (
              <ActivityIndicator color={t.accent} />
            ) : q.isError ? (
              <Card>
                <Label>{q.error.message}</Label>
                <Button label="Thử lại" onPress={() => void q.refetch()} />
              </Card>
            ) : !q.data?.length ? (
              <Card>
                <Label>Không tìm thấy địa điểm. Thử tên thành phố khác.</Label>
              </Card>
            ) : (
              q.data.map(p => (
                <PlaceRow key={p.id} place={p} onSelect={() => select(p)} />
              ))
            )}
          </>
        ) : (
          <>
            <Label large>Địa điểm yêu thích</Label>
            <View style={{ height: 16 }} />
            {!state.favorites.length ? (
              <Card>
                <Ionicons name="star-outline" size={30} color={t.accent} />
                <Label>Chưa có địa điểm yêu thích.</Label>
                <Label muted>Tìm thành phố và chạm ngôi sao để lưu.</Label>
              </Card>
            ) : (
              state.favorites.map(p => (
                <PlaceRow
                  key={p.id}
                  place={p}
                  onSelect={() => select(p)}
                  summary
                />
              ))
            )}
          </>
        )}
      </View>
    </ScrollView>
  );
}
