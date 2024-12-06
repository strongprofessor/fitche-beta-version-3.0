import React, { useState, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Camera, CameraType, FlashMode } from 'expo-camera';
import { Feather } from '@expo/vector-icons';
import Footer from './Footer';

const CreateScreen = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [type, setType] = useState(CameraType.back);
  const [flashMode, setFlashMode] = useState(FlashMode.off);
  const [permission, requestPermission] = Camera.useCameraPermissions();
  const cameraRef = useRef<Camera | null>(null);

  React.useEffect(() => {
    requestPermission();
  }, []);

  const toggleCameraType = () => {
    setType(current => (
      current === CameraType.back ? CameraType.front : CameraType.back
    ));
  };

  const toggleFlash = () => {
    setFlashMode(current => (
      current === FlashMode.off ? FlashMode.on : FlashMode.off
    ));
  };

  const startRecording = async () => {
    if (cameraRef.current) {
      try {
        setIsRecording(true);
        const video = await cameraRef.current.recordAsync();
        console.log('Video recorded:', video);
      } catch (error) {
        console.error('Error recording:', error);
        Alert.alert('Error', 'Failed to record video');
      } finally {
        setIsRecording(false);
      }
    }
  };

  const stopRecording = async () => {
    if (cameraRef.current && isRecording) {
      await cameraRef.current.stopRecording();
    }
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync();
        console.log('Picture taken:', photo);
      } catch (error) {
        console.error('Error taking picture:', error);
        Alert.alert('Error', 'Failed to take picture');
      }
    }
  };

  const handlePressIn = () => {
    console.log('Press started');
  };

  const handlePressOut = () => {
    if (isRecording) {
      stopRecording();
    } else {
      takePicture();
    }
  };

  const handleLongPress = () => {
    startRecording();
  };

  if (!permission?.granted) {
    return (
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.captureButton}
          onPress={() => requestPermission()}
        >
          <View style={styles.buttonInner} />
        </TouchableOpacity>
        <Footer />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        style={styles.camera}
        type={type}
        flashMode={flashMode}
      >
        <View style={styles.controlsContainer}>
          <TouchableOpacity 
            style={styles.controlButton} 
            onPress={toggleCameraType}
          >
            <Feather name="refresh-ccw" size={24} color="white" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.controlButton} 
            onPress={toggleFlash}
          >
            <Feather 
              name={flashMode === FlashMode.off ? "zap-off" : "zap"} 
              size={24} 
              color="white" 
            />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <TouchableOpacity
            style={[styles.captureButton, isRecording && styles.recordingButton]}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onLongPress={handleLongPress}
            delayLongPress={500}
          >
            <View style={styles.buttonInner} />
          </TouchableOpacity>
        </View>
      </Camera>
      <Footer />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 40,
  },
  controlButton: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  content: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 80,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'white',
  },
  buttonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
  },
  recordingButton: {
    borderColor: 'red',
  },
});

export default CreateScreen; 