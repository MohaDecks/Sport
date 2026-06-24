import { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import { useTheme } from '../context/ThemeContext';
import Card, { StatusBadge, EmptyState } from '../components/Card';

export default function TodayMatchesScreen() {
  const [matches, setMatches] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const { colors } = useTheme();

  const fetchMatches = useCallback(async () => {
    try {
      const { data } = await api.get('/matches/today');
      setMatches(data.data);
    } catch {
      setMatches([]);
    }
  }, []);

  useEffect(() => { fetchMatches(); }, [fetchMatches]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMatches();
    setRefreshing(false);
  };

  const renderMatch = ({ item }) => (
    <Card>
      <View style={styles.matchHeader}>
        <StatusBadge status={item.status} />
        <Text style={[styles.time, { color: colors.textSecondary }]}>{item.matchTime}</Text>
      </View>
      <View style={styles.teamsRow}>
        <Text style={[styles.teamName, { color: colors.text }]}>{item.homeTeam?.name}</Text>
        <Text style={[styles.score, { color: colors.primary }]}>
          {item.status === 'Finished' ? `${item.homeScore} - ${item.awayScore}` : 'vs'}
        </Text>
        <Text style={[styles.teamName, { color: colors.text, textAlign: 'right' }]}>{item.awayTeam?.name}</Text>
      </View>
      <View style={styles.footer}>
        <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
        <Text style={[styles.stadium, { color: colors.textSecondary }]}>{item.stadium}</Text>
      </View>
      <Text style={[styles.tournament, { color: colors.textSecondary }]}>{item.tournament?.name}</Text>
    </Card>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={matches}
        keyExtractor={(item) => item._id}
        renderItem={renderMatch}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        ListEmptyComponent={<EmptyState message="No matches scheduled for today" />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: 16 },
  matchHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  time: { fontSize: 13 },
  teamsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  teamName: { flex: 1, fontSize: 16, fontWeight: '600' },
  score: { fontSize: 18, fontWeight: '800', marginHorizontal: 12 },
  footer: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 10 },
  stadium: { fontSize: 13 },
  tournament: { fontSize: 12, marginTop: 4 },
});
