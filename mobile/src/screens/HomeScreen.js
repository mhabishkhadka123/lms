import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Searchbar,
  Text,
  Chip,
  Button,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';

const HomeScreen = ({ navigation }) => {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchBooks();
  }, []);

  useEffect(() => {
    filterBooks();
  }, [searchQuery, books]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await api.get('/books');
      setBooks(response.data);
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBooks();
    setRefreshing(false);
  };

  const filterBooks = () => {
    if (!searchQuery.trim()) {
      setFilteredBooks(books);
      return;
    }

    const filtered = books.filter(
      (book) =>
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredBooks(filtered);
  };

  const renderBookItem = ({ item }) => (
    <Card style={styles.bookCard} mode="outlined">
      <Card.Content>
        <View style={styles.bookHeader}>
          <View style={styles.bookInfo}>
            <Title style={styles.bookTitle} numberOfLines={2}>
              {item.title}
            </Title>
            <Paragraph style={styles.bookAuthor}>
              by {item.author}
            </Paragraph>
            {item.category && (
              <Chip style={styles.categoryChip} textStyle={styles.chipText}>
                {item.category}
              </Chip>
            )}
          </View>
          <View style={styles.availabilityContainer}>
            <Text style={styles.availabilityText}>
              {item.available_copies} of {item.total_copies} available
            </Text>
            <View style={styles.availabilityIndicator}>
              <Ionicons
                name={item.available_copies > 0 ? 'checkmark-circle' : 'close-circle'}
                size={20}
                color={item.available_copies > 0 ? '#4caf50' : '#f44336'}
              />
            </View>
          </View>
        </View>

        {item.description && (
          <Paragraph style={styles.bookDescription} numberOfLines={3}>
            {item.description}
          </Paragraph>
        )}

        <View style={styles.bookFooter}>
          <Text style={styles.bookYear}>
            {item.published_year ? `Published: ${item.published_year}` : ''}
          </Text>
          <Button
            mode="contained"
            onPress={() => navigation.navigate('BookDetails', { book: item })}
            style={styles.detailsButton}
            compact
          >
            View Details
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1976d2" />
        <Text style={styles.loadingText}>Loading books...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search by title or author..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
        iconColor="#666"
      />

      <FlatList
        data={filteredBooks}
        renderItem={renderBookItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="library-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>
              {searchQuery ? 'No books found matching your search' : 'No books available'}
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchbar: {
    margin: 16,
    elevation: 2,
  },
  listContainer: {
    padding: 16,
  },
  bookCard: {
    marginBottom: 16,
    elevation: 2,
  },
  bookHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bookInfo: {
    flex: 1,
    marginRight: 12,
  },
  bookTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  bookAuthor: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  categoryChip: {
    alignSelf: 'flex-start',
    backgroundColor: '#e3f2fd',
  },
  chipText: {
    color: '#1976d2',
    fontSize: 12,
  },
  availabilityContainer: {
    alignItems: 'center',
    minWidth: 80,
  },
  availabilityText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 4,
  },
  availabilityIndicator: {
    alignItems: 'center',
  },
  bookDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  bookFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bookYear: {
    fontSize: 12,
    color: '#999',
  },
  detailsButton: {
    borderRadius: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default HomeScreen;
