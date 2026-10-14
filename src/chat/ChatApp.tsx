import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  FlatList,
  Image,
  ImageSourcePropType,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  MessageEntrance,
  MotionProvider,
  MotionTouchable,
  motion,
  useReducedMotion,
} from './motion';
import { colors, spacing } from './theme';
import { NavigationContainer } from '@react-navigation/native';
import {
  BottomTabScreenProps,
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import {
  Bell,
  ChevronLeft,
  LogOut,
  MessageCircle,
  Search,
  Send,
  Settings,
  Users,
  UserRound,
  ShieldCheck,
  Info,
  Eye,
  EyeOff,
  LockKeyhole,
  ArrowRight,
  SquarePen,
} from 'lucide-react-native';

type Routes = {
  Login: undefined;
  Home: undefined;
  Contacts: undefined;
  Notifications: undefined;
  Settings: undefined;
  Chat: { id: string };
};
type Message = { id: string; text: string; mine: boolean; time: string };
type Person = {
  id: string;
  name: string;
  online: boolean;
  color: string;
  avatar: ImageSourcePropType;
};
type Conversation = { id: string; unread: number; messages: Message[] };
const people: Person[] = [
  {
    id: '1',
    name: 'Minh Anh',
    online: true,
    color: '#e1e9ff',
    avatar: require('./assets/blue.png'),
  },
  {
    id: '2',
    name: 'Hoàng Nam',
    online: true,
    color: '#e1f3ee',
    avatar: require('./assets/green.png'),
  },
  {
    id: '3',
    name: 'Thu Hà',
    online: false,
    color: '#ffeadf',
    avatar: require('./assets/orange.png'),
  },
  {
    id: '4',
    name: 'Đức Huy',
    online: false,
    color: '#eee5fc',
    avatar: require('./assets/purple.png'),
  },
  {
    id: '5',
    name: 'Ngọc Linh',
    online: true,
    color: '#ffe5ef',
    avatar: require('./assets/pink.png'),
  },
  {
    id: '6',
    name: 'Gia Bảo',
    online: false,
    color: '#e1f1fa',
    avatar: require('./assets/cyan.png'),
  },
];
const previews = [
  'Chiều nay mình gặp nhau nhé!',
  'Mình đã gửi tài liệu cho bạn rồi.',
  'Cảm ơn bạn nhiều nha',
  'Hẹn gặp bạn vào ngày mai!',
  'Cuối tuần đi dạo không bạn?',
];
const initialConversations = (): Conversation[] =>
  people.slice(0, 5).map((p, i) => ({
    id: p.id,
    unread: i === 0 ? 2 : i === 1 ? 1 : 0,
    messages: [
      {
        id: `${p.id}-a`,
        text: 'Chào bạn! Hôm nay bạn thế nào?',
        mine: true,
        time: '09:15',
      },
      {
        id: `${p.id}-b`,
        text: previews[i]!,
        mine: false,
        time: ['09:41', '09:30', '08:45', 'Hôm qua', 'Hôm qua'][i]!,
      },
    ],
  }));
const initialNotices = () => [
  {
    id: 'n1',
    text: 'Minh Anh đã gửi cho bạn một tin nhắn mới.',
    time: '5 phút trước',
    read: false,
    personId: '1',
  },
  {
    id: 'n2',
    text: 'Hoàng Nam đã gửi cho bạn tài liệu cuộc họp.',
    time: '15 phút trước',
    read: false,
    personId: '2',
  },
  {
    id: 'n3',
    text: 'Chào mừng bạn đến với ChitChat! Bắt đầu kết nối với bạn bè nhé.',
    time: 'Hôm qua',
    read: true,
    personId: null,
  },
];
const timeNow = () =>
  new Date().toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  });
const matches = (name: string, query: string) =>
  name
    .toLocaleLowerCase('vi')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .includes(
      query
        .trim()
        .toLocaleLowerCase('vi')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd'),
    );
