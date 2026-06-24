import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function Card({ children, style }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }, style]}>
      {children}
    </View>
  );
}

export function SectionTitle({ title }) {
  const { colors } = useTheme();
  return <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>;
}

export function EmptyState({ message }) {
  const { colors } = useTheme();
  return (
    <View style={styles.empty}>
      <Text style={{ color: colors.textSecondary }}>{message}</Text>
    </View>
  );
}

export function StatusBadge({ status }) {
  const colorMap = {
    Upcoming: '#2563eb',
    Live: '#dc2626',
    Finished: '#16a34a',
    Ongoing: '#d97706',
  };
  const bg = colorMap[status] || '#64748b';
  return (
    <View style={[styles.badge, { backgroundColor: bg + '20' }]}>
      <Text style={[styles.badgeText, { color: bg }]}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    marginTop: 8,
  },
  empty: {
    padding: 40,
    alignItems: 'center',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
