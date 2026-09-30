import React, {useMemo, useState} from 'react';
import {
  FlatList,
  Image,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View,
} from 'react-native';

type Course = {
  id: string;
  title: string;
  lessons: number;
  progress: number;
  icon: string;
  accent: string;
  soft: string;
};

const courses: Course[] = [
  {id: '1', title: 'Lập trình di động', lessons: 18, progress: 72, icon: '⌘', accent: '#6C63E7', soft: '#EEECFF'},
  {id: '2', title: 'Cơ sở dữ liệu', lessons: 15, progress: 100, icon: '▱', accent: '#EF7D52', soft: '#FFF0E9'},
  {id: '3', title: 'Thiết kế giao diện', lessons: 12, progress: 45, icon: '✦', accent: '#2BAE88', soft: '#E4F7F1'},
  {id: '4', title: 'Mạng máy tính', lessons: 20, progress: 28, icon: '⌁', accent: '#3D8DDB', soft: '#E7F3FF'},
];

const stats = [
  {icon: '▤', value: '06', label: 'Môn học', color: '#6C63E7', background: '#EEECFF'},
  {icon: '✓', value: '12', label: 'Bài tập', color: '#EF7D52', background: '#FFF0E9'},
  {icon: '★', value: '02', label: 'Hoàn thành', color: '#2BAE88', background: '#E4F7F1'},
];

function StatCard({item, dark}: {item: (typeof stats)[number]; dark: boolean}) {
  return (
    <View style={[styles.statCard, dark && styles.cardDark]}>
      <View style={[styles.statIcon, {backgroundColor: item.background}]}>
        <Text style={[styles.statIconText, {color: item.color}]}>{item.icon}</Text>
      </View>
      <Text style={[styles.statValue, dark && styles.textDark]}>{item.value}</Text>
      <Text style={[styles.statLabel, dark && styles.mutedDark]}>{item.label}</Text>
    </View>
  );
}

