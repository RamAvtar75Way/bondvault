
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

export default function VaultScreen() {
    const [privateContacts, setPrivateContacts] = useState<any[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPrivateContacts = async () => {
            const data = await db.select().from(contacts).where(eq(contacts.isPrivate, true));
            setPrivateContacts(data);
        };
        fetchPrivateContacts();
    }, []);

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#0F172A', '#1E1B4B']}
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
        padding: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: RADIUS.full,
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
        letterSpacing: 1,
        fontSize: FONT_SIZE.xs,
        textTransform: 'uppercase',
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
        marginBottom: 32,
    },
    shieldIcon: {
        marginBottom: 8,
        opacity: 0.8,
    },
    shieldText: {
        color: '#94A3B8',
        fontSize: FONT_SIZE.sm,
    },
    emptyState: {
        height: 160,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: RADIUS.lg,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    emptyText: {
        color: '#64748B',
    },
    listContainer: {
        paddingBottom: 80,
        gap: 16,
    },
    card: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        padding: 16,
        borderRadius: RADIUS.lg,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarContainer: {
        width: 48,
        height: 48,
        backgroundColor: 'rgba(245, 158, 11, 0.2)',
        borderRadius: RADIUS.full,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
        borderWidth: 1,
        borderColor: 'rgba(245, 158, 11, 0.3)',
        overflow: 'hidden',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
    },
    avatarText: {
        color: '#F59E0B',
        fontWeight: 'bold',
        fontSize: FONT_SIZE.lg,
    },
    info: {
        flex: 1,
    },
    name: {
        fontSize: FONT_SIZE.lg,
        fontWeight: 'bold',
        color: '#E2E8F0',
    },
    relation: {
        color: '#64748B',
        fontSize: FONT_SIZE.xs,
        marginTop: 2,
    },
});
