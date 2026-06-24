import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function LoginScreen() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { colors, isDark, toggleTheme } = useTheme();

  const handleLogin = async () => {
    if (!identifier || !password) {
      Alert.alert('Error', 'Please enter email/phone and password');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await login(identifier, password);
    } catch (err) {
      const message = err.response?.data?.message
        || (err.message?.includes('Network') ? 'Cannot reach server. Check backend is running on port 5001.' : null)
        || err.message
        || 'Invalid credentials';
      setError(message);
      if (Platform.OS !== 'web') {
        Alert.alert('Login Failed', message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>District Sports</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Management System</Text>
      </View>

      <View style={[styles.form, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.formTitle, { color: colors.text }]}>Sign In</Text>
        <Text style={[styles.hint, { color: colors.textSecondary }]}>Use email or phone number</Text>
        <Text style={[styles.demoHint, { color: colors.textSecondary }]}>
          Demo: ahmed@dsms.com / coach123
        </Text>
        {error ? <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text> : null}

        <TextInput
          style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
          placeholder="Email or Phone"
          placeholderTextColor={colors.textSecondary}
          value={identifier}
          onChangeText={setIdentifier}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
          placeholder="Password"
          placeholderTextColor={colors.textSecondary}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign In</Text>}
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={toggleTheme} style={styles.themeToggle}>
        <Text style={{ color: colors.textSecondary }}>{isDark ? 'Light Mode' : 'Dark Mode'}</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  header: { alignItems: 'center', marginBottom: 32 },
  title: { fontSize: 28, fontWeight: '800' },
  subtitle: { fontSize: 14, marginTop: 4 },
  form: { borderRadius: 16, padding: 24, borderWidth: 1 },
  formTitle: { fontSize: 20, fontWeight: '700', marginBottom: 4 },
  hint: { fontSize: 13, marginBottom: 8 },
  demoHint: { fontSize: 12, marginBottom: 16, fontStyle: 'italic' },
  errorText: { fontSize: 14, marginBottom: 12, fontWeight: '500' },
  input: { borderWidth: 1, borderRadius: 8, padding: 14, marginBottom: 12, fontSize: 16 },
  button: { borderRadius: 8, padding: 16, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  themeToggle: { alignItems: 'center', marginTop: 24 },
});
