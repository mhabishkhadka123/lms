import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  Text,
  Chip,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';

const BorrowingsScreen = () => {
  const [borrowings, setBorrowings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchBorrowings();
  }, []);

  const fetchBorrowings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/borrowings');
      setBorrowings(response.data);
    } catch (error) {
      console.error('Error fetching borrowings:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBorrowings();
    setRefreshing(false);
  };

  const handleReturn = async (bookId, bookTitle) => {
    Alert.alert(
      'Return Book',
      `Are you sure you want to return "${bookTitle}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Return',
          onPress: () => performReturn(bookId),
        },
      ]
    );
  };

  const performReturn = async (bookId) => {
    try {
      await api.post('/return', { bookId });
      Alert.alert('Success!', 'Book returned successfully.');
      fetchBorrowings(); // Refresh the list
    } catch (error) {
      console.error('Return error:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to return book. Please try again.',
      );
    }
  };

  const getStatusColor = (status, dueDate) => {
    if (status === 'returned') return '#4caf50';
    if (new Date(dueDate) < new Date()) return '#f44336';
    return '#ff9800';
  };

  const getStatusText = (status, dueDate) => {
    if (status === 'returned') return 'Returned';
    if (new Date(dueDate) < new Date()) return 'Overdue';
    return 'Borrowed';
  };

  const getDaysRemaining = (dueDate) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = due - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const renderBorrowingItem = ({ item }) => {
    const isOverdue = new Date(item.due_date) < new Date();
    const daysRemaining = getDaysRemaining(item.due_date);
    const statusColor = getStatusColor(item.status, item.due_date);
    const statusText = getStatusText(item.status, item.due_date);

    return (
      <Card style={styles.borrowingCard} mode="outlined">
        <Card.Content>
          <View style={styles.bookHeader}>
            <View style={styles.bookInfo}>
              <Title style={styles.bookTitle} numberOfLines={2}>
                {item.title}
              </Title>
              <Paragraph style={styles.bookAuthor}>
                by {item.author}
              </Paragraph>
            </View>
            <Chip
              style={[styles.statusChip, { backgroundColor: statusColor + '20' }]}
              textStyle={[styles.statusText, { color: statusColor }]}
            >
              {statusText}
            </Chip>
          </View>

          <View style={styles.detailsSection}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Borrowed:</Text>
              <Text style={styles.detailValue}>
                {new Date(item.borrowed_date).toLocaleDateString()}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Due Date:</Text>
              <Text style={[styles.detailValue, isOverdue && styles.overdueText]}>
                {new Date(item.due_date).toLocaleDateString()}
              </Text>
            </View>

            {item.status === 'borrowed' && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Days Remaining:</Text>
                <Text style={[
                  styles.detailValue,
                  daysRemaining < 0 ? styles.overdueText : 
                  daysRemaining <= 3 ? styles.warningText : styles.normalText
                ]}>
                  {daysRemaining < 0 ? `${Math.abs(daysRemaining)} days overdue` : `${daysRemaining} days`}
                </Text>
              </View>
            )}

            {item.status === 'returned' && item.returned_date && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Returned:</Text>
                <Text style={styles.detailValue}>
                  {new Date(item.returned_date).toLocaleDateString()}
                </Text>
              </View>
            )}
          </View>

          {item.status === 'borrowed' && (
            <View style={styles.actionSection}>
              <Button
                mode="contained"
                onPress={() => handleReturn(item.book_id, item.title)}
                style={styles.returnButton}
                icon="book-return"
              >
                Return Book
              </Button>
            </View>
          )}
        </Card.Content>
      </Card>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1976d2" />
        <Text style={styles.loadingText}>Loading your borrowings...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={borrowings}
        renderItem={renderBorrowingItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="book-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>You haven't borrowed any books yet</Text>
            <Text style={styles.emptySubtext}>
              Browse the library to find books you'd like to borrow
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
  listContainer: {
    padding: 16,
  },
  borrowingCard: {
    marginBottom: 16,
    elevation: 2,
  },
  bookHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
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
  },
  statusChip: {
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  detailsSection: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  overdueText: {
    color: '#f44336',
    fontWeight: 'bold',
  },
  warningText: {
    color: '#ff9800',
    fontWeight: 'bold',
  },
  normalText: {
    color: '#4caf50',
  },
  actionSection: {
    alignItems: 'center',
  },
  returnButton: {
    width: '100%',
    borderRadius: 8,
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
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});

export default BorrowingsScreen;
