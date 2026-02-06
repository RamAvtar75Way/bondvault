import { Text, View, ScrollView, TouchableOpacity, RefreshControl, TextInput, Image, StyleSheet, Linking, Modal, TouchableWithoutFeedback } from 'react-native';
import { Layout } from '../../components/ui/Layout';
import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-native';
import { getContacts } from '../../db/contacts';
import { Plus, Lock, Search, Filter, Settings, Phone, MoreVertical, Briefcase, Heart, Users, Check } from 'lucide-react-native';
import { COLORS, SPACING, FONT_SIZE, RADIUS } from '../../constants/theme';

const RELATION_TYPES = ['All', 'Family', 'Friend', 'Work', 'Client', 'Other'];

export default function HomeScreen() {
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
      <View style={styles.header}>
        <View style={styles.searchBar}>
          <Search size={20} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search contacts..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.iconButton, activeFilter !== 'All' && styles.activeFilter]}
            onPress={() => setFilterVisible(true)}
          >
            <Filter size={24} color={activeFilter !== 'All' ? COLORS.primary : COLORS.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={() => navigate('/add-contact')}>
            <Plus size={24} color={COLORS.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={() => setMenuVisible(true)}>
            <MoreVertical size={24} color={COLORS.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter Modal */}
      <Modal visible={filterVisible} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={() => setFilterVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.filterMenu}>
                <Text style={styles.menuTitle}>Filter by Relationship</Text>
                {RELATION_TYPES.map(type => (
                  <TouchableOpacity
                    key={type}
                    style={styles.filterOption}
                    onPress={() => {
                      setActiveFilter(type);
                      setFilterVisible(false);
                    }}
                  >
                    <Text style={[
                      styles.filterOptionText,
                      activeFilter === type && styles.activeFilterText
                    ]}>
                      {type}
                    </Text>
                    {activeFilter === type && <Check size={16} color={COLORS.primary} />}
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
              <View style={[styles.menuDropdown, { top: 60, right: 16 }]}>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => handleMenuAction(() => navigate('/import-contacts'))}
                >
                  <Plus size={20} color={COLORS.text} style={styles.menuIcon} />
                  <Text style={styles.menuText}>Import Contacts</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => handleMenuAction(() => navigate('/vault-auth'))}
                >
                  <Lock size={20} color={COLORS.text} style={styles.menuIcon} />
                  <Text style={styles.menuText}>Secure Vault</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.menuItem, styles.borderTop]}
                  onPress={() => handleMenuAction(() => navigate('/app/settings'))}
                >
                  <Settings size={20} color={COLORS.text} style={styles.menuIcon} />
                  <Text style={styles.menuText}>Settings</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Text style={styles.sectionTitle}>My Network</Text>

        {filteredContacts.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              {searchQuery || activeFilter !== 'All' ? 'No matching contacts.' : 'No contacts yet.'}
            </Text>
          </View>
        ) : (
          <View style={styles.contactList}>
            {filteredContacts.map((contact) => (
              <TouchableOpacity
                key={contact.id}
                style={styles.contactCard}
                onPress={() => navigate(`/contact/${contact.id}`)}
              >
                {/* Avatar */}
                <View style={styles.avatar}>
                  {contact.profileImageUri ? (
                    <Image source={{ uri: contact.profileImageUri }} style={styles.avatarImage} />
                  ) : (
                    <Text style={styles.avatarText}>
                      {contact.firstName[0]}{contact.lastName ? contact.lastName[0] : ''}
                    </Text>
                  )}
                </View>

                {/* Info */}
                <View style={styles.contactInfo}>
                  <Text style={styles.contactName}>{contact.firstName} {contact.lastName}</Text>
                  <View style={styles.contactMeta}>
                    <Text style={styles.metaText}>
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
                  <Phone size={18} color={COLORS.primary} />
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
  layout: {
    backgroundColor: COLORS.background,
  },
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
    backgroundColor: '#F1F5F9', // slate-100
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.full,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: FONT_SIZE.base,
    color: '#1E293B',
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
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#94A3B8',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 4,
    marginBottom: 2,
  },
  avatar: {
    width: 50,
    height: 50,
    backgroundColor: '#F1F5F9',
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 25,
  },
  avatarText: {
    color: '#64748B',
    fontWeight: '600',
    fontSize: FONT_SIZE.lg,
  },
  contactInfo: {
    flex: 1,
    justifyContent: 'center',
    gap: 4,
  },
  contactName: {
    fontSize: FONT_SIZE.base,
    fontWeight: '700',
    color: '#334155',
    letterSpacing: 0.2,
  },
  contactMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '500',
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
