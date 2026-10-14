import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { Text, TextInput, TouchableOpacity } from 'react-native';
import App from '../App';

test('validates login, searches, sends messages, reads notifications and logs out', async () => {
  let tree!: ReactTestRenderer.ReactTestRenderer;
  await act(async () => {
    tree = ReactTestRenderer.create(<App />);
  });
  const text = () =>
    tree.root
      .findAllByType(Text)
      .map(n => n.props.children)
      .flat()
      .join(' ');
  const press = async (label: string) => {
    const button = tree.root
      .findAllByType(TouchableOpacity)
      .find(
        n =>
          n.props.accessibilityLabel === label ||
          n
            .findAllByType(Text)
            .some(t => String(t.props.children).includes(label)),
      );
    expect(button).toBeDefined();
    await act(async () => button!.props.onPress());
  };
  const input = async (label: string, value: string) => {
    await act(async () =>
      tree.root
        .findAllByType(TextInput)
        .find(n => n.props.accessibilityLabel === label)!
        .props.onChangeText(value),
    );
  };
  try {
    expect(text()).toContain('ChitChat');
    await press('Hiện mật khẩu');
    expect(
      tree.root
        .findAllByType(TextInput)
        .find(n => n.props.accessibilityLabel === 'Mật khẩu')!.props
        .secureTextEntry,
    ).toBe(false);
    await press('Ẩn mật khẩu');
    expect(
      tree.root
        .findAllByType(TextInput)
        .find(n => n.props.accessibilityLabel === 'Mật khẩu')!.props
        .secureTextEntry,
    ).toBe(true);
    await press('Đăng nhập');
    expect(text()).toContain('Vui lòng nhập đầy đủ');
    await input('Tài khoản', 'truong');
    await input('Mật khẩu', 'demo');
    await press('Đăng nhập');
    expect(text()).toContain('Cuộc trò chuyện');
    await press('Cuộc trò chuyện chưa đọc');
    expect(text()).toContain('Hoàng Nam');
    expect(text()).not.toContain('Thu Hà');
    await press('Tất cả cuộc trò chuyện');
    expect(text()).toContain('Thu Hà');
    await input('Tìm kiếm cuộc trò chuyện', 'khong-co');
    expect(text()).toContain('Không tìm thấy cuộc trò chuyện');
    await input('Tìm kiếm cuộc trò chuyện', 'minh');
    await press('Trò chuyện với Minh Anh');
    await input('Nội dung tin nhắn', 'Xin chào!');
    await press('Gửi tin nhắn');
    expect(text()).toContain('Xin chào!');
    await press('Quay lại');
    expect(text()).toContain('Bạn: Xin chào!');
    const tab = async (name: string) => {
      const node = tree.root
        .findAll(
          n =>
            n.props.onPress &&
            typeof n.props.accessibilityLabel === 'string' &&
            n.props.accessibilityLabel.startsWith(name),
        )
        .pop();
      expect(node).toBeDefined();
      await act(async () => node!.props.onPress());
    };
    await tab('Thông báo');
    await press('Đọc tất cả');
    expect(text()).toContain('0 thông báo chưa đọc');
    await tab('Cài đặt');
    expect(text()).toContain('truong');
    await press('Đăng xuất');
    expect(text()).toContain('Chào mừng trở lại');
    expect(
      tree.root
        .findAllByType(TextInput)
        .find(n => n.props.accessibilityLabel === 'Tài khoản')!.props.value,
    ).toBe('');
  } finally {
    await act(async () => tree!.unmount());
  }
});
