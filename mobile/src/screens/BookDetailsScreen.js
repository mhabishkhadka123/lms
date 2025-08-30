import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  Text,
  Chip,
  Divider,
  ActivityIndicator,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';

const BookDetailsScreen = ({ route, navigation }) => {
  const { book } = route.params;
  const [loading, setLoading] = useState(false);

  const handleBorrow = async () => {
    if (book.available_copies <= 0) {
      Alert.alert('Not Available', 'This book is not available for borrowing.');
      return;
    }

    Alert.alert(
      'Borrow Book',
      `Are you sure you want to borrow "${book.title}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Borrow',
          onPress: performBorrow,
        },
      ]
    );
  };

  const performBorrow = async () => {
    setLoading(true);
    try {
      const response = await api.post('/borrow', { bookId: book.id });
      Alert.alert(
        'Success!',
        `Book borrowed successfully. Due date: ${new Date(response.data.dueDate).toLocaleDateString()}`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Borrow error:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to borrow book. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = () => {
    return book.available_copies > 0 ? '#4caf50' : '#f44336';
  };

  const getStatusText = () => {
    return book.available_copies > 0 ? 'Available' : 'Not Available';
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card} mode="outlined">
        <Card.Content>
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Title style={styles.title}>{book.title}</Title>
              <Paragraph style={styles.author}>by {book.author}</Paragraph>
            </View>
            <View style={styles.statusContainer}>
              <Ionicons
                name={book.available_copies > 0 ? 'checkmark-circle' : 'close-circle'}
                size={24}
                color={getStatusColor()}
              />
              <Text style={[styles.statusText, { color: getStatusColor() }]}>
                {getStatusText()}
              </Text>
            </View>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>ISBN:</Text>
              <Text style={styles.infoValue}>{book.isbn || 'N/A'}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Category:</Text>
              <Text style={styles.infoValue}>{book.category || 'N/A'}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Published Year:</Text>
              <Text style={styles.infoValue}>
                {book.published_year || 'N/A'}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Copies Available:</Text>
              <Text style={styles.infoValue}>
                {book.available_copies} of {book.total_copies}
              </Text>
            </View>
          </View>

          {book.description && (
            <>
              <Divider style={styles.divider} />
              <View style={styles.descriptionSection}>
                <Text style={styles.sectionTitle}>Description</Text>
                <Paragraph style={styles.description}>
                  {book.description}
                </Paragraph>
              </View>
            </>
          )}

          <Divider style={styles.divider} />

          <View style={styles.actionSection}>
            <Button
              mode="contained"
              onPress={handleBorrow}
              disabled={book.available_copies <= 0 || loading}
              loading={loading}
              style={[
                styles.borrowButton,
                book.available_copies <= 0 && styles.disabledButton,
              ]}
              icon={book.available_copies > 0 ? 'book-open-variant' : 'book-off'}
            >
              {book.available_copies > 0 ? 'Borrow Book' : 'Not Available'}
            </Button>

            {book.available_copies > 0 && (
              <Text style={styles.borrowInfo}>
                You can borrow this book for up to 14 days
              </Text>
            )}
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    margin: 16,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  titleContainer: {
    flex: 1,
    marginRight: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  author: {
    fontSize: 16,
    color: '#666',
  },
  statusContainer: {
    alignItems: 'center',
    minWidth: 80,
  },
  statusText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 4,
  },
  divider: {
    marginVertical: 16,
  },
  infoSection: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  infoValue: {
    fontSize: 16,
    color: '#666',
    flex: 1,
    textAlign: 'right',
  },
  descriptionSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#666',
  },
  actionSection: {
    alignItems: 'center',
    marginTop: 16,
  },
  borrowButton: {
    width: '100%',
    paddingVertical: 8,
    borderRadius: 8,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  borrowInfo: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default BookDetailsScreen;
