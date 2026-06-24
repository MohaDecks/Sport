import { useState, useEffect, useCallback } from 'react';
import { View, FlatList, Text, StyleSheet, RefreshControl } from 'react-native';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Card, { StatusBadge, EmptyState } from '../components/Card';

export default function ScheduleScreen() {
  const [matches, setMatches] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();
  const { colors } = useTheme();
  const teamId = user?.team?._id || user?.team;

  const fetchSchedule = useCallback(async () => {
    if (!teamId) return;
    try {
      const { data } = await api.get('/matches', { params: { team: teamId, limit: 50 } });
      setMatches(data.data);
    } catch {
      setMatches([]);
    }
  }, [teamId]);

  useEffect(() => { fetchSchedule(); }, [fetchSchedule]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchSchedule();
    setRefreshing(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={matches}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        ListEmptyComponent={<EmptyState message="No scheduled matches" />}
        renderItem={({ item }) => (
          <Card>
            <View style={styles.row}>
              <Text style={[styles.date, { color: colors.textSecondary }]}>
                {new Date(item.matchDate).toLocaleDateString()} · {item.matchTime}
              </Text>
              <StatusBadge status={item.status} />
            </View>
            <Text style={[styles.matchup, { color: colors.text }]}>
              {item.homeTeam?.name} vs {item.awayTeam?.name}
            </Text>
            <Text style={[styles.detail, { color: colors.textSecondary }]}>{item.stadium}</Text>
          </Card>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  date: { fontSize: 13 },
  matchup: { fontSize: 16, fontWeight: '600' },
  detail: { fontSize: 13, marginTop: 4 },
});
