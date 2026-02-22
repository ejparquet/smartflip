import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import {
  Plus,
  Search,
  MapPin,
  Palette,
  Calendar,
  Camera,
  Clock,
  ChevronRight,
  X,
  Trash2,
  Edit3,
  CheckCircle,
  AlertCircle,
  FileText,
  Home,
  Building2,
  Filter,
} from 'lucide-react-native';

interface TouchUpEntry {
  id: string;
  projectName: string;
  clientName: string;
  address: string;
  location: string;
  colorName: string;
  colorCode: string;
  colorHex: string;
  brand: string;
  finish: string;
  dateCompleted: string;
  warrantyExpires: string;
  notes: string;
  status: 'pending' | 'completed' | 'scheduled';
  photos: string[];
  createdAt: string;
}

const MOCK_ENTRIES: TouchUpEntry[] = [
  {
    id: '1',
    projectName: 'Anderson Residence',
    clientName: 'Michael Anderson',
    address: '1842 Oak Valley Drive',
    location: 'Master Bedroom - South Wall',
    colorName: 'Swiss Coffee',
    colorCode: 'OC-45',
    colorHex: '#F5F0E6',
    brand: 'Benjamin Moore',
    finish: 'Eggshell',
    dateCompleted: '2024-01-15',
    warrantyExpires: '2025-01-15',
    notes: 'Small scuff mark from furniture move. Client requested touch-up during warranty period.',
    status: 'pending',
    photos: [],
    createdAt: '2024-01-20',
  },
  {
    id: '2',
    projectName: 'Riverdale Office',
    clientName: 'Riverdale Tech Inc.',
    address: '500 Commerce Blvd, Suite 200',
    location: 'Conference Room A - Accent Wall',
    colorName: 'Hale Navy',
    colorCode: 'HC-154',
    colorHex: '#3D4F5F',
    brand: 'Benjamin Moore',
    finish: 'Satin',
    dateCompleted: '2023-11-08',
    warrantyExpires: '2024-11-08',
    notes: 'Minor chip near door frame from equipment installation.',
    status: 'scheduled',
    photos: [],
    createdAt: '2024-01-18',
  },
  {
    id: '3',
    projectName: 'Thompson Kitchen Refresh',
    clientName: 'Sarah Thompson',
    address: '2156 Maple Street',
    location: 'Kitchen Cabinets - Upper',
    colorName: 'Simply White',
    colorCode: 'OC-117',
    colorHex: '#F7F6F2',
    brand: 'Benjamin Moore',
    finish: 'Semi-Gloss',
    dateCompleted: '2023-09-22',
    warrantyExpires: '2024-09-22',
    notes: 'Completed touch-up on cabinet edges. No issues found.',
    status: 'completed',
    photos: [],
    createdAt: '2024-01-10',
  },
  {
    id: '4',
    projectName: 'Sunset Villa Exterior',
    clientName: 'Robert Chen',
    address: '890 Sunset Boulevard',
    location: 'Front Porch - Trim',
    colorName: 'Decorator\'s White',
    colorCode: 'CC-20',
    colorHex: '#EFEDE7',
    brand: 'Benjamin Moore',
    finish: 'High-Gloss',
    dateCompleted: '2023-12-05',
    warrantyExpires: '2024-12-05',
    notes: 'Weather damage on trim. Schedule for spring touch-up.',
    status: 'pending',
    photos: [],
    createdAt: '2024-01-22',
  },
];

const BRAND_OPTIONS = [
  'Benjamin Moore',
  'Sherwin-Williams',
  'Behr',
  'PPG',
  'Dunn-Edwards',
  'Farrow & Ball',
  'Other',
];

const FINISH_OPTIONS = [
  'Flat/Matte',
  'Eggshell',
  'Satin',
  'Semi-Gloss',
  'High-Gloss',
];

