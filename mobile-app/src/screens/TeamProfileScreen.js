import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Card, { SectionTitle, StatusBadge } from '../components/Card';

export default function TeamProfileScreen() {
  const [team, setTeam] = useState(null);
  const [players, setPlayers] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [history, setHistory] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();
  const { colors } = useTheme();
  const teamId = user?.team?._id || user?.team;

  const fetchData = useCallback(async () => {
    if (!teamId) return;
    try {
      const [teamRes, playersRes, matchesRes] = await Promise.all([
        api.get(`/teams/${teamId}`),
        api.get('/players', { params: { team: teamId, limit: 50 } }),
        api.get('/matches', { params: { team: teamId, limit: 20 } }),
      ]);
      setTeam(teamRes.data.data);
      setPlayers(playersRes.data.data);
      const all = matchesRes.data.data;
      setUpcoming(all.filter((m) => m.status === 'Upcoming'));
      setHistory(all.filter((m) => m.status === 'Finished'));
    } catch {
      /* empty */
    }
  }, [teamId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (!team) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: colors.textSecondary }}>Loading team profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await fetchData(); setRefreshing(false); }} tintColor={colors.primary} />}
    >
      <Card style={styles.profileCard}>
        <Text style={[styles.teamName, { color: colors.text }]}>{team.name}</Text>
        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
          <Text style={{ color: colors.textSecondary }}>{team.district}</Text>
        </View>
        <View style={[styles.categoryBadge, { backgroundColor: colors.primary + '20' }]}>
          <Text style={{ color: colors.primary, fontWeight: '600' }}>{team.category}</Text>
        </View>
        {team.coach && (
          <Text style={[styles.coach, { color: colors.textSecondary }]}>
            Coach: {team.coach.fullName || team.coach}
          </Text>
        )}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.primary }]}>{players.length}</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Players</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.primary }]}>{upcoming.length}</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Upcoming</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.primary }]}>{history.length}</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Played</Text>
          </View>
        </View>
      </Card>

      <View style={styles.section}>
        <SectionTitle title="Upcoming Matches" />
        {upcoming.length === 0 ? (
          <Text style={{ color: colors.textSecondary, paddingHorizontal: 16 }}>No upcoming matches</Text>
        ) : upcoming.slice(0, 3).map((m) => (
          <Card key={m._id}>
            <Text style={{ color: colors.text, fontWeight: '600' }}>
              {m.homeTeam?.name} vs {m.awayTeam?.name}
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: 4 }}>
              {new Date(m.matchDate).toLocaleDateString()} · {m.matchTime}
            </Text>
          </Card>
        ))}
      </View>

      <View style={styles.section}>
        <SectionTitle title="Match History & Results" />
        {history.length === 0 ? (
          <Text style={{ color: colors.textSecondary, paddingHorizontal: 16 }}>No match history</Text>
        ) : history.slice(0, 5).map((m) => (
          <Card key={m._id}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: colors.text, fontWeight: '600', flex: 1 }}>
                {m.homeTeam?.name} vs {m.awayTeam?.name}
              </Text>
              <StatusBadge status="Finished" />
            </View>
            <Text style={[styles.score, { color: colors.primary }]}>
              {m.homeScore} - {m.awayScore}
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
              {new Date(m.matchDate).toLocaleDateString()}
            </Text>
          </Card>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  profileCard: { margin: 16, alignItems: 'center' },
  teamName: { fontSize: 24, fontWeight: '800' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 },
  categoryBadge: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16, marginTop: 12 },
  coach: { marginTop: 8, fontSize: 14 },
  statsRow: { flexDirection: 'row', marginTop: 20, gap: 32 },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 24, fontWeight: '800' },
  section: { paddingHorizontal: 16, marginBottom: 16 },
  score: { fontSize: 20, fontWeight: '800', marginVertical: 4 },
});
