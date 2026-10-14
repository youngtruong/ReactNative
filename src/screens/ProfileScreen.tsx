import React from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const statistics = [
  { value: '12', label: 'Môn' },
  { value: '3.6', label: 'GPA' },
  { value: '120', label: 'Tín chỉ' },
];

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const focused = useIsFocused();

  return (
    <View style={styles.screen}>
      {focused && <StatusBar barStyle="light-content" />}
      <View style={[styles.header, { paddingTop: insets.top + 14 }]}>
        <Text accessibilityRole="header" style={styles.title}>
          Hồ sơ
        </Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <View style={styles.profileCard}>
            <View
              style={styles.avatar}
              accessibilityLabel="Ảnh đại diện sinh viên"
            />
            <View style={styles.identity}>
              <Text style={styles.name}>Nguyễn Trọng Trường</Text>
              <Text style={styles.subtitle}>Sinh viên CNTT</Text>
            </View>
          </View>
          <View style={styles.statistics}>
            {statistics.map(({ value, label }) => (
              <View key={label} style={styles.statistic}>
                <Text style={styles.value}>{value}</Text>
                <Text style={styles.label}>{label}</Text>
              </View>
            ))}
          </View>
          <View style={styles.sections} accessible={false}>
            {[0, 1, 2, 3].map(index => (
              <View key={index} style={styles.sectionPlaceholder} />
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#EAF2FC' },
  header: {
    backgroundColor: '#A4142B',
    paddingHorizontal: 20,
    paddingBottom: 14,
  },
  title: { color: '#FFFFFF', fontSize: 20, fontWeight: '700' },
  scrollContent: { flexGrow: 1, alignItems: 'center', padding: 16 },
  content: { width: '100%', maxWidth: 560 },
  profileCard: {
    backgroundColor: '#E0DEF2',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    minHeight: 112,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#A4142B',
    borderWidth: 2,
    borderColor: '#F8F1F3',
  },
  identity: { flex: 1, gap: 4 },
  name: { color: '#17233B', fontSize: 16, fontWeight: '700' },
  subtitle: { color: '#34425B', fontSize: 14 },
  statistics: { flexDirection: 'row', paddingVertical: 28 },
  statistic: { flex: 1, alignItems: 'center', gap: 4 },
  value: { color: '#17233B', fontSize: 24, fontWeight: '700' },
  label: { color: '#34425B', fontSize: 13, fontWeight: '500' },
  sections: { gap: 14, marginTop: 16 },
  sectionPlaceholder: { height: 58, backgroundColor: '#DFEAF8' },
});
