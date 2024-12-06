import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';

interface WalletProps {
  isVisible: boolean;
  onClose: () => void;
}

interface WalletAddressType {
  id: string;
  address: string;
}

const Wallet: React.FC<WalletProps> = ({ isVisible, onClose }) => {
  const [walletAddresses, setWalletAddresses] = useState<WalletAddressType[]>([]);
  const [currentAddress, setCurrentAddress] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [showPasscodeModal, setShowPasscodeModal] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [walletToDelete, setWalletToDelete] = useState<string | null>(null);

  const CORRECT_PASSCODE = '1234'; // Example passcode

  const handleSave = () => {
    if (!currentAddress.trim()) {
      Alert.alert('Error', 'Please enter a wallet address');
      return;
    }

    if (editingId) {
      setWalletAddresses(addresses => 
        addresses.map(addr => 
          addr.id === editingId 
            ? { ...addr, address: currentAddress }
            : addr
        )
      );
    } else {
      setWalletAddresses(addresses => [
        ...addresses,
        { id: Date.now().toString(), address: currentAddress }
      ]);
    }

    setCurrentAddress('');
    setIsEditing(false);
    setEditingId(null);
  };

  const handleDelete = (idToDelete: string) => {
    setWalletToDelete(idToDelete);
    setShowPasscodeModal(true);
    setPasscode('');
  };

  const handlePasscodeSubmit = () => {
    if (passcode === CORRECT_PASSCODE && walletToDelete) {
      setWalletAddresses(currentAddresses => 
        currentAddresses.filter(wallet => wallet.id !== walletToDelete)
      );
      setShowPasscodeModal(false);
      setPasscode('');
      setWalletToDelete(null);
    } else {
      Alert.alert('Error', 'Incorrect passcode');
      setPasscode('');
    }
  };

  const handleCopyAddress = async (id: string, address: string) => {
    try {
      await Clipboard.setStringAsync(address);
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      Alert.alert('Error', 'Failed to copy address');
    }
  };

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>My Wallets</Text>
            <TouchableOpacity onPress={onClose}>
              <Feather name="x" size={24} color="black" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.container}>
            {isEditing ? (
              <View style={styles.editContainer}>
                <TextInput
                  style={styles.input}
                  value={currentAddress}
                  onChangeText={setCurrentAddress}
                  placeholder="Enter wallet address"
                  placeholderTextColor="#666"
                  autoCapitalize="none"
                  autoCorrect={false}
                  spellCheck={false}
                />
                <View style={styles.buttonRow}>
                  <TouchableOpacity 
                    style={[styles.button, styles.cancelButton]}
                    onPress={() => {
                      setIsEditing(false);
                      setCurrentAddress('');
                      setEditingId(null);
                    }}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.button, styles.saveButton]}
                    onPress={handleSave}
                  >
                    <Text style={styles.saveButtonText}>Save</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <>
                {walletAddresses.map((wallet) => (
                  <View key={wallet.id} style={styles.addressContainer}>
                    <View style={styles.addressRow}>
                      <Text style={styles.address} numberOfLines={1}>
                        {wallet.address.slice(0, 20)}...{wallet.address.slice(-4)}
                      </Text>
                      <View style={styles.addressActions}>
                        <TouchableOpacity 
                          onPress={() => handleCopyAddress(wallet.id, wallet.address)}
                          style={[styles.copyButton, copied === wallet.id && styles.copyButtonSuccess]}
                        >
                          <Feather 
                            name={copied === wallet.id ? "check" : "copy"} 
                            size={16} 
                            color={copied === wallet.id ? "#fff" : "#007AFF"} 
                          />
                        </TouchableOpacity>
                        <TouchableOpacity 
                          onPress={() => handleDelete(wallet.id)}
                          style={styles.actionButton}
                        >
                          <Feather name="trash-2" size={16} color="#FF3B30" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                ))}
                <TouchableOpacity 
                  style={styles.addButton}
                  onPress={() => {
                    setIsEditing(true);
                    setEditingId(null);
                    setCurrentAddress('');
                  }}
                >
                  <Feather name="plus-circle" size={24} color="#007AFF" />
                  <Text style={styles.addButtonText}>Add New Wallet</Text>
                </TouchableOpacity>
              </>
            )}
          </ScrollView>
        </View>

        <Modal
          visible={showPasscodeModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => {
            setShowPasscodeModal(false);
            setPasscode('');
            setWalletToDelete(null);
          }}
        >
          <View style={styles.passcodeOverlay}>
            <View style={styles.passcodeContent}>
              <View style={styles.passcodeHeader}>
                <Text style={styles.passcodeTitle}>Enter Passcode</Text>
                <TouchableOpacity 
                  onPress={() => {
                    setShowPasscodeModal(false);
                    setPasscode('');
                    setWalletToDelete(null);
                  }}
                >
                  <Feather name="x" size={24} color="black" />
                </TouchableOpacity>
              </View>
              
              <Text style={styles.passcodeSubtitle}>
                Enter your passcode to delete this wallet
              </Text>
              
              <TextInput
                style={styles.passcodeInput}
                value={passcode}
                onChangeText={setPasscode}
                placeholder="Enter passcode"
                placeholderTextColor="#666"
                keyboardType="numeric"
                secureTextEntry
                maxLength={4}
                autoFocus
              />
              
              <View style={styles.passcodeButtons}>
                <TouchableOpacity 
                  style={[styles.passcodeButton, styles.passcodeButtonCancel]}
                  onPress={() => {
                    setShowPasscodeModal(false);
                    setPasscode('');
                    setWalletToDelete(null);
                  }}
                >
                  <Text style={styles.passcodeButtonCancelText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.passcodeButton, styles.passcodeButtonDelete]}
                  onPress={handlePasscodeSubmit}
                >
                  <Text style={styles.passcodeButtonDeleteText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: '50%',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
  },
  editContainer: {
    gap: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 15,
    fontSize: 18,
    backgroundColor: '#fff',
    color: '#000',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  addressContainer: {
    gap: 10,
  },
  label: {
    fontSize: 16,
    color: '#666',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    padding: 12,
    borderRadius: 12,
  },
  address: {
    flex: 1,
    fontSize: 18,
    color: '#000',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    fontWeight: '400',
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E5F1FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
    marginLeft: 10,
  },
  copyButtonSuccess: {
    backgroundColor: '#4CAF50',
  },
  copyButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#007AFF',
  },
  copyButtonTextSuccess: {
    color: '#fff',
  },
  editButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  editButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '500',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    gap: 10,
  },
  addButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  addressActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  passcodeOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  passcodeContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: 340,
  },
  passcodeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  passcodeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  passcodeSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  passcodeInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 15,
    fontSize: 20,
    backgroundColor: '#fff',
    textAlign: 'center',
    letterSpacing: 8,
    marginBottom: 20,
  },
  passcodeButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  passcodeButton: {
    flex: 1,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  passcodeButtonCancel: {
    backgroundColor: '#f0f0f0',
  },
  passcodeButtonDelete: {
    backgroundColor: '#FF3B30',
  },
  passcodeButtonCancelText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  passcodeButtonDeleteText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Wallet;