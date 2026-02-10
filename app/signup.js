import { registerUser, validatePassword, validateSignupInputs } from '@/firebase/auth';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import LottieView from 'lottie-react-native';

export default function Signup() {
  const router = useRouter();
  
  // State management
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState([]);
  const [passwordRequirements, setPasswordRequirements] = useState({
    minLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumbers: false,
    passwordMatch: false,
  });

  /**
   * Update password requirements whenever password changes
   */
  useEffect(() => {
    if (password) {
      const validation = validatePassword(password, confirmPassword);
      setPasswordRequirements(validation.requirements);
    }
  }, [password, confirmPassword]);

  /**
   * Handle signup button press
   */
  const handleSignup = async () => {
    // Clear previous errors
    setErrors([]);

    // Validate inputs
    const validation = validateSignupInputs(email, password, confirmPassword);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    // Start loading
    setIsLoading(true);

    // Call Firebase register function
    const result = await registerUser(email, password);

    setIsLoading(false);

    if (result.success) {
      // Registration successful
      Alert.alert('Success', result.message);
      router.replace('/(tabs)');
    } else {
      // Registration failed
      setErrors([result.message]);
      Alert.alert('Signup Failed', result.message);
    }
  };

  /**
   * Navigate to login page
   */
  const handleLoginLink = () => {
    router.push('/login');
  };

  /**
   * Get requirement status icon
   */
  const getRequirementIcon = (isMet) => {
    return isMet ? '✅' : '⭕';
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <LottieView
                      source={require('@/assets/Walking-burger.json')}
                      autoPlay
                      loop
                      style={styles.logoLottie}
                    />
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join us to get started</Text>
        </View>

        {/* Input Fields */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            editable={!isLoading}
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            placeholderTextColor="#999"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={true}
            editable={!isLoading}
          />

          {/* Password Requirements */}
          {password && (
            <View style={styles.requirementsContainer}>
              <Text style={styles.requirementTitle}>Password Requirements:</Text>
              <View style={styles.requirement}>
                <Text style={styles.requirementIcon}>{getRequirementIcon(passwordRequirements.minLength)}</Text>
                <Text style={styles.requirementText}>At least 6 characters</Text>
              </View>
              <View style={styles.requirement}>
                <Text style={styles.requirementIcon}>{getRequirementIcon(passwordRequirements.hasUpperCase)}</Text>
                <Text style={styles.requirementText}>Uppercase letter (A-Z)</Text>
              </View>
              <View style={styles.requirement}>
                <Text style={styles.requirementIcon}>{getRequirementIcon(passwordRequirements.hasLowerCase)}</Text>
                <Text style={styles.requirementText}>Lowercase letter (a-z)</Text>
              </View>
              <View style={styles.requirement}>
                <Text style={styles.requirementIcon}>{getRequirementIcon(passwordRequirements.hasNumbers)}</Text>
                <Text style={styles.requirementText}>Number (0-9)</Text>
              </View>
            </View>
          )}

          <Text style={styles.label}>Confirm Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Confirm your password"
            placeholderTextColor="#999"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={true}
            editable={!isLoading}
          />

          {/* Password Match Indicator */}
          {confirmPassword && (
            <View style={styles.matchIndicator}>
              <Text style={styles.requirementIcon}>{getRequirementIcon(passwordRequirements.passwordMatch)}</Text>
              <Text style={[styles.matchText, !passwordRequirements.passwordMatch && styles.matchTextError]}>
                {passwordRequirements.passwordMatch ? 'Passwords match' : 'Passwords do not match'}
              </Text>
            </View>
          )}
        </View>

        {/* Error Messages */}
        {errors.length > 0 && (
          <View style={styles.errorContainer}>
            {errors.map((error, index) => (
              <Text key={index} style={styles.errorText}>
                ❌ {error}
              </Text>
            ))}
          </View>
        )}

        {/* Signup Button */}
        <TouchableOpacity
          style={[styles.signupButton, isLoading && styles.buttonDisabled]}
          onPress={handleSignup}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.buttonText}>SIGN UP</Text>
          )}
        </TouchableOpacity>

        {/* Login Link */}
        <View style={styles.loginLinkContainer}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <TouchableOpacity onPress={handleLoginLink} disabled={isLoading}>
            <Text style={styles.loginLink}>Sign in here</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eeeeee',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 20,
  },
  logoLottie: {
    width: 140,
    height: 140,
    marginBottom: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    paddingHorizontal: 15,
    borderRadius: 8,
    backgroundColor: '#fff',
    fontSize: 16,
    color: '#333',
    marginBottom: 16,
  },
  requirementsContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FF8C00',
  },
  requirementTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  requirement: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  requirementIcon: {
    fontSize: 14,
    marginRight: 8,
    width: 20,
  },
  requirementText: {
    fontSize: 12,
    color: '#666',
  },
  matchIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 6,
  },
  matchText: {
    fontSize: 12,
    color: '#4caf50',
    fontWeight: '500',
  },
  matchTextError: {
    color: '#f44336',
  },
  errorContainer: {
    backgroundColor: '#ffe0e0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#ff6b6b',
  },
  errorText: {
    fontSize: 13,
    color: '#d32f2f',
    marginBottom: 6,
    lineHeight: 18,
  },
  signupButton: {
    backgroundColor: '#FF8C00',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  buttonDisabled: {
    backgroundColor: '#CCB8A0',
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  loginLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontSize: 14,
    color: '#666',
  },
  loginLink: {
    fontSize: 14,
    color: '#FF8C00',
    fontWeight: '600',
  },
});