function useChatState() {
  const [account, setAccount] = useState<string | null>(null);
  const [conversations, setConversations] = useState(initialConversations);
  const [notices, setNotices] = useState(initialNotices);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const open = (id: string) =>
    setConversations(current =>
      current.some(c => c.id === id)
        ? current.map(c => (c.id === id ? { ...c, unread: 0 } : c))
        : [{ id, unread: 0, messages: [] }, ...current],
    );
  const send = (id: string, text: string) => {
    if (!text.trim()) return;
    const message: Message = {
      id: `${Date.now()}-${Math.random()}`,
      text: text.trim(),
      mine: true,
      time: timeNow(),
    };
    setConversations(current => {
      const conversation = current.find(c => c.id === id) ?? {
        id,
        unread: 0,
        messages: [],
      };
      return [
        {
          ...conversation,
          unread: 0,
          messages: [...conversation.messages, message],
        },
        ...current.filter(c => c.id !== id),
      ];
    });
  };
  const markRead = (id?: string) =>
    setNotices(current =>
      current.map(n => (!id || n.id === id ? { ...n, read: true } : n)),
    );
  const logout = () => {
    setAccount(null);
    setConversations(initialConversations());
    setNotices(initialNotices());
    setNotificationsEnabled(true);
  };
  return {
    account,
    setAccount,
    conversations,
    notices,
    notificationsEnabled,
    setNotificationsEnabled,
    open,
    send,
    markRead,
    logout,
  };
}
const Context = createContext<ReturnType<typeof useChatState> | null>(null);
const useChat = () => useContext(Context)!;
const Tab = createBottomTabNavigator<Routes>();
function Avatar({
  person,
  small = false,
}: {
  person: Person;
  small?: boolean;
}) {
  return (
    <View
      style={[
        s.avatar,
        { backgroundColor: person.color },
        small && s.avatarSmall,
      ]}
    >
      <Image source={person.avatar} style={s.avatarImage} accessible={false} />
      {person.online && <View style={s.onlineDot} />}
    </View>
  );
}
function Header({
  title,
  subtitle,
  count,
}: {
  title: string;
  subtitle: string;
  count?: number;
}) {
  return (
    <View style={s.header}>
      <View style={s.headerBody}>
        <View style={s.brandLine}>
          <MessageCircle size={15} color={colors.primary} />
          <Text style={s.eyebrow}>ChitChat</Text>
        </View>
        <Text style={s.title}>{title}</Text>
        <Text style={s.muted}>{subtitle}</Text>
      </View>
      {count !== undefined && (
        <View style={s.count}>
          <Text style={s.countText}>{count}</Text>
        </View>
      )}
    </View>
  );
}
function SearchBox({
  value,
  onChangeText,
  placeholder,
}: {
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={[s.search, focused && s.searchFocused]}>
      <Search size={19} color={colors.muted} />
      <TextInput
        accessibilityLabel={placeholder}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        value={value}
        onChangeText={onChangeText}
        style={s.searchInput}
      />
      {value.length > 0 && (
        <MotionTouchable
          accessibilityRole="button"
          accessibilityLabel="Xóa tìm kiếm"
          style={s.clearSearch}
          onPress={() => onChangeText('')}
        >
          <Text style={s.link}>Xóa</Text>
        </MotionTouchable>
      )}
    </View>
  );
}
function Empty({ text }: { text: string }) {
  return (
    <View style={s.emptyState}>
      <View style={s.emptyIcon}>
        <MessageCircle size={28} color={colors.primary} />
      </View>
      <Text style={s.empty}>{text}</Text>
      <Text style={s.muted}>Thử tìm bằng một tên khác.</Text>
    </View>
  );
}
function LoginScreen() {
  const { setAccount } = useChat();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [visible, setVisible] = useState(false);
  const [focused, setFocused] = useState<'username' | 'password' | null>(null);
  const [error, setError] = useState('');
  const passwordInput = useRef<React.ComponentRef<typeof TextInput>>(null);
  const login = () => {
    if (!username.trim() || !password.trim()) {
      setError('Vui lòng nhập đầy đủ tài khoản và mật khẩu.');
      return;
    }
    setAccount(username.trim());
  };
  return (
    <SafeAreaView style={s.screen}>
      <KeyboardAvoidingView
        style={s.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={s.login}
        >
          <View style={s.loginBrand}>
            <View style={s.loginBrandIcon}>
              <MessageCircle size={24} color={colors.onPrimary} />
            </View>
            <Text style={s.loginBrandName}>ChitChat</Text>
            <View style={s.demoPill}>
              <Text style={s.demoPillText}>DEMO</Text>
            </View>
          </View>
          <View style={s.loginHero}>
            <View style={s.heroBadge}>
              <View style={s.statusDot} />
              <Text style={s.heroBadgeText}>Kết nối từ những điều nhỏ</Text>
            </View>
            <Text style={s.loginHeadline}>
              Một lời chào.{'\n'}Thêm gần nhau.
            </Text>
            <Text style={s.loginDescription}>
              Chia sẻ một câu chuyện, bắt đầu một cuộc trò chuyện cùng những
              người bạn yêu quý.
            </Text>
            <View style={s.loginConversation}>
              <View style={s.sampleBubble}>
                <MessageCircle size={18} color={colors.primary} />
                <Text style={s.sampleBubbleText}>Hôm nay bạn thế nào?</Text>
              </View>
              <View style={s.sampleReply}>
                <Text style={s.sampleReplyText}>Rất vui vì được gặp bạn!</Text>
              </View>
            </View>
          </View>
          <View style={s.loginForm}>
            <Text style={s.loginFormTitle}>Chào mừng trở lại</Text>
            <Text style={s.muted}>
              Đăng nhập để tiếp tục câu chuyện của bạn.
            </Text>
            <Text style={s.label}>Tài khoản</Text>
            <View
              style={[
                s.loginInputRow,
                focused === 'username' && s.loginInputFocused,
                !!error && !username.trim() && s.loginInputError,
              ]}
            >
              <UserRound
                size={20}
                color={focused === 'username' ? colors.primary : colors.muted}
              />
              <TextInput
                accessibilityLabel="Tài khoản"
                style={s.loginInput}
                placeholder="Nhập tài khoản của bạn"
                placeholderTextColor={colors.muted}
                autoCapitalize="none"
                autoCorrect={false}
                value={username}
                onChangeText={value => {
                  setUsername(value);
                  setError('');
                }}
                textContentType="username"
                returnKeyType="next"
                onSubmitEditing={() => passwordInput.current?.focus()}
                onFocus={() => setFocused('username')}
                onBlur={() => setFocused(null)}
              />
            </View>
            <Text style={s.label}>Mật khẩu</Text>
            <View
              style={[
                s.loginInputRow,
                focused === 'password' && s.loginInputFocused,
                !!error && !password.trim() && s.loginInputError,
              ]}
            >
              <LockKeyhole
                size={20}
                color={focused === 'password' ? colors.primary : colors.muted}
              />
              <TextInput
                ref={passwordInput}
                accessibilityLabel="Mật khẩu"
                style={s.loginInput}
                placeholder="Nhập mật khẩu"
                placeholderTextColor={colors.muted}
                secureTextEntry={!visible}
                value={password}
                onChangeText={value => {
                  setPassword(value);
                  setError('');
                }}
                textContentType="password"
                onSubmitEditing={login}
                returnKeyType="go"
                onFocus={() => setFocused('password')}
                onBlur={() => setFocused(null)}
              />
              <MotionTouchable
                accessibilityRole="button"
                accessibilityLabel={visible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                accessibilityState={{ expanded: visible }}
                style={s.passwordToggle}
                onPress={() => setVisible(value => !value)}
              >
                {visible ? (
                  <EyeOff size={20} color={colors.muted} />
                ) : (
                  <Eye size={20} color={colors.muted} />
                )}
              </MotionTouchable>
            </View>
            {error ? (
              <Text
                accessibilityRole="alert"
                accessibilityLiveRegion="polite"
                style={s.error}
              >
                {error}
              </Text>
            ) : null}
            <MotionTouchable
              accessibilityRole="button"
              accessibilityLabel="Đăng nhập"
              style={s.loginSubmit}
              onPress={login}
            >
              <Text style={s.buttonText}>Đăng nhập</Text>
              <ArrowRight size={20} color={colors.onPrimary} />
            </MotionTouchable>
            <View style={s.loginDemo}>
              <Info size={18} color={colors.primary} />
              <Text style={s.loginDemoText}>
                Dùng tài khoản và mật khẩu bất kỳ không rỗng để khám phá bản
                demo.
              </Text>
            </View>
          </View>
          <Text style={s.loginFooter}>Một nơi nhỏ cho những kết nối lớn.</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
function HomeScreen({ navigation }: BottomTabScreenProps<Routes, 'Home'>) {
  const { account, conversations, open } = useChat();
  const [query, setQuery] = useState('');
  const [unreadOnly, setUnreadOnly] = useState(false);
  const unreadCount = conversations.filter(c => c.unread > 0).length;
  const filtered = conversations.filter(
    c =>
      matches(people.find(p => p.id === c.id)!.name, query) &&
      (!unreadOnly || c.unread > 0),
  );
  return (
    <SafeAreaView edges={['top']} style={s.screen}>
      <View style={s.inboxHeader}>
        <View style={s.rowBody}>
          <Text style={s.inboxGreeting} numberOfLines={1}>
            Xin chào, {account}
          </Text>
          <Text style={s.inboxTitle}>Tin nhắn</Text>
        </View>
        <MotionTouchable
          accessibilityRole="button"
          accessibilityLabel="Cuộc trò chuyện mới"
          style={s.composeNew}
          onPress={() => navigation.navigate('Contacts')}
        >
          <SquarePen size={23} color={colors.onPrimary} />
        </MotionTouchable>
      </View>
      <SearchBox
        value={query}
        onChangeText={setQuery}
        placeholder="Tìm kiếm cuộc trò chuyện"
      />
      <View style={s.inboxFilters}>
        <MotionTouchable
          accessibilityRole="button"
          accessibilityLabel="Tất cả cuộc trò chuyện"
          accessibilityState={{ selected: !unreadOnly }}
          style={[s.inboxFilter, !unreadOnly && s.inboxFilterActive]}
          onPress={() => setUnreadOnly(false)}
        >
          <Text
            style={[s.inboxFilterText, !unreadOnly && s.inboxFilterTextActive]}
          >
            Tất cả
          </Text>
          <Text style={[s.filterCount, !unreadOnly && s.inboxFilterTextActive]}>
            {conversations.length}
          </Text>
        </MotionTouchable>
        <MotionTouchable
          accessibilityRole="button"
          accessibilityLabel="Cuộc trò chuyện chưa đọc"
          accessibilityState={{ selected: unreadOnly }}
          style={[s.inboxFilter, unreadOnly && s.inboxFilterActive]}
          onPress={() => setUnreadOnly(true)}
        >
          <Text
            style={[s.inboxFilterText, unreadOnly && s.inboxFilterTextActive]}
          >
            Chưa đọc
          </Text>
          {unreadCount > 0 && (
            <Text
              style={[s.filterCount, unreadOnly && s.inboxFilterTextActive]}
            >
              {unreadCount}
            </Text>
          )}
        </MotionTouchable>
      </View>
      <FlatList
        data={filtered}
        keyExtractor={c => c.id}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={s.inboxList}
        ListHeaderComponent={
          <View>
            {!query.trim() && !unreadOnly && (
              <View style={s.onlineSection}>
                <View style={s.listHeading}>
                  <Text style={s.inboxSectionTitle}>Bạn bè đang online</Text>
                  <View style={s.onlineLabel}>
                    <View style={s.statusDot} />
                    <Text style={s.onlineCount}>
                      {people.filter(p => p.online).length} online
                    </Text>
                  </View>
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={s.onlinePeople}
                >
                  {people
                    .filter(p => p.online)
                    .map(person => (
                      <MotionTouchable
                        key={person.id}
                        accessibilityRole="button"
                        accessibilityLabel={`Mở chat với ${person.name}`}
                        style={s.onlinePerson}
                        onPress={() => {
                          open(person.id);
                          navigation.navigate('Chat', { id: person.id });
                        }}
                      >
                        <View style={s.onlineAvatarRing}>
                          <Avatar person={person} />
                        </View>
                        <Text numberOfLines={1} style={s.onlineName}>
                          {person.name}
                        </Text>
                      </MotionTouchable>
                    ))}
                </ScrollView>
              </View>
            )}
            <View style={s.inboxListHeading}>
              <Text style={s.inboxSectionTitle}>Cuộc trò chuyện</Text>
              <Text style={s.inboxResultCount}>
                {filtered.length}
                {query.trim() ? ' kết quả' : ''}
              </Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={s.emptyState}>
            <View style={s.emptyIcon}>
              <MessageCircle size={28} color={colors.primary} />
            </View>
            <Text style={s.empty}>
              {query.trim()
                ? 'Không tìm thấy cuộc trò chuyện.'
                : 'Bạn đã đọc hết tin nhắn'}
            </Text>
            <Text style={s.muted}>
              {query.trim()
                ? 'Thử tìm bằng một tên khác.'
                : 'Mọi cuộc trò chuyện đều đã được cập nhật.'}
            </Text>
            <MotionTouchable
              accessibilityRole="button"
              style={s.greetingButton}
              onPress={() => {
                setQuery('');
                setUnreadOnly(false);
              }}
            >
              <Text style={s.greetingText}>Xem tất cả cuộc trò chuyện</Text>
            </MotionTouchable>
          </View>
        }
        renderItem={({ item }) => {
          const person = people.find(p => p.id === item.id)!;
          const last = item.messages[item.messages.length - 1];
          return (
            <MotionTouchable
              accessibilityRole="button"
              accessibilityLabel={`Trò chuyện với ${person.name}`}
              style={[s.inboxRow, item.unread > 0 && s.inboxRowUnread]}
              onPress={() => {
                open(item.id);
                navigation.navigate('Chat', { id: item.id });
              }}
            >
              <Avatar person={person} />
              <View style={s.inboxRowBody}>
                <Text
                  numberOfLines={1}
                  style={[s.inboxName, item.unread > 0 && s.inboxNameUnread]}
                >
                  {person.name}
                </Text>
                <Text
                  numberOfLines={1}
                  style={[s.inboxPreview, item.unread > 0 && s.unreadText]}
                >
                  {last
                    ? `${last.mine ? 'Bạn: ' : ''}${last.text}`
                    : 'Bắt đầu cuộc trò chuyện'}
                </Text>
              </View>
              <View style={s.inboxTrailing}>
                <Text
                  style={[s.inboxTime, item.unread > 0 && s.inboxTimeUnread]}
                >
                  {last?.time ?? ''}
                </Text>
                {item.unread > 0 ? (
                  <View style={s.inboxUnreadBadge}>
                    <Text style={s.badgeText}>{item.unread}</Text>
                  </View>
                ) : (
                  <View style={s.inboxBadgeSpace} />
                )}
              </View>
            </MotionTouchable>
          );
        }}
      />
    </SafeAreaView>
  );
}
function ContactsScreen({
  navigation,
}: BottomTabScreenProps<Routes, 'Contacts'>) {
  const { open } = useChat();
  const [query, setQuery] = useState('');
  return (
    <SafeAreaView edges={['top']} style={s.screen}>
      <Header
        title="Danh bạ"
        subtitle={`${
          people.filter(p => p.online).length
        } người đang trực tuyến`}
      />
      <SearchBox
        value={query}
        onChangeText={setQuery}
        placeholder="Tìm kiếm danh bạ"
      />
      <FlatList
        data={people.filter(p => matches(p.name, query))}
        keyExtractor={p => p.id}
        ListEmptyComponent={<Empty text="Không tìm thấy người dùng." />}
        renderItem={({ item }) => (
          <MotionTouchable
            accessibilityRole="button"
            style={s.row}
            onPress={() => {
              open(item.id);
              navigation.navigate('Chat', { id: item.id });
            }}
          >
            <Avatar person={item} />
            <View style={s.rowBody}>
              <Text style={s.name}>{item.name}</Text>
              <Text style={[s.preview, item.online && s.onlineText]}>
                {item.online ? 'Đang trực tuyến' : 'Ngoại tuyến'}
              </Text>
            </View>
            <MessageCircle size={21} color={colors.primary} />
          </MotionTouchable>
        )}
      />
    </SafeAreaView>
  );
}
function NotificationsScreen({
  navigation,
}: BottomTabScreenProps<Routes, 'Notifications'>) {
  const { notices, markRead, open } = useChat();
  const unread = notices.filter(n => !n.read).length;
  return (
    <SafeAreaView edges={['top']} style={s.screen}>
      <Header title="Thông báo" subtitle={`${unread} thông báo chưa đọc`} />
      <View style={s.listHeading}>
        <Text style={s.sectionTitle}>Hoạt động gần đây</Text>
        <MotionTouchable accessibilityRole="button" onPress={() => markRead()}>
          <Text style={s.link}>Đọc tất cả</Text>
        </MotionTouchable>
      </View>
      <FlatList
        data={notices}
        keyExtractor={n => n.id}
        renderItem={({ item }) => (
          <View style={[s.notice, !item.read && s.noticeUnread]}>
            <View style={s.noticeIcon}>
              <Bell size={21} color={colors.primary} />
            </View>
            <View style={s.rowBody}>
              <Text style={[s.noticeText, !item.read && s.unreadText]}>
                {item.text}
              </Text>
              <Text style={s.time}>
                {item.time} · {item.read ? 'Đã đọc' : 'Chưa đọc'}
              </Text>
              <View style={s.actions}>
                {!item.read && (
                  <MotionTouchable
                    accessibilityRole="button"
                    onPress={() => markRead(item.id)}
                  >
                    <Text style={s.link}>Đánh dấu đã đọc</Text>
                  </MotionTouchable>
                )}
                {item.personId && (
                  <MotionTouchable
                    accessibilityRole="button"
                    onPress={() => {
                      markRead(item.id);
                      open(item.personId!);
                      navigation.navigate('Chat', { id: item.personId! });
                    }}
                  >
                    <Text style={s.link}>Xem tin nhắn</Text>
                  </MotionTouchable>
                )}
              </View>
            </View>
            {!item.read && <View style={s.unreadDot} />}
          </View>
        )}
      />
    </SafeAreaView>
  );
}
function SettingsScreen() {
  const {
    account,
    conversations,
    notificationsEnabled,
    setNotificationsEnabled,
    logout,
  } = useChat();
  const unread = conversations.reduce(
    (sum, conversation) => sum + conversation.unread,
    0,
  );
  return (
    <SafeAreaView edges={['top']} style={s.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.settingsScroll}
      >
        <Header
          title="Cài đặt"
          subtitle="Không gian của bạn, theo cách bạn muốn."
        />
        <View style={s.settings}>
          <View style={s.profile}>
            <View style={s.profileTop}>
              <Avatar
                person={{
                  id: 'me',
                  name: account!,
                  online: true,
                  color: colors.primarySoft,
                  avatar: require('./assets/green.png'),
                }}
              />
              <View style={s.rowBody}>
                <Text style={s.profileCaption}>TÀI KHOẢN CỦA BẠN</Text>
                <Text
                  style={s.profileName}
                  numberOfLines={1}
                  ellipsizeMode="middle"
                  adjustsFontSizeToFit
                  minimumFontScale={0.8}
                >
                  {account}
                </Text>
                <View style={s.profileStatus}>
                  <View style={s.profileStatusDot} />
                  <Text style={s.profileStatusText}>Đang hoạt động</Text>
                </View>
              </View>
            </View>
            <View style={s.profileStats}>
              <View style={s.profileStat}>
                <Text style={s.statNumber}>{conversations.length}</Text>
                <Text style={s.statLabel}>Cuộc trò chuyện</Text>
              </View>
              <View style={s.statDivider} />
              <View style={s.profileStat}>
                <Text style={s.statNumber}>{unread}</Text>
                <Text style={s.statLabel}>Tin nhắn chưa đọc</Text>
              </View>
            </View>
          </View>
          <Text style={s.settingsSection}>Thông tin cá nhân</Text>
          <View style={s.settingGroup}>
            <View style={s.settingRow}>
              <View style={s.settingIcon}>
                <UserRound size={20} color={colors.primary} />
              </View>
              <View style={s.rowBody}>
                <Text style={s.settingLabel}>Tên tài khoản</Text>
                <Text style={s.name} numberOfLines={1} ellipsizeMode="middle">
                  {account}
                </Text>
              </View>
            </View>
            <View style={s.settingDivider} />
            <View style={s.settingRow}>
              <View style={s.settingIcon}>
                <ShieldCheck size={20} color={colors.primary} />
              </View>
              <View style={s.rowBody}>
                <Text style={s.name}>Phiên đăng nhập demo</Text>
                <Text style={s.preview}>
                  Dữ liệu được lưu trên ứng dụng trong phiên này.
                </Text>
              </View>
            </View>
          </View>
          <Text style={s.settingsSection}>Trải nghiệm</Text>
          <View style={s.settingGroup}>
            <View style={s.settingRow}>
              <View style={s.settingIcon}>
                <Bell size={20} color={colors.primary} />
              </View>
              <View style={s.rowBody}>
                <Text style={s.name}>Huy hiệu thông báo</Text>
                <Text style={s.preview}>
                  Số thông báo chưa đọc trên thanh điều hướng
                </Text>
              </View>
              <Switch
                accessibilityLabel="Huy hiệu thông báo"
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: colors.border, true: colors.primary }}
              />
            </View>
          </View>
          <Text style={s.settingsHint}>
            {notificationsEnabled
              ? 'Huy hiệu đang bật. Bạn sẽ thấy số thông báo chưa đọc.'
              : 'Huy hiệu đang tắt. Bạn vẫn có thể xem tất cả thông báo.'}
          </Text>
          <MotionTouchable
            accessibilityRole="button"
            accessibilityLabel="Đăng xuất"
            onPress={logout}
            style={s.logout}
          >
            <LogOut size={20} color={colors.error} />
            <View style={s.rowBody}>
              <Text style={s.logoutText}>Đăng xuất</Text>
              <Text style={s.preview}>
                Kết thúc phiên và đặt lại dữ liệu mẫu
              </Text>
            </View>
          </MotionTouchable>
          <View style={s.settingsFooter}>
            <MessageCircle size={18} color={colors.primary} />
            <Text style={s.footerBrand}>ChitChat</Text>
            <Text style={s.settingLabel}>Phiên bản 1.0</Text>
          </View>
          <View style={s.demoNote}>
            <Info size={14} color={colors.muted} />
            <Text style={s.demoNoteText}>
              Bản demo sử dụng dữ liệu mẫu, không kết nối máy chủ.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
function ChatScreen({
  navigation,
  route,
}: BottomTabScreenProps<Routes, 'Chat'>) {
  const { conversations, send } = useChat();
  const reducedMotion = useReducedMotion();
  const [draft, setDraft] = useState('');
  const [showInfo, setShowInfo] = useState(false);
  const [focused, setFocused] = useState(false);
  const list = useRef<FlatList<Message>>(null);
  const person = people.find(p => p.id === route.params.id)!;
  useEffect(() => {
    setDraft('');
    setShowInfo(false);
  }, [person.id]);
  const messages = conversations.find(c => c.id === person.id)?.messages ?? [];
  const submit = () => {
    if (draft.trim()) {
      send(person.id, draft);
      setDraft('');
    }
  };
  return (
    <SafeAreaView style={s.screen}>
      <KeyboardAvoidingView
        style={s.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={s.chatHeader}>
          <MotionTouchable
            accessibilityRole="button"
            accessibilityLabel="Quay lại"
            style={s.back}
            onPress={() => navigation.goBack()}
          >
            <ChevronLeft size={24} color={colors.text} />
          </MotionTouchable>
          <Avatar person={person} small />
          <View style={s.rowBody}>
            <Text numberOfLines={1} style={s.name}>
              {person.name}
            </Text>
            <View style={s.chatStatus}>
              <View
                style={[s.chatStatusDot, !person.online && s.offlineStatus]}
              />
              <Text style={s.chatStatusText}>
                {person.online ? 'Đang trực tuyến' : 'Ngoại tuyến'}
              </Text>
            </View>
          </View>
          <MotionTouchable
            accessibilityRole="button"
            accessibilityLabel="Thông tin hội thoại"
            accessibilityState={{ expanded: showInfo }}
            style={[s.chatInfoButton, showInfo && s.chatInfoActive]}
            onPress={() => setShowInfo(value => !value)}
          >
            <Info size={21} color={colors.primary} />
          </MotionTouchable>
        </View>
        {showInfo && (
          <View style={s.chatInfoPanel}>
            <Info size={18} color={colors.primary} />
            <Text style={s.chatInfoText}>
              Đây là hội thoại demo với {person.name}. Tin nhắn chỉ lưu trong
              phiên sử dụng và được đặt lại khi đăng xuất.
            </Text>
          </View>
        )}
        <FlatList
          ref={list}
          data={messages}
          keyExtractor={m => m.id}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={
            Platform.OS === 'ios' ? 'interactive' : 'on-drag'
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={s.messages}
          onContentSizeChange={() =>
            list.current?.scrollToEnd({ animated: !reducedMotion })
          }
          ListHeaderComponent={
            <View style={s.conversationIntro}>
              <Avatar person={person} />
              <Text style={s.conversationName}>{person.name}</Text>
              <Text style={s.conversationCaption}>
                Những câu chuyện nhỏ, kết nối mỗi ngày.
              </Text>
              <View style={s.conversationSeparator}>
                <View style={s.conversationLine} />
                <Text style={s.conversationLabel}>HỘI THOẠI MẪU</Text>
                <View style={s.conversationLine} />
              </View>
            </View>
          }
          ListEmptyComponent={
            <View style={s.chatEmpty}>
              <Text style={s.chatEmptyTitle}>Bắt đầu bằng một lời chào</Text>
              <Text style={s.conversationCaption}>
                Gửi tin nhắn đầu tiên đến {person.name}.
              </Text>
              <MotionTouchable
                accessibilityRole="button"
                accessibilityLabel="Gửi lời chào"
                style={s.greetingButton}
                onPress={() => send(person.id, `Chào ${person.name}!`)}
              >
                <MessageCircle size={18} color={colors.primary} />
                <Text style={s.greetingText}>Chào {person.name}!</Text>
              </MotionTouchable>
            </View>
          }
          renderItem={({ item, index }) => {
            const previous = messages[index - 1];
            const grouped = previous?.mine === item.mine;
            return (
              <View
                style={[
                  s.messageRow,
                  item.mine && s.myMessageRow,
                  grouped && s.groupedMessage,
                ]}
              >
                {!item.mine && (
                  <View style={s.messageAvatar}>
                    {!grouped && <Avatar person={person} small />}
                  </View>
                )}
                <MessageEntrance
                  recent={
                    item.mine &&
                    /^\d{13}-/.test(item.id) &&
                    Date.now() - Number(item.id.split('-')[0]) < 1000
                  }
                  style={[s.bubble, item.mine ? s.myBubble : s.theirBubble]}
                >
                  <Text
                    selectable
                    style={[s.messageText, item.mine && s.myText]}
                  >
                    {item.text}
                  </Text>
                  <View style={s.messageMeta}>
                    <Text style={[s.messageTime, item.mine && s.myTime]}>
                      {item.time}
                    </Text>
                  </View>
                </MessageEntrance>
              </View>
            );
          }}
        />
        <View style={s.composerArea}>
          <View style={[s.composer, focused && s.composerFocused]}>
            <TextInput
              key={person.id}
              accessibilityLabel="Nội dung tin nhắn"
              placeholder={`Nhắn cho ${person.name}…`}
              placeholderTextColor={colors.muted}
              value={draft}
              onChangeText={setDraft}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              style={s.composeInput}
              multiline
              maxLength={2000}
            />
            <MotionTouchable
              accessibilityRole="button"
              accessibilityLabel="Gửi tin nhắn"
              disabled={!draft.trim()}
              style={[s.send, !draft.trim() && s.sendDisabled]}
              onPress={submit}
            >
              <Send size={20} color={colors.onPrimary} />
            </MotionTouchable>
          </View>
          <Text style={s.composerNote}>
            {draft.length > 1800
              ? `${draft.length}/2000 ký tự`
              : 'Tin nhắn mẫu · Lưu trong phiên sử dụng'}
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
function MessageCircleTabIcon({
  color,
  size,
}: {
  color: string;
  size: number;
}) {
  return <MessageCircle color={color} size={size} />;
}
function UsersTabIcon({ color, size }: { color: string; size: number }) {
  return <Users color={color} size={size} />;
}
function BellTabIcon({ color, size }: { color: string; size: number }) {
  return <Bell color={color} size={size} />;
}
function SettingsTabIcon({ color, size }: { color: string; size: number }) {
  return <Settings color={color} size={size} />;
}
function Navigation() {
  const reducedMotion = useReducedMotion();
  const { account, conversations, notices, notificationsEnabled } = useChat();
  const unread = conversations.reduce((sum, c) => sum + c.unread, 0);
  const alerts = notices.filter(n => !n.read).length;
  return (
    <NavigationContainer>
      <Tab.Navigator
        key={account ? 'signed-in' : 'signed-out'}
        backBehavior="history"
        screenOptions={{
          headerShown: false,
          animation: reducedMotion ? 'none' : 'fade',
          transitionSpec: {
            animation: 'timing',
            config: {
              duration: reducedMotion ? 0 : motion.screenDuration,
              easing: motion.easing,
            },
          },
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.muted,
          tabBarStyle: s.tabBar,
          tabBarHideOnKeyboard: true,
          tabBarLabelStyle: s.tabLabel,
        }}
      >
        {account ? (
          <>
            <Tab.Screen
              name="Home"
              component={HomeScreen}
              options={{
                title: 'Tin nhắn',
                tabBarAccessibilityLabel: 'Tin nhắn',
                tabBarBadge: unread || undefined,
                tabBarIcon: MessageCircleTabIcon,
              }}
            />
            <Tab.Screen
              name="Contacts"
              component={ContactsScreen}
              options={{
                title: 'Danh bạ',
                tabBarAccessibilityLabel: 'Danh bạ',
                tabBarIcon: UsersTabIcon,
              }}
            />
            <Tab.Screen
              name="Notifications"
              component={NotificationsScreen}
              options={{
                title: 'Thông báo',
                tabBarAccessibilityLabel: 'Thông báo',
                tabBarBadge:
                  notificationsEnabled && alerts ? alerts : undefined,
                tabBarIcon: BellTabIcon,
              }}
            />
            <Tab.Screen
              name="Settings"
              component={SettingsScreen}
              options={{
                title: 'Cài đặt',
                tabBarAccessibilityLabel: 'Cài đặt',
                tabBarIcon: SettingsTabIcon,
              }}
            />
            <Tab.Screen
              name="Chat"
              component={ChatScreen}
              getId={({ params }) => params?.id}
              options={{
                tabBarButton: () => null,
                tabBarItemStyle: { display: 'none' },
                tabBarStyle: { display: 'none' },
              }}
            />
          </>
        ) : (
          <Tab.Screen
            name="Login"
            component={LoginScreen}
            options={{ tabBarStyle: { display: 'none' } }}
          />
        )}
      </Tab.Navigator>
    </NavigationContainer>
  );
}
export default function ChatApp() {
  const state = useChatState();
  return (
    <SafeAreaProvider>
      <Context.Provider value={state}>
        <StatusBar barStyle="dark-content" />
        <MotionProvider>
          <Navigation />
        </MotionProvider>
      </Context.Provider>
    </SafeAreaProvider>
  );
}
const s = StyleSheet.create({
  flex: { flex: 1 },
  inboxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
  },
  inboxGreeting: { fontSize: 13, color: colors.muted, lineHeight: 19 },
  inboxTitle: {
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: -0.8,
    color: colors.text,
  },
  composeNew: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inboxFilters: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
  },
  inboxFilter: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: spacing.lg,
    borderRadius: 22,
    backgroundColor: colors.input,
  },
  inboxFilterActive: { backgroundColor: colors.primary },
  inboxFilterText: { fontSize: 13, fontWeight: '600', color: colors.secondary },
  inboxFilterTextActive: { color: colors.onPrimary },
  filterCount: { fontSize: 12, fontWeight: '600', color: colors.muted },
  inboxList: { paddingBottom: spacing.xl },
  inboxSectionTitle: { fontSize: 14, fontWeight: '700', color: colors.text },
  onlineCount: { fontSize: 11, fontWeight: '500', color: colors.primary },
  onlineAvatarRing: {
    padding: 4,
    borderRadius: 36,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
  },
  inboxListHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  inboxResultCount: { fontSize: 12, color: colors.muted },
  inboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    marginHorizontal: spacing.md,
    marginBottom: spacing.xs,
    borderRadius: 16,
  },
  inboxRowUnread: { backgroundColor: colors.primarySoft },
  inboxRowBody: { flex: 1, gap: spacing.sm },
  inboxName: { fontSize: 16, fontWeight: '600', color: colors.text },
  inboxNameUnread: { fontWeight: '700' },
  inboxPreview: { fontSize: 13, lineHeight: 19, color: colors.muted },
  inboxTrailing: { alignItems: 'flex-end', gap: spacing.sm },
  inboxTime: { fontSize: 11, color: colors.muted },
  inboxTimeUnread: { color: colors.primary, fontWeight: '600' },
  inboxUnreadBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  inboxBadgeSpace: { height: 22 },
  screen: { flex: 1, backgroundColor: colors.background },
  headerBody: { flex: 1, gap: spacing.xs, paddingRight: spacing.md },
  brandLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  onlineSection: { paddingTop: spacing.sm },
  onlineLabel: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.success,
  },
  onlinePeople: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
    gap: spacing.xl,
  },
  onlinePerson: { width: 76, alignItems: 'center', gap: spacing.sm },
  onlineName: { fontSize: 12, color: colors.secondary, fontWeight: '500' },
  unreadRow: { backgroundColor: colors.primarySoft },
  emptyState: { alignItems: 'center', padding: spacing.xxl, gap: spacing.md },
  emptyIcon: {
    backgroundColor: colors.primarySoft,
    padding: spacing.lg,
    borderRadius: 24,
  },
  searchFocused: { borderColor: colors.primary },
  clearSearch: {
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 22,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eyebrow: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 0,
  },
  title: {
    fontSize: 34,
    color: colors.text,
    fontWeight: '700',
    marginBottom: 8,
  },
  muted: { color: colors.muted, fontSize: 13, lineHeight: 20 },
  count: {
    width: 44,
    height: 44,
    backgroundColor: colors.primarySoft,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: { fontSize: 20, fontWeight: '700', color: colors.primary },
  search: {
    marginHorizontal: 24,
    marginBottom: 20,
    paddingHorizontal: 16,
    backgroundColor: colors.input,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    paddingVertical: 15,
    paddingHorizontal: 10,
    color: colors.text,
    fontSize: 14,
  },
  listHeading: {
    paddingHorizontal: 24,
    marginBottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: colors.text },
  row: {
    paddingHorizontal: 24,
    paddingVertical: 17,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowBody: { flex: 1, gap: 6 },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  name: { color: colors.text, fontSize: 16, fontWeight: '700', flexShrink: 1 },
  preview: { color: colors.muted, fontSize: 13, lineHeight: 20, flexShrink: 1 },
  unreadText: { color: colors.text, fontWeight: '600' },
  time: { fontSize: 11, color: colors.muted },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarSmall: { width: 44, height: 44, borderRadius: 22 },
  avatarImage: { width: '100%', height: '100%' },
  onlineDot: {
    position: 'absolute',
    right: -1,
    bottom: 0,
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: colors.success,
    borderWidth: 3,
    borderColor: colors.background,
  },
  badge: {
    minWidth: 21,
    height: 21,
    paddingHorizontal: 5,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: colors.surface, fontSize: 11, fontWeight: '700' },
  onlineText: { color: colors.success },
  empty: {
    color: colors.text,
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    padding: 17,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: { color: colors.surface, fontWeight: '700', fontSize: 16 },
  disabled: { opacity: 0.4 },
  login: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
  },
  loginBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  loginBrandIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginBrandName: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
  },
  demoPill: {
    backgroundColor: colors.primarySoft,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  demoPillText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    color: colors.primary,
  },
  loginHero: {
    backgroundColor: colors.primarySoft,
    borderRadius: 24,
    padding: spacing.xl,
    marginBottom: spacing.xl,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  heroBadgeText: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '600',
    flexShrink: 1,
  },
  loginHeadline: {
    fontSize: 32,
    lineHeight: 39,
    fontWeight: '700',
    letterSpacing: -0.8,
    color: colors.text,
  },
  loginDescription: {
    fontSize: 13,
    lineHeight: 21,
    color: colors.secondary,
    marginTop: spacing.md,
  },
  loginConversation: { marginTop: spacing.lg, gap: spacing.sm },
  sampleBubble: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderBottomLeftRadius: 4,
  },
  sampleBubbleText: { fontSize: 12, color: colors.text, flexShrink: 1 },
  sampleReply: {
    alignSelf: 'flex-end',
    padding: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: 14,
    borderBottomRightRadius: 4,
  },
  sampleReplyText: { fontSize: 12, color: colors.onPrimary },
  loginForm: { gap: spacing.xs },
  loginFormTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  loginInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingLeft: spacing.lg,
    minHeight: 56,
  },
  loginInputFocused: { borderColor: colors.primary },
  loginInputError: { borderColor: colors.error },
  loginInput: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
  },
  passwordToggle: {
    minWidth: 48,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginSubmit: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: 14,
    minHeight: 56,
    padding: spacing.lg,
    marginTop: spacing.xl,
  },
  loginDemo: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-start',
    marginTop: spacing.lg,
  },
  loginDemoText: { flex: 1, fontSize: 12, lineHeight: 19, color: colors.muted },
  loginFooter: {
    fontSize: 11,
    color: colors.muted,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
  logo: {
    alignSelf: 'center',
    width: 80,
    height: 80,
    borderRadius: 26,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  brand: {
    fontSize: 36,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
  },
  tagline: {
    textAlign: 'center',
    color: colors.muted,
    marginTop: 10,
    marginBottom: 34,
  },
  loginCard: {
    backgroundColor: colors.background,
    borderRadius: 0,
    padding: 0,
    gap: 6,
  },
  label: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 18,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 14,
    color: colors.text,
  },
  error: { color: colors.error, fontSize: 13, marginTop: 10 },
  demo: {
    fontSize: 12,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 19,
    marginTop: 18,
  },
  footer: {
    textAlign: 'center',
    fontSize: 10,
    letterSpacing: 2,
    color: colors.muted,
    marginTop: 32,
  },
  notice: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  noticeUnread: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primaryBorder,
  },
  noticeIcon: {
    width: 40,
    height: 40,
    backgroundColor: colors.primarySoft,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noticeText: { fontSize: 14, color: colors.secondary, lineHeight: 22 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginTop: 8 },
  link: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
    paddingVertical: 12,
    minHeight: 44,
  },
  unreadDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginTop: 6,
  },
  settingsScroll: { paddingBottom: spacing.xl },
  settings: { paddingHorizontal: spacing.xl },
  profile: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: spacing.xl,
    marginBottom: spacing.sm,
  },
  profileTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  profileCaption: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: colors.onPrimaryMuted,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.onPrimary,
    flexShrink: 1,
  },
  profileStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  profileStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.onPrimaryMuted,
  },
  profileStatusText: { fontSize: 12, color: colors.onPrimaryMuted },
  profileStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xl,
    paddingTop: spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.onPrimaryMuted,
  },
  profileStat: { flex: 1, gap: spacing.xs },
  statNumber: { fontSize: 23, fontWeight: '700', color: colors.onPrimary },
  statLabel: { fontSize: 11, color: colors.onPrimaryMuted, lineHeight: 16 },
  statDivider: {
    width: StyleSheet.hairlineWidth,
    height: 32,
    backgroundColor: colors.onPrimaryMuted,
    marginHorizontal: spacing.lg,
  },
  settingsSection: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.secondary,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  settingGroup: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: colors.surface,
  },
  settingRow: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
    alignItems: 'center',
  },
  settingIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingLabel: { fontSize: 12, color: colors.muted, lineHeight: 18 },
  settingDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginLeft: 66,
    marginRight: spacing.lg,
  },
  settingsHint: {
    fontSize: 12,
    lineHeight: 18,
    color: colors.muted,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  logout: {
    marginTop: spacing.xl,
    flexDirection: 'row',
    gap: spacing.lg,
    padding: spacing.lg,
    backgroundColor: colors.errorSoft,
    borderRadius: 16,
    alignItems: 'center',
  },
  logoutText: { color: colors.error, fontSize: 15, fontWeight: '700' },
  settingsFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.xxl,
  },
  footerBrand: { fontSize: 14, fontWeight: '700', color: colors.text },
  demoNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
  demoNoteText: {
    fontSize: 11,
    lineHeight: 17,
    color: colors.muted,
    flexShrink: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  back: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatStatus: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  chatStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success,
  },
  offlineStatus: { backgroundColor: colors.muted },
  chatStatusText: { fontSize: 12, color: colors.secondary },
  chatInfoButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
  },
  chatInfoActive: { backgroundColor: colors.primarySoft },
  chatInfoPanel: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.primarySoft,
  },
  chatInfoText: {
    flex: 1,
    color: colors.secondary,
    fontSize: 12,
    lineHeight: 19,
  },
  messages: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    flexGrow: 1,
  },
  conversationIntro: {
    alignItems: 'center',
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    gap: spacing.sm,
  },
  conversationName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.xs,
  },
  conversationCaption: {
    fontSize: 12,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 19,
  },
  conversationSeparator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    alignSelf: 'stretch',
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  conversationLine: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    flex: 1,
  },
  conversationLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1,
    color: colors.muted,
  },
  chatEmpty: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    gap: spacing.sm,
  },
  chatEmptyTitle: { fontSize: 17, fontWeight: '600', color: colors.text },
  greetingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.lg,
    borderRadius: 14,
    backgroundColor: colors.primarySoft,
    marginTop: spacing.md,
  },
  greetingText: { fontSize: 14, fontWeight: '600', color: colors.primary },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  myMessageRow: { justifyContent: 'flex-end' },
  groupedMessage: { marginTop: spacing.xs },
  messageAvatar: { width: 44 },
  bubble: {
    maxWidth: '78%',
    borderRadius: 18,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: 6,
  },
  myBubble: { backgroundColor: colors.primary, borderBottomRightRadius: 5 },
  theirBubble: {
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    borderBottomLeftRadius: 5,
  },
  messageText: { color: colors.text, fontSize: 15, lineHeight: 23 },
  myText: { color: colors.onPrimary },
  messageMeta: { flexDirection: 'row', justifyContent: 'flex-end' },
  messageTime: { fontSize: 10, color: colors.muted },
  myTime: { color: colors.onPrimaryMuted },
  composerArea: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 6,
    gap: spacing.sm,
    backgroundColor: colors.input,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
  },
  composerFocused: { borderColor: colors.primary },
  composeInput: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    maxHeight: 120,
    color: colors.text,
  },
  send: {
    backgroundColor: colors.primary,
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendDisabled: { backgroundColor: colors.secondary, opacity: 0.45 },
  composerNote: {
    fontSize: 10,
    color: colors.muted,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  tabBar: {
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    paddingTop: 8,
  },
  tabLabel: { fontSize: 11, fontWeight: '600' },
});
