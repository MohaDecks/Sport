import { useState, useEffect, useCallback } from 'react';
import { View, FlatList, Text, StyleSheet, RefreshControl } from 'react-native';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Card, { EmptyState } from '../components/Card';

export default function PlayersScreen() {
  const [players, setPlayers] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();
  const { colors } = useTheme();
  const teamId = user?.team?._id || user?.team;

  const fetchPlayers = useCallback(async () => {
    if (!teamId) return;
    try {
      const { data } = await api.get('/players', { params: { team: teamId, limit: 50 } });
      setPlayers(data.data);
    } catch {
      setPlayers([]);
    }
  }, [teamId]);

  useEffect(() => { fetchPlayers(); }, [fetchPlayers]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={players}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await fetchPlayers(); setRefreshing(false); }} tintColor={colors.primary} />}
        ListEmptyComponent={<EmptyState message="No players found" />}
        renderItem={({ item }) => (
          <Card>
            <View style={styles.row}>
              <View style={[styles.number, { backgroundColor: colors.primary + '20' }]}>
                <Text style={[styles.numberText, { color: colors.primary }]}>{item.jerseyNumber}</Text>
              </View>
              <View style={styles.info}>
                <Text style={[styles.name, { color: colors.text }]}>{item.fullName}</Text>
                <Text style={[styles.detail, { color: colors.textSecondary }]}>
                  {item.position} · Age {item.age}
                </Text>
              </View>
              <View style={styles.cards}>
                <Text style={{ color: colors.warning, fontSize: 12 }}>{item.yellowCards}Y</Text>
                <Text style={{ color: colors.danger, fontSize: 12 }}>{item.redCards}R</Text>
              </View>
            </View>
          </Card>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: 16 },
  row: { flexDirection: 'row', alignItems: 'center' },
  number: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  numberText: { fontSize: 16, fontWeight: '800' },
  info: { flex: 1, marginLeft: 12 },
  name: { fontSize: 16, fontWeight: '600' },
  detail: { fontSize: 13, marginTop: 2 },
  cards: { flexDirection: 'row', gap: 8 },
});
