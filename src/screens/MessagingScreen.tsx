import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  StyleSheet,
  SafeAreaView,
  Alert,
  Animated, // For recording animation
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { Audio } from 'expo-av';
import * as Crypto from 'expo-crypto';
import { Sound } from 'expo-av';

interface Message {
  id: string;
  text: string;
  isMine: boolean;
  timestamp: number;
  isFile?: boolean;
  fileName?: string;
  fileSize?: number;
  isVoiceNote?: boolean;
  duration?: number;
  audioUri?: string;
}

const MessagingScreen = () => {
  const navigation = useNavigation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const recordingAnimation = useRef(new Animated.Value(1)).current;
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  // Regular text message sending
  const sendMessage = () => {
    if (inputText.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: inputText.trim(),
        isMine: true,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, newMessage]);
      setInputText('');
    }
  };

  // File attachment handling
  const handleAttachment = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*', // Allow all file types
        copyToCacheDirectory: true
      });

      if (result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        const newMessage: Message = {
          id: Date.now().toString(),
          text: `File: ${file.name}`,
          isMine: true,
          timestamp: Date.now(),
          isFile: true,
          fileName: file.name,
          fileSize: file.size
        };

        setMessages(prev => [...prev, newMessage]);
        Alert.alert('Success', 'File attached successfully');
      }
    } catch (error) {
      console.error('Error attaching file:', error);
      Alert.alert('Error', 'Failed to attach file');
    }
  };

  // Initialize audio recording
  const startRecording = async () => {
    try {
      // Request permissions
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert('Permission required', 'Please grant microphone access to record voice notes.');
        return;
      }

      // Set audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Start recording
      const newRecording = new Audio.Recording();
      await newRecording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await newRecording.startAsync();
      setRecording(newRecording);
      setIsRecording(true);

      // Start duration counter
      startDurationCounter();
      // Start recording animation
      startRecordingAnimation();

    } catch (error) {
      console.error('Failed to start recording:', error);
      Alert.alert('Error', 'Failed to start recording');
    }
  };

  const stopRecording = async () => {
    try {
      if (!recording) return;

      // Stop recording
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      
      if (uri) {
        // Encrypt the audio file
        const encryptedUri = await encryptAudioFile(uri);
        
        // Add voice note to messages
        const newMessage: Message = {
          id: Date.now().toString(),
          text: 'Voice Note',
          isMine: true,
          timestamp: Date.now(),
          isVoiceNote: true,
          duration: recordingDuration,
          audioUri: encryptedUri,
        };
        
        setMessages(prev => [...prev, newMessage]);
      }

      // Reset states
      setRecording(null);
      setIsRecording(false);
      setRecordingDuration(0);
      stopRecordingAnimation();

    } catch (error) {
      console.error('Failed to stop recording:', error);
      Alert.alert('Error', 'Failed to stop recording');
    }
  };

  // Duration counter
  const startDurationCounter = () => {
    const interval = setInterval(() => {
      setRecordingDuration(prev => prev + 1);
    }, 1000);

    // Clear interval when recording stops
    return () => clearInterval(interval);
  };

  // Recording animation
  const startRecordingAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(recordingAnimation, {
          toValue: 1.2,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(recordingAnimation, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const stopRecordingAnimation = () => {
    recordingAnimation.setValue(1);
  };

  // Encrypt audio file
  const encryptAudioFile = async (uri: string) => {
    try {
      // Implement your encryption logic here
      // For now, we'll return the original URI
      return uri;
    } catch (error) {
      console.error('Failed to encrypt audio:', error);
      throw error;
    }
  };

  // Add this function to handle audio playback
  const handlePlayVoiceNote = async (audioUri: string) => {
    try {
      // If the same audio is playing, stop it
      if (playingAudio === audioUri && sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
        setSound(null);
        setPlayingAudio(null);
        return;
      }

      // If a different audio is playing, stop it
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
        setSound(null);
      }

      // Play the selected audio
      const newSound = new Audio.Sound();
      await newSound.loadAsync({ uri: audioUri });
      
      // Add event listener for playback status
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          setPlayingAudio(null);
          setSound(null);
        }
      });

      await newSound.playAsync();
      setSound(newSound);
      setPlayingAudio(audioUri);

    } catch (error) {
      console.error('Error playing voice note:', error);
      Alert.alert('Error', 'Failed to play voice note');
    }
  };

  // Update your renderMessage function
  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[
      styles.messageContainer,
      item.isMine ? styles.myMessage : styles.theirMessage
    ]}>
      <View style={[
        styles.messageBubble,
        item.isMine ? styles.myMessageBubble : styles.theirMessageBubble
      ]}>
        {item.isVoiceNote ? (
          <View style={styles.voiceNoteContainer}>
            <TouchableOpacity 
              style={styles.playButton}
              onPress={() => item.audioUri && handlePlayVoiceNote(item.audioUri)}
            >
              <Feather 
                name={playingAudio === item.audioUri ? "square" : "play"} 
                size={24} 
                color={item.isMine ? "#fff" : "#000"} 
              />
            </TouchableOpacity>
            <View style={styles.voiceNoteContent}>
              <View style={[
                styles.voiceNoteWaveform,
                item.isMine ? styles.myVoiceNoteWaveform : styles.theirVoiceNoteWaveform
              ]} />
              <Text style={[
                styles.durationText,
                item.isMine ? styles.myMessageText : styles.theirMessageText
              ]}>
                {formatDuration(item.duration || 0)}
              </Text>
            </View>
          </View>
        ) : (
          <Text style={[
            styles.messageText,
            item.isMine ? styles.myMessageText : styles.theirMessageText
          ]}>
            {item.text}
          </Text>
        )}
      </View>
    </View>
  );

  // Format duration
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Clean up sound when component unmounts
  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Feather name="arrow-left" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Messages</Text>
      </View>

      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        style={styles.messagesList}
      />
      
      <View style={styles.inputContainer}>
        <TouchableOpacity 
          style={styles.attachButton}
          onPress={handleAttachment}
        >
          <Feather name="paperclip" size={24} color="#007AFF" />
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type a message..."
          multiline
        />
        <TouchableOpacity 
          style={styles.recordButton}
          onPress={isRecording ? stopRecording : startRecording}
        >
          <Feather name={isRecording ? "square" : "mic"} size={20} color="white" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.sendButton}
          onPress={sendMessage}
        >
          <Feather name="send" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ECECEC',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  messagesList: {
    flex: 1,
  },
  messageContainer: {
    marginVertical: 4,
    marginHorizontal: 8,
    flexDirection: 'row',
  },
  myMessage: {
    justifyContent: 'flex-end',
  },
  theirMessage: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 20,
  },
  myMessageBubble: {
    backgroundColor: '#007AFF',
    borderTopRightRadius: 4,
  },
  theirMessageBubble: {
    backgroundColor: '#E9E9EB',
    borderTopLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
  },
  myMessageText: {
    color: '#FFFFFF',
  },
  theirMessageText: {
    color: '#000000',
  },
  fileAttachment: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fileSize: {
    fontSize: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#ECECEC',
  },
  attachButton: {
    padding: 10,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    backgroundColor: '#F2F2F7',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    fontSize: 16,
  },
  recordButton: {
    width: 44,
    height: 44,
    backgroundColor: '#FF3B30',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  sendButton: {
    width: 44,
    height: 44,
    backgroundColor: '#007AFF',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  recordingContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 20,
    padding: 10,
  },
  recordingIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'red',
    marginRight: 10,
  },
  recordingText: {
    flex: 1,
    color: '#666',
  },
  stopRecordingButton: {
    padding: 10,
  },
  voiceNoteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 120,
    paddingVertical: 4,
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  voiceNoteContent: {
    flex: 1,
    marginLeft: 8,
  },
  voiceNoteWaveform: {
    height: 20,
    borderRadius: 2,
    marginBottom: 4,
  },
  myVoiceNoteWaveform: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  theirVoiceNoteWaveform: {
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  durationText: {
    fontSize: 12,
  },
});

export default MessagingScreen;