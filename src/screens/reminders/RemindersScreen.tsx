
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, StyleSheet } from 'react-native';
import { Layout } from '../../components/ui/Layout';
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-native';
import { db } from '../../db/client';
import { reminders, contacts } from '../../db/schema';
import { eq, asc } from 'drizzle-orm';
import { Bell, CheckCircle, Circle, Plus } from 'lucide-react-native';
import { format, isPast, isToday, isTomorrow } from 'date-fns';
import { COLORS, SPACING, FONT_SIZE, RADIUS } from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';

export default function RemindersScreen() {
    const { colors } = useTheme();
    const [items, setItems] = useState<any[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const navigate = useNavigate();

    const fetchReminders = async () => {
        try {
            const result = await db.select({
                id: reminders.id,
                title: reminders.title,
                date: reminders.date,
                completed: reminders.completed,
                contactFirstName: contacts.firstName,
                contactLastName: contacts.lastName,
                contactId: contacts.id
            })
                .from(reminders)
                .leftJoin(contacts, eq(reminders.contactId, contacts.id))
                .orderBy(asc(reminders.date));

            setItems(result);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        fetchReminders();
    }, []);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchReminders();
        setRefreshing(false);
    }, []);

    const toggleComplete = async (id: number, currentStatus: boolean) => {
        setItems(items.map(i => i.id === id ? { ...i, completed: !currentStatus } : i));
    };

    const getSectionTitle = (dateStr: string) => {
        const date = new Date(dateStr);
        if (isPast(date) && !isToday(date)) return 'Overdue';
        if (isToday(date)) return 'Today';
        if (isTomorrow(date)) return 'Tomorrow';
        return 'Upcoming';
    };

    const groupedItems = items.reduce((acc: any, item: any) => {
        const section = getSectionTitle(item.date);
        if (!acc[section]) acc[section] = [];
        acc[section].push(item);
        return acc;
    }, {});

    const SECTIONS = ['Overdue', 'Today', 'Tomorrow', 'Upcoming'];

    return (
        <Layout style={styles.layout}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                <Text style={[styles.title, { color: colors.text }]}>Reminders</Text>
                <TouchableOpacity onPress={() => navigate('/add-reminder')} style={styles.addButton}>
                    <Plus size={24} color={colors.primary} />
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.scrollView}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {items.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Bell size={48} color={colors.mutedText} style={{ marginBottom: 16 }} />
                        <Text style={[styles.emptyText, { color: colors.text }]}>No reminders set.</Text>
                        <Text style={[styles.emptySubtext, { color: colors.mutedText }]}>Add one from a contact profile.</Text>
                    </View>
                ) : (
                    <View style={styles.listContainer}>
                        {SECTIONS.map(section => {
                            const sectionItems = groupedItems[section];
                            if (!sectionItems || sectionItems.length === 0) return null;

                            return (
                                <View key={section} style={styles.section}>
                                    <Text style={[
                                        styles.sectionTitle,
                                        { color: section === 'Overdue' ? colors.destructive : colors.mutedText }
                                    ]}>{section}</Text>

                                    <View style={[styles.card, { backgroundColor: colors.card }]}>
                                        {sectionItems.map((item: any, index: number) => (
                                            <View key={item.id}>
                                                <View style={styles.itemRow}>
                                                    <TouchableOpacity onPress={() => toggleComplete(item.id, item.completed)} style={styles.checkButton}>
                                                        {item.completed ? <CheckCircle size={24} color={colors.primary} /> : <Circle size={24} color={colors.border} />}
                                                    </TouchableOpacity>

                                                    <TouchableOpacity
                                                        style={styles.itemContent}
                                                        onPress={() => navigate(`/contact/${item.contactId}`)}
                                                    >
                                                        <Text style={[
                                                            styles.itemTitle,
                                                            { color: colors.text },
                                                            item.completed && { textDecorationLine: 'line-through', opacity: 0.5 }
                                                        ]}>
                                                            {item.title}
                                                        </Text>
                                                        <View style={styles.itemMeta}>
                                                            <Text style={[styles.contactName, { color: colors.mutedText }]}>
                                                                {item.contactFirstName} {item.contactLastName}
                                                            </Text>
                                                            <Text style={[styles.dateText, { color: colors.mutedText }]}>
                                                                {format(new Date(item.date), 'MMM d, h:mm a')}
                                                            </Text>
                                                        </View>
                                                    </TouchableOpacity>
                                                </View>
                                                {index < sectionItems.length - 1 && <View style={[styles.divider, { backgroundColor: colors.border }]} />}
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            );
                        })}
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        fontSize: FONT_SIZE.xxl,
        fontWeight: 'bold',
        color: '#0F172A',
    },
    addButton: {
        backgroundColor: COLORS.tealLight,
        padding: 8,
        borderRadius: RADIUS.full,
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
    emptyText: {
        color: '#94A3B8',
        fontSize: FONT_SIZE.base,
    },
    emptySubtext: {
        color: '#94A3B8',
        fontSize: FONT_SIZE.xs,
        marginTop: 8,
    },
    listContainer: {
        paddingBottom: 80,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: FONT_SIZE.sm,
        fontWeight: 'bold',
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    sectionTitleOverdue: {
        color: '#EF4444',
    },
    sectionTitleNormal: {
        color: '#64748B',
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: RADIUS.lg,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        overflow: 'hidden',
    },
    itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    checkButton: {
        marginRight: 16,
    },
    itemContent: {
        flex: 1,
    },
    itemTitle: {
        fontSize: FONT_SIZE.base,
        fontWeight: 'bold',
        color: '#0F172A',
    },
    itemTitleCompleted: {
        textDecorationLine: 'line-through',
        color: '#94A3B8',
    },
    itemMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    contactName: {
        fontSize: FONT_SIZE.xs,
        color: COLORS.primary,
        fontWeight: '500',
        marginRight: 8,
    },
    dateText: {
        fontSize: FONT_SIZE.xs,
        color: '#94A3B8',
    },
    divider: {
        height: 1,
        backgroundColor: '#F8FAFC',
        marginLeft: 56,
    },
});
