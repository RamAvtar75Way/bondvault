

import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, Platform, StyleSheet, Modal, FlatList } from 'react-native';
import { useNavigate, useParams } from 'react-router-native';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { Layout } from '../../components/ui/Layout';
import { addReminder } from '../../db/reminders';
import { getContacts, getContactById } from '../../db/contacts';
import { createCalendarEvent } from '../../utils/calendar';
import { ArrowLeft, User, Search, X } from 'lucide-react-native';
import { COLORS, SPACING, FONT_SIZE, RADIUS } from '../../constants/theme';

export default function AddReminderScreen() {
    const navigate = useNavigate();
    const { contactId } = useParams();

    const [title, setTitle] = useState('');
    const [date, setDate] = useState(new Date());

    // Contact Selection State
    const [selectedContact, setSelectedContact] = useState<any>(null);
    const [contactsList, setContactsList] = useState<any[]>([]);
    const [modalVisible, setModalVisible] = useState(false);

    useEffect(() => {
        const init = async () => {
            if (contactId) {
                const contact = await getContactById(parseInt(contactId));
                setSelectedContact(contact);
            } else {
                const contacts = await getContacts();
                setContactsList(contacts);
            }
        };
        init();
    }, [contactId]);

    const handleSave = async () => {
        if (!title) {
            Alert.alert('Error', 'Please enter a title');
            return;
        }
        if (!selectedContact) {
            Alert.alert('Error', 'Please select a contact');
            return;
        }

        try {
            const eventId = await createCalendarEvent(title, date, `Reminder for contact ${selectedContact.firstName}`);

            await addReminder({
                contactId: selectedContact.id,
                title,
                date,
                calendarEventId: eventId || undefined
            });

            Alert.alert('Success', 'Reminder set!', [
                { text: 'OK', onPress: () => navigate(`/contact/${selectedContact.id}`) }
            ]);
        } catch (e) {
            console.error(e);
            Alert.alert('Error', 'Failed to save reminder');
        }
    };

    return (
        <Layout style={styles.layout}>
            <ScrollView style={styles.scrollView}>
                <TouchableOpacity onPress={() => navigate(-1)} style={styles.backButton}>
                    <ArrowLeft size={24} color="#000" />
                </TouchableOpacity>

                <Text style={styles.title}>Add Reminder</Text>

                <View style={styles.form}>
                    {/* Contact Selection (Only if not pre-selected via URL) */}
                    {!contactId && (
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Contact</Text>
                            <TouchableOpacity
                                style={styles.selector}
                                onPress={() => setModalVisible(true)}
                            >
                                <Text style={[styles.selectorText, !selectedContact && styles.placeholderText]}>
                                    {selectedContact ? `${selectedContact.firstName} ${selectedContact.lastName}` : 'Select a contact'}
                                </Text>
                                <User size={20} color="#94A3B8" />
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Show selected contact name if pre-selected */}
                    {contactId && selectedContact && (
                        <View style={styles.contactBadge}>
                            <User size={16} color={COLORS.primary} />
                            <Text style={styles.contactBadgeText}>
                                For: {selectedContact.firstName} {selectedContact.lastName}
                            </Text>
                        </View>
                    )}

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Title</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. Call for birthday"
                            value={title}
                            onChangeText={setTitle}
                            placeholderTextColor="#94A3B8"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Date & Time</Text>
                        {Platform.OS === 'ios' ? (
                            <DateTimePicker
                                value={date}
                                mode="datetime"
                                display="spinner"
                                onChange={(e: any, d: Date | undefined) => d && setDate(d)}
                            />
                        ) : (
                            <TouchableOpacity
                                onPress={() => {
                                    DateTimePickerAndroid.open({
                                        value: date,
                                        mode: 'date',
                                        onChange: (event, selectedDate) => {
                                            if (event.type === 'set' && selectedDate) {
                                                // After date is selected, open time picker
                                                DateTimePickerAndroid.open({
                                                    value: selectedDate,
                                                    mode: 'time',
                                                    onChange: (timeEvent, selectedTime) => {
                                                        if (timeEvent.type === 'set' && selectedTime) {
                                                            setDate(selectedTime);
                                                        }
                                                    }
                                                });
                                            }
                                        }
                                    });
                                }}
                                style={styles.input}
                            >
                                <Text style={styles.dateText}>{date.toLocaleString()}</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    <TouchableOpacity
                        style={styles.saveButton}
                        onPress={handleSave}
                    >
                        <Text style={styles.saveButtonText}>Set Reminder</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Contact Selection Modal */}
            <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Select Contact</Text>
                        <TouchableOpacity onPress={() => setModalVisible(false)}>
                            <Text style={styles.closeText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                    <FlatList
                        data={contactsList}
                        keyExtractor={item => item.id.toString()}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.contactItem}
                                onPress={() => {
                                    setSelectedContact(item);
                                    setModalVisible(false);
                                }}
                            >
                                <View style={styles.avatarPlaceholder}>
                                    <Text style={styles.avatarInitial}>{item.firstName[0]}</Text>
                                </View>
                                <Text style={styles.contactName}>{item.firstName} {item.lastName}</Text>
                            </TouchableOpacity>
                        )}
                    />
                </View>
            </Modal>
        </Layout>
    );
}

const styles = StyleSheet.create({
    layout: {
        backgroundColor: COLORS.background,
    },
    scrollView: {
        flex: 1,
        padding: 24,
    },
    backButton: {
        marginBottom: 16,
    },
    title: {
        fontSize: FONT_SIZE.xxl,
        fontWeight: 'bold',
        color: '#0F172A',
        marginBottom: 32,
    },
    form: {
        gap: 24,
    },
    inputGroup: {
        marginBottom: 0,
    },
    label: {
        fontSize: FONT_SIZE.sm,
        fontWeight: '500',
        color: '#64748B',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: RADIUS.md,
        padding: 12,
        color: '#0F172A',
        fontSize: FONT_SIZE.base,
    },
    dateText: {
        color: '#0F172A',
    },
    saveButton: {
        backgroundColor: COLORS.primary,
        padding: 16,
        borderRadius: RADIUS.lg,
        alignItems: 'center',
        marginTop: 24,
    },
    saveButtonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: FONT_SIZE.lg,
    },
    selector: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: RADIUS.md,
        padding: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    selectorText: {
        fontSize: FONT_SIZE.base,
        color: '#0F172A',
    },
    placeholderText: {
        color: '#94A3B8',
    },
    contactBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#F0FDFA',
        padding: 8,
        borderRadius: RADIUS.md,
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: COLORS.tealLight,
        marginBottom: 8,
    },
    contactBadgeText: {
        color: COLORS.primary,
        fontSize: FONT_SIZE.sm,
        fontWeight: '500',
    },
    modalContainer: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        paddingTop: 24,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    modalTitle: {
        fontSize: FONT_SIZE.lg,
        fontWeight: 'bold',
        color: '#0F172A',
    },
    closeText: {
        color: COLORS.primary,
        fontSize: FONT_SIZE.base,
        fontWeight: '500',
    },
    contactItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    avatarPlaceholder: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#E2E8F0',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    avatarInitial: {
        fontSize: FONT_SIZE.lg,
        fontWeight: 'bold',
        color: '#64748B',
    },
    contactName: {
        fontSize: FONT_SIZE.base,
        color: '#0F172A',
    },
});
