import React, {useState} from 'react';
import {ImageBackground, Modal, Pressable, ScrollView, StatusBar, StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

const hours = ['18:00', '19:00', '20:00', '21:00', '22:00', '23:00'];
const days = [
  {day: 'Hôm nay', high: '30°', low: '24°'},
  {day: 'Thứ Tư', high: '29°', low: '24°'},
  {day: 'Thứ Năm', high: '31°', low: '25°'},
  {day: 'Thứ Sáu', high: '30°', low: '24°'},
  {day: 'Thứ Bảy', high: '28°', low: '23°'},
];

function GlassCard({children, style}: {children: React.ReactNode; style?: object}) {
  return <View style={[styles.glassCard, style]}>{children}</View>;
}

function WeatherIcon({rain = false, small = false}: {rain?: boolean; small?: boolean}) {
  return (
    <View style={[styles.iconBox, small && styles.iconBoxSmall]}>
      <View style={[styles.sun, small && styles.sunSmall]} />
      <View style={[styles.cloud, small && styles.cloudSmall]}>
        <View style={[styles.cloudBubbleLeft, small && styles.cloudBubbleLeftSmall]} />
        <View style={[styles.cloudBubbleRight, small && styles.cloudBubbleRightSmall]} />
      </View>
      {rain && <><View style={[styles.rainDrop, styles.rainOne]} /><View style={[styles.rainDrop, styles.rainTwo]} /></>}
    </View>
  );
}

export default function WeatherScreen() {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />
      <View style={StyleSheet.absoluteFill}>
        <ImageBackground source={require('../assets/lightning-background.gif')} resizeMode="cover" style={styles.background} />
      </View>
      <View style={styles.tint} />

      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false} bounces={false}>
          <View style={styles.hero}>
            <Text style={styles.location}>Hoàng Quốc Việt</Text>
            <Text style={styles.currentTemperature}>32°</Text>
            <Text style={styles.condition}>Mưa giông</Text>
            <Text style={styles.range}>C:33°  ·  T:25°</Text>
          </View>

          <Pressable onPress={() => setModalVisible(true)} style={styles.detailsButton}>
            <Text style={styles.detailsButtonText}>Xem chi tiết thời tiết</Text>
          </Pressable>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hourlyList}>
            {hours.map((time, index) => (
              <GlassCard key={time} style={styles.hourCard}>
                <Text style={styles.hourTime}>{index === 0 ? 'Bây giờ' : time}</Text>
                <WeatherIcon rain={index % 3 === 1} />
                <Text style={styles.rainChance}>{70 + index * 3}%</Text>
                <Text style={styles.hourTemperature}>{30 - Math.floor(index / 2)}°</Text>
              </GlassCard>
            ))}
          </ScrollView>

          <GlassCard style={styles.forecastPanel}>
            <View style={styles.panelTitleRow}><Text style={styles.panelIcon}>▦</Text><Text style={styles.panelTitle}>DỰ BÁO 5 NGÀY</Text></View>
            {days.map((item, index) => (
              <View key={item.day} style={[styles.forecastRow, index > 0 && styles.rowBorder]}>
                <Text style={styles.rowDay}>{item.day}</Text>
                <View style={styles.rowIcon}><WeatherIcon rain={index === 3} small /></View>
                <Text style={styles.rowLow}>{item.low}</Text>
                <View style={styles.tempTrack}>
                  <View style={[styles.tempFill, {left: 8 + index * 3, right: 4 + (index % 2) * 8}]} />
                  {index === 0 && <View style={styles.currentDot} />}
                </View>
                <Text style={styles.rowHigh}>{item.high}</Text>
              </View>
            ))}
          </GlassCard>
        </ScrollView>
      </SafeAreaView>

      <Modal transparent visible={modalVisible} animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setModalVisible(false)}>
          <Pressable style={styles.modalCard} onPress={() => undefined}>
            <WeatherIcon rain />
            <Text style={styles.modalTitle}>Cảnh báo mưa giông</Text>
            <Text style={styles.modalBody}>Mưa lớn kèm sấm chớp có thể kéo dài đến 20:30. Hãy hạn chế di chuyển ngoài trời.</Text>
            <Pressable style={styles.closeButton} onPress={() => setModalVisible(false)}><Text style={styles.closeButtonText}>Đã hiểu</Text></Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: '#20384c'},
  background: {flex: 1},
  tint: {position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: 'rgba(8,18,38,0.48)'},
  safeArea: {flex: 1},
  page: {paddingHorizontal: 16, paddingBottom: 22},
  hero: {alignItems: 'center', paddingTop: 28, paddingBottom: 20},
  location: {color: '#fff', fontSize: 25, fontWeight: '500', letterSpacing: -0.4, textShadowColor: '#1a2a38', textShadowRadius: 8},
  currentTemperature: {color: '#fff', fontSize: 86, fontWeight: '200', lineHeight: 96, letterSpacing: -5, marginLeft: 8, textShadowColor: '#142534', textShadowRadius: 12},
  condition: {color: '#f4f8fb', fontSize: 18, fontWeight: '600', marginTop: -3},
  range: {color: 'rgba(255,255,255,0.88)', fontSize: 15, marginTop: 4},
  detailsButton: {alignSelf: 'center', backgroundColor: 'rgba(56,126,196,0.42)', borderColor: 'rgba(181,220,255,0.42)', borderWidth: 1, paddingHorizontal: 18, paddingVertical: 9, borderRadius: 20, marginBottom: 16},
  detailsButtonText: {color: '#e7f4ff', fontSize: 14, fontWeight: '600'},
  glassCard: {backgroundColor: 'rgba(226,235,240,0.72)', borderColor: 'rgba(255,255,255,0.36)', borderWidth: 1, shadowColor: '#06121c', shadowOpacity: 0.18, shadowRadius: 12, shadowOffset: {width: 0, height: 5}, elevation: 4},
  hourlyList: {gap: 9, paddingRight: 16, paddingBottom: 4},
  hourCard: {width: 78, height: 142, borderRadius: 18, alignItems: 'center', paddingVertical: 13},
  hourTime: {color: '#18232d', fontSize: 14, fontWeight: '600'},
  iconBox: {width: 48, height: 36, marginTop: 8},
  iconBoxSmall: {width: 38, height: 30, marginTop: 0},
  sun: {position: 'absolute', left: 5, top: 2, width: 20, height: 20, borderRadius: 10, backgroundColor: '#f8c443'},
  sunSmall: {left: 3, width: 16, height: 16, borderRadius: 8},
  cloud: {position: 'absolute', left: 10, bottom: 5, width: 34, height: 17, borderRadius: 9, backgroundColor: '#78aaf2'},
  cloudSmall: {left: 8, bottom: 5, width: 28, height: 14},
  cloudBubbleLeft: {position: 'absolute', left: 5, top: -7, width: 17, height: 17, borderRadius: 9, backgroundColor: '#78aaf2'},
  cloudBubbleLeftSmall: {top: -5, width: 14, height: 14},
  cloudBubbleRight: {position: 'absolute', right: 3, top: -4, width: 13, height: 13, borderRadius: 7, backgroundColor: '#78aaf2'},
  cloudBubbleRightSmall: {width: 11, height: 11},
  rainDrop: {position: 'absolute', bottom: 0, width: 2, height: 5, borderRadius: 2, backgroundColor: '#247dcc', transform: [{rotate: '18deg'}]},
  rainOne: {left: 20}, rainTwo: {left: 31},
  rainChance: {color: '#1479c9', fontSize: 12, fontWeight: '700', marginTop: 1},
  hourTemperature: {color: '#101b24', fontSize: 19, fontWeight: '600', marginTop: 7},
  forecastPanel: {borderRadius: 20, marginTop: 18, paddingHorizontal: 14, overflow: 'hidden'},
  panelTitleRow: {height: 40, flexDirection: 'row', alignItems: 'center', gap: 7},
  panelIcon: {color: '#526472', fontSize: 15},
  panelTitle: {color: '#526472', fontSize: 12, fontWeight: '700', letterSpacing: 0.5},
  forecastRow: {height: 61, flexDirection: 'row', alignItems: 'center'},
  rowBorder: {borderTopColor: 'rgba(76,96,110,0.20)', borderTopWidth: StyleSheet.hairlineWidth},
  rowDay: {width: 76, color: '#14202a', fontSize: 16, fontWeight: '600'},
  rowIcon: {width: 46, alignItems: 'center'},
  rowLow: {width: 36, color: '#5b6b78', fontSize: 15, textAlign: 'right'},
  tempTrack: {height: 4, flex: 1, marginHorizontal: 8, borderRadius: 4, backgroundColor: 'rgba(70,83,91,0.22)'},
  tempFill: {position: 'absolute', height: 4, borderRadius: 4, backgroundColor: '#f3b43d'},
  currentDot: {position: 'absolute', left: 12, top: -2, width: 8, height: 8, borderRadius: 4, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e79d26'},
  rowHigh: {width: 34, color: '#17232c', fontSize: 15, fontWeight: '600'},
  modalBackdrop: {flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(4,13,22,0.64)', padding: 28},
  modalCard: {width: '100%', backgroundColor: '#edf4f8', borderRadius: 24, padding: 24, alignItems: 'center'},
  modalTitle: {color: '#14212b', fontSize: 22, fontWeight: '700', marginTop: 10},
  modalBody: {color: '#52616d', fontSize: 15, lineHeight: 22, textAlign: 'center', marginTop: 10},
  closeButton: {width: '100%', backgroundColor: '#287fc1', borderRadius: 14, paddingVertical: 13, marginTop: 20, alignItems: 'center'},
  closeButtonText: {color: '#fff', fontSize: 16, fontWeight: '700'},
});
