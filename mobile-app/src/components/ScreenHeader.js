import { View, Text, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function ScreenHeader({ title, subtitle, showLogout = true }) {
  const { user, logout } = useAuth();
  const { colors, isDark, toggleTheme } = useTheme();

  const handleLogout = () => {
    const confirm = () => logout();
    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to logout?')) confirm();
      return;
    }
    Alert.alert('Logout', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: confirm },
    ]);
  };

  const initial = user?.fullName?.charAt(0)?.toUpperCase() || '?';

  const teamLabel = user?.team?.name ? `${user.role === 'coach' ? 'Coach' : 'Team'} · ${user.team.name}` : null;

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
      <View style={styles.left}>
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <View style={styles.textWrap}>
          <Text style={[styles.greeting, { color: colors.textSecondary }]}>{title || 'Welcome back'}</Text>
          <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
            {user?.fullName}
          </Text>
          {(subtitle || teamLabel) ? (
            <Text style={[styles.subtitle, { color: colors.textSecondary }]} numberOfLines={1}>
              {subtitle || teamLabel}
            </Text>
          ) : null}
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity onPress={toggleTheme} style={[styles.iconBtn, { borderColor: colors.border }]}>
          <Ionicons name={isDark ? 'sunny-outline' : 'moon-outline'} size={20} color={colors.text} />
        </TouchableOpacity>
        {showLogout && (
          <TouchableOpacity
            onPress={handleLogout}
            style={[styles.logoutBtn, { backgroundColor: colors.danger + '15', borderColor: colors.danger + '40' }]}
          >
            <Ionicons name="log-out-outline" size={18} color={colors.danger} />
            <Text style={[styles.logoutText, { color: colors.danger }]}>Logout</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  left: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 8 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  textWrap: { flex: 1 },
  greeting: { fontSize: 12, fontWeight: '500' },
  name: { fontSize: 16, fontWeight: '700', marginTop: 1 },
  subtitle: { fontSize: 12, marginTop: 2 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  logoutText: { fontSize: 13, fontWeight: '600' },
});
