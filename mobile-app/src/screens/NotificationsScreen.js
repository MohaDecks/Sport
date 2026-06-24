import { useState, useEffect, useCallback } from 'react';
import { View, FlatList, Text, StyleSheet, RefreshControl, TouchableOpacity } from 'react-native';
import api from '../services/api';
import { useTheme } from '../context/ThemeContext';
import Card, { EmptyState } from '../components/Card';

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const { colors } = useTheme();

  const fetchNotifications = useCallback(async () => {
    try {
      const { data } = await api.get('/notifications', { params: { limit: 30 } });
      setNotifications(data.data);
    } catch {
      setNotifications([]);
    }
  }, []);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const markRead = async (id) => {
    await api.put(`/notifications/${id}/read`);
    fetchNotifications();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await fetchNotifications(); setRefreshing(false); }} tintColor={colors.primary} />}
        ListEmptyComponent={<EmptyState message="No notifications" />}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => markRead(item._id)}>
            <Card>
              <View style={styles.row}>
                <View style={[styles.dot, { backgroundColor: colors.primary }]} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
                  <Text style={[styles.message, { color: colors.textSecondary }]}>{item.message}</Text>
                  <Text style={[styles.date, { color: colors.textSecondary }]}>
                    {new Date(item.createdAt).toLocaleDateString()} · {item.type}
                  </Text>
                </View>
              </View>
            </Card>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: 16 },
  row: { flexDirection: 'row', gap: 12 },
  dot: { width: 8, height: 8, borderRadius: 4, marginTop: 6 },
  title: { fontSize: 15, fontWeight: '600' },
  message: { fontSize: 13, marginTop: 4 },
  date: { fontSize: 11, marginTop: 6 },
});
