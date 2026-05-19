import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  StatusBar,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES } from '../../constants';
import { useAuthStore } from '../../store/useAuthStore';

export default function SettingsScreen() {
  const { session, logout } = useAuthStore();
  const username = session?.user?.username || 'Operator';
  const role = session?.user?.role || 'operator';

  return (
    <ImageBackground
      source={require('../../assets/industrial_bg.png')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <StatusBar barStyle="light-content" />
      <View style={styles.blurOverlay} />
      
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.headerContainer}>
          <Text style={styles.subHeaderTitle}>Preferences</Text>
          <Text style={styles.headerTitle}>System Settings</Text>
        </View>

        <View style={styles.content}>
          {/* Profile Glass Card */}
          <View style={styles.glassCard}>
            <View style={styles.profileSection}>
              <View style={styles.avatarCircle}>
                <Ionicons name="person" size={32} color="#38BDF8" />
              </View>
              <Text style={styles.usernameText}>{username}</Text>
              <View style={styles.roleBadge}>
                <Text style={styles.roleBadgeText}>{role}</Text>
              </View>
            </View>

            <View style={styles.infoSection}>
              <View style={styles.infoRow}>
                <Ionicons name="shield-checkmark" size={20} color="#94A3B8" />
                <Text style={styles.infoLabel}>System Authority</Text>
                <Text style={styles.infoValue}>Authorized</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Ionicons name="server" size={20} color="#94A3B8" />
                <Text style={styles.infoLabel}>Backend Status</Text>
                <Text style={styles.infoValue}>Online</Text>
              </View>

              <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
                <Ionicons name="git-branch" size={20} color="#94A3B8" />
                <Text style={styles.infoLabel}>App Version</Text>
                <Text style={styles.infoValue}>v1.2.0 (Stable)</Text>
              </View>
            </View>

            {/* Logout Action Button */}
            <TouchableOpacity
              onPress={logout}
              style={styles.logoutButton}
              activeOpacity={0.8}
            >
              <Ionicons name="log-out" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.logoutButtonText}>Disconnect Session</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  blurOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.72)',
  },
  safeArea: {
    flex: 1,
  },
  headerContainer: {
    paddingHorizontal: SPACING.S20,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : SPACING.S12,
    paddingBottom: SPACING.S12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  subHeaderTitle: {
    color: '#94A3B8',
    fontSize: FONT_SIZES.F12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  headerTitle: {
    color: '#38BDF8',
    fontSize: FONT_SIZES.F22,
    fontWeight: '800',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.S20,
  },
  glassCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 20,
    padding: SPACING.S24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  profileSection: {
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
    paddingBottom: SPACING.S20,
    marginBottom: SPACING.S20,
  },
  avatarCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.25)',
    marginBottom: SPACING.S12,
  },
  usernameText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.F20,
    fontWeight: '700',
  },
  roleBadge: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  roleBadgeText: {
    color: '#38BDF8',
    fontSize: FONT_SIZES.F12,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  infoSection: {
    gap: 12,
    marginBottom: SPACING.S24,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.04)',
    paddingBottom: 10,
  },
  infoLabel: {
    color: '#94A3B8',
    fontSize: FONT_SIZES.F14,
    fontWeight: '600',
    marginLeft: 12,
    flex: 1,
  },
  infoValue: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.F14,
    fontWeight: '700',
  },
  logoutButton: {
    flexDirection: 'row',
    backgroundColor: '#EF4444',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.F16,
    fontWeight: '700',
  },
});
