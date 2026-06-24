import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, RefreshControl, TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import BannerCarousel from '../components/BannerCarousel';
import Card, { SectionTitle, StatusBadge, EmptyState } from '../components/Card';

function StatCard({ icon, label, value, color }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.statIcon, { backgroundColor: color + '18' }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{label}</Text>
    </View>
  );
}

export default function DashboardScreen() {
  const [news, setNews] = useState([]);
  const [todayMatches, setTodayMatches] = useState([]);
  const [playerCount, setPlayerCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();
  const { colors } = useTheme();
  const navigation = useNavigation();
  const teamId = user?.team?._id || user?.team;

  const fetchData = useCallback(async () => {
    try {
      const requests = [
        api.get('/news', { params: { limit: 10 } }),
        api.get('/matches/today'),
      ];
      if (teamId) {
        requests.push(api.get('/players', { params: { team: teamId, limit: 1 } }));
      }
      const [newsRes, matchesRes, ...rest] = await Promise.all(requests);
      const playersRes = rest[0];
      setNews(newsRes.data.data || []);
      setTodayMatches(matchesRes.data.data || []);
      if (playersRes) setPlayerCount(playersRes.data.pagination?.total || 0);
    } catch {
      /* keep previous data */
    }
  }, [teamId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <BannerCarousel items={news} />
        </View>

        <View style={styles.statsRow}>
          <StatCard icon="today-outline" label="Today" value={todayMatches.length} color={colors.primary} />
          <StatCard icon="people-outline" label="Players" value={playerCount} color={colors.success} />
          <StatCard icon="newspaper-outline" label="News" value={news.length} color={colors.warning} />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <SectionTitle title="Today's Matches" />
            <TouchableOpacity onPress={() => navigation.navigate('Schedule')}>
              <Text style={{ color: colors.primary, fontWeight: '600', fontSize: 13 }}>See all</Text>
            </TouchableOpacity>
          </View>

          {todayMatches.length === 0 ? (
            <EmptyState message="No matches scheduled for today" />
          ) : todayMatches.slice(0, 3).map((item) => (
            <Card key={item._id}>
              <View style={styles.matchHeader}>
                <StatusBadge status={item.status} />
                <Text style={{ color: colors.textSecondary, fontSize: 13 }}>{item.matchTime}</Text>
              </View>
              <Text style={[styles.matchTeams, { color: colors.text }]}>
                {item.homeTeam?.name} vs {item.awayTeam?.name}
              </Text>
              <View style={styles.matchFooter}>
                <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
                <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{item.stadium}</Text>
              </View>
            </Card>
          ))}
        </View>

        {news.length > 0 && (
          <View style={[styles.section, { paddingBottom: 32 }]}>
            <SectionTitle title="Latest News" />
            {news.slice(0, 3).map((item) => (
              <Card key={item._id}>
                <Text style={[styles.newsTitle, { color: colors.text }]}>{item.title}</Text>
                <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: 4 }} numberOfLines={2}>
                  {item.content}
                </Text>
                <Text style={{ color: colors.textSecondary, fontSize: 11, marginTop: 8 }}>
                  {new Date(item.createdAt).toLocaleDateString()}
                </Text>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  section: { marginTop: 16 },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 10,
    marginTop: 20,
  },
  statCard: {
    flex: 1,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    alignItems: 'center',
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: { fontSize: 22, fontWeight: '800' },
  statLabel: { fontSize: 11, marginTop: 2, fontWeight: '500' },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  matchHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  matchTeams: { fontSize: 15, fontWeight: '600' },
  matchFooter: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 },
  newsTitle: { fontSize: 15, fontWeight: '700' },
});
