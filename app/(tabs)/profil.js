import { View, Text, StyleSheet, Alert,TouchableOpacity} from 'react-native';
import { auth } from '@/firebase/config';
import { logoutUser } from '@/firebase/auth';
import { useRouter } from 'expo-router';

export default function Profile() {
  const router = useRouter();

  const handleLogout = async () => {
    const result = await logoutUser();
    if (result.success) {
      router.replace('/login');
    } else {
      Alert.alert('Logout Failed', result.message);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.avatarBox}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarIcon}>🧑‍🍳</Text>
        </View>
      </View>
      <Text style={styles.title}>Welcome!</Text>
      <Text style={styles.email}>Email: {auth.currentUser?.email || 'Not logged in'}</Text>
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 24,
  },
  avatarBox: {
    marginBottom: 32,
    
  },
  avatarCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FF8C00',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  avatarIcon: {
    fontSize: 48,
    color: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FF8C00',
    marginBottom: 12,
  },
  email: {
    fontSize: 16,
    color: '#333',
    marginBottom: 40,
  },
  logoutButton: {
    backgroundColor: '#FF8C00',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 24,
    shadowColor: '#FF8C00',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});