export default function TouchUpLogScreen() {
  const router = useRouter();
  const [entries, setEntries] = useState<TouchUpEntry[]>(MOCK_ENTRIES);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<TouchUpEntry | null>(null);
  const [showFilterModal, setShowFilterModal] = useState(false);

  const [newEntry, setNewEntry] = useState<Partial<TouchUpEntry>>({
    projectName: '',
    clientName: '',
    address: '',
    location: '',
    colorName: '',
    colorCode: '',
    colorHex: '#FFFFFF',
    brand: 'Benjamin Moore',
    finish: 'Eggshell',
    dateCompleted: '',
    warrantyExpires: '',
    notes: '',
    status: 'pending',
    photos: [],
  });

  const filteredEntries = entries.filter((entry) => {
    const matchesSearch =
      entry.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.colorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = !filterStatus || entry.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#22C55E';
      case 'scheduled':
        return '#3B82F6';
      case 'pending':
        return '#272D53';
      default:
        return '#6B7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={16} color="#22C55E" />;
      case 'scheduled':
        return <Clock size={16} color="#3B82F6" />;
      case 'pending':
        return <AlertCircle size={16} color="#272D53" />;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const isWarrantyExpiringSoon = (warrantyDate: string) => {
    const warranty = new Date(warrantyDate);
    const today = new Date();
    const daysUntilExpiry = Math.ceil(
      (warranty.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  };

  const isWarrantyExpired = (warrantyDate: string) => {
    const warranty = new Date(warrantyDate);
    const today = new Date();
    return warranty < today;
  };

  const handleAddEntry = useCallback(() => {
    if (!newEntry.projectName || !newEntry.location || !newEntry.colorName) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }

    const entry: TouchUpEntry = {
      id: Date.now().toString(),
      projectName: newEntry.projectName || '',
      clientName: newEntry.clientName || '',
      address: newEntry.address || '',
      location: newEntry.location || '',
      colorName: newEntry.colorName || '',
      colorCode: newEntry.colorCode || '',
      colorHex: newEntry.colorHex || '#FFFFFF',
      brand: newEntry.brand || 'Benjamin Moore',
      finish: newEntry.finish || 'Eggshell',
      dateCompleted: newEntry.dateCompleted || new Date().toISOString().split('T')[0],
      warrantyExpires: newEntry.warrantyExpires || '',
      notes: newEntry.notes || '',
      status: newEntry.status as 'pending' | 'completed' | 'scheduled',
      photos: [],
      createdAt: new Date().toISOString().split('T')[0],
    };

    setEntries([entry, ...entries]);
    setShowAddModal(false);
    setNewEntry({
      projectName: '',
      clientName: '',
      address: '',
      location: '',
      colorName: '',
      colorCode: '',
      colorHex: '#FFFFFF',
      brand: 'Benjamin Moore',
      finish: 'Eggshell',
      dateCompleted: '',
      warrantyExpires: '',
      notes: '',
      status: 'pending',
      photos: [],
    });
  }, [newEntry, entries]);

  const handleDeleteEntry = useCallback((id: string) => {
    Alert.alert(
      'Delete Entry',
      'Are you sure you want to delete this touch-up entry?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setEntries(entries.filter((e) => e.id !== id));
            setShowDetailModal(false);
          },
        },
      ]
    );
  }, [entries]);

  const handleUpdateStatus = useCallback((id: string, status: 'pending' | 'completed' | 'scheduled') => {
    setEntries(entries.map((e) => (e.id === id ? { ...e, status } : e)));
    if (selectedEntry) {
      setSelectedEntry({ ...selectedEntry, status });
    }
  }, [entries, selectedEntry]);

  const pendingCount = entries.filter((e) => e.status === 'pending').length;
  const scheduledCount = entries.filter((e) => e.status === 'scheduled').length;
  const completedCount = entries.filter((e) => e.status === 'completed').length;

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Touch-Up Log',
          headerStyle: { backgroundColor: '#1A1A2E' },
          headerTintColor: '#FFFFFF',
        }}
      />

      <View style={styles.statsRow}>
        <TouchableOpacity
          style={[styles.statCard, filterStatus === 'pending' && styles.statCardActive]}
          onPress={() => setFilterStatus(filterStatus === 'pending' ? null : 'pending')}
        >
          <View style={[styles.statDot, { backgroundColor: '#272D53' }]} />
          <Text style={styles.statNumber}>{pendingCount}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.statCard, filterStatus === 'scheduled' && styles.statCardActive]}
          onPress={() => setFilterStatus(filterStatus === 'scheduled' ? null : 'scheduled')}
        >
          <View style={[styles.statDot, { backgroundColor: '#3B82F6' }]} />
          <Text style={styles.statNumber}>{scheduledCount}</Text>
          <Text style={styles.statLabel}>Scheduled</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.statCard, filterStatus === 'completed' && styles.statCardActive]}
          onPress={() => setFilterStatus(filterStatus === 'completed' ? null : 'completed')}
        >
          <View style={[styles.statDot, { backgroundColor: '#22C55E' }]} />
          <Text style={styles.statNumber}>{completedCount}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <Search size={18} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search projects, colors, locations..."
            placeholderTextColor="#6B7280"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
        {filteredEntries.length === 0 ? (
          <View style={styles.emptyState}>
            <FileText size={48} color="#4B5563" />
            <Text style={styles.emptyTitle}>No Touch-Up Entries</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery || filterStatus
                ? 'Try adjusting your search or filters'
                : 'Add your first touch-up record'}
            </Text>
          </View>
        ) : (
          filteredEntries.map((entry) => (
            <TouchableOpacity
              key={entry.id}
              style={styles.entryCard}
              onPress={() => {
                setSelectedEntry(entry);
                setShowDetailModal(true);
              }}
              activeOpacity={0.7}
            >
              <View style={styles.entryHeader}>
                <View style={styles.colorPreviewWrapper}>
                  <View
                    style={[styles.colorPreview, { backgroundColor: entry.colorHex }]}
                  />
                </View>
                <View style={styles.entryInfo}>
                  <Text style={styles.entryProject}>{entry.projectName}</Text>
                  <Text style={styles.entryClient}>{entry.clientName}</Text>
                </View>
                <View style={styles.statusBadge}>
                  {getStatusIcon(entry.status)}
                  <Text
                    style={[styles.statusText, { color: getStatusColor(entry.status) }]}
                  >
                    {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                  </Text>
                </View>
              </View>

              <View style={styles.entryDetails}>
                <View style={styles.detailRow}>
                  <MapPin size={14} color="#9CA3AF" />
                  <Text style={styles.detailText}>{entry.location}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Palette size={14} color="#9CA3AF" />
                  <Text style={styles.detailText}>
                    {entry.colorName} ({entry.colorCode})
                  </Text>
                </View>
              </View>

              <View style={styles.entryFooter}>
                <View style={styles.warrantyInfo}>
                  <Calendar size={14} color="#6B7280" />
                  <Text
                    style={[
                      styles.warrantyText,
                      isWarrantyExpired(entry.warrantyExpires) && styles.warrantyExpired,
                      isWarrantyExpiringSoon(entry.warrantyExpires) && styles.warrantyExpiringSoon,
                    ]}
                  >
                    {isWarrantyExpired(entry.warrantyExpires)
                      ? 'Warranty Expired'
                      : `Warranty: ${formatDate(entry.warrantyExpires)}`}
                  </Text>
                </View>
                <ChevronRight size={18} color="#6B7280" />
              </View>
            </TouchableOpacity>
          ))
        )}
        <View style={styles.bottomPadding} />
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowAddModal(true)}
        activeOpacity={0.8}
      >
        <Plus size={24} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Add Entry Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAddModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <X size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>New Touch-Up Entry</Text>
            <TouchableOpacity onPress={handleAddEntry}>
              <Text style={styles.saveButton}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <Text style={styles.sectionTitle}>Project Details</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Project Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Smith Residence"
                placeholderTextColor="#6B7280"
                value={newEntry.projectName}
                onChangeText={(text) => setNewEntry({ ...newEntry, projectName: text })}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Client Name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., John Smith"
                placeholderTextColor="#6B7280"
                value={newEntry.clientName}
                onChangeText={(text) => setNewEntry({ ...newEntry, clientName: text })}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Address</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 123 Main Street"
                placeholderTextColor="#6B7280"
                value={newEntry.address}
                onChangeText={(text) => setNewEntry({ ...newEntry, address: text })}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Touch-Up Location *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Living Room - North Wall"
                placeholderTextColor="#6B7280"
                value={newEntry.location}
                onChangeText={(text) => setNewEntry({ ...newEntry, location: text })}
              />
            </View>

            <Text style={styles.sectionTitle}>Color Information</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Color Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Swiss Coffee"
                placeholderTextColor="#6B7280"
                value={newEntry.colorName}
                onChangeText={(text) => setNewEntry({ ...newEntry, colorName: text })}
              />
            </View>

            <View style={styles.rowInputs}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.inputLabel}>Color Code</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., OC-45"
                  placeholderTextColor="#6B7280"
                  value={newEntry.colorCode}
                  onChangeText={(text) => setNewEntry({ ...newEntry, colorCode: text })}
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.inputLabel}>Hex Code</Text>
                <View style={styles.hexInputWrapper}>
                  <View
                    style={[
                      styles.hexPreview,
                      { backgroundColor: newEntry.colorHex || '#FFFFFF' },
                    ]}
                  />
                  <TextInput
                    style={[styles.input, styles.hexInput]}
                    placeholder="#FFFFFF"
                    placeholderTextColor="#6B7280"
                    value={newEntry.colorHex}
                    onChangeText={(text) => setNewEntry({ ...newEntry, colorHex: text })}
                    autoCapitalize="characters"
                  />
                </View>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Brand</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.optionsScroll}
              >
                {BRAND_OPTIONS.map((brand) => (
                  <TouchableOpacity
                    key={brand}
                    style={[
                      styles.optionChip,
                      newEntry.brand === brand && styles.optionChipActive,
                    ]}
                    onPress={() => setNewEntry({ ...newEntry, brand })}
                  >
                    <Text
                      style={[
                        styles.optionChipText,
                        newEntry.brand === brand && styles.optionChipTextActive,
                      ]}
                    >
                      {brand}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Finish</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.optionsScroll}
              >
                {FINISH_OPTIONS.map((finish) => (
                  <TouchableOpacity
                    key={finish}
                    style={[
                      styles.optionChip,
                      newEntry.finish === finish && styles.optionChipActive,
                    ]}
                    onPress={() => setNewEntry({ ...newEntry, finish })}
                  >
                    <Text
                      style={[
                        styles.optionChipText,
                        newEntry.finish === finish && styles.optionChipTextActive,
                      ]}
                    >
                      {finish}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <Text style={styles.sectionTitle}>Warranty & Dates</Text>

            <View style={styles.rowInputs}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.inputLabel}>Date Completed</Text>
                <TextInput
                  style={styles.input}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#6B7280"
                  value={newEntry.dateCompleted}
                  onChangeText={(text) =>
                    setNewEntry({ ...newEntry, dateCompleted: text })
                  }
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.inputLabel}>Warranty Expires</Text>
                <TextInput
                  style={styles.input}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#6B7280"
                  value={newEntry.warrantyExpires}
                  onChangeText={(text) =>
                    setNewEntry({ ...newEntry, warrantyExpires: text })
                  }
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Notes</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Add details about the touch-up needed..."
                placeholderTextColor="#6B7280"
                value={newEntry.notes}
                onChangeText={(text) => setNewEntry({ ...newEntry, notes: text })}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Status</Text>
              <View style={styles.statusOptions}>
                {(['pending', 'scheduled', 'completed'] as const).map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.statusOption,
                      newEntry.status === status && styles.statusOptionActive,
                      { borderColor: getStatusColor(status) },
                    ]}
                    onPress={() => setNewEntry({ ...newEntry, status })}
                  >
                    {getStatusIcon(status)}
                    <Text
                      style={[
                        styles.statusOptionText,
                        newEntry.status === status && { color: getStatusColor(status) },
                      ]}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.modalBottomPadding} />
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Detail Modal */}
      <Modal
        visible={showDetailModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowDetailModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowDetailModal(false)}>
              <X size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Touch-Up Details</Text>
            <TouchableOpacity onPress={() => selectedEntry && handleDeleteEntry(selectedEntry.id)}>
              <Trash2 size={22} color="#EF4444" />
            </TouchableOpacity>
          </View>

          {selectedEntry && (
            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              <View style={styles.detailHeader}>
                <View
                  style={[styles.largeColorPreview, { backgroundColor: selectedEntry.colorHex }]}
                />
                <View style={styles.detailHeaderInfo}>
                  <Text style={styles.detailColorName}>{selectedEntry.colorName}</Text>
                  <Text style={styles.detailColorCode}>
                    {selectedEntry.colorCode} • {selectedEntry.brand}
                  </Text>
                  <Text style={styles.detailFinish}>{selectedEntry.finish}</Text>
                </View>
              </View>

              <View style={styles.detailCard}>
                <View style={styles.detailCardRow}>
                  <Home size={18} color="#9CA3AF" />
                  <View style={styles.detailCardContent}>
                    <Text style={styles.detailCardLabel}>Project</Text>
                    <Text style={styles.detailCardValue}>{selectedEntry.projectName}</Text>
                  </View>
                </View>
                <View style={styles.detailCardRow}>
                  <Building2 size={18} color="#9CA3AF" />
                  <View style={styles.detailCardContent}>
                    <Text style={styles.detailCardLabel}>Client</Text>
                    <Text style={styles.detailCardValue}>{selectedEntry.clientName}</Text>
                  </View>
                </View>
                <View style={styles.detailCardRow}>
                  <MapPin size={18} color="#9CA3AF" />
                  <View style={styles.detailCardContent}>
                    <Text style={styles.detailCardLabel}>Address</Text>
                    <Text style={styles.detailCardValue}>{selectedEntry.address}</Text>
                  </View>
                </View>
                <View style={[styles.detailCardRow, { borderBottomWidth: 0 }]}>
                  <Palette size={18} color="#9CA3AF" />
                  <View style={styles.detailCardContent}>
                    <Text style={styles.detailCardLabel}>Location</Text>
                    <Text style={styles.detailCardValue}>{selectedEntry.location}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.detailCard}>
                <View style={styles.detailCardRow}>
                  <Calendar size={18} color="#9CA3AF" />
                  <View style={styles.detailCardContent}>
                    <Text style={styles.detailCardLabel}>Original Completion</Text>
                    <Text style={styles.detailCardValue}>
                      {formatDate(selectedEntry.dateCompleted)}
                    </Text>
                  </View>
                </View>
                <View style={[styles.detailCardRow, { borderBottomWidth: 0 }]}>
                  <Clock size={18} color="#9CA3AF" />
                  <View style={styles.detailCardContent}>
                    <Text style={styles.detailCardLabel}>Warranty Expires</Text>
                    <Text
                      style={[
                        styles.detailCardValue,
                        isWarrantyExpired(selectedEntry.warrantyExpires) && styles.warrantyExpired,
                        isWarrantyExpiringSoon(selectedEntry.warrantyExpires) &&
                          styles.warrantyExpiringSoon,
                      ]}
                    >
                      {formatDate(selectedEntry.warrantyExpires)}
                      {isWarrantyExpired(selectedEntry.warrantyExpires) && ' (Expired)'}
                      {isWarrantyExpiringSoon(selectedEntry.warrantyExpires) && ' (Expiring Soon)'}
                    </Text>
                  </View>
                </View>
              </View>

              {selectedEntry.notes && (
                <View style={styles.detailCard}>
                  <Text style={styles.notesTitle}>Notes</Text>
                  <Text style={styles.notesText}>{selectedEntry.notes}</Text>
                </View>
              )}

              <Text style={styles.updateStatusTitle}>Update Status</Text>
              <View style={styles.statusUpdateOptions}>
                {(['pending', 'scheduled', 'completed'] as const).map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.statusUpdateOption,
                      selectedEntry.status === status && styles.statusUpdateOptionActive,
                      {
                        borderColor:
                          selectedEntry.status === status
                            ? getStatusColor(status)
                            : '#374151',
                      },
                    ]}
                    onPress={() => handleUpdateStatus(selectedEntry.id, status)}
                  >
                    {getStatusIcon(status)}
                    <Text
                      style={[
                        styles.statusUpdateText,
                        selectedEntry.status === status && { color: getStatusColor(status) },
                      ]}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.modalBottomPadding} />
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F1A',
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  statCardActive: {
    borderColor: '#6366F1',
  },
  statDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 6,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: '#FFFFFF',
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  entryCard: {
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#252542',
  },
  entryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  colorPreviewWrapper: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#252542',
    padding: 3,
  },
  colorPreview: {
    flex: 1,
    borderRadius: 7,
  },
  entryInfo: {
    flex: 1,
    marginLeft: 12,
  },
  entryProject: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  entryClient: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#252542',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 5,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  entryDetails: {
    borderTopWidth: 1,
    borderTopColor: '#252542',
    paddingTop: 12,
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 13,
    color: '#D1D5DB',
  },
  entryFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#252542',
  },
  warrantyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  warrantyText: {
    fontSize: 12,
    color: '#6B7280',
  },
  warrantyExpired: {
    color: '#EF4444',
  },
  warrantyExpiringSoon: {
    color: '#272D53',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 6,
    textAlign: 'center',
  },
  bottomPadding: {
    height: 100,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6366F1',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#0F0F1A',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#252542',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  saveButton: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6366F1',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
    marginTop: 24,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: '#D1D5DB',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#252542',
  },
  textArea: {
    minHeight: 100,
    paddingTop: 14,
  },
  rowInputs: {
    flexDirection: 'row',
  },
  hexInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hexPreview: {
    width: 24,
    height: 24,
    borderRadius: 6,
    position: 'absolute',
    left: 12,
    zIndex: 1,
    borderWidth: 1,
    borderColor: '#374151',
  },
  hexInput: {
    flex: 1,
    paddingLeft: 44,
  },
  optionsScroll: {
    marginTop: 4,
  },
  optionChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#1A1A2E',
    borderRadius: 10,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#252542',
  },
  optionChipActive: {
    backgroundColor: '#6366F1',
    borderColor: '#6366F1',
  },
  optionChipText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  optionChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  statusOptions: {
    flexDirection: 'row',
    gap: 10,
  },
  statusOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    backgroundColor: '#1A1A2E',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#252542',
  },
  statusOptionActive: {
    backgroundColor: '#252542',
  },
  statusOptionText: {
    fontSize: 13,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  modalBottomPadding: {
    height: 40,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#252542',
  },
  largeColorPreview: {
    width: 72,
    height: 72,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#252542',
  },
  detailHeaderInfo: {
    marginLeft: 16,
    flex: 1,
  },
  detailColorName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  detailColorCode: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
  },
  detailFinish: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  detailCard: {
    backgroundColor: '#1A1A2E',
    borderRadius: 14,
    padding: 16,
    marginTop: 16,
  },
  detailCardRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#252542',
  },
  detailCardContent: {
    marginLeft: 12,
    flex: 1,
  },
  detailCardLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  detailCardValue: {
    fontSize: 15,
    color: '#FFFFFF',
    marginTop: 2,
  },
  notesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
    marginBottom: 10,
  },
  notesText: {
    fontSize: 15,
    color: '#D1D5DB',
    lineHeight: 22,
  },
  updateStatusTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
    marginTop: 24,
    marginBottom: 12,
  },
  statusUpdateOptions: {
    flexDirection: 'row',
    gap: 10,
  },
  statusUpdateOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    borderWidth: 1.5,
  },
  statusUpdateOptionActive: {
    backgroundColor: '#252542',
  },
  statusUpdateText: {
    fontSize: 13,
    color: '#9CA3AF',
    fontWeight: '600',
  },
});
