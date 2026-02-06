
import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, Linking, StyleSheet } from 'react-native';
import { useNavigate } from 'react-router-native';
import * as Contacts from 'expo-contacts';
import { Layout } from '../../components/ui/Layout';
import { ArrowLeft, CheckCircle, Circle } from 'lucide-react-native';
import { addContact } from '../../db/contacts';
import { COLORS, SPACING, FONT_SIZE } from '../../constants/theme';

export default function ImportContactsScreen() {
    const navigate = useNavigate();
    const [phoneContacts, setPhoneContacts] = useState<Contacts.Contact[]>([]);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);
    const [importing, setImporting] = useState(false);
    useEffect(() => {
        (async () => {
            const { status, canAskAgain } = await Contacts.requestPermissionsAsync();
            if (status === 'granted') {
                const { data } = await Contacts.getContactsAsync({
                    fields: [Contacts.Fields.Name, Contacts.Fields.PhoneNumbers, Contacts.Fields.Emails, Contacts.Fields.Birthday],
                });

                const validContacts = data.filter(c => c.name && c.phoneNumbers && c.phoneNumbers.length > 0);
                setPhoneContacts(validContacts);
            } else {
                Alert.alert(
                    'Permission Required',
                    'Access to contacts is needed to import them. Please enable it in settings.',
                    [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Open Settings', onPress: () => Linking.openSettings() }
                    ]
                );
            }
            setLoading(false);
        })();
    }, []);

    const toggleSelection = (id: string) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
    };

    const handleImport = async () => {
        if (selectedIds.size === 0) return;
        setImporting(true);

        let count = 0;
        for (const contact of phoneContacts) {
            if (selectedIds.has((contact as any).id || '')) {
                try {
                    await addContact({
                        firstName: contact.firstName || contact.name || 'Unknown',
                        lastName: contact.lastName || '',
                        mobileNumber: contact.phoneNumbers?.[0]?.number || '',
                        email: contact.emails?.[0]?.email || '',
                        relationType: '',
                        birthday: contact.birthday ? `${contact.birthday.year}-${contact.birthday.month}-${contact.birthday.day}` : '',
                        notes: 'Imported from device',
                        profileImageUri: null,
                        isPrivate: false
                    });
                    count++;
                } catch (error) {
                    console.error('Failed to import contact', contact.name, error);
                }
            }
        }

        setImporting(false);
        Alert.alert('Success', `Imported ${count} contacts successfully.`);
        navigate('/app/contacts');
    };

    if (loading) {
        return (
            <Layout style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </Layout>
        );
    }

    return (
        <Layout style={styles.layout}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigate(-1)} disabled={importing}>
                    <ArrowLeft size={24} color="#334155" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Import Contacts</Text>
                <TouchableOpacity onPress={handleImport} disabled={selectedIds.size === 0 || importing}>
                    {importing ? (
                        <ActivityIndicator color={COLORS.primary} />
                    ) : (
                        <Text style={[styles.importText, selectedIds.size > 0 ? styles.activeImport : styles.inactiveImport]}>
                            Import ({selectedIds.size})
                        </Text>
                    )}
                </TouchableOpacity>
            </View>

            <FlatList
                data={phoneContacts}
                keyExtractor={(item: any) => item.id || Math.random().toString()}
                renderItem={({ item }: { item: any }) => {
                    const isSelected = item.id ? selectedIds.has(item.id) : false;
                    return (
                        <TouchableOpacity
                            onPress={() => item.id && toggleSelection(item.id)}
                            style={styles.listItem}
                        >
                            <View style={styles.iconContainer}>
                                {isSelected ? (
                                    <CheckCircle size={24} color={COLORS.primary} fill="#E6FFFA" />
                                ) : (
                                    <Circle size={24} color="#CBD5E1" />
                                )}
                            </View>
                            <View style={styles.itemInfo}>
                                <Text style={styles.itemName}>{item.name}</Text>
                                <Text style={styles.itemPhone}>{item.phoneNumbers?.[0]?.number}</Text>
                            </View>
                        </TouchableOpacity>
                    )
                }}
            />
        </Layout>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    layout: {
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9', // slate-100
    },
    headerTitle: {
        fontSize: FONT_SIZE.lg,
        fontWeight: 'bold',
        color: '#0F172A',
    },
    importText: {
        fontSize: FONT_SIZE.lg,
        fontWeight: 'bold',
    },
    activeImport: {
        color: COLORS.primary,
    },
    inactiveImport: {
        color: '#CBD5E1', // slate-300
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F8FAFC',
    },
    iconContainer: {
        marginRight: 16,
    },
    itemInfo: {
        flex: 1,
    },
    itemName: {
        color: '#0F172A',
        fontWeight: 'bold',
        fontSize: FONT_SIZE.base,
    },
    itemPhone: {
        color: '#64748B',
        fontSize: FONT_SIZE.sm,
    },
});
