
import { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, Alert, Linking, Image, StyleSheet } from 'react-native';
import { useParams, useNavigate } from 'react-router-native';
import { Layout } from '../../components/ui/Layout';
import { getContactById, deleteContact } from '../../db/contacts';
import { getInteractionsByContactId } from '../../db/interactions';
import { getMediaByContactId, addMedia } from '../../db/media';
import { Phone, Mail, MessageCircle, ArrowLeft, PlusCircle, Bell, MapPin, FileText, Pencil, Video as VideoIcon, PlayCircle } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { createAudioPlayer, AudioPlayer } from 'expo-audio';


import { format } from 'date-fns';
import { COLORS, SPACING, FONT_SIZE, RADIUS } from '../../constants/theme';

export default function ContactProfileScreen() {
    // ... existing state ...
    const { id } = useParams();
    const navigate = useNavigate();
    const [contact, setContact] = useState<any>(null);
    const [interactions, setInteractions] = useState<any[]>([]);
    const [mediaList, setMediaList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'timeline' | 'media' | 'info'>('timeline');
    const [currentPlayer, setCurrentPlayer] = useState<AudioPlayer | null>(null);

    useEffect(() => {
        return () => {
            if (currentPlayer) {
                currentPlayer.remove();
            }
        };
    }, [currentPlayer]);

    // ... existing fetchData ...

    // ... existing useEffect ... follows:
    const fetchData = useCallback(async () => {
        if (id) {
            const [contactData, interactionsData, mediaData] = await Promise.all([
                getContactById(parseInt(id)),
                getInteractionsByContactId(parseInt(id)),
                getMediaByContactId(parseInt(id))
            ]);
            setContact(contactData);
            setInteractions(interactionsData);
            setMediaList(mediaData);
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleChooseMediaType = () => {
        Alert.alert(
            'Add Media',
            'Choose a media type',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Photo / Video', onPress: handlePickMedia },
                { text: 'Document', onPress: handlePickDocument },
            ]
        );
    };

    const handlePickMedia = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            quality: 1,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            const asset = result.assets[0];
            await addMedia({
                contactId: parseInt(id!),
                type: asset.type === 'video' ? 'Video' : 'Image',
                uri: asset.uri,
                mimeType: asset.mimeType || 'image/jpeg',
                fileName: asset.fileName,
                isPrivate: false
            });
            fetchData();
        }
    };

    const handlePickDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: '*/*',
                copyToCacheDirectory: true
            });

            if (!result.canceled && result.assets) {
                const doc = result.assets[0];
                await addMedia({
                    contactId: parseInt(id!),
                    type: 'Document',
                    uri: doc.uri,
                    mimeType: doc.mimeType || 'application/octet-stream',
                    fileName: doc.name,
                    isPrivate: false
                });
                fetchData();
            }
        } catch (e) {
            Alert.alert('Error', 'Failed to pick document');
        }
    };

    const handleOpenMedia = async (item: any) => {
        try {
            if (item.type === 'Audio') {
                if (currentPlayer) {
                    currentPlayer.pause();
                    currentPlayer.remove();
                }
                const player = createAudioPlayer(item.uri);
                player.play();
                setCurrentPlayer(player);
            } else {
                const canOpen = await Linking.canOpenURL(item.uri);
                if (canOpen) {
                    Linking.openURL(item.uri);
                } else {
                    Alert.alert('Info', 'Cannot open this file type directly. It may be saved locally.');
                }
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Could not open media file.');
        }
    };

    const handleDelete = async () => {
        Alert.alert('Delete Contact', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete', style: 'destructive',
                onPress: async () => {
                    if (contact?.id) {
                        await deleteContact(contact.id);
                        navigate('/app/contacts');
                    }
                }
            }
        ]);
    };

    if (loading || !contact) {
        return (
            <Layout style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </Layout>
        );
    }

    const handleCall = () => {
        if (!contact.mobileNumber) {
            Alert.alert('No Number', 'This contact does not have a mobile number.');
            return;
        }
        Linking.openURL(`tel:${contact.mobileNumber}`).catch(() =>
            Alert.alert('Error', 'Could not open dialer.')
        );
    };

    const handleMessage = () => {
        if (!contact.mobileNumber) {
            Alert.alert('No Number', 'This contact does not have a mobile number.');
            return;
        }
        Linking.openURL(`sms:${contact.mobileNumber}`).catch(() =>
            Alert.alert('Error', 'Could not open messaging app.')
        );
    };

    const handleEmail = () => {
        if (!contact.email) {
            Alert.alert('No Email', 'This contact does not have an email address.');
            return;
        }
        Linking.openURL(`mailto:${contact.email}`).catch(() =>
            Alert.alert('Error', 'Could not open mail app.')
        );
    };

    return (
        <Layout style={styles.layout}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigate(-1)} style={styles.backButton}>
                    <ArrowLeft size={20} color="#334155" />
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => navigate(`/edit-contact/${contact.id}`)}
                    style={styles.editButton}
                >
                    <Pencil size={20} color="#334155" />
                </TouchableOpacity>

                <View style={styles.profileInfo}>
                    <View style={styles.avatar}>
                        {contact.profileImageUri ? (
                            <Image source={{ uri: contact.profileImageUri }} style={styles.avatarImage} />
                        ) : (
                            <Text style={styles.avatarText}>
                                {contact.firstName[0]}{contact.lastName ? contact.lastName[0] : ''}
                            </Text>
                        )}
                    </View>
                    <Text style={styles.name}>{contact.firstName} {contact.lastName}</Text>
                    <Text style={styles.relationBadge}>{contact.relationType || 'Contact'}</Text>
                </View>

                {/* Quick Actions */}
                <View style={styles.quickActions}>
                    <ActionButton icon={<Phone size={20} color="white" />} color="#22C55E" label="Call" onPress={handleCall} />
                    <ActionButton icon={<MessageCircle size={20} color="white" />} color="#3B82F6" label="Message" onPress={handleMessage} />
                    <ActionButton icon={<Mail size={20} color="white" />} color="#F97316" label="Email" onPress={handleEmail} />
                </View>
            </View>

            {/* Tabs */}
            <View style={styles.tabs}>
                <TabButton label="Timeline" active={activeTab === 'timeline'} onPress={() => setActiveTab('timeline')} />
                <TabButton label="Media" active={activeTab === 'media'} onPress={() => setActiveTab('media')} />
                <TabButton label="Info" active={activeTab === 'info'} onPress={() => setActiveTab('info')} />
            </View>

            <ScrollView style={styles.content}>

                {/* TIMELINE CONTENT */}
                {activeTab === 'timeline' && (
                    <View style={styles.tabContent}>
                        <TouchableOpacity
                            onPress={() => navigate(`/log-interaction/${contact.id}`)}
                            style={styles.logButton}
                        >
                            <PlusCircle size={20} color="white" style={{ marginRight: 8 }} />
                            <Text style={styles.logButtonText}>Log Interaction</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => navigate(`/add-reminder/${contact.id}`)}
                            style={styles.reminderButton}
                        >
                            <Bell size={20} color={COLORS.primary} style={{ marginRight: 8 }} />
                            <Text style={styles.reminderButtonText}>Set Reminder</Text>
                        </TouchableOpacity>

                        <View style={styles.timeline}>
                            {interactions.map((interaction) => (
                                <View key={interaction.id} style={styles.timelineItem}>
                                    <View style={styles.timelineDotContainer}>
                                        <View style={styles.timelineDot} />
                                    </View>
                                    <View style={styles.interactionCard}>
                                        <Text style={styles.interactionDate}>
                                            {new Date(interaction.date).toLocaleDateString()}
                                        </Text>
                                        <Text style={styles.interactionType}>{interaction.type}</Text>
                                        <Text style={styles.interactionNotes}>{interaction.notes}</Text>
                                        {interaction.location && (
                                            <View style={styles.locationContainer}>
                                                <MapPin size={14} color="#64748B" style={{ marginRight: 4 }} />
                                                <Text style={styles.locationText}>{interaction.location}</Text>
                                            </View>
                                        )}
                                    </View>
                                </View>
                            ))}
                            {interactions.length === 0 && (
                                <Text style={styles.emptyText}>No history yet. Start logging!</Text>
                            )}
                        </View>
                    </View>
                )}

                {/* MEDIA CONTENT */}
                {activeTab === 'media' && (
                    <View style={styles.mediaContainer}>
                        <View style={styles.mediaFilter}>
                            <TouchableOpacity style={styles.filterPillActive}><Text style={styles.filterTextActive}>All</Text></TouchableOpacity>
                            <TouchableOpacity style={styles.filterPill}><Text style={styles.filterText}>Photos</Text></TouchableOpacity>
                            <TouchableOpacity style={styles.filterPill}><Text style={styles.filterText}>Docs</Text></TouchableOpacity>
                        </View>
                        <View style={styles.mediaGrid}>
                            <TouchableOpacity onPress={handleChooseMediaType} style={styles.addMediaButton}>
                                <PlusCircle size={32} color="#94A3B8" />
                            </TouchableOpacity>
                            {mediaList.map((item) => (
                                <TouchableOpacity
                                    key={item.id}
                                    style={styles.mediaItem}
                                    onPress={() => handleOpenMedia(item)}
                                >
                                    {item.type === 'Image' && (
                                        <Image source={{ uri: item.uri }} style={styles.mediaImage} />
                                    )}
                                    {item.type === 'Video' && (
                                        <View style={[styles.mediaPlaceholder, { backgroundColor: '#F1F5F9' }]}>
                                            <VideoIcon size={32} color={COLORS.primary} />
                                            <Text numberOfLines={1} style={styles.mediaLabel}>Video</Text>
                                        </View>
                                    )}
                                    {item.type === 'Audio' && (
                                        <View style={[styles.mediaPlaceholder, { backgroundColor: '#FEF2F2' }]}>
                                            <PlayCircle size={32} color="#EF4444" />
                                            <Text numberOfLines={1} style={[styles.mediaLabel, { color: '#EF4444' }]}>
                                                {item.fileName || 'Audio Note'}
                                            </Text>
                                        </View>
                                    )}
                                    {item.type === 'Document' && (
                                        <View style={[styles.mediaPlaceholder, { backgroundColor: '#F0F9FF' }]}>
                                            <FileText size={32} color="#0EA5E9" />
                                            <Text numberOfLines={1} style={[styles.mediaLabel, { color: '#0EA5E9' }]}>
                                                {item.fileName || 'Document'}
                                            </Text>
                                        </View>
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                )}

                {/* INFO CONTENT */}
                {activeTab === 'info' && (
                    <View style={styles.infoContainer}>
                        <InfoItem label="Mobile" value={contact.mobileNumber} />
                        <InfoItem label="Email" value={contact.email} />
                        <InfoItem label="Birthday" value={contact.birthday} />
                        <InfoItem label="Notes" value={contact.notes} />

                        <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
                            <Text style={styles.deleteButtonText}>Delete Contact</Text>
                        </TouchableOpacity>
                    </View>
                )}

            </ScrollView>
        </Layout>
    );
}

const ActionButton = ({ icon, color, label, onPress }: any) => (
    <View style={styles.actionButtonContainer}>
        <TouchableOpacity onPress={onPress} style={[styles.actionButton, { backgroundColor: color }]}>
            {icon}
        </TouchableOpacity>
        <Text style={styles.actionLabel}>{label}</Text>
    </View>
);

const TabButton = ({ label, active, onPress }: any) => (
    <TouchableOpacity onPress={onPress} style={[styles.tabButton, active && styles.activeTabButton]}>
        <Text style={[styles.tabText, active && styles.activeTabText]}>{label}</Text>
    </TouchableOpacity>
);

const InfoItem = ({ label, value }: any) => (
    <View style={styles.infoItem}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value || 'N/A'}</Text>
    </View>
);

const styles = StyleSheet.create({
    loadingContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    layout: {
        backgroundColor: COLORS.background,
    },
    header: {
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        paddingBottom: 24,
        paddingTop: 8,
    },
    backButton: {
        position: 'absolute',
        left: 16,
        top: 16,
        zIndex: 10,
        padding: 8,
        backgroundColor: '#F1F5F9',
        borderRadius: RADIUS.full,
    },
    editButton: {
        position: 'absolute',
        right: 16,
        top: 16,
        zIndex: 10,
        padding: 8,
        backgroundColor: '#F1F5F9',
        borderRadius: RADIUS.full,
    },
    profileInfo: {
        alignItems: 'center',
        marginTop: 16,
    },
    avatar: {
        width: 112,
        height: 112,
        backgroundColor: '#E2E8F0',
        borderRadius: 56,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
        // shadowInner simulation not easy in RN, skipping
        overflow: 'hidden',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
    },
    avatarText: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#94A3B8',
    },
    name: {
        fontSize: FONT_SIZE.xxl,
        fontWeight: 'bold',
        color: '#0F172A',
    },
    relationBadge: {
        color: COLORS.primary,
        fontWeight: '500',
        marginTop: 4,
    },
    quickActions: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 24,
        marginTop: 24,
    },
    actionButtonContainer: {
        alignItems: 'center',
    },
    actionButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 4,
        shadowColor: 'black',
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1,
    },
    actionLabel: {
        fontSize: FONT_SIZE.xs,
        color: '#64748B',
    },
    tabs: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    tabButton: {
        flex: 1,
        paddingVertical: 16,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTabButton: {
        borderBottomColor: COLORS.primary,
    },
    tabText: {
        fontWeight: 'bold',
        fontSize: FONT_SIZE.sm,
        color: '#94A3B8',
    },
    activeTabText: {
        color: COLORS.primary,
    },
    content: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    tabContent: {
        padding: 24,
    },
    logButton: {
        backgroundColor: COLORS.primary,
        padding: 12,
        borderRadius: RADIUS.lg,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        shadowColor: COLORS.primary,
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 2,
    },
    logButtonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    reminderButton: {
        backgroundColor: '#FFFFFF',
        borderColor: COLORS.primary,
        borderWidth: 1,
        padding: 12,
        borderRadius: RADIUS.lg,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 32,
    },
    reminderButtonText: {
        color: COLORS.primary,
        fontWeight: 'bold',
    },
    timeline: {
        borderLeftWidth: 2,
        borderLeftColor: '#E2E8F0',
        marginLeft: 16,
        paddingLeft: 32,
        paddingBottom: 40,
        gap: 32,
    },
    timelineItem: {
        position: 'relative',
    },
    timelineDotContainer: {
        position: 'absolute',
        left: -41,
        width: 24,
        height: 24,
        backgroundColor: COLORS.background,
        borderWidth: 2,
        borderColor: COLORS.primary,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    timelineDot: {
        width: 8,
        height: 8,
        backgroundColor: COLORS.primary,
        borderRadius: 4,
    },
    interactionCard: {
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: RADIUS.lg,
        shadowColor: 'black',
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    interactionDate: {
        fontSize: FONT_SIZE.xs,
        color: '#94A3B8',
        fontWeight: '500',
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    interactionType: {
        fontSize: FONT_SIZE.lg,
        fontWeight: 'bold',
        color: '#0F172A',
        marginBottom: 4,
    },
    interactionNotes: {
        color: '#475569',
        fontSize: FONT_SIZE.base,
        lineHeight: 20,
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    locationText: {
        fontSize: FONT_SIZE.xs,
        color: '#64748B',
    },
    emptyText: {
        color: '#94A3B8',
        fontStyle: 'italic',
    },
    mediaContainer: {
        padding: 16,
    },
    mediaFilter: {
        flexDirection: 'row',
        marginBottom: 16,
        gap: 8,
    },
    filterPill: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: RADIUS.full,
    },
    filterPillActive: {
        backgroundColor: '#1E293B',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: RADIUS.full,
    },
    filterText: {
        color: '#475569',
        fontWeight: 'bold',
        fontSize: FONT_SIZE.xs,
    },
    filterTextActive: {
        color: '#FFFFFF',
        fontSize: FONT_SIZE.xs,
        fontWeight: 'bold',
    },
    mediaGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    addMediaButton: {
        width: 112,
        height: 112,
        backgroundColor: '#F1F5F9',
        borderRadius: RADIUS.lg,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#CBD5E1',
        borderStyle: 'dashed',
    },
    mediaItem: {
        width: 112,
        height: 112,
        backgroundColor: '#E2E8F0',
        borderRadius: RADIUS.lg,
        overflow: 'hidden',
    },
    mediaImage: {
        width: '100%',
        height: '100%',
    },
    mediaPlaceholder: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 8,
    },
    mediaLabel: {
        marginTop: 4,
        fontSize: FONT_SIZE.xs,
        color: '#475569',
        fontWeight: '500',
        textAlign: 'center',
    },
    infoContainer: {
        padding: 24,
        gap: 16,
    },
    infoItem: {
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: RADIUS.lg,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    infoLabel: {
        fontSize: FONT_SIZE.xs,
        color: '#94A3B8',
        textTransform: 'uppercase',
        fontWeight: 'bold',
        marginBottom: 4,
    },
    infoValue: {
        color: '#1E293B',
        fontSize: FONT_SIZE.base,
    },
    deleteButton: {
        marginTop: 32,
        backgroundColor: '#FEF2F2', // red-50
        padding: 16,
        borderRadius: RADIUS.lg,
        alignItems: 'center',
    },
    deleteButtonText: {
        color: '#EF4444',
        fontWeight: 'bold',
    },
});