function CourseCard({course, dark}: {course: Course; dark: boolean}) {
  const [selected, setSelected] = useState(false);
  const complete = course.progress === 100;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${course.title}, hoàn thành ${course.progress}%`}
      onPress={() => setSelected(value => !value)}
      style={({pressed}) => [
        styles.courseCard,
        dark && styles.cardDark,
        (selected || pressed) && styles.courseCardPressed,
      ]}>
      <View style={[styles.courseIcon, {backgroundColor: course.soft}]}>
        <Text style={[styles.courseIconText, {color: course.accent}]}>{course.icon}</Text>
      </View>
      <View style={styles.courseContent}>
        <View style={styles.courseHeading}>
          <Text numberOfLines={1} style={[styles.courseTitle, dark && styles.textDark]}>{course.title}</Text>
          <Text style={[styles.progressLabel, {color: complete ? '#2BAE88' : course.accent}]}>
            {complete ? 'Đã xong' : `${course.progress}%`}
          </Text>
        </View>
        <Text style={[styles.lessonCount, dark && styles.mutedDark]}>{course.lessons} bài học</Text>
        <View style={[styles.progressTrack, dark && styles.progressTrackDark]}>
          <View style={[styles.progressFill, {width: `${course.progress}%`, backgroundColor: complete ? '#2BAE88' : course.accent}]} />
        </View>
      </View>
      <Text style={[styles.chevron, dark && styles.mutedDark]}>›</Text>
    </Pressable>
  );
}

const navItems = [
  {icon: '⌂', label: 'Trang chủ'},
  {icon: '▤', label: 'Môn học'},
  {icon: '✓', label: 'Bài tập'},
  {icon: '♙', label: 'Cá nhân'},
];

export default function HomeScreen() {
  const dark = useColorScheme() === 'dark';
  const [query, setQuery] = useState('');
  const filteredCourses = useMemo(
    () => courses.filter(course => course.title.toLowerCase().includes(query.trim().toLowerCase())),
    [query],
  );

  const header = (
    <>
      <View style={styles.header}>
        <View style={styles.profileRow}>
          <Image source={{uri: 'https://i.pravatar.cc/160?img=12'}} style={styles.avatar} accessibilityLabel="Ảnh đại diện của Minh Anh" />
          <View style={styles.greetingBlock}>
            <View style={styles.greetingRow}>
              <Text style={[styles.greeting, dark && styles.mutedDark]}>Chào buổi sáng</Text>
              <View style={styles.greetingDot} />
            </View>
            <Text style={[styles.studentName, dark && styles.textDark]}>Nguyễn Minh Anh</Text>
          </View>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Thông báo, có 3 thông báo mới"
          style={({pressed}) => [styles.notificationButton, dark && styles.cardDark, pressed && styles.buttonPressed]}>
          <View style={[styles.bellBody, dark && styles.bellBodyDark]}>
            <View style={[styles.bellClapper, dark && styles.bellClapperDark]} />
          </View>
          <View style={styles.notificationDot} />
        </Pressable>
      </View>

      <View style={styles.hero}>
        <Text style={styles.heroEyebrow}>HỌC TẬP HÔM NAY</Text>
        <Text style={styles.heroTitle}>Tiếp tục hành trình{`\n`}chinh phục kiến thức!</Text>
        <View style={styles.heroFooter}>
          <View style={styles.heroAvatarGroup}>
            <View style={[styles.smallAvatar, styles.avatarPeach]}><Text style={styles.smallAvatarText}>AN</Text></View>
            <View style={[styles.smallAvatar, styles.overlapAvatar, styles.avatarBlue]}><Text style={styles.smallAvatarText}>BM</Text></View>
            <View style={[styles.smallAvatar, styles.overlapAvatar, styles.avatarLilac]}><Text style={styles.smallAvatarText}>CH</Text></View>
          </View>
          <Text style={styles.heroHint}>Bạn bè đang học cùng bạn</Text>
        </View>
        <View style={styles.heroCircleOne} />
        <View style={styles.heroCircleTwo} />
      </View>

      <View style={styles.statsRow}>
        {stats.map(item => <StatCard key={item.label} item={item} dark={dark} />)}
      </View>

      <View style={[styles.searchBox, dark && styles.cardDark]}>
        <Text style={[styles.searchIcon, dark && styles.mutedDark]}>⌕</Text>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Tìm kiếm môn học..."
          placeholderTextColor={dark ? '#788198' : '#969CAF'}
          style={[styles.searchInput, dark && styles.textDark]}
          returnKeyType="search"
        />
        {query.length > 0 && (
          <Pressable onPress={() => setQuery('')} accessibilityLabel="Xóa tìm kiếm">
            <Text style={[styles.clearText, dark && styles.mutedDark]}>×</Text>
          </Pressable>
        )}
      </View>

      <View style={styles.sectionHeading}>
        <View>
          <Text style={[styles.sectionTitle, dark && styles.textDark]}>Môn học của tôi</Text>
          <Text style={[styles.sectionSubtitle, dark && styles.mutedDark]}>{filteredCourses.length} môn học đang hiển thị</Text>
        </View>
        <Pressable><Text style={styles.seeAll}>Xem tất cả</Text></Pressable>
      </View>
    </>
  );

  return (
    <SafeAreaView style={[styles.safeArea, dark && styles.safeAreaDark]}>
      <StatusBar barStyle={dark ? 'light-content' : 'dark-content'} />
      <FlatList
        data={filteredCourses}
        keyExtractor={item => item.id}
        renderItem={({item}) => <CourseCard course={item} dark={dark} />}
        ListHeaderComponent={header}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>⌕</Text>
            <Text style={[styles.emptyTitle, dark && styles.textDark]}>Không tìm thấy môn học</Text>
            <Text style={[styles.emptyBody, dark && styles.mutedDark]}>Hãy thử tìm kiếm bằng từ khóa khác.</Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      />

      <View style={[styles.bottomNav, dark && styles.bottomNavDark]}>
        {navItems.map((item, index) => (
          <Pressable key={item.label} style={styles.navItem} accessibilityRole="button">
            <View style={[styles.navIconWrap, index === 0 && styles.navIconWrapActive]}>
              <Text style={[styles.navIcon, index === 0 && styles.navActive]}>{item.icon}</Text>
              {index === 2 && <View style={styles.navBadge}><Text style={styles.navBadgeText}>3</Text></View>}
            </View>
            <Text style={[styles.navLabel, index === 0 && styles.navActive, dark && index !== 0 && styles.mutedDark]}>{item.label}</Text>
          </Pressable>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: '#F7F8FC'},
  safeAreaDark: {backgroundColor: '#10131D'},
  listContent: {paddingHorizontal: 20, paddingTop: 12, paddingBottom: 112},
  header: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20},
  profileRow: {flexDirection: 'row', alignItems: 'center'},
  avatar: {width: 48, height: 48, borderRadius: 16, backgroundColor: '#E6E8F0'},
  greetingBlock: {marginLeft: 12},
  greetingRow: {flexDirection: 'row', alignItems: 'center'},
  greeting: {fontSize: 12, color: '#777E91', marginBottom: 3},
  greetingDot: {width: 5, height: 5, borderRadius: 3, backgroundColor: '#FFB547', marginLeft: 6, marginBottom: 2},
  studentName: {fontSize: 17, lineHeight: 22, fontWeight: '700', color: '#1B1E2C'},
  notificationButton: {width: 44, height: 44, borderRadius: 15, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', shadowColor: '#28304D', shadowOffset: {width: 0, height: 5}, shadowOpacity: 0.08, shadowRadius: 12, elevation: 3},
  bellBody: {width: 17, height: 18, borderWidth: 2.3, borderColor: '#303548', borderTopLeftRadius: 9, borderTopRightRadius: 9, borderBottomLeftRadius: 4, borderBottomRightRadius: 4, transform: [{rotate: '-8deg'}]},
  bellBodyDark: {borderColor: '#F4F5F8'},
  bellClapper: {position: 'absolute', width: 5, height: 3, borderRadius: 3, backgroundColor: '#303548', bottom: -6, left: 4},
  bellClapperDark: {backgroundColor: '#F4F5F8'},
  notificationDot: {position: 'absolute', top: 9, right: 10, width: 8, height: 8, borderRadius: 4, backgroundColor: '#FF655C', borderWidth: 1.5, borderColor: '#FFFFFF'},
  buttonPressed: {opacity: 0.65, transform: [{scale: 0.96}]},
  hero: {height: 176, overflow: 'hidden', backgroundColor: '#6259D9', borderRadius: 28, paddingHorizontal: 22, paddingVertical: 21, marginBottom: 20},
  heroEyebrow: {fontSize: 10, letterSpacing: 1.4, color: '#D9D5FF', fontWeight: '700', marginBottom: 9},
  heroTitle: {fontSize: 22, lineHeight: 29, color: '#FFFFFF', fontWeight: '800', letterSpacing: -0.35},
  heroFooter: {flexDirection: 'row', alignItems: 'center', marginTop: 15},
  heroAvatarGroup: {flexDirection: 'row', marginRight: 9},
  smallAvatar: {width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#6259D9'},
  smallAvatarText: {fontSize: 7, fontWeight: '800', color: '#3E4260'},
  avatarPeach: {backgroundColor: '#FFD9C8'},
  avatarBlue: {backgroundColor: '#D8EEFF'},
  avatarLilac: {backgroundColor: '#E8E1FF'},
  overlapAvatar: {marginLeft: -8},
  heroHint: {color: '#E8E6FF', fontSize: 10.5, fontWeight: '500'},
  heroCircleOne: {position: 'absolute', width: 126, height: 126, borderRadius: 63, borderWidth: 26, borderColor: 'rgba(255,255,255,0.08)', right: -18, top: -25},
  heroCircleTwo: {position: 'absolute', width: 82, height: 82, borderRadius: 41, backgroundColor: 'rgba(255,255,255,0.06)', right: 35, bottom: -52},
  statsRow: {flexDirection: 'row', gap: 10, marginBottom: 22},
  statCard: {flex: 1, minHeight: 125, backgroundColor: '#FFFFFF', borderRadius: 21, paddingVertical: 13, alignItems: 'center', shadowColor: '#263052', shadowOffset: {width: 0, height: 5}, shadowOpacity: 0.06, shadowRadius: 12, elevation: 2},
  statIcon: {width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center', marginBottom: 8},
  statIconText: {fontSize: 17, fontWeight: '800'},
  statValue: {fontSize: 20, color: '#1C2030', fontWeight: '800'},
  statLabel: {fontSize: 10.5, color: '#83899A', marginTop: 3, textAlign: 'center'},
  searchBox: {height: 54, borderRadius: 17, backgroundColor: '#FFFFFF', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginBottom: 24, borderWidth: 1, borderColor: 'rgba(223,226,235,0.7)'},
  searchIcon: {fontSize: 25, color: '#777E91', marginRight: 10, marginTop: -3},
  searchInput: {flex: 1, height: '100%', fontSize: 14, color: '#1B1E2C', paddingVertical: 0},
  clearText: {fontSize: 25, color: '#9BA1B1', paddingLeft: 8},
  sectionHeading: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14},
  sectionTitle: {fontSize: 19, fontWeight: '800', color: '#1B1E2C', letterSpacing: -0.25},
  sectionSubtitle: {fontSize: 11, color: '#8A90A2', marginTop: 4},
  seeAll: {fontSize: 12, color: '#665DE0', fontWeight: '700'},
  courseCard: {backgroundColor: '#FFFFFF', minHeight: 96, borderRadius: 21, flexDirection: 'row', alignItems: 'center', padding: 14, marginBottom: 12, shadowColor: '#263052', shadowOffset: {width: 0, height: 5}, shadowOpacity: 0.05, shadowRadius: 12, elevation: 2},
  courseCardPressed: {transform: [{scale: 0.985}], opacity: 0.86},
  courseIcon: {width: 52, height: 52, borderRadius: 17, alignItems: 'center', justifyContent: 'center', marginRight: 13},
  courseIconText: {fontSize: 25, fontWeight: '800'},
  courseContent: {flex: 1},
  courseHeading: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  courseTitle: {fontSize: 14.5, fontWeight: '700', color: '#1D2130', flex: 1, marginRight: 8},
  progressLabel: {fontSize: 10.5, fontWeight: '800'},
  lessonCount: {fontSize: 11, color: '#8B91A1', marginTop: 5, marginBottom: 10},
  progressTrack: {height: 5, borderRadius: 3, backgroundColor: '#ECEEF4', overflow: 'hidden'},
  progressTrackDark: {backgroundColor: '#343849'},
  progressFill: {height: '100%', borderRadius: 3},
  chevron: {fontSize: 23, color: '#B2B6C1', marginLeft: 11},
  bottomNav: {position: 'absolute', bottom: 0, left: 0, right: 0, height: 86, backgroundColor: '#FFFFFF', flexDirection: 'row', alignItems: 'flex-start', paddingTop: 9, paddingHorizontal: 12, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#E8EAF1', shadowColor: '#1D2540', shadowOffset: {width: 0, height: -5}, shadowOpacity: 0.05, shadowRadius: 14, elevation: 9},
  bottomNavDark: {backgroundColor: '#191D29', borderTopColor: '#292E3E'},
  navItem: {flex: 1, alignItems: 'center'},
  navIconWrap: {width: 42, height: 31, borderRadius: 13, alignItems: 'center', justifyContent: 'center'},
  navIconWrapActive: {backgroundColor: '#EEECFF'},
  navIcon: {fontSize: 20, color: '#969CAB', fontWeight: '600'},
  navLabel: {fontSize: 10, color: '#969CAB', fontWeight: '600', marginTop: 4},
  navActive: {color: '#6259D9', fontWeight: '800'},
  navBadge: {position: 'absolute', top: -3, right: 2, minWidth: 16, height: 16, borderRadius: 8, backgroundColor: '#FF655C', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#FFFFFF'},
  navBadgeText: {fontSize: 8, color: '#FFFFFF', fontWeight: '800'},
  emptyState: {alignItems: 'center', paddingVertical: 40},
  emptyIcon: {fontSize: 42, color: '#A4A9B8'},
  emptyTitle: {fontSize: 16, fontWeight: '700', color: '#1D2130', marginTop: 8},
  emptyBody: {fontSize: 12, color: '#898FA0', marginTop: 5},
  cardDark: {backgroundColor: '#1B1F2C', borderColor: '#2C3142'},
  textDark: {color: '#F4F5F8'},
  mutedDark: {color: '#9CA3B6'},
});
