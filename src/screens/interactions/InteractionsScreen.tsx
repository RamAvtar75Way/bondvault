
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, StyleSheet, TextInput } from 'react-native';
import { Layout } from '../../components/ui/Layout';
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-native';
import { db } from '../../db/client';
import { interactions, contacts } from '../../db/schema';
import { eq, desc } from 'drizzle-orm';
import { Phone, MapPin, MessageCircle, FileText, Search } from 'lucide-react-native';
import { format } from 'date-fns';
import { COLORS, SPACING, FONT_SIZE, RADIUS } from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';

export default function InteractionsScreen() {
    const { colors } = useTheme();
    const [items, setItems] = useState<any[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [filterType, setFilterType] = useState('All');
    const navigate = useNavigate();

    const fetchInteractions = async () => {
        try {
            const result = await db.select({
                id: interactions.id,
                type: interactions.type,
                notes: interactions.notes,
                date: interactions.date,
                contactFirstName: contacts.firstName,
                contactLastName: contacts.lastName,
                contactId: contacts.id
            })
                .from(interactions)
                .leftJoin(contacts, eq(interactions.contactId, contacts.id))
                .orderBy(desc(interactions.date));

            setItems(result);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        fetchInteractions();
    }, []);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchInteractions();
        setRefreshing(false);
    }, []);

    const [searchQuery, setSearchQuery] = useState('');

    const filteredItems = items.filter(i => {
        const matchesType = filterType === 'All' || i.type === filterType;
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch = !searchQuery ||
            (i.notes && i.notes.toLowerCase().includes(searchLower)) ||
            (i.contactFirstName && i.contactFirstName.toLowerCase().includes(searchLower)) ||
            (i.contactLastName && i.contactLastName.toLowerCase().includes(searchLower));

        return matchesType && matchesSearch;
    });

    return (
        <Layout style={styles.layout}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                <Text style={[styles.title, { color: colors.text }]}>Timeline</Text>

                <View style={[styles.searchBar, { backgroundColor: colors.input, borderColor: colors.border, borderWidth: 1 }]}>
                    <Search size={20} color={colors.mutedText} />
                    <TextInput
                        style={[styles.searchInput, { color: colors.text }]}
                        placeholder="Search timeline..."
                        placeholderTextColor={colors.mutedText}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>

                <View style={styles.filterContainer}>
                    {['All', 'Call', 'Meeting', 'Message'].map(t => (
                        <TouchableOpacity
                            key={t}
                            onPress={() => setFilterType(t)}
                            style={[
                                styles.filterPill,
                                filterType === t ? { backgroundColor: colors.primary, borderColor: colors.primary } : { backgroundColor: colors.card, borderColor: colors.border }
                            ]}
                        >
                            <Text style={[
                                styles.filterText,
                                { color: filterType === t ? colors.primaryForeground : colors.mutedText }
                            ]}>{t}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <ScrollView
                style={styles.scrollView}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {filteredItems.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={[styles.emptyText, { color: colors.mutedText }]}>No interactions found.</Text>
                    </View>
                ) : (
                    <View style={styles.listContainer}>
                        {filteredItems.map((item) => (
                            <TouchableOpacity
                                key={item.id}
                                style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
                                onPress={() => navigate(`/contact/${item.contactId}`)}
                            >
                                <View style={styles.cardHeader}>
                                    <View style={styles.cardHeaderLeft}>
                                        <View style={[
                                            styles.iconContainer,
                                            item.type === 'Call' ? styles.bgGreen :
                                                item.type === 'Meeting' ? styles.bgOrange : styles.bgBlue
                                        ]}>
                                            {item.type === 'Call' && <Phone size={14} color="#166534" />}
                                            {item.type === 'Meeting' && <MapPin size={14} color="#9A3412" />}
                                            {item.type === 'Message' && <MessageCircle size={14} color="#1E40AF" />}
                                            {item.type === 'Note' && <FileText size={14} color="#1E293B" />}
                                        </View>
                                        <View>
                                            <Text style={[styles.contactName, { color: colors.text }]}>
                                                {item.contactFirstName} {item.contactLastName}
                                            </Text>
                                            <Text style={[styles.interactionType, { color: colors.mutedText }]}>{item.type}</Text>
                                        </View>
                                    </View>
                                    <Text style={[styles.dateText, { color: colors.mutedText }]}>
                                        {format(new Date(item.date), 'MMM d, h:mm a')}
                                    </Text>
                                </View>
                                <Text style={[styles.notesText, { color: colors.mutedText }]} numberOfLines={2}>
                                    {item.notes}
                                </Text>
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
        paddingTop: 8,
        paddingBottom: 16,
        paddingHorizontal: 24,
        borderBottomWidth: 1,
    },
    title: {
        fontSize: FONT_SIZE.xxl,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: RADIUS.full,
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginBottom: 16,
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        fontSize: FONT_SIZE.base,
    },
    filterContainer: {
        flexDirection: 'row',
    },
    filterPill: {
        marginRight: 8,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: RADIUS.full,
        borderWidth: 1,
    },
    filterText: {
        fontSize: FONT_SIZE.xs,
        fontWeight: 'bold',
    },
    scrollView: {
        flex: 1,
        padding: 24,
    },
    emptyState: {
        height: 240,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyText: {},
    listContainer: {
        paddingBottom: 80,
        gap: 16,
    },
    card: {
        padding: 16,
        borderRadius: RADIUS.lg,
        borderWidth: 1,
        shadowColor: 'black',
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    cardHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    bgGreen: { backgroundColor: '#DCFCE7' },
    bgOrange: { backgroundColor: '#FFEDD5' },
    bgBlue: { backgroundColor: '#DBEAFE' },
    contactName: {
        fontWeight: 'bold',
        fontSize: FONT_SIZE.base,
    },
    interactionType: {
        fontSize: FONT_SIZE.xs,
    },
    dateText: {
        fontSize: FONT_SIZE.xs,
    },
    notesText: {
        lineHeight: 20,
        paddingLeft: 44,
    },
});
