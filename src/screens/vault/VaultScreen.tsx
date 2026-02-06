
import { Text, View, ScrollView, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Layout } from '../../components/ui/Layout';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-native';
import { db } from '../../db/client';
import { contacts } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { Lock, ArrowLeft, Shield } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, FONT_SIZE, RADIUS } from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';

export default function VaultScreen() {
    const { colors, colorScheme } = useTheme();
    const [privateContacts, setPrivateContacts] = useState<any[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPrivateContacts = async () => {
            const data = await db.select().from(contacts).where(eq(contacts.isPrivate, true));
            setPrivateContacts(data);
        };
        fetchPrivateContacts();
    }, []);

    // Vault always uses dark gradient for security aesthetic
    const gradientColors = colorScheme === 'dark'
        ? ['#0F172A', '#1E1B4B']
        : ['#1E293B', '#312E81'];

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={gradientColors}
                style={StyleSheet.absoluteFill}
            />
            <Layout style={styles.layout}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigate('/app/contacts')} style={styles.backButton}>
                        <ArrowLeft size={24} color="#F59E0B" />
                    </TouchableOpacity>
                    <View style={styles.badge}>
                        <Lock size={16} color="#F59E0B" style={styles.badgeIcon} />
                        <Text style={styles.badgeText}>Secure Vault</Text>
                    </View>
                    <View style={styles.spacer} />
                </View>

                <ScrollView style={styles.scrollView}>
                    <View style={styles.shieldContainer}>
                        <Shield size={48} color="#F59E0B" style={styles.shieldIcon} />
                        <Text style={styles.shieldText}>Protected by Biometrics</Text>
                    </View>

                    {privateContacts.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyText}>No hidden contacts.</Text>
                        </View>
                    ) : (
                        <View style={styles.listContainer}>
                            {privateContacts.map((contact) => (
                                <TouchableOpacity
                                    key={contact.id}
                                    style={styles.card}
                                    onPress={() => navigate(`/contact/${contact.id}`)}
                                >
                                    <View style={styles.avatarContainer}>
                                        {contact.profileImageUri ? (
                                            <Image source={{ uri: contact.profileImageUri }} style={styles.avatarImage} />
                                        ) : (
                                            <Text style={styles.avatarText}>
                                                {contact.firstName[0]}
                                                {contact.lastName ? contact.lastName[0] : ''}
                                            </Text>
                                        )}
                                    </View>
                                    <View style={styles.info}>
                                        <Text style={styles.name}>{contact.firstName} {contact.lastName}</Text>
                                        <Text style={styles.relation}>{contact.relationType || 'Private'}</Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </ScrollView>
            </Layout>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F172A',
    },
    layout: {
        backgroundColor: 'transparent',
    },
    header: {
        paddingTop: 8,
        paddingBottom: 24,
        paddingHorizontal: 24,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: RADIUS.full,
        borderWidth: 1,
        borderColor: 'rgba(245, 158, 11, 0.3)',
    },
    badgeIcon: {
        marginRight: 8,
    },
    badgeText: {
        color: '#F59E0B',
        fontWeight: 'bold',
        fontSize: FONT_SIZE.sm,
    },
    spacer: {
        width: 40,
    },
    scrollView: {
        flex: 1,
        paddingHorizontal: 24,
    },
    shieldContainer: {
        alignItems: 'center',
        paddingVertical: 32,
    },
    shieldIcon: {
        marginBottom: 16,
    },
    shieldText: {
        color: '#F59E0B',
        fontSize: FONT_SIZE.base,
        fontWeight: '600',
    },
    emptyState: {
        paddingVertical: 64,
        alignItems: 'center',
    },
    emptyText: {
        color: '#94A3B8',
        fontSize: FONT_SIZE.base,
    },
    listContainer: {
        paddingBottom: 80,
        gap: 12,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        padding: 16,
        borderRadius: RADIUS.lg,
        borderWidth: 1,
        borderColor: 'rgba(245, 158, 11, 0.2)',
    },
    avatarContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(245, 158, 11, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
        borderWidth: 2,
        borderColor: '#F59E0B',
    },
    avatarImage: {
        width: 48,
        height: 48,
        borderRadius: 24,
    },
    avatarText: {
        color: '#F59E0B',
        fontSize: FONT_SIZE.lg,
        fontWeight: 'bold',
    },
    info: {
        flex: 1,
    },
    name: {
        color: '#FFFFFF',
        fontSize: FONT_SIZE.base,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    relation: {
        color: '#94A3B8',
        fontSize: FONT_SIZE.sm,
    },
});
