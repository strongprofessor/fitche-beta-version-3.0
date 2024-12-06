import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

interface NotificationsProps {
  isVisible: boolean;
  onClose: () => void;
}

const Notifications: React.FC<NotificationsProps> = ({ isVisible, onClose }) => {
  const [selectedFilter, setSelectedFilter] = useState('all');

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'like', label: 'Likes' },
    { id: 'comment', label: 'Comments' },
    { id: 'follow', label: 'Follows' },
    { id: 'mention', label: 'Mentions' },
    { id: 'share', label: 'Shares' },
  ];

  const notifications = [
    {
      id: '1',
      type: 'like',
      message: 'John Doe liked your photo',
      time: '2m ago',
      read: false,
      user: 'John Doe',
      action: 'liked your photo'
    },
    {
      id: '2',
      type: 'comment',
      message: 'Sarah Smith commented: "Great shot!"',
      time: '1h ago',
      read: false,
      user: 'Sarah Smith',
      action: 'commented on your post'
    },
    {
      id: '3',
      type: 'follow',
      message: 'Mike Johnson started following you',
      time: '2h ago',
      read: true,
      user: 'Mike Johnson',
      action: 'started following you'
    },
    {
      id: '4',
      type: 'mention',
      message: 'Alex mentioned you in a comment',
      time: '3h ago',
      read: true,
      user: 'Alex Brown',
      action: 'mentioned you in a comment'
    },
    {
      id: '5',
      type: 'share',
      message: 'Emma shared your post',
      time: '5h ago',
      read: true,
      user: 'Emma Wilson',
      action: 'shared your post'
    }
  ];

  const filteredNotifications = selectedFilter === 'all' 
    ? notifications 
    : notifications.filter(notification => notification.type === selectedFilter);

  const getIconName = (type: string) => {
    switch (type) {
      case 'like':
        return 'heart';
      case 'comment':
        return 'message-circle';
      case 'follow':
        return 'user-plus';
      case 'mention':
        return 'at-sign';
      case 'share':
        return 'share-2';
      default:
        return 'bell';
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'like':
        return '#FF3B30';
      case 'comment':
        return '#007AFF';
      case 'follow':
        return '#34C759';
      case 'mention':
        return '#5856D6';
      case 'share':
        return '#FF9500';
      default:
        return '#007AFF';
    }
  };

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.title}>Notifications</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>3 new</Text>
              </View>
            </View>
            <TouchableOpacity 
              onPress={onClose}
              style={styles.closeButton}
            >
              <Feather name="x" size={24} color="#000" />
            </TouchableOpacity>
          </View>

          <ScrollView 
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterContainer}
            contentContainerStyle={styles.filterContent}
          >
            {filters.map((filter) => (
              <TouchableOpacity
                key={filter.id}
                style={[
                  styles.filterButton,
                  selectedFilter === filter.id && styles.filterButtonActive
                ]}
                onPress={() => setSelectedFilter(filter.id)}
              >
                {filter.id !== 'all' && (
                  <Feather
                    name={getIconName(filter.id)}
                    size={14}
                    color={selectedFilter === filter.id ? '#FFF' : '#666'}
                  />
                )}
                <Text
                  style={[
                    styles.filterText,
                    selectedFilter === filter.id && styles.filterTextActive
                  ]}
                >
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <ScrollView 
            style={styles.notificationsList}
            showsVerticalScrollIndicator={false}
          >
            {filteredNotifications.map((notification) => (
              <TouchableOpacity 
                key={notification.id}
                style={[
                  styles.notificationItem,
                  !notification.read && styles.unreadNotification
                ]}
              >
                <View style={[
                  styles.notificationIcon,
                  { backgroundColor: `${getIconColor(notification.type)}15` }
                ]}>
                  <Feather
                    name={getIconName(notification.type)}
                    size={20}
                    color={getIconColor(notification.type)}
                  />
                </View>
                <View style={styles.notificationContent}>
                  <View style={styles.notificationHeader}>
                    <Text style={styles.userName}>{notification.user}</Text>
                    <Text style={styles.notificationTime}>
                      {notification.time}
                    </Text>
                  </View>
                  <Text style={styles.notificationAction}>
                    {notification.action}
                  </Text>
                </View>
                {!notification.read && (
                  <View style={styles.unreadDot} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
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
    height: Dimensions.get('window').height * 0.8,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  badge: {
    backgroundColor: '#007AFF15',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#007AFF',
    fontSize: 12,
    fontWeight: '600',
  },
  closeButton: {
    padding: 8,
  },
  notificationsList: {
    flex: 1,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: 'white',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  unreadNotification: {
    backgroundColor: '#f8f9ff',
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
  },
  notificationTime: {
    fontSize: 12,
    color: '#666',
  },
  notificationAction: {
    fontSize: 14,
    color: '#666',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#007AFF',
    marginLeft: 8,
  },
  filterContainer: {
    maxHeight: 40,
    marginBottom: 15,
    marginTop: -5,
  },
  filterContent: {
    paddingHorizontal: 10,
    gap: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
    gap: 4,
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
  },
  filterText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#FFF',
  },
});

export default Notifications; 