import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Image,
  Switch,
  Dimensions,
  TextInput,
  Alert,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import DraggableFlatList, { 
  RenderItemParams, 
  ScaleDecorator 
} from 'react-native-draggable-flatlist';
import { Video, ResizeMode } from 'expo-av';
import { ColorPicker } from 'react-native-color-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Audio } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import Wallet from '../components/Wallet';
import Notifications from '../components/Notifications';
import { NavigationProp } from '@react-navigation/native';

type ButtonIcon = 'image' | 'video' | 'headphones' | 'file-text' | 'link' | 'box' | 'calendar' | 'gift' | 'tag' | 'clock' | 'heart' | 'message-circle' | 'credit-card' | 'bell';

type RootStackParamList = {
  Home: undefined;
  Create: undefined;
  Profile: undefined;
  Messaging: undefined;
  // ... other screens ...
};

const samplePhotos = [
  { id: '1', color: '#FF5733', title: 'Sunset Beach' },
  { id: '2', color: '#33FF57', title: 'Mountain View' },
  { id: '3', color: '#3357FF', title: 'City Lights' },
  { id: '4', color: '#FF33F6', title: 'Forest Path' },
  { id: '5', color: '#33FFF6', title: 'Desert Dunes' },
  { id: '6', color: '#F6FF33', title: 'Ocean Waves' },
  { id: '7', color: '#FF3333', title: 'Autumn Leaves' },
  { id: '8', color: '#33FF33', title: 'Spring Garden' },
  { id: '9', color: '#3333FF', title: 'Winter Snow' },
  { id: '10', color: '#FF9933', title: 'Summer Lake' },
  { id: '11', color: '#33FF99', title: 'Tropical Island' },
  { id: '12', color: '#9933FF', title: 'Northern Lights' },
  { id: '13', color: '#FF3366', title: 'Urban Street' },
  { id: '14', color: '#66FF33', title: 'Green Valley' },
  { id: '15', color: '#3366FF', title: 'Blue Lagoon' },
];

