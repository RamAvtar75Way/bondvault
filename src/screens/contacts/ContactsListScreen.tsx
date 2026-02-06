import { Text, View, ScrollView, TouchableOpacity, RefreshControl, TextInput, Image, StyleSheet, Linking, Modal, TouchableWithoutFeedback } from 'react-native';
import { Layout } from '../../components/ui/Layout';
import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-native';
import { getContacts } from '../../db/contacts';
import { Plus, Lock, Search, Filter, Settings, Phone, MoreVertical, Briefcase, Heart, Users, Check } from 'lucide-react-native';
import { COLORS, SPACING, FONT_SIZE, RADIUS, SHADOWS, FONT_WEIGHT } from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';

const RELATION_TYPES = ['All', 'Family', 'Friend', 'Work', 'Client', 'Other'];

export default function HomeScreen() {
  const { colors } = useTheme();
  const [contacts, setContacts] = useState<any[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);
  const [filterVisible, setFilterVisible] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');
  const navigate = useNavigate();

  const fetchContacts = async () => {
    const data = await getContacts();
    setContacts(data);
    setFilteredContacts(data);
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  useEffect(() => {
    let result = contacts;

    // Filter by Type
    if (activeFilter !== 'All') {
      result = result.filter(c => c.relationType === activeFilter);
    }

    // Filter by Search
    if (searchQuery) {
      const lower = searchQuery.toLowerCase();
      result = result.filter(c =>
        c.firstName.toLowerCase().includes(lower) ||
        (c.lastName && c.lastName.toLowerCase().includes(lower)) ||
        (c.relationType && c.relationType.toLowerCase().includes(lower))
      );
    }

    setFilteredContacts(result);
  }, [searchQuery, contacts, activeFilter]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchContacts();
    setRefreshing(false);
  }, []);

  const handleMenuAction = (action: () => void) => {
    setMenuVisible(false);
    action();
  };

  return (
    <Layout style={styles.layout}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={[styles.searchBar, { backgroundColor: colors.input, borderColor: colors.border, borderWidth: 1 }]}>
          <Search size={20} color={colors.mutedText} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search contacts..."
            placeholderTextColor={colors.mutedText}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.iconButton, activeFilter !== 'All' && { backgroundColor: colors.tealLight }]}
            onPress={() => setFilterVisible(true)}
          >
            <Filter size={24} color={activeFilter !== 'All' ? colors.primary : colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={() => navigate('/add-contact')}>
            <Plus size={24} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={() => setMenuVisible(true)}>
            <MoreVertical size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter Modal */}
      <Modal visible={filterVisible} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={() => setFilterVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={[styles.filterMenu, { backgroundColor: colors.card }]}>
                <Text style={[styles.menuTitle, { color: colors.text }]}>Filter by Relationship</Text>
                {RELATION_TYPES.map(type => (
                  <TouchableOpacity
                    key={type}
                    style={[styles.filterOption, { borderBottomColor: colors.border }]}
                    onPress={() => {
                      setActiveFilter(type);
                      setFilterVisible(false);
                    }}
                  >
                    <Text style={[
                      styles.filterOptionText,
                      { color: colors.text },
                      activeFilter === type && { color: colors.primary, fontWeight: '600' }
                    ]}>
                      {type}
                    </Text>
                    {activeFilter === type && <Check size={16} color={colors.primary} />}
                  </TouchableOpacity>
                ))}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Main Menu Modal */}
      <Modal visible={menuVisible} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={[styles.menuDropdown, { top: 60, right: 16, backgroundColor: colors.card, borderColor: colors.border }]}>
                <TouchableOpacity
                  style={[styles.menuItem, { borderBottomColor: colors.border }]}
                  onPress={() => handleMenuAction(() => navigate('/import-contacts'))}
                >
                  <Plus size={20} color={colors.text} style={styles.menuIcon} />
                  <Text style={[styles.menuText, { color: colors.text }]}>Import Contacts</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.menuItem, { borderBottomColor: colors.border }]}
                  onPress={() => handleMenuAction(() => navigate('/vault-auth'))}
                >
                  <Lock size={20} color={colors.text} style={styles.menuIcon} />
                  <Text style={[styles.menuText, { color: colors.text }]}>Secure Vault</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.menuItem, { borderTopWidth: 1, borderTopColor: colors.border }]}
                  onPress={() => handleMenuAction(() => navigate('/app/settings'))}
                >
                  <Settings size={20} color={colors.text} style={styles.menuIcon} />
                  <Text style={[styles.menuText, { color: colors.text }]}>Settings</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Contacts List */}
      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {filteredContacts.length === 0 ? (
          <View style={styles.emptyState}>
            <Users size={48} color={colors.mutedText} style={{ marginBottom: 16 }} />
            <Text style={[styles.emptyText, { color: colors.text }]}>
              {searchQuery || activeFilter !== 'All' ? 'No matching contacts.' : 'No contacts yet.'}
            </Text>
            {(!searchQuery && activeFilter === 'All') && (
              <Text style={[styles.emptyText, { color: colors.mutedText, marginTop: 8 }]}>Add your first contact to get started.</Text>
            )}
          </View>
        ) : (
          <View style={styles.contactList}>
            <Text style={[styles.sectionTitle, { color: colors.mutedText }]}>My Network</Text>
            {filteredContacts.map((contact) => (
              <TouchableOpacity
                key={contact.id}
                style={[styles.contactCard, { backgroundColor: colors.card }]}
                onPress={() => navigate(`/contact/${contact.id}`)}
              >
                {/* Avatar */}
                <View style={[styles.avatar, { backgroundColor: colors.tealLight, borderColor: colors.primary }]}>
                  {contact.profileImageUri ? (
                    <Image source={{ uri: contact.profileImageUri }} style={styles.avatarImage} />
                  ) : (
                    <Text style={[styles.avatarText, { color: colors.primary }]}>
                      {contact.firstName[0]}{contact.lastName ? contact.lastName[0] : ''}
                    </Text>
                  )}
                </View>

                {/* Info */}
                <View style={styles.contactInfo}>
                  <Text style={[styles.contactName, { color: colors.text }]}>{contact.firstName} {contact.lastName}</Text>
                  <View style={styles.contactMeta}>
                    <Text style={[styles.metaText, { color: colors.mutedText }]}>
                      {contact.relationType || 'Friend'} • Last spoke: 2 days ago
                    </Text>
                  </View>
                </View>

                {/* Action */}
                <TouchableOpacity
                  style={styles.callButton}
                  onPress={() => {
                    if (contact.mobileNumber) {
                      Linking.openURL(`tel:${contact.mobileNumber}`);
                    } else {
                      alert('No mobile number found for this contact');
                    }
                  }}
                >
                  <Phone size={18} color={colors.primary} />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

    </Layout>
  );
}

const styles = StyleSheet.create({
  layout: {},
  header: {
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    zIndex: 10,
  },
  searchBar: {
    flex: 1,
    marginRight: 12,
    backgroundColor: COLORS.input,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    ...SHADOWS.sm,
  },
  searchInput: {
    flex: 1,
    marginLeft: SPACING.sm,
    fontSize: FONT_SIZE.base,
    color: COLORS.text,
    fontWeight: FONT_WEIGHT.medium,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  iconButton: {
    padding: 8,
    borderRadius: RADIUS.full,
  },
  activeFilter: {
    backgroundColor: '#F0FDF4', // green-50
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuDropdown: {
    position: 'absolute',
    backgroundColor: 'white',
    borderRadius: RADIUS.md,
    width: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
    paddingVertical: 4,
    overflow: 'hidden',
  },
  filterMenu: {
    backgroundColor: 'white',
    borderRadius: RADIUS.lg,
    width: '80%',
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 10,
  },
  menuTitle: {
    fontSize: FONT_SIZE.sm,
    fontWeight: 'bold',
    color: '#94A3B8',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    textTransform: 'uppercase',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  menuIcon: {
    marginRight: 12,
  },
  menuText: {
    fontSize: FONT_SIZE.base,
    color: '#1E293B',
    fontWeight: '500',
  },
  borderTop: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  filterOptionText: {
    fontSize: FONT_SIZE.base,
    color: '#334155',
  },
  activeFilterText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
  },
  emptyState: {
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#94A3B8',
  },
  contactList: {
    paddingBottom: 96,
    paddingHorizontal: 4,
    gap: 16,
  },
  contactCard: {
    backgroundColor: COLORS.card,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    flexDirection: 'row',
    alignItems: 'center',
    ...SHADOWS.md,
    marginBottom: SPACING.xs,
  },
  avatar: {
    width: 56,
    height: 56,
    backgroundColor: COLORS.tealLight,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 25,
  },
  avatarText: {
    color: COLORS.primary,
    fontWeight: FONT_WEIGHT.bold,
    fontSize: FONT_SIZE.lg,
  },
  contactInfo: {
    flex: 1,
    justifyContent: 'center',
    gap: 4,
  },
  contactName: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text,
    letterSpacing: 0.3,
  },
  contactMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    color: COLORS.mutedText,
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.medium,
  },
  callButton: {
    padding: 8,
    opacity: 0.8,
  },
  fab: {
    position: 'absolute',
    bottom: 32,
    right: 24,
    backgroundColor: COLORS.primary,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
});
