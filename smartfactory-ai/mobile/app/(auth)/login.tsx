import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES } from '../../constants';
import { useAuthStore } from '../../store/useAuthStore';
import { authService } from '../../services/authService';

type AuthTab = 'login' | 'signup';
type UserRole = 'operator' | 'maintenance' | 'manager';

export default function LoginScreen() {
  const router = useRouter();
  const { setSession, setToken } = useAuthStore();

  // Tab & Form State
  const [activeTab, setActiveTab] = useState<AuthTab>('signup'); // Default to signup matching screenshot
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('operator');

  // Interactive UI State
  const [showPassword, setShowPassword] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [focusedField, setFocusedField] = useState<'username' | 'password' | null>(null);

  const toggleTab = (tab: AuthTab) => {
    setActiveTab(tab);
    setErrorMsg(null);
    setUsername('');
    setPassword('');
    setIsDropdownOpen(false);
  };

  const handleAuthSubmit = async () => {
    if (!username.trim() || !password.trim()) {
      setErrorMsg('Please fill in all fields.');
      return;
    }

    if (username.trim().length < 2) {
      setErrorMsg('Username must be at least 2 characters.');
      return;
    }

    if (password.length < 4) {
      setErrorMsg('Password must be at least 4 characters.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      if (activeTab === 'signup') {
        const response = await authService.signup(username.trim(), password, role);
        setToken(response.token);
        setSession(response.session);
      } else {
        const response = await authService.login(username.trim(), password);
        setToken(response.token);
        setSession(response.session);
      }
      
      // Navigate to tabs command dashboard
      router.replace('/(tabs)');
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require('../../assets/industrial_bg.png')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <StatusBar barStyle="light-content" />
      <View style={styles.blurOverlay} />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Portal Brand Header */}
          <View style={styles.brandContainer}>
            <View style={styles.brandIconContainer}>
              <Ionicons name="hardware-chip" size={30} color="#FFAB40" />
            </View>
            <Text style={styles.brandTitle}>FactoryMind AI</Text>
            <Text style={styles.brandSubtitle}>Industrial Intelligence Portal</Text>
          </View>

          {/* Main Glassmorphic Panel */}
          <View style={styles.glassCard}>
            {/* Header / Tabs */}
            <View style={styles.tabContainer}>
              <TouchableOpacity
                onPress={() => toggleTab('login')}
                style={[styles.tabButton, activeTab === 'login' && styles.tabButtonActive]}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="lock-closed"
                  size={18}
                  color={activeTab === 'login' ? '#FFAB40' : '#94A3B8'}
                  style={styles.tabIcon}
                />
                <Text style={[styles.tabText, activeTab === 'login' && styles.tabTextActive]}>
                  Login
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={() => toggleTab('signup')}
                style={[styles.tabButton, activeTab === 'signup' && styles.tabButtonActive]}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="create"
                  size={18}
                  color={activeTab === 'signup' ? '#FFAB40' : '#94A3B8'}
                  style={styles.tabIcon}
                />
                <Text style={[styles.tabText, activeTab === 'signup' && styles.tabTextActive]}>
                  Sign Up
                </Text>
              </TouchableOpacity>
            </View>

            {/* Error Banner */}
            {errorMsg && (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={20} color="#EF4444" style={{ marginRight: 8 }} />
                <Text style={styles.errorText}>{errorMsg}</Text>
              </View>
            )}

            {/* Form Fields */}
            <View style={styles.formContainer}>
              {/* Username field */}
              <Text style={styles.fieldLabel}>
                {activeTab === 'signup' ? 'New Username' : 'Username'}
              </Text>
              <TextInput
                value={username}
                onChangeText={(text) => {
                  setUsername(text);
                  if (errorMsg) setErrorMsg(null);
                }}
                onFocus={() => setFocusedField('username')}
                onBlur={() => setFocusedField(null)}
                placeholder={activeTab === 'signup' ? "Choose a username" : "Enter your username"}
                placeholderTextColor="rgba(255, 255, 255, 0.3)"
                style={[
                  styles.inputField,
                  focusedField === 'username' && styles.inputFieldFocused
                ]}
                autoCapitalize="none"
                autoCorrect={false}
              />

              {/* Role Dropdown Selector (only visible in SignUp) */}
              {activeTab === 'signup' && (
                <View style={{ zIndex: 10 }}>
                  <Text style={styles.fieldLabel}>Role</Text>
                  <TouchableOpacity
                    onPress={() => {
                      setIsDropdownOpen(!isDropdownOpen);
                      if (errorMsg) setErrorMsg(null);
                    }}
                    activeOpacity={0.8}
                    style={[
                      styles.inputField,
                      styles.dropdownHeader,
                      isDropdownOpen && styles.dropdownHeaderActive
                    ]}
                  >
                    <Text style={styles.dropdownHeaderText}>{role}</Text>
                    <Ionicons
                      name={isDropdownOpen ? 'chevron-up' : 'chevron-down'}
                      size={20}
                      color="#FFFFFF"
                    />
                  </TouchableOpacity>

                  {/* Dropdown Options */}
                  {isDropdownOpen && (
                    <View style={styles.dropdownOptionsContainer}>
                      {(['operator', 'maintenance', 'manager'] as UserRole[]).map((item) => (
                        <TouchableOpacity
                          key={item}
                          onPress={() => {
                            setRole(item);
                            setIsDropdownOpen(false);
                          }}
                          style={[
                            styles.dropdownItem,
                            role === item && styles.dropdownItemActive,
                          ]}
                          activeOpacity={0.7}
                        >
                          <Text
                            style={[
                              styles.dropdownItemText,
                              role === item && styles.dropdownItemTextActive,
                            ]}
                          >
                            {item}
                          </Text>
                          {role === item && (
                            <Ionicons name="checkmark" size={16} color="#FFAB40" />
                          )}
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              )}

              {/* Password field */}
              <View style={{ marginTop: SPACING.S16, zIndex: 1 }}>
                <Text style={styles.fieldLabel}>Password</Text>
                <View style={[
                  styles.passwordInputContainer,
                  focusedField === 'password' && styles.inputFieldFocused
                ]}>
                  <TextInput
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      if (errorMsg) setErrorMsg(null);
                    }}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    placeholder={activeTab === 'signup' ? 'Create a secure password' : 'Enter your password'}
                    placeholderTextColor="rgba(255, 255, 255, 0.3)"
                    secureTextEntry={!showPassword}
                    style={styles.passwordInput}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeButton}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-off' : 'eye'}
                      size={20}
                      color="rgba(255, 255, 255, 0.6)"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                onPress={handleAuthSubmit}
                disabled={isLoading}
                activeOpacity={0.8}
                style={styles.submitButton}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.submitButtonText}>
                    {activeTab === 'signup' ? 'Create Account' : 'Sign In'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    backgroundColor: 'rgba(15, 23, 42, 0.7)', // Sleek dark slate tint
  },
  container: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: SPACING.S48,
    paddingHorizontal: SPACING.S20, // Give healthy horizontal margins on smaller screens
    width: '100%',
  },
  glassCard: {
    width: '100%',
    maxWidth: 380, // Perfect professional mobile width boundary
    alignSelf: 'center', // Centers the card within the stretched parent
    backgroundColor: 'rgba(15, 23, 42, 0.85)', // High-density premium dark slate
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    padding: SPACING.S24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 12,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: SPACING.S24,
    width: '100%',
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 2.5,
    borderBottomColor: 'transparent',
  },
  tabButtonActive: {
    borderBottomColor: '#EF4444', // Dark Red-Orange active indicator line
  },
  tabIcon: {
    marginRight: 8,
  },
  tabText: {
    color: '#94A3B8',
    fontSize: FONT_SIZES.F16,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 10,
    padding: SPACING.S12,
    marginBottom: SPACING.S16,
    width: '100%',
  },
  errorText: {
    color: '#FCA5A5',
    fontSize: FONT_SIZES.F14,
    flex: 1,
  },
  formContainer: {
    width: '100%',
  },
  fieldLabel: {
    color: '#94A3B8',
    fontSize: FONT_SIZES.F14,
    fontWeight: '600',
    marginBottom: SPACING.S8,
  },
  inputField: {
    backgroundColor: '#1E293B', // Darker slate input fill
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    paddingHorizontal: SPACING.S16,
    paddingVertical: 14, // Extra spacing for professional touch
    fontSize: FONT_SIZES.F16,
    marginBottom: SPACING.S16,
    width: '100%',
  },
  inputFieldFocused: {
    borderColor: '#EF4444', // Red-Orange highlight on selection
    borderWidth: 1.2,
    backgroundColor: '#0F172A',
  },
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 0, // Align properly with floating dropdowns
  },
  dropdownHeaderActive: {
    borderColor: '#EF4444', 
    borderWidth: 1.2,
    backgroundColor: '#0F172A',
  },
  dropdownHeaderText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.F16,
    textTransform: 'capitalize',
  },
  dropdownOptionsContainer: {
    position: 'absolute',
    top: 55, // Floats elegantly directly beneath the select box
    left: 0,
    right: 0,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 10,
    paddingVertical: SPACING.S4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 100,
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.S12,
    paddingHorizontal: SPACING.S16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  dropdownItemActive: {
    backgroundColor: '#0F172A',
  },
  dropdownItemText: {
    color: '#94A3B8',
    fontSize: FONT_SIZES.F16,
    textTransform: 'capitalize',
  },
  dropdownItemTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    paddingHorizontal: SPACING.S16,
    width: '100%',
  },
  passwordInput: {
    flex: 1,
    color: '#FFFFFF',
    paddingVertical: 14,
    fontSize: FONT_SIZES.F16,
  },
  eyeButton: {
    padding: SPACING.S8,
  },
  submitButton: {
    backgroundColor: '#1A73E8', // Beautiful vibrant blue matching modern styling
    borderRadius: 12, // slightly rounder
    paddingVertical: 16, // more luxurious height
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32, // Replaced undefined SPACING.S28 to explicitly push button down
    width: '100%',
    shadowColor: '#1A73E8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.F16,
    fontWeight: '700',
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: SPACING.S32,
    marginTop: SPACING.S16,
  },
  brandIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    marginBottom: SPACING.S12,
  },
  brandTitle: {
    fontSize: FONT_SIZES.F28,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  brandSubtitle: {
    fontSize: FONT_SIZES.F12,
    color: '#FFAB40', // Matches the accent industrial color
    fontWeight: '600',
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
});
