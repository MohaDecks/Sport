import { useState, useEffect } from 'react';
import { View, FlatList, Text, StyleSheet, TouchableOpacity } from 'react-native';
import api from '../services/api';
import { useTheme } from '../context/ThemeContext';
import Card, { EmptyState } from '../components/Card';

export default function StandingsScreen() {
  const [tournaments, setTournaments] = useState([]);
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [standings, setStandings] = useState([]);
  const { colors } = useTheme();

  useEffect(() => {
    api.get('/tournaments', { params: { limit: 20 } }).then(({ data }) => {
      setTournaments(data.data);
      if (data.data.length) setSelectedTournament(data.data[0]._id);
    });
  }, []);

  useEffect(() => {
    if (!selectedTournament) return;
    api.get(`/standings/${selectedTournament}`).then(({ data }) => setStandings(data.data));
  }, [selectedTournament]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.tabs}>
        {tournaments.map((t) => (
          <TouchableOpacity
            key={t._id}
            style={[styles.tab, selectedTournament === t._id && { backgroundColor: colors.primary }]}
            onPress={() => setSelectedTournament(t._id)}
          >
            <Text style={[styles.tabText, { color: selectedTournament === t._id ? '#fff' : colors.textSecondary }]}>
              {t.name.length > 15 ? t.name.substring(0, 15) + '...' : t.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={standings}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<EmptyState message="No standings available" />}
        ListHeaderComponent={
          standings.length > 0 ? (
            <View style={[styles.headerRow, { borderBottomColor: colors.border }]}>
              <Text style={[styles.headerCell, { color: colors.textSecondary, flex: 0.5 }]}>#</Text>
              <Text style={[styles.headerCell, { color: colors.textSecondary, flex: 2 }]}>Team</Text>
              <Text style={[styles.headerCell, { color: colors.textSecondary }]}>P</Text>
              <Text style={[styles.headerCell, { color: colors.textSecondary }]}>W</Text>
              <Text style={[styles.headerCell, { color: colors.textSecondary }]}>D</Text>
              <Text style={[styles.headerCell, { color: colors.textSecondary }]}>L</Text>
              <Text style={[styles.headerCell, { color: colors.textSecondary }]}>Pts</Text>
            </View>
          ) : null
        }
        renderItem={({ item, index }) => (
          <View style={[styles.row, { borderBottomColor: colors.border }]}>
            <Text style={[styles.cell, { color: colors.text, flex: 0.5, fontWeight: '700' }]}>{index + 1}</Text>
            <Text style={[styles.cell, { color: colors.text, flex: 2, fontWeight: '600' }]}>{item.team?.name}</Text>
            <Text style={[styles.cell, { color: colors.textSecondary }]}>{item.played}</Text>
            <Text style={[styles.cell, { color: colors.textSecondary }]}>{item.won}</Text>
            <Text style={[styles.cell, { color: colors.textSecondary }]}>{item.drawn}</Text>
            <Text style={[styles.cell, { color: colors.textSecondary }]}>{item.lost}</Text>
            <Text style={[styles.cell, { color: colors.primary, fontWeight: '700' }]}>{item.points}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  tabs: { flexDirection: 'row', padding: 12, gap: 8, flexWrap: 'wrap' },
  tab: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  tabText: { fontSize: 13, fontWeight: '500' },
  list: { paddingHorizontal: 16 },
  headerRow: { flexDirection: 'row', paddingVertical: 10, borderBottomWidth: 1 },
  headerCell: { flex: 1, fontSize: 12, fontWeight: '600', textAlign: 'center' },
  row: { flexDirection: 'row', paddingVertical: 12, borderBottomWidth: 1, alignItems: 'center' },
  cell: { flex: 1, fontSize: 14, textAlign: 'center' },
});