const ProfileScreen = () => {
  const [showSettings, setShowSettings] = useState(false);
  
  const [profileSettings, setProfileSettings] = useState({
    showProfilePicture: true,
    showName: true,
    showBiography: true,
    showFollowButton: true,
    showFollowing: true,
    showFollowers: true,
    showWalletButton: true,
    showMessageButton: true,
    showBackground: true,
    backgroundUri: null,
    backgroundType: 'color' as 'image' | 'video' | 'color',
    textColors: {
      name: '#000000',
      username: '#000000',
      biography: '#000000',
      location: '#000000',
      following: '#000000',
      followers: '#000000',
    },
    buttonColors: {
      background: '#f8f8f8',
      text: '#000000',
      icon: '#000000',
    },
    backgroundColor: '#ffffff',
    rectangleColor: '#f8f8f8',
    followButton: {
      backgroundColor: '#000000',
      textColor: '#FFFFFF',
    },
    showProfileBox: true,
  });

  const [buttons, setButtons] = useState<Array<{
    id: string;
    title: string;
    contentType: string;
    icon: ButtonIcon;
    isVisible: boolean;
  }>>([
    { id: '1', title: 'Photos', contentType: 'photos', icon: 'image', isVisible: true },
    { id: '2', title: 'Videos', contentType: 'videos', icon: 'video', isVisible: true },
    { id: '3', title: 'Audio', contentType: 'audio', icon: 'headphones', isVisible: true },
    { id: '4', title: 'Text', contentType: 'text', icon: 'file-text', isVisible: true },
    { id: '5', title: 'Links', contentType: 'links', icon: 'link', isVisible: true },
    { id: '6', title: "NFT's", contentType: 'nfts', icon: 'box', isVisible: true },
    { id: '7', title: 'Events', contentType: 'events', icon: 'calendar', isVisible: true },
    { id: '8', title: 'Donations', contentType: 'donations', icon: 'gift', isVisible: true },
    { id: '9', title: 'Tags', contentType: 'tags', icon: 'tag', isVisible: true },
    { id: '10', title: 'Moments', contentType: 'moments', icon: 'clock', isVisible: true },
    { id: '11', title: 'Likes', contentType: 'likes', icon: 'heart', isVisible: true },
    { id: '12', title: 'Comments', contentType: 'comments', icon: 'message-circle', isVisible: true },
  ]);

  const [videoStatus, setVideoStatus] = useState<any>({});
  const [videoError, setVideoError] = useState(false);

  const [showColorPicker, setShowColorPicker] = useState(false);
  const [currentColorField, setCurrentColorField] = useState<keyof typeof profileSettings.textColors | null>(null);

  const [activeContent, setActiveContent] = useState<string | null>(null);
  const [showContentModal, setShowContentModal] = useState(false);

  const [loadingImages, setLoadingImages] = useState<Record<string, boolean>>({});

  const [photoViewType, setPhotoViewType] = useState('grid'); // 'grid' or 'scroll'

  const [selectedPhoto, setSelectedPhoto] = useState<{
    id: string;
    color: string;
    title: string;
  } | null>(null);
  const [showPhotoDetail, setShowPhotoDetail] = useState(false);

  const photoDetails = {
    '1': {
      likes: 1234,
      comments: [
        { id: 1, user: 'user1', text: 'Beautiful photo!', likes: 23 },
        { id: 2, user: 'user2', text: 'Amazing shot 📸', likes: 15 },
        { id: 3, user: 'user3', text: 'Love the colors!', likes: 19 },
      ]
    }
    // Add more photo details as needed
  };

  const [showOptionsMenu, setShowOptionsMenu] = useState(false);

  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const [audioFiles, setAudioFiles] = useState<Array<{
    id: string;
    uri: string;
    name: string;
    duration?: number;
    isPlaying?: boolean;
  }>>([]);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);

  const [backgroundType, setBackgroundType] = useState<'image' | 'video'>('image');
  const [backgroundUri, setBackgroundUri] = useState<string | null>(null);

  const [colorInput, setColorInput] = useState('#');

  const [isWalletVisible, setIsWalletVisible] = useState(false);
  const [isNotificationsVisible, setIsNotificationsVisible] = useState(false);

  // Add this state at the top with your other states
  const [notificationCount, setNotificationCount] = useState(3); // Example count

  const [profileImage, setProfileImage] = useState('https://via.placeholder.com/150');

  // Add these new state variables
  const [profileData, setProfileData] = useState({
    displayName: 'John Doe',
    biography: 'Digital Creator & Developer',
    location: 'New York, USA'
  });

  const toggleProfileSetting = (setting: keyof typeof profileSettings) => {
    setProfileSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const toggleButtonVisibility = (id: string) => {
    setButtons(prevButtons =>
      prevButtons.map(button =>
        button.id === id
          ? { ...button, isVisible: !button.isVisible }
          : button
      )
    );
  };

  const handleEditButton = (id: string, title: string) => {
    setIsEditing(id);
    setEditText(title);
  };

  const handleSaveEdit = (id: string) => {
    setButtons(currentButtons => 
      currentButtons.map(button => 
        button.id === id ? { ...button, title: editText } : button
      )
    );
    setIsEditing(null);
  };

  const renderItem = ({ item, drag, isActive }: RenderItemParams<typeof buttons[0]>) => {
    return (
      <ScaleDecorator>
        <TouchableOpacity
          onLongPress={drag}
          disabled={isActive}
          style={[
            styles.buttonContainer,
            { opacity: isActive ? 0.5 : 1 }
          ]}
        >
          <View style={styles.buttonContent}>
            <Feather name="menu" size={24} color="gray" style={styles.dragHandle} />
            
            {isEditing === item.id ? (
              <View style={styles.editContainer}>
                <TextInput
                  value={editText}
                  onChangeText={setEditText}
                  style={styles.editInput}
                  autoFocus
                />
                <TouchableOpacity 
                  onPress={() => handleSaveEdit(item.id)}
                  style={styles.saveButton}
                >
                  <Feather name="check" size={20} color="green" />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.buttonInner}>
                <Feather name={item.icon} size={24} color="black" />
                <Text style={styles.buttonText}>{item.title}</Text>
                <TouchableOpacity 
                  onPress={() => handleEditButton(item.id, item.title)}
                  style={styles.editButton}
                >
                  <Feather name="edit-2" size={16} color="gray" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </ScaleDecorator>
    );
  };

  const updateTextColor = (field: keyof typeof profileSettings.textColors, color: string) => {
    setProfileSettings(prev => ({
      ...prev,
      textColors: {
        ...prev.textColors,
        [field]: color
      }
    }));
  };

  const handleContentPress = (contentType: string) => {
    console.log('Button pressed:', contentType); // Debug log
    if (contentType === 'wallet') {
      console.log('Opening wallet'); // Debug log
      setIsWalletVisible(true);
    } else {
      setActiveContent(contentType);
      setShowContentModal(true);
    }
  };

  const handlePhotoTap = (photo: {
    id: string;
    color: string;
    title: string;
  }) => {
    setSelectedPhoto(photo);
    setShowPhotoDetail(true);
  };

  const handleShare = async (photo: {
    id: string;
    color: string;
    title: string;
  }) => {
    try {
      const shareMessage = `Check out this photo: Photo ${photo.id} from MySecureApp`;
      
      // For web
      if (Platform.OS === 'web') {
        if (typeof navigator !== 'undefined' && navigator.share) {
          await navigator.share({
            title: 'Share Photo',
            text: shareMessage,
          });
        } else {
          // Fallback for browsers that don't support Web Share API
          alert('Copy this link to share: ' + shareMessage);
        }
      } else {
        // For mobile
        await Share.share({
          message: shareMessage,
        });
      }
    } catch (error) {
      console.log('Error sharing:', error);
    }
  };

  const handleNotInterested = () => {
    alert('Not interested in similar content');
    setShowOptionsMenu(false);
  };

  const handleReport = () => {
    alert('Report submitted');
    setShowOptionsMenu(false);
  };

  const handleBlock = () => {
    alert('User blocked');
    setShowOptionsMenu(false);
  };

  // Add state for button texts
  const [contentButtons, setContentButtons] = useState([
    { id: 'Photos', text: 'Photos' },
    { id: 'Posts', text: 'Posts' },
    { id: 'Reels', text: 'Reels' },
    { id: 'Tagged', text: 'Tagged' },
  ]);

  const pickAudio = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
        copyToCacheDirectory: true,
      });

      if (result.assets && result.assets[0]) {
        const asset = result.assets[0];
        const newAudio = {
          id: Date.now().toString(),
          uri: asset.uri,
          name: asset.name,
        };
        setAudioFiles(prev => [...prev, newAudio]);
      }
    } catch (err) {
      console.log('Error picking audio:', err);
    }
  };

  const playSound = async (audioFile: typeof audioFiles[0]) => {
    try {
      // Stop current sound if playing
      if (sound) {
        await sound.unloadAsync();
      }

      // Load and play new sound
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioFile.uri },
        { shouldPlay: true }
      );
      setSound(newSound);
      setCurrentlyPlaying(audioFile.id);

      // Update state when playback finishes
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status && 'didJustFinish' in status && status.didJustFinish) {
          setCurrentlyPlaying(null);
        }
      });
    } catch (error) {
      console.log('Error playing sound:', error);
    }
  };

  const stopSound = async () => {
    if (sound) {
      await sound.stopAsync();
      setCurrentlyPlaying(null);
    }
  };

  const handleBackgroundUpload = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please allow access to your media library');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setBackgroundType(asset.type === 'image' ? 'image' : 'video');
        setBackgroundUri(asset.uri);
      }
    } catch (error) {
      console.log('Error uploading background:', error);
      Alert.alert('Error', 'Failed to upload background');
    }
  };

  const handleColorSelect = (color: string) => {
    console.log('Selected color:', color); // Debug log
    console.log('Current field:', currentColorField); // Debug log
    
    if (currentColorField === 'buttonBackground') {
      setProfileSettings(prev => ({
        ...prev,
        buttonColors: {
          ...prev.buttonColors,
          background: color
        }
      }));
    } else if (currentColorField === 'buttonText') {
      setProfileSettings(prev => ({
        ...prev,
        buttonColors: {
          ...prev.buttonColors,
          text: color
        }
      }));
    } else if (currentColorField === 'buttonIcon') {
      setProfileSettings(prev => ({
        ...prev,
        buttonColors: {
          ...prev.buttonColors,
          icon: color
        }
      }));
    } else if (currentColorField) {
      setProfileSettings(prev => ({
        ...prev,
        textColors: {
          ...prev.textColors,
          [currentColorField]: color
        }
      }));
    }
    setShowColorPicker(false);
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled) {
        setProfileSettings(prev => ({
          ...prev,
          backgroundUri: result.assets[0].uri,
          backgroundType: 'upload'
        }));
        setHasUnsavedChanges(true);
      }
    } catch (error) {
      console.log('Error picking image:', error);
    }
  };

  const handleBackgroundColorChange = (text: string) => {
    setColorInput(text);
    if (text.length === 7 && text.startsWith('#')) {
      setProfileSettings(prev => ({
        ...prev,
        backgroundColor: text,
        backgroundType: 'color'
      }));
    }
  };

  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const handleMessagePress = () => {
    console.log('Navigating to Messaging screen');
    navigation.navigate('Messaging');
  };

  const handleImageUpload = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Needed', 'Please grant permission to access your photos');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        setProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', 'Failed to upload image');
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={[
        styles.container,
        profileSettings.backgroundType === 'color' && { backgroundColor: profileSettings.backgroundColor }
      ]}>
        {/* Background Layer */}
        {profileSettings.showBackground && profileSettings.backgroundUri && (
          <View style={styles.backgroundContainer}>
            {profileSettings.backgroundType === 'video' ? (
              <Video
                source={{ uri: profileSettings.backgroundUri }}
                style={styles.backgroundMedia}
                shouldPlay
                isLooping
                resizeMode={ResizeMode.COVER}
              />
            ) : (
              <Image
                source={{ uri: profileSettings.backgroundUri }}
                style={styles.backgroundMedia}
                resizeMode="cover"
              />
            )}
          </View>
        )}

        {/* Content Layer */}
        <View style={styles.contentLayer}>
          <View style={styles.headerButtons}>
            <View style={styles.leftButtons}>
              {profileSettings.showWalletButton && (
                <TouchableOpacity 
                  style={styles.transparentButton}
                  onPress={() => setIsWalletVisible(true)}
                >
                  <Feather name="credit-card" size={24} color="white" />
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.rightButtons}>
              <TouchableOpacity 
                style={styles.transparentButton}
                onPress={() => setIsNotificationsVisible(true)}
              >
                <View style={styles.notificationIconContainer}>
                  <Feather name="bell" size={24} color="white" />
                  {notificationCount > 0 && (
                    <View style={styles.notificationBadge}>
                      <Text style={styles.notificationBadgeText}>
                        {notificationCount > 99 ? '99+' : notificationCount}
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>

              {profileSettings.showMessageButton && (
                <TouchableOpacity 
                  style={styles.transparentButton}
                  onPress={handleMessagePress}
                >
                  <Feather name="message-circle" size={24} color="white" />
                </TouchableOpacity>
              )}

              <TouchableOpacity 
                style={styles.transparentButton}
                onPress={() => setShowSettings(true)}
              >
                <Feather name="settings" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView style={styles.scrollView}>
            <View style={styles.profileSection}>
              {profileSettings.showProfilePicture && (
                <View style={styles.profileImageContainer}>
                  <Image 
                    source={{ uri: profileImage }}
                    style={styles.profileImage}
                  />
                  <TouchableOpacity 
                    style={styles.editImageButton}
                    onPress={handleImageUpload}
                  >
                    <Feather name="edit-2" size={16} color="white" />
                  </TouchableOpacity>
                </View>
              )}

              <View style={[
                profileSettings.showProfileBox ? styles.textContainer : styles.textContainerNoBox,
                profileSettings.showProfileBox && { backgroundColor: profileSettings.rectangleColor }
              ]}>
                {profileSettings.showName && (
                  <Text style={[styles.name, { color: profileSettings.textColors.name }]}>
                    {profileData.displayName}
                  </Text>
                )}
                
                <Text style={[
                  styles.username,
                  { color: profileSettings.textColors.username }
                ]}>
                  @johndoe
                </Text>
                
                {profileSettings.showBiography && (
                  <>
                    <Text style={[styles.bio, { color: profileSettings.textColors.biography }]}>
                      {profileData.biography}
                    </Text>
                    <View style={styles.locationRow}>
                      <Feather name="map-pin" size={16} color={profileSettings.textColors.location} />
                      <Text style={[styles.locationText, { color: profileSettings.textColors.location }]}>
                        {profileData.location}
                      </Text>
                    </View>
                  </>
                )}

                <View style={styles.statsRow}>
                  {profileSettings.showFollowing && (
                    <View style={styles.statItem}>
                      <Text style={[styles.statNumber, { color: profileSettings.textColors.following }]}>1.2K</Text>
                      <Text style={[styles.statLabel, { color: profileSettings.textColors.following }]}>Following</Text>
                    </View>
                  )}
                  {profileSettings.showFollowing && profileSettings.showFollowers && (
                    <View style={styles.statDivider} />
                  )}
                  {profileSettings.showFollowers && (
                    <View style={styles.statItem}>
                      <Text style={[styles.statNumber, { color: profileSettings.textColors.followers }]}>8.5K</Text>
                      <Text style={[styles.statLabel, { color: profileSettings.textColors.followers }]}>Followers</Text>
                    </View>
                  )}
                </View>
              </View>

              {profileSettings.showFollowButton && (
                <TouchableOpacity 
                  style={[
                    styles.followButton,
                    { backgroundColor: profileSettings.followButton.backgroundColor }
                  ]}
                >
                  <Text style={[
                    styles.followButtonText,
                    { color: profileSettings.followButton.textColor }
                  ]}>
                    Follow
                  </Text>
                </TouchableOpacity>
              )}

              <View style={styles.buttonGrid}>
                {buttons.filter(button => button.isVisible).reduce((rows: any[], button, index, array) => {
                  if (index % 2 === 0) {
                    rows.push(
                      <View key={index} style={styles.buttonRow}>
                        <TouchableOpacity 
                          style={[
                            styles.gridButton,
                            { backgroundColor: profileSettings.buttonColors.background }
                          ]}
                          onPress={() => handleContentPress(button.contentType)}
                        >
                          <Feather 
                            name={button.icon} 
                            size={24} 
                            color={profileSettings.buttonColors.icon} 
                          />
                          <Text style={[
                            styles.buttonText,
                            { color: profileSettings.buttonColors.text }
                          ]}>
                            {button.title}
                          </Text>
                        </TouchableOpacity>
                        
                        {array[index + 1] && (
                          <TouchableOpacity 
                            style={[
                              styles.gridButton,
                              { backgroundColor: profileSettings.buttonColors.background }
                            ]}
                            onPress={() => handleContentPress(array[index + 1].contentType)}
                          >
                            <Feather 
                              name={array[index + 1].icon} 
                              size={24} 
                              color={profileSettings.buttonColors.icon} 
                            />
                            <Text style={[
                              styles.buttonText,
                              { color: profileSettings.buttonColors.text }
                            ]}>
                              {array[index + 1].title}
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    );
                  }
                  return rows;
                }, [])}
              </View>
            </View>
          </ScrollView>
        </View>

        {/* Modals */}
        <Modal
          visible={showSettings}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowSettings(false)}
        >
          <GestureHandlerRootView style={{ flex: 1 }}>
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Settings</Text>
                  <TouchableOpacity onPress={() => setShowSettings(false)}>
                    <Feather name="x" size={24} color="black" />
                  </TouchableOpacity>
                </View>

                <ScrollView>
                  <View style={styles.settingsSection}>
                    <Text style={styles.settingsSectionTitle}>Profile Elements</Text>
                    
                    {/* Add text input fields for editing profile data */}
                    <View style={styles.editField}>
                      <Text style={styles.editFieldLabel}>Display Name</Text>
                      <TextInput
                        value={profileData.displayName}
                        onChangeText={(text) => setProfileData(prev => ({ ...prev, displayName: text }))}
                        style={styles.editInput}
                      />
                    </View>

                    <View style={styles.editField}>
                      <Text style={styles.editFieldLabel}>Biography</Text>
                      <TextInput
                        value={profileData.biography}
                        onChangeText={(text) => setProfileData(prev => ({ ...prev, biography: text }))}
                        style={styles.editInput}
                        multiline
                        numberOfLines={3}
                      />
                    </View>

                    <View style={styles.editField}>
                      <Text style={styles.editFieldLabel}>Location</Text>
                      <TextInput
                        value={profileData.location}
                        onChangeText={(text) => setProfileData(prev => ({ ...prev, location: text }))}
                        style={styles.editInput}
                      />
                    </View>

                    <View style={styles.toggleItem}>
                      <View style={styles.toggleIcon}>
                        <Feather name="image" size={24} color="black" />
                      </View>
                      <Text style={styles.toggleText}>Profile Picture</Text>
                      <Switch 
                        value={profileSettings.showProfilePicture}
                        onValueChange={() => toggleProfileSetting('showProfilePicture')}
                      />
                    </View>

                    <View style={styles.toggleItem}>
                      <View style={styles.toggleIcon}>
                        <Feather name="user" size={24} color="black" />
                      </View>
                      <Text style={styles.toggleText}>Display Name</Text>
                      <Switch 
                        value={profileSettings.showName}
                        onValueChange={() => toggleProfileSetting('showName')}
                      />
                    </View>

                    <View style={styles.toggleItem}>
                      <View style={styles.toggleIcon}>
                        <Feather name="file-text" size={24} color="black" />
                      </View>
                      <Text style={styles.toggleText}>Biography</Text>
                      <Switch 
                        value={profileSettings.showBiography}
                        onValueChange={() => toggleProfileSetting('showBiography')}
                      />
                    </View>

                    <View style={styles.toggleItem}>
                      <View style={styles.toggleIcon}>
                        <Feather name="users" size={24} color="black" />
                      </View>
                      <Text style={styles.toggleText}>Following Count</Text>
                      <Switch 
                        value={profileSettings.showFollowing}
                        onValueChange={() => toggleProfileSetting('showFollowing')}
                      />
                    </View>

                    <View style={styles.toggleItem}>
                      <View style={styles.toggleIcon}>
                        <Feather name="users" size={24} color="black" />
                      </View>
                      <Text style={styles.toggleText}>Followers Count</Text>
                      <Switch 
                        value={profileSettings.showFollowers}
                        onValueChange={() => toggleProfileSetting('showFollowers')}
                      />
                    </View>

                    <View style={styles.toggleItem}>
                      <View style={styles.toggleIcon}>
                        <Feather name="user-plus" size={24} color="black" />
                      </View>
                      <Text style={styles.toggleText}>Follow Button</Text>
                      <Switch 
                        value={profileSettings.showFollowButton}
                        onValueChange={() => toggleProfileSetting('showFollowButton')}
                      />
                    </View>
                  </View>

                  <View style={styles.settingsDivider} />

                  <View style={styles.settingsSection}>
                    <Text style={styles.settingsSectionTitle}>Background</Text>
                    
                    <View style={styles.backgroundControls}>
                      <TouchableOpacity
                        style={styles.backgroundButton}
                        onPress={pickImage}
                      >
                        <Feather 
                          name="upload" 
                          size={24} 
                          color="black" 
                        />
                        <Text style={styles.backgroundButtonText}>
                          Upload
                        </Text>
                      </TouchableOpacity>

                      <TextInput
                        style={styles.colorInput}
                        value={colorInput}
                        onChangeText={handleBackgroundColorChange}
                        placeholder="#ffffff"
                        maxLength={7}
                        autoCapitalize="characters"
                      />
                    </View>

                    {/* Show selected background */}
                    {profileSettings.backgroundUri && (
                      <View style={styles.selectedBackground}>
                        <Image 
                          source={{ uri: profileSettings.backgroundUri }} 
                          style={styles.backgroundPreview} 
                        />
                      </View>
                    )}
                  </View>

                  <View style={styles.settingsDivider} />

                  <View style={styles.settingsSection}>
                    <Text style={styles.settingsSectionTitle}>Content Buttons</Text>
                    <DraggableFlatList
                      data={buttons}
                      onDragEnd={({ data }) => {
                        console.log('Reordering buttons:', data); // Debug log
                        setButtons(data);
                      }}
                      keyExtractor={(item) => item.id}
                      renderItem={({ item, drag, isActive }: RenderItemParams<typeof buttons[0]>) => (
                        <ScaleDecorator>
                          <View style={[
                            styles.toggleItem,
                            { backgroundColor: isActive ? '#f0f0f0' : 'white' }
                          ]}>
                            <TouchableOpacity 
                              onPressIn={drag}  // Changed from onLongPress to onPressIn
                              delayLongPress={0}
                              style={styles.dragHandle}
                            >
                              <Feather name="menu" size={24} color="gray" />
                            </TouchableOpacity>

                            <View style={styles.toggleIcon}>
                              <Feather name={item.icon} size={24} color="black" />
                            </View>
                            
                            {isEditing === item.id ? (
                              <View style={styles.editContainer}>
                                <TextInput
                                  value={editText}
                                  onChangeText={setEditText}
                                  style={styles.editInput}
                                  autoFocus
                                />
                                <TouchableOpacity 
                                  onPress={() => handleSaveEdit(item.id)}
                                  style={styles.saveButton}
                                >
                                  <Feather name="check" size={20} color="green" />
                                </TouchableOpacity>
                              </View>
                            ) : (
                              <View style={styles.buttonTitleContainer}>
                                <Text style={styles.toggleText}>{item.title}</Text>
                                <TouchableOpacity 
                                  onPress={() => handleEditButton(item.id, item.title)}
                                  style={styles.editButton}
                                >
                                  <Feather name="edit-2" size={16} color="gray" />
                                </TouchableOpacity>
                              </View>
                            )}
                            
                            <Switch
                              value={item.isVisible}
                              onValueChange={() => toggleButtonVisibility(item.id)}
                            />
                          </View>
                        </ScaleDecorator>
                      )}
                    />
                  </View>

                  <View style={styles.settingsDivider} />

                  <View style={styles.settingsSection}>
                    <Text style={styles.settingsSectionTitle}>Text Colors</Text>
                    
                    {Object.entries(profileSettings.textColors).map(([key, value]) => (
                      <View key={key} style={styles.colorRow}>
                        <Text style={styles.colorLabel}>{key.charAt(0).toUpperCase() + key.slice(1)}:</Text>
                        <TextInput
                          style={styles.colorInput}
                          value={value}
                          onChangeText={(text) => {
                            if (text.length <= 7) {
                              setProfileSettings(prev => ({
                                ...prev,
                                textColors: {
                                  ...prev.textColors,
                                  [key]: text
                                }
                              }));
                              if (text.length === 7 && text.startsWith('#')) {
                                setHasUnsavedChanges(true);
                              }
                            }
                          }}
                          placeholder="#000000"
                          maxLength={7}
                          autoCapitalize="characters"
                        />
                      </View>
                    ))}
                  </View>

                  <View style={styles.settingsSection}>
                    <Text style={styles.settingsSectionTitle}>Button Colors</Text>
                    
                    <View style={styles.colorRow}>
                      <Text style={styles.colorLabel}>Background:</Text>
                      <TextInput
                        style={styles.colorInput}
                        value={profileSettings.buttonColors.background}
                        onChangeText={(text) => {
                          if (text.length <= 7) {
                            setProfileSettings(prev => ({
                              ...prev,
                              buttonColors: {
                                ...prev.buttonColors,
                                background: text
                              }
                            }));
                            if (text.length === 7 && text.startsWith('#')) {
                              setHasUnsavedChanges(true);
                            }
                          }
                        }}
                        placeholder="#f8f8f8"
                        maxLength={7}
                        autoCapitalize="characters"
                      />
                    </View>

                    <View style={styles.colorRow}>
                      <Text style={styles.colorLabel}>Text:</Text>
                      <TextInput
                        style={styles.colorInput}
                        value={profileSettings.buttonColors.text}
                        onChangeText={(text) => {
                          if (text.length <= 7) {
                            setProfileSettings(prev => ({
                              ...prev,
                              buttonColors: {
                                ...prev.buttonColors,
                                text: text
                              }
                            }));
                            if (text.length === 7 && text.startsWith('#')) {
                              setHasUnsavedChanges(true);
                            }
                          }
                        }}
                        placeholder="#000000"
                        maxLength={7}
                        autoCapitalize="characters"
                      />
                    </View>

                    <View style={styles.colorRow}>
                      <Text style={styles.colorLabel}>Icon:</Text>
                      <TextInput
                        style={styles.colorInput}
                        value={profileSettings.buttonColors.icon}
                        onChangeText={(text) => {
                          if (text.length <= 7) {
                            setProfileSettings(prev => ({
                              ...prev,
                              buttonColors: {
                                ...prev.buttonColors,
                                icon: text
                              }
                            }));
                            if (text.length === 7 && text.startsWith('#')) {
                              setHasUnsavedChanges(true);
                            }
                          }
                        }}
                        placeholder="#000000"
                        maxLength={7}
                        autoCapitalize="characters"
                      />
                    </View>
                  </View>

                  <View style={styles.settingsSection}>
                    <View style={styles.sectionHeaderRow}>
                      <Text style={styles.settingsSectionTitle}>Profile Box</Text>
                      <Switch
                        value={profileSettings.showProfileBox}
                        onValueChange={(value) => {
                          setProfileSettings(prev => ({
                            ...prev,
                            showProfileBox: value
                          }));
                        }}
                      />
                    </View>

                    {profileSettings.showProfileBox && (
                      <View style={styles.colorRow}>
                        <Text style={styles.colorLabel}>Box Color:</Text>
                        <TextInput
                          style={styles.colorInput}
                          value={profileSettings.rectangleColor}
                          onChangeText={(text) => {
                            setProfileSettings(prev => ({
                              ...prev,
                              rectangleColor: text
                            }));
                          }}
                          placeholder="#f8f8f8"
                          maxLength={7}
                          autoCapitalize="characters"
                        />
                      </View>
                    )}
                  </View>

                  <View style={styles.settingsSection}>
                    <Text style={styles.settingsSectionTitle}>Follow Button</Text>
                    
                    <View style={styles.colorRow}>
                      <Text style={styles.colorLabel}>Button Color:</Text>
                      <TextInput
                        style={styles.colorInput}
                        value={profileSettings.followButton.backgroundColor}
                        onChangeText={(text) => {
                          setProfileSettings(prev => ({
                            ...prev,
                            followButton: {
                              ...prev.followButton,
                              backgroundColor: text
                            }
                          }));
                        }}
                        placeholder="#000000"
                        maxLength={7}
                        autoCapitalize="characters"
                      />
                    </View>

                    <View style={styles.colorRow}>
                      <Text style={styles.colorLabel}>Text Color:</Text>
                      <TextInput
                        style={styles.colorInput}
                        value={profileSettings.followButton.textColor}
                        onChangeText={(text) => {
                          setProfileSettings(prev => ({
                            ...prev,
                            followButton: {
                              ...prev.followButton,
                              textColor: text
                            }
                          }));
                        }}
                        placeholder="#FFFFFF"
                        maxLength={7}
                        autoCapitalize="characters"
                      />
                    </View>
                  </View>
                </ScrollView>
              </View>
            </View>
          </GestureHandlerRootView>
        </Modal>

        <Modal
          visible={showColorPicker}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowColorPicker(false)}
        >
          <View style={styles.colorPickerModal}>
            <View style={styles.colorPickerContainer}>
              <View style={styles.colorPickerHeader}>
                <Text style={styles.colorPickerTitle}>Pick a Color</Text>
                <TouchableOpacity onPress={() => setShowColorPicker(false)}>
                  <Feather name="x" size={24} color="black" />
                </TouchableOpacity>
              </View>
              <ColorPicker
                onColorSelected={(color) => {
                  handleColorSelect(color);
                }}
                style={{ flex: 1 }}
                hideSliders={true}
              />
            </View>
          </View>
        </Modal>

        <Modal
          visible={showContentModal}
          animationType="slide"
          onRequestClose={() => setShowContentModal(false)}
        >
          <View style={styles.modalView}>
            <View style={styles.modalHeader}>
              <TouchableOpacity 
                onPress={() => setShowContentModal(false)}
                style={styles.closeButton}
              >
                <Feather name="arrow-left" size={24} color="black" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>
                {buttons.find(b => b.contentType === activeContent)?.title}
              </Text>
              <View style={{width: 40}} />
            </View>

            {activeContent === 'photos' ? (
              <View style={styles.contentContainer}>
                <View style={styles.viewTypeToggle}>
                  <TouchableOpacity 
                    style={[
                      styles.viewTypeButton, 
                      photoViewType === 'grid' && styles.viewTypeButtonActive
                    ]}
                    onPress={() => setPhotoViewType('grid')}
                  >
                    <Feather name="grid" size={24} color={photoViewType === 'grid' ? 'white' : 'black'} />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[
                      styles.viewTypeButton, 
                      photoViewType === 'scroll' && styles.viewTypeButtonActive
                    ]}
                    onPress={() => setPhotoViewType('scroll')}
                  >
                    <Feather name="list" size={24} color={photoViewType === 'scroll' ? 'white' : 'black'} />
                  </TouchableOpacity>
                </View>

                {photoViewType === 'grid' ? (
                  <ScrollView>
                    <View style={styles.photoGrid}>
                      {samplePhotos.map((photo) => (
                        <TouchableOpacity
                          key={photo.id}
                          style={styles.photoItem}
                          onPress={() => handlePhotoTap(photo)}
                        >
                          <View style={[styles.photo, { backgroundColor: photo.color }]}>
                            <Text style={styles.photoText}>{photo.title}</Text>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                ) : (
                  <ScrollView horizontal pagingEnabled>
                    {samplePhotos.map((photo) => (
                      <TouchableOpacity
                        key={photo.id}
                        style={styles.scrollPhotoContainer}
                        onPress={() => handlePhotoTap(photo)}
                      >
                        <View style={[styles.scrollPhoto, { backgroundColor: photo.color }]}>
                          <Text style={styles.photoText}>{photo.title}</Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}
              </View>
            ) : activeContent === 'audio' ? (
              <View style={styles.audioSection}>
                <TouchableOpacity 
                  style={styles.uploadButton}
                  onPress={pickAudio}
                >
                  <Feather name="upload" size={24} color="black" />
                  <Text style={styles.uploadButtonText}>Upload Audio</Text>
                </TouchableOpacity>

                <ScrollView style={styles.audioList}>
                  {audioFiles.map((audio) => (
                    <View key={audio.id} style={styles.audioItem}>
                      <View style={styles.audioInfo}>
                        <Feather 
                          name="music" 
                          size={24} 
                          color="black" 
                          style={styles.audioIcon}
                        />
                        <Text style={styles.audioName} numberOfLines={1}>
                          {audio.name}
                        </Text>
                      </View>
                      
                      <View style={styles.audioControls}>
                        <TouchableOpacity 
                          onPress={() => {
                            if (currentlyPlaying === audio.id) {
                              stopSound();
                            } else {
                              playSound(audio);
                            }
                          }}
                          style={styles.playButton}
                        >
                          <Feather 
                            name={currentlyPlaying === audio.id ? "square" : "play"} 
                            size={24} 
                            color="black" 
                          />
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                          onPress={() => {
                            setAudioFiles(prev => 
                              prev.filter(file => file.id !== audio.id)
                            );
                            if (currentlyPlaying === audio.id) {
                              stopSound();
                            }
                          }}
                          style={styles.deleteButton}
                        >
                          <Feather name="trash-2" size={20} color="red" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </ScrollView>
              </View>
            ) : (
              <View style={styles.modalContent}>
                <Text style={styles.placeholderText}>
                  {buttons.find(b => b.contentType === activeContent)?.title} content will appear here
                </Text>
              </View>
            )}
          </View>
        </Modal>

        <Modal
          visible={showPhotoDetail}
          animationType="slide"
          onRequestClose={() => setShowPhotoDetail(false)}
        >
          <View style={styles.photoDetailModal}>
            <View style={styles.photoDetailHeader}>
              <TouchableOpacity 
                onPress={() => setShowPhotoDetail(false)}
                style={styles.headerButton}
              >
                <Feather name="arrow-left" size={24} color="black" />
              </TouchableOpacity>
              <Text style={styles.photoDetailTitle}>Photo {selectedPhoto?.id}</Text>
              <TouchableOpacity 
                onPress={() => setShowOptionsMenu(true)}
                style={styles.headerButton}
              >
                <Feather name="more-vertical" size={24} color="black" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.photoDetailContent}>
              <View style={[styles.photoDetailImage, { backgroundColor: selectedPhoto?.color }]}>
                <Text style={styles.photoDetailImageText}>Photo {selectedPhoto?.id}</Text>
              </View>

              <View style={styles.interactionSection}>
                <View style={styles.interactionButtons}>
                  <TouchableOpacity style={styles.interactionButton}>
                    <MaterialCommunityIcons name="fire" size={24} color="#FF3B30" />
                    <Text style={styles.interactionCount}>
                      {photoDetails[selectedPhoto?.id]?.likes || 0}
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.shareButton}
                    onPress={() => handleShare(selectedPhoto)}
                    activeOpacity={0.7}
                  >
                    <Feather name="send" size={16} color="#fff" />
                    <View style={styles.shareTextContainer}>
                      <Text style={styles.shareButtonText}>Share</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.commentsSection}>
                <Text style={styles.commentTitle}>Comments</Text>
                {photoDetails[selectedPhoto?.id]?.comments.map(comment => (
                  <View key={comment.id} style={styles.commentItem}>
                    <View style={styles.commentHeader}>
                      <Text style={styles.commentUser}>{comment.user}</Text>
                      <View style={styles.commentLikes}>
                        <MaterialCommunityIcons name="fire" size={12} color="#FF3B30" />
                        <Text style={[styles.commentLikeCount, { color: '#FF3B30' }]}>
                          {comment.likes}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.commentText}>{comment.text}</Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        </Modal>

        <Modal
          visible={showOptionsMenu}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowOptionsMenu(false)}
        >
          <TouchableOpacity 
            style={styles.bottomSheetOverlay}
            activeOpacity={1}
            onPress={() => setShowOptionsMenu(false)}
          >
            <View style={styles.bottomSheet}>
              {/* Header */}
              <View style={styles.bottomSheetHeader}>
                <View style={styles.bottomSheetIndicator} />
              </View>

              {/* Options */}
              <TouchableOpacity 
                style={styles.bottomSheetOption}
                onPress={() => {
                  alert('Not interested in similar content');
                  setShowOptionsMenu(false);
                }}
              >
                <Feather name="x-circle" size={24} color="#666" />
                <Text style={styles.bottomSheetOptionText}>Not interested</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.bottomSheetOption}
                onPress={() => {
                  alert('Report submitted');
                  setShowOptionsMenu(false);
                }}
              >
                <Feather name="flag" size={24} color="#666" />
                <Text style={styles.bottomSheetOptionText}>Report</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.bottomSheetOption, styles.bottomSheetOptionDanger]}
                onPress={() => {
                  alert('User blocked');
                  setShowOptionsMenu(false);
                }}
              >
                <Feather name="slash" size={24} color="#ff3b30" />
                <Text style={[styles.bottomSheetOptionText, styles.bottomSheetOptionTextDanger]}>
                  Block
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
      <Wallet 
        isVisible={isWalletVisible}
        onClose={() => {
          console.log('Closing wallet'); // Debug log
          setIsWalletVisible(false);
        }}
      />
      <Notifications 
        isVisible={isNotificationsVisible}
        onClose={() => setIsNotificationsVisible(false)}
      />
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  backgroundContainer: {
    ...StyleSheet.absoluteFillObject,
  },

  backgroundMedia: {
    width: '100%',
    height: '100%',
  },

  contentLayer: {
    flex: 1,
    position: 'relative',
  },

  headerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },

  scrollView: {
    flex: 1,
  },

  fullScreenVideo: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    width: '100%',
    height: '100%',
    zIndex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    zIndex: 2,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15, // Space between icons
  },
  headerIconButton: {
    padding: 5, // Touchable area for icons
  },
  contentContainer: {
    flex: 1,
    zIndex: 2,
    backgroundColor: 'transparent',
  },
  profileSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    backgroundColor: 'transparent',
  },
  profileImageContainer: {
    position: 'relative',
    alignItems: 'center',
    marginTop: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  editImageButton: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: '#000',
    borderRadius: 20,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#000000',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  username: {
    fontSize: 18,
    color: '#666666',
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  bio: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
    color: '#000000',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  location: {
    fontSize: 16,
    color: '#666666',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  followText: {
    fontSize: 16,
    color: '#000000',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#666',
    fontSize: 14,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#eee',
    marginHorizontal: 10,
  },
  followButton: {
    backgroundColor: '#000',
    paddingHorizontal: 40,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 20,
    marginBottom: 20,
    marginHorizontal: 20,
    alignSelf: 'center',
  },
  followButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  buttonGrid: {
    width: '100%',
    paddingHorizontal: 15,
    marginTop: 0,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  gridButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    margin: 5,
    borderRadius: 10,
    gap: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: '50%',
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  settingsSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  settingsSectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#000',
  },
  toggleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  toggleIcon: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 10,
  },
  settingsDivider: {
    height: 10,
    backgroundColor: '#f5f5f5',
    marginVertical: 10,
  },
  dragHandle: {
    marginRight: 15,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  singleGridButton: {
    width: '100%',
    maxWidth: 200,
    marginHorizontal: 'auto',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#ffffff',
  },
  footerButton: {
    padding: 8,
  },
  createButton: {
    borderRadius: 50,
    padding: 4,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'black',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
    marginHorizontal: 20,
  },
  uploadButtonText: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: '500',
  },
  colorOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  colorOptionIcon: {
    width: 40,
    alignItems: 'center',
  },
  colorOptionText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 10,
  },
  colorPickerModal: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  colorPickerContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    height: 400,
  },
  colorPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  colorPickerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  colorPreview: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  modalView: {
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: '50%',
    maxHeight: '90%',
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoGridContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 2,
  },
  photoContainer: {
    width: '33.33%',
    aspectRatio: 1,
    padding: 2,
  },
  photoBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  photoPlaceholder: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  photoSection: {
    flex: 1,
  },
  viewToggle: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 6,
    backgroundColor: '#f8f8f8',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 15,
    marginHorizontal: 4,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  toggleButtonText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#000',
  },
  toggleButtonActive: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  toggleButtonTextActive: {
    color: '#fff',
  },
  photoScrollContainer: {
    flex: 1,
    padding: 10,
    backgroundColor: '#fff',
  },
  photoScrollItem: {
    marginBottom: 15,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  photoScrollBox: {
    height: 200
  },
  photoScrollContent: {
    flex: 1,
  },
  photoTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  photoId: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  photoActions: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 12,
    padding: 4,
  },
  photoDetailModal: {
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: '50%',
    maxHeight: '90%',
  },
  photoDetailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerButton: {
    padding: 8,
    borderRadius: 20,
  },
  photoDetailTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  photoDetailContent: {
    flex: 1,
    padding: 20,
  },
  photoDetailImage: {
    width: '100%',
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 20,
  },
  photoDetailImageText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  interactionSection: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  interactionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  interactionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5,
  },
  interactionCount: {
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000',
    borderRadius: 24,
    paddingVertical: 8,
    paddingHorizontal: 16,
    gap: 8,
  },
  shareTextContainer: {
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255,255,255,0.2)',
    paddingLeft: 8,
  },
  shareButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  commentsSection: {
    flex: 1,
  },
  commentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  commentItem: {
    marginBottom: 15,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  commentUser: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  commentLikes: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
  },
  fireIcon: {
    marginRight: 4,
  },
  commentLikeCount: {
    marginLeft: 4,
    fontSize: 14,
    color: '#FF3B30',
    fontWeight: '500',
  },
  commentText: {
    fontSize: 16,
  },
  optionsMenuModal: {
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: '50%',
    maxHeight: '90%',
  },
  optionsMenuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  optionsMenuTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  optionsMenuActions: {
    padding: 20,
  },
  optionsMenuActionText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
  bottomSheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 30,
  },
  bottomSheetHeader: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  bottomSheetIndicator: {
    width: 40,
    height: 4,
    backgroundColor: '#ccc',
    borderRadius: 2,
  },
  bottomSheetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  bottomSheetOptionText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#333',
  },
  bottomSheetOptionDanger: {
    borderBottomWidth: 0,
  },
  bottomSheetOptionTextDanger: {
    color: '#ff3b30',
  },
  contentButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  contentButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  contentButtonActive: {
    backgroundColor: '#000',
  },
  contentButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  contentButtonTextActive: {
    color: '#fff',
  },
  placeholderText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
  buttonContainer: {
    padding: 10,
    backgroundColor: 'white',
    marginVertical: 5,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  dragHandle: {
    marginRight: 15,
  },
  
  buttonInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  editContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  
  editInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    paddingHorizontal: 10,
    marginRight: 10,
    backgroundColor: 'white',
  },
  
  saveButton: {
    padding: 5,
  },
  
  editButton: {
    padding: 5,
    marginLeft: 10,
  },
  
  buttonTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  dragHandleContainer: {
    padding: 10,
    marginRight: 5,
  },
  toggleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: 'white',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
  },
  buttonTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  editContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  audioSection: {
    flex: 1,
    padding: 20,
  },
  
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  
  uploadButtonText: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: '500',
  },
  
  audioList: {
    flex: 1,
  },
  
  audioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  
  audioInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  audioIcon: {
    marginRight: 10,
  },
  
  audioName: {
    fontSize: 16,
    flex: 1,
  },
  
  audioControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  playButton: {
    padding: 10,
    marginRight: 10,
  },
  
  deleteButton: {
    padding: 10,
  },
  backgroundPreview: {
    marginTop: 15,
    marginHorizontal: 20,
    height: 200,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  backgroundPreviewImage: {
    width: '100%',
    height: '100%',
  },
  removeBackgroundButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 15,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backgroundActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  
  applyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginTop: 10,
  },
  
  applyButtonText: {
    color: 'white',
    marginLeft: 5,
    fontWeight: '500',
  },
  
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  
  cancelButtonText: {
    color: 'black',
    marginLeft: 5,
    fontWeight: '500',
  },
  fullScreenBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    zIndex: 1,
  },
  contentContainer: {
    flex: 1,
  },
  
  viewTypeToggle: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 10,
    gap: 10,
  },
  
  viewTypeButton: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  
  viewTypeButtonActive: {
    backgroundColor: '#000',
  },
  
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 5,
  },
  
  photoItem: {
    width: '33.33%',
    aspectRatio: 1,
    padding: 5,
  },
  
  photo: {
    flex: 1,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  scrollPhotoContainer: {
    width: Dimensions.get('window').width,
    height: '100%',
    padding: 20,
  },
  
  scrollPhoto: {
    flex: 1,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  photoText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  backgroundButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 16,
  },
  backgroundButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  backgroundButtonActive: {
    backgroundColor: '#007AFF',
  },
  backgroundButtonText: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
  },
  backgroundButtonTextActive: {
    color: '#fff',
  },
  selectedBackground: {
    marginTop: 16,
    alignItems: 'center',
  },
  backgroundPreview: {
    width: 200,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  colorInputContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  colorInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    padding: 12,
    width: 120,
    fontSize: 16,
    textAlign: 'center',
    height: 48, // Match height with button
  },
  backgroundControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginVertical: 16,
  },
  colorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  colorLabel: {
    fontSize: 16,
    color: '#000',
    minWidth: 100,
  },
  colorInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    width: 120,
    fontSize: 16,
    textAlign: 'center',
    backgroundColor: '#fff',
  },
  textContainer: {
    padding: 20,
    borderRadius: 12,
    marginHorizontal: 30,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
    // Remove existing text shadow as the background provides contrast
    textShadowColor: undefined,
    textShadowOffset: undefined,
    textShadowRadius: undefined,
  },
  username: {
    fontSize: 18,
    marginBottom: 10,
    textAlign: 'center',
    // Remove existing text shadow
    textShadowColor: undefined,
    textShadowOffset: undefined,
    textShadowRadius: undefined,
  },
  bio: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
    // Remove existing text shadow
    textShadowColor: undefined,
    textShadowOffset: undefined,
    textShadowRadius: undefined,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  locationText: {
    marginLeft: 5,
    fontSize: 16,
    // Remove existing text shadow
    textShadowColor: undefined,
    textShadowOffset: undefined,
    textShadowRadius: undefined,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 5,
    marginBottom: 10,
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    // Remove existing text shadow
    textShadowColor: undefined,
    textShadowOffset: undefined,
    textShadowRadius: undefined,
  },
  statLabel: {
    fontSize: 14,
    // Remove existing text shadow
    textShadowColor: undefined,
    textShadowOffset: undefined,
    textShadowRadius: undefined,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 10,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 8,
  },
  settingsSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  notificationIconContainer: {
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    right: -6,
    top: -6,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FFF',
  },
  notificationBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
    paddingHorizontal: 4,
  },
  editField: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    flexDirection: 'column',
  },
  
  editFieldLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  
  editInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    minHeight: 40,
  },
  headerButtons: {
    position: 'absolute',
    top: 0, // Removed the top padding
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 10,
    paddingTop: 8, // Small padding just for visual comfort
  },

  leftButtons: {
    flexDirection: 'row',
  },

  rightButtons: {
    flexDirection: 'row',
    gap: 16,
  },

  transparentButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },

  notificationIconContainer: {
    position: 'relative',
  },

  notificationBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(0, 0, 0, 0.3)',
  },

  notificationBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default ProfileScreen;