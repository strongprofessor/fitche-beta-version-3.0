import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  ScrollView, 
  Image 
} from 'react-native';

const COLORS = [
  { name: 'Red', value: '#FF0000' },
  { name: 'Blue', value: '#0000FF' },
  { name: 'Green', value: '#00FF00' },
  { name: 'Yellow', value: '#FFFF00' },
  { name: 'Purple', value: '#800080' },
  { name: 'Orange', value: '#FFA500' },
  { name: 'Pink', value: '#FFC0CB' },
  { name: 'Brown', value: '#A52A2A' },
  { name: 'Gray', value: '#808080' },
  { name: 'Cyan', value: '#00FFFF' },
  { name: 'Magenta', value: '#FF00FF' },
  { name: 'Mint', value: '#3eb489' },
  { name: 'Teal', value: '#008080' },
  { name: 'Indigo', value: '#4B0082' },
  { name: 'Violet', value: '#EE82EE' },
  { name: 'Maroon', value: '#800000' },
  { name: 'Navy', value: '#000080' },
  { name: 'Olive', value: '#808000' },
  { name: 'Turquoise', value: '#40E0D0' },
  { name: 'Gold', value: '#FFD700' },
];

// Add this type for the tap pattern
type PatternDigit = {
  position: number;
  timestamp: number;
};

// Add these types and constants at the top of your file
type PasswordRequirement = {
  label: string;
  test: (password: string) => boolean;
  met: boolean;
};

const LoginScreen = ({ navigation }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState(1);
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
  });
  const [verifiedMethods, setVerifiedMethods] = useState<string[]>([]);
  const [selectedColor, setSelectedColor] = useState('');
  const [number, setNumber] = useState('');
  const [patternSequence, setPatternSequence] = useState<PatternDigit[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordRequirements, setPasswordRequirements] = useState<PasswordRequirement[]>([
    {
      label: 'Maximum 6 characters',
      test: (pwd) => pwd.length <= 6,
      met: false
    },
    {
      label: 'Contains uppercase letter (A-Z)',
      test: (pwd) => /[A-Z]/.test(pwd),
      met: false
    },
    {
      label: 'Contains a number (0-9)',
      test: (pwd) => /[0-9]/.test(pwd),
      met: false
    },
    {
      label: 'Contains special character (!@#$%^&*)',
      test: (pwd) => /[!@#$%^&*]/.test(pwd),
      met: false
    }
  ]);

  const isPasswordValid = (password: string) => {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*]/.test(password);
    const isValidLength = password.length <= 6;
    
    return hasUpperCase && hasNumber && hasSpecial && isValidLength;
  };

  const handleLogin = () => {
    // Registration mode - enforce password requirements
    if (!isLogin) {
      const password = credentials.password;
      const hasUpperCase = /[A-Z]/.test(password);
      const hasNumber = /[0-9]/.test(password);
      const hasSpecial = /[!@#$%^&*]/.test(password);
      const isValidLength = password.length <= 6;

      if (!hasUpperCase || !hasNumber || !hasSpecial || !isValidLength) {
        Alert.alert(
          'Invalid Password',
          'Password must:\n- Have maximum 6 characters\n- Include an uppercase letter\n- Include a number\n- Include a special character (!@#$%^&*)'
        );
        return; // Stop here if password is invalid
      }
    }

    if (!credentials.username || !credentials.password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setVerifiedMethods([...verifiedMethods, 'PASSWORD']);
    setStep(2);
  };

  const handleTapSquare = (position: number) => {
    const newSequence = [...patternSequence, { 
      position, 
      timestamp: Date.now() 
    }];
    
    setPatternSequence(newSequence);
    
    // When 4 taps are completed
    if (newSequence.length === 4) {
      // Convert pattern to string (e.g., "0132")
      const pattern = newSequence.map(tap => tap.position).join('');
      setTimeout(() => {
        setPatternSequence([]);
        handleTapPattern(pattern);
      }, 300); // Short delay to show the last tap
    }
  };

  const handleTapPattern = (pattern: string) => {
    setVerifiedMethods([...verifiedMethods, 'TAP']);
    setStep(3);
  };

  const handleColorNumber = () => {
    // Validate number input
    const numberValue = parseInt(number);
    if (isNaN(numberValue) || numberValue < 1 || numberValue > 9999) {
      Alert.alert('Invalid Number', 'Please enter a number between 1 and 9999');
      return;
    }

    setVerifiedMethods([...verifiedMethods, 'COLOR']);
    if (verifiedMethods.length >= 1) {
      navigation.replace('Profile');
    }
  };

  const handlePasswordChange = (text: string) => {
    setCredentials(prev => ({ ...prev, password: text }));
    const updatedRequirements = passwordRequirements.map(req => ({
      ...req,
      met: req.test(text)
    }));
    setPasswordRequirements(updatedRequirements);
  };

  const renderAuthTypeSwitch = () => (
    <View style={styles.authSwitch}>
      <TouchableOpacity 
        style={[
          styles.authTypeButton,
          isLogin && styles.authTypeActive
        ]}
        onPress={() => setIsLogin(true)}
      >
        <Text style={[
          styles.authTypeText,
          isLogin && styles.authTypeTextActive
        ]}>Login</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[
          styles.authTypeButton,
          !isLogin && styles.authTypeActive
        ]}
        onPress={() => setIsLogin(false)}
      >
        <Text style={[
          styles.authTypeText,
          !isLogin && styles.authTypeTextActive
        ]}>Register</Text>
      </TouchableOpacity>
    </View>
  );

  const renderColorSelection = () => (
    <View style={styles.form}>
      <Text style={styles.subtitle}>Color & Number Selection</Text>
      
      <View style={styles.splitContainer}>
        {/* Left side - Colors */}
        <View style={styles.colorList}>
          <Text style={styles.sectionTitle}>Select Color:</Text>
          <ScrollView style={styles.colorScroll}>
            {COLORS.map((color) => (
              <TouchableOpacity
                key={color.name}
                style={[
                  styles.colorRow,
                  selectedColor === color.name && styles.selectedColorRow
                ]}
                onPress={() => setSelectedColor(color.name)}
              >
                <View 
                  style={[
                    styles.colorDot,
                    { backgroundColor: color.value }
                  ]} 
                />
                <Text style={styles.colorText}>{color.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Right side - Number Input */}
        <View style={styles.numberSection}>
          <Text style={styles.sectionTitle}>Enter Number:</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter a number (1-9999)"
            keyboardType="numeric"
            value={number}
            onChangeText={(text) => {
              // Only allow numbers
              if (/^\d*$/.test(text)) {
                setNumber(text);
              }
            }}
            maxLength={4}
          />
          <Text style={styles.selectedInfo}>
            {selectedColor ? `Selected: ${selectedColor}` : 'No color selected'}
          </Text>
          <TouchableOpacity 
            style={[
              styles.button,
              (!selectedColor || !number) && styles.buttonDisabled
            ]}
            disabled={!selectedColor || !number}
            onPress={handleColorNumber}
          >
            <Text style={styles.buttonText}>Complete Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderTapPattern = () => (
    <View style={styles.form}>
      <Text style={styles.subtitle}>Create Tap Pattern</Text>
      
      <Text style={styles.instruction}>
        Tap 4 times to create your pattern
      </Text>
      
      <View style={styles.tapGrid}>
        {/* Top row */}
        <View style={styles.tapRow}>
          <TouchableOpacity
            style={[
              styles.tapSquare,
              patternSequence.some(tap => tap.position === 0) && styles.tappedSquare
            ]}
            onPress={() => handleTapSquare(0)}
          />
          <TouchableOpacity
            style={[
              styles.tapSquare,
              patternSequence.some(tap => tap.position === 1) && styles.tappedSquare
            ]}
            onPress={() => handleTapSquare(1)}
          />
        </View>
        
        {/* Bottom row */}
        <View style={styles.tapRow}>
          <TouchableOpacity
            style={[
              styles.tapSquare,
              patternSequence.some(tap => tap.position === 2) && styles.tappedSquare
            ]}
            onPress={() => handleTapSquare(2)}
          />
          <TouchableOpacity
            style={[
              styles.tapSquare,
              patternSequence.some(tap => tap.position === 3) && styles.tappedSquare
            ]}
            onPress={() => handleTapSquare(3)}
          />
        </View>
      </View>

      <Text style={styles.patternCount}>
        Taps: {patternSequence.length}/4
      </Text>
    </View>
  );

  // Helper function to determine text color
  const isLightColor = (hex: string) => {
    const c = hex.substring(1);
    const rgb = parseInt(c, 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = (rgb >> 0) & 0xff;
    const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    return luma > 128;
  };

  const renderPasswordSection = () => (
    <View style={styles.form}>
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={credentials.username}
        onChangeText={(text) => 
          setCredentials(prev => ({ ...prev, username: text }))
        }
      />
      <TextInput
        style={[
          styles.input,
          !isLogin && credentials.password && !isPasswordValid(credentials.password) && 
          styles.inputError
        ]}
        placeholder="Password (6 chars max)"
        secureTextEntry={!showPassword}
        value={credentials.password}
        onChangeText={(text) => 
          setCredentials(prev => ({ ...prev, password: text }))
        }
        maxLength={6}
      />
      {!isLogin && (
        <View style={styles.requirementsList}>
          <Text style={styles.requirementsTitle}>Password must have:</Text>
          <Text style={[
            styles.requirementText,
            credentials.password && /[A-Z]/.test(credentials.password) && styles.requirementMet
          ]}>
            • Uppercase letter (A-Z)
          </Text>
          <Text style={[
            styles.requirementText,
            credentials.password && /[0-9]/.test(credentials.password) && styles.requirementMet
          ]}>
            • Number (0-9)
          </Text>
          <Text style={[
            styles.requirementText,
            credentials.password && /[!@#$%^&*]/.test(credentials.password) && styles.requirementMet
          ]}>
            • Special character (!@#$%^&*)
          </Text>
          <Text style={[
            styles.requirementText,
            credentials.password && credentials.password.length <= 6 && styles.requirementMet
          ]}>
            • Maximum 6 characters
          </Text>
        </View>
      )}
      <TouchableOpacity 
        style={[
          styles.button,
          (!credentials.username || 
           !credentials.password || 
           (!isLogin && !isPasswordValid(credentials.password))) && 
          styles.buttonDisabled
        ]}
        disabled={!credentials.username || 
                 !credentials.password || 
                 (!isLogin && !isPasswordValid(credentials.password))}
        onPress={handleLogin}
      >
        <Text style={styles.buttonText}>Next</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Image 
        source={require('../../assets/logo.png')}
        style={styles.logo}
      />
      
      {renderAuthTypeSwitch()}
      
      {/* <Text style={styles.title}>Login</Text> */}
      
      {/* Method selector */}
      <View style={styles.methodSelector}>
        <Text style={styles.methodTitle}>
          {isLogin 
            ? 'Complete all 3 verification methods:' 
            : 'Set up all 3 verification methods:'}
        </Text>
        {/* ... rest of method selector */}
      </View>

      {/* Progress indicator */}
      <View style={styles.progressBar}>
        <Text style={styles.progressText}>
          Step {step} of 3
        </Text>
      </View>

      {/* Step 1: Username/Password */}
      {step === 1 && renderPasswordSection()}

      {/* Step 2: Tap Pattern */}
      {step === 2 && renderTapPattern()}

      {/* Step 3: Color and Number */}
      {step === 3 && renderColorSelection()}

      {/* Keep only this verification status */}
      <Text style={styles.verificationStatus}>
        {isLogin 
          ? `Verified: ${verifiedMethods.length}/3 methods`
          : `Setup: ${verifiedMethods.length}/3 methods`}
      </Text>

      {/* Complete button */}
      {verifiedMethods.length >= 3 && (
        <TouchableOpacity 
          style={styles.completeButton}
          onPress={() => navigation.replace('Profile')}
        >
          <Text style={styles.completeButtonText}>
            {isLogin ? 'Complete Login' : 'Create Account'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  logo: {
    width: 120,
    height: 60,
    resizeMode: 'contain',
    alignSelf: 'flex-start',
    marginLeft: 20,
    marginTop: 10,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  form: {
    width: '100%',
    flex: 1,
    paddingHorizontal: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    marginBottom: 15,
    borderRadius: 5,
    width: '100%',
  },
  button: {
    backgroundColor: '#FF9800',
    padding: 15,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  progress: {
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
  },
  progressBar: {
    marginBottom: 20,
    alignItems: 'center',
  },
  progressText: {
    color: '#666',
    fontSize: 14,
  },
  tapGrid: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  
  tapRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 10,
  },
  
  tapSquare: {
    width: 120,  // Larger squares
    height: 120, // Larger squares
    backgroundColor: '#e0e0e0',
    borderRadius: 12,
    margin: 10,
    borderWidth: 2,
    borderColor: '#ccc',
    // Add shadow
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  
  tappedSquare: {
    backgroundColor: '#FF9800',
    borderColor: '#F57C00',
    transform: [{ scale: 0.95 }], // Slight scale effect when tapped
  },
  
  instruction: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  
  patternCount: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
    marginTop: 20,
    fontWeight: '500',
  },
  splitContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 400, // Adjust this value as needed
    width: '100%',
  },
  colorList: {
    flex: 1,
    marginRight: 10,
    borderRightWidth: 1,
    borderRightColor: '#ddd',
  },
  colorScroll: {
    flex: 1,
  },
  colorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  selectedColorRow: {
    backgroundColor: '#f0f0f0',
  },
  colorDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  colorText: {
    fontSize: 16,
  },
  numberSection: {
    flex: 1,
    marginLeft: 10,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'left',
    width: '100%',
  },
  numberInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    borderRadius: 5,
    width: '100%',
    fontSize: 18,
    marginBottom: 20,
  },
  selectedInfo: {
    marginBottom: 20,
    fontSize: 16,
    color: '#666',
  },
  buttonDisabled: {
    backgroundColor: '#FFE0B2',
  },
  authSwitch: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 15,
    padding: 3,
    marginHorizontal: 80,
    marginTop: 20,
    marginBottom: 30,
    alignSelf: 'center',
    width: 160,
  },
  
  authTypeButton: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  authTypeActive: {
    backgroundColor: '#FF9800',
  },
  
  authTypeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  
  authTypeTextActive: {
    color: '#fff',
  },
  
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  
  methodSelector: {
    padding: 15,
  },
  
  methodTitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
    textAlign: 'center',
  },
  verificationStatus: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 10,
    color: '#666',
  },
});

export default LoginScreen;