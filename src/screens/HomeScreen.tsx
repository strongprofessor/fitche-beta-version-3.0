import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Modal, TextInput, FlatList, Animated, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useNavigation, NavigationProp } from '@react-navigation/native';

type RootStackParamList = {
  Home: undefined;
  Create: undefined;
  Profile: undefined;
  Story: { id: string };
};

// Mock data for stories
const stories = [
  { id: '1', username: 'Your Story', hasStory: false, type: 'add' },
  { id: '2', username: 'john_doe', hasStory: true, expiresIn: 'green' }, // < 6 hours
  { id: '3', username: 'jane_smith', hasStory: true, expiresIn: 'yellow' }, // 6-18 hours
  { id: '4', username: 'mike_wilson', hasStory: true, expiresIn: 'red' }, // > 18 hours
];

const StoryCircle = ({ story }: { story: typeof stories[0] }) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const getBorderColor = () => {
    if (story.type === 'add') return '#ddd';
    if (!story.hasStory) return '#ddd';
    return story.expiresIn;
  };

  return (
    <TouchableOpacity
      style={styles.storyContainer}
      onPress={() => {
        if (story.type === 'add') {
          navigation.navigate('Create');
        } else {
          navigation.navigate('Story', { id: story.id });
        }
      }}
    >
      <View style={[styles.storyRing, { borderColor: getBorderColor() }]}>
        <View style={styles.storyImageContainer}>
          {story.type === 'add' ? (
            <View style={styles.addStoryButton}>
              <Feather name="plus" size={24} color="black" />
            </View>
          ) : (
            <Image
              source={{ uri: 'https://via.placeholder.com/60' }}
              style={styles.storyImage}
            />
          )}
        </View>
      </View>
      <Text style={styles.storyUsername} numberOfLines={1}>
        {story.username}
      </Text>
    </TouchableOpacity>
  );
};

const filterOptions = [
  'All',
  'Photos',
  'Videos',
  'Audio',
  'Text',
  'Links',
  "NFT's",
  'Events',
  'Donations',
  'Tags',
  'Moments',
  'Likes',
  'Comments'
];

const HomeScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<string[]>(['All']);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [isSearchActive, setIsSearchActive] = useState(false);
  
  // Mock search history - replace with actual storage implementation
  const [searchHistory, setSearchHistory] = useState([
    'Previous search 1',
    'Previous search 2',
    'Previous search 3',
  ]);

  const handleFilterSelect = (option: string) => {
    if (option === 'All') {
      setSelectedFilters(['All', ...filterOptions.slice(1)]);
    } else {
      setSelectedFilters(prev => {
        if (prev.includes('All')) {
          return [option];
        }

        const newSelection = prev.includes(option)
          ? prev.filter(item => item !== option)
          : [...prev, option];

        if (newSelection.length === filterOptions.length - 1) {
          return ['All', ...filterOptions.slice(1)];
        }

        return newSelection;
      });
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const results = stories.filter(item => 
      item.username.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredData(results);
  };

  const handleSearchPress = () => {
    setIsSearchActive(true);
  };

  const handleSearchClose = () => {
    setIsSearchActive(false);
    setSearchQuery('');
    Keyboard.dismiss();
  };

  const handleHistoryItemPress = (item: string) => {
    setSearchQuery(item);
    handleSearch(item);
  };

  const clearSearchHistory = () => {
    setSearchHistory([]);
  };

  return (
    <SafeAreaView style={styles.container}>
      {!isSearchActive ? (
        // Normal View
        <>
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.searchBar}
              onPress={handleSearchPress}
            >
              <Feather name="search" size={20} color="#666" />
              <Text style={styles.searchPlaceholder}>Search...</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => setShowFilterModal(true)}
            >
              <Feather name="filter" size={24} color="black" />
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.storiesContainer} 
            horizontal 
            showsHorizontalScrollIndicator={false}
          >
            {stories.map((story) => (
              <StoryCircle key={story.id} story={story} />
            ))}
          </ScrollView>

          <FlatList
            data={filteredData}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.itemContainer}>
                <Text style={styles.itemTitle}>{item.username}</Text>
                <Text style={styles.itemUsername}>{item.username}</Text>
              </View>
            )}
          />
        </>
      ) : (
        // Expanded Search View
        <View style={styles.searchScreen}>
          <View style={styles.searchHeader}>
            <View style={styles.searchInputContainer}>
              <Feather name="search" size={20} color="#666" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search..."
                value={searchQuery}
                onChangeText={handleSearch}
                autoFocus
              />
            </View>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={handleSearchClose}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>

          {searchQuery === '' ? (
            // Show search history when no search query
            <View style={styles.searchHistoryContainer}>
              <View style={styles.searchHistoryHeader}>
                <Text style={styles.searchHistoryTitle}>Recent Searches</Text>
                {searchHistory.length > 0 && (
                  <TouchableOpacity onPress={clearSearchHistory}>
                    <Text style={styles.clearHistoryText}>Clear</Text>
                  </TouchableOpacity>
                )}
              </View>
              
              {searchHistory.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.historyItem}
                  onPress={() => handleHistoryItemPress(item)}
                >
                  <Feather name="clock" size={16} color="#666" />
                  <Text style={styles.historyItemText}>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            // Show search results
            <FlatList
              data={filteredData}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.searchResultItem}>
                  <Text style={styles.searchResultText}>{item.username}</Text>
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      )}

      <Modal
        visible={showFilterModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowFilterModal(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalIndicator} />
            </View>
            
            <Text style={styles.modalTitle}>Filter</Text>
            
            <ScrollView style={styles.filterList}>
              {filterOptions.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.filterOption,
                    selectedFilters.includes(option) && styles.filterOptionSelected
                  ]}
                  onPress={() => handleFilterSelect(option)}
                >
                  <Text style={[
                    styles.filterOptionText,
                    selectedFilters.includes(option) && styles.filterOptionTextSelected
                  ]}>
                    {option}
                  </Text>
                  {selectedFilters.includes(option) && (
                    <Feather name="check" size={20} color="#007AFF" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.footerButton}
          onPress={() => navigation.navigate('Home')}
        >
          <Feather name="home" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.footerButton, styles.createButton]}
          onPress={() => navigation.navigate('Create')}
        >
          <Feather name="plus" size={12} color="black" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.footerButton}
          onPress={() => navigation.navigate('Profile')}
        >
          <Feather name="user" size={24} color="black" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
  },
  storiesContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  storiesContent: {
    padding: 10,
  },
  storyContainer: {
    alignItems: 'center',
    marginHorizontal: 8,
    width: 70,
  },
  storyRing: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 2,
    padding: 2,
    marginBottom: 4,
  },
  storyImageContainer: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  storyImage: {
    width: '100%',
    height: '100%',
  },
  addStoryButton: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  storyUsername: {
    fontSize: 12,
    textAlign: 'center',
    width: '100%',
  },
  feedContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#ffffff',
  },
  
  headerButton: {
    padding: 8,
    borderRadius: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '50%',
    paddingBottom: 20,
  },
  modalHeader: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  modalIndicator: {
    width: 40,
    height: 4,
    backgroundColor: '#007AFF',
    borderRadius: 2,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  filterList: {
    maxHeight: '100%',
    paddingHorizontal: 20,
  },
  filterOption: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    marginBottom: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filterOptionSelected: {
    borderColor: '#007AFF',
  },
  filterOptionText: {
    fontSize: 16,
  },
  filterOptionTextSelected: {
    fontWeight: 'bold',
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginRight: 10,
  },

  itemContainer: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },

  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },

  itemUsername: {
    fontSize: 14,
    color: '#666',
  },

  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 10,
  },

  searchPlaceholder: {
    marginLeft: 8,
    color: '#666',
    fontSize: 16,
  },

  searchScreen: {
    flex: 1,
    backgroundColor: '#fff',
  },

  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },

  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 10,
  },

  cancelButton: {
    paddingHorizontal: 8,
  },

  cancelButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },

  searchHistoryContainer: {
    padding: 16,
  },

  searchHistoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },

  searchHistoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },

  clearHistoryText: {
    color: '#007AFF',
    fontSize: 16,
  },

  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#f0f0f0',
  },

  historyItemText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#333',
  },

  searchResultItem: {
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#f0f0f0',
  },

  searchResultText: {
    fontSize: 16,
    color: '#333',
  },
});

export default HomeScreen; 