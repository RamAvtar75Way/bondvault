
import { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, Alert, Linking, Image, StyleSheet, Platform, PermissionsAndroid } from 'react-native';
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
import { useTheme } from '../../contexts/ThemeContext';

export default function ContactProfileScreen() {
    const { colors } = useTheme();
    // ... existing state ...
    const { id } = useParams();
    const navigate = useNavigate();
    const [contact, setContact] = useState<any>(null);
    const [interactions, setInteractions] = useState<any[]>([]);
    const [mediaList, setMediaList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'timeline' | 'media' | 'info'>('timeline');
    const [activeMediaFilter, setActiveMediaFilter] = useState<'All' | 'Photos' | 'Docs'>('All');
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


    const handleCall = async () => {
        if (!contact.mobileNumber) {
            Alert.alert('No Number', 'This contact does not have a mobile number.');
            return;
        }

        // On Android, request CALL_PHONE permission for direct calling
        if (Platform.OS === 'android') {
            try {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.CALL_PHONE,
                    {
                        title: 'Phone Call Permission',
                        message: 'BondVault needs permission to make phone calls directly from the app.',
                        buttonNeutral: 'Ask Me Later',
                        buttonNegative: 'Cancel',
                        buttonPositive: 'OK',
                    }
                );

                if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                    // Use tel: URL which will initiate call directly with permission
                    Linking.openURL(`tel:${contact.mobileNumber}`).catch(() =>
                        Alert.alert('Error', 'Could not initiate call.')
                    );
                } else {
                    Alert.alert('Permission Denied', 'Phone call permission is required to make calls.');
                }
            } catch (err) {
                console.error('Error requesting call permission:', err);
                Alert.alert('Error', 'Could not request permission.');
            }
        } else {
            // On iOS, tel: always opens dialer (no direct calling allowed)
            Linking.openURL(`tel:${contact.mobileNumber}`).catch(() =>
                Alert.alert('Error', 'Could not open dialer.')
            );
        }
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
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => navigate(-1)} style={[styles.backButton, { backgroundColor: colors.card }]}>
                    <ArrowLeft size={20} color={colors.text} />
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => navigate(`/edit-contact/${contact.id}`)}
                    style={[styles.editButton, { backgroundColor: colors.card }]}
                >
                    <Pencil size={20} color={colors.text} />
                </TouchableOpacity>

                <View style={styles.profileInfo}>
                    <View style={[styles.avatar, { backgroundColor: colors.secondary }]}>
                        {contact.profileImageUri ? (
                            <Image source={{ uri: contact.profileImageUri }} style={styles.avatarImage} />
                        ) : (
                            <Text style={[styles.avatarText, { color: colors.mutedText }]}>
                                {contact.firstName[0]}{contact.lastName ? contact.lastName[0] : ''}
                            </Text>
                        )}
                    </View>
                    <Text style={[styles.name, { color: colors.text }]}>{contact.firstName} {contact.lastName}</Text>
                    <Text style={[styles.relationBadge, { color: colors.primary }]}>{contact.relationType || 'Contact'}</Text>
                </View>

                {/* Quick Actions */}
                <View style={styles.quickActions}>
                    <ActionButton icon={<Phone size={20} color="white" />} color="#22C55E" label="Call" onPress={handleCall} textColor={colors.mutedText} />
                    <ActionButton icon={<MessageCircle size={20} color="white" />} color="#3B82F6" label="Message" onPress={handleMessage} textColor={colors.mutedText} />
                    <ActionButton icon={<Mail size={20} color="white" />} color="#F97316" label="Email" onPress={handleEmail} textColor={colors.mutedText} />
                </View>
            </View>

            {/* Tabs */}
            <View style={[styles.tabs, { borderBottomColor: colors.border }]}>
                <TabButton label="Timeline" active={activeTab === 'timeline'} onPress={() => setActiveTab('timeline')} colors={colors} />
                <TabButton label="Media" active={activeTab === 'media'} onPress={() => setActiveTab('media')} colors={colors} />
                <TabButton label="Info" active={activeTab === 'info'} onPress={() => setActiveTab('info')} colors={colors} />
            </View>

            <ScrollView style={styles.content}>

                {/* TIMELINE CONTENT */}
                {activeTab === 'timeline' && (
                    <View style={styles.tabContent}>
                        <TouchableOpacity
                            onPress={() => navigate(`/log-interaction/${contact.id}`)}
                            style={[styles.logButton, { backgroundColor: colors.primary }]}
                        >
                            <PlusCircle size={20} color="white" style={{ marginRight: 8 }} />
                            <Text style={[styles.logButtonText, { color: colors.primaryForeground }]}>Log Interaction</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => navigate(`/add-reminder/${contact.id}`)}
                            style={[styles.reminderButton, { backgroundColor: colors.card, borderColor: colors.primary }]}
                        >
                            <Bell size={20} color={COLORS.primary} style={{ marginRight: 8 }} />
                            <Text style={[styles.reminderButtonText, { color: colors.primary }]}>Set Reminder</Text>
                        </TouchableOpacity>

                        <View style={[styles.timeline, { borderLeftColor: colors.border }]}>
                            {interactions.map((interaction) => (
                                <View key={interaction.id} style={styles.timelineItem}>
                                    <View style={[styles.timelineDotContainer, { borderColor: colors.primary, backgroundColor: colors.background }]}>
                                        <View style={[styles.timelineDot, { backgroundColor: colors.primary }]} />
                                    </View>
                                    <View style={[styles.interactionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                        <Text style={[styles.interactionDate, { color: colors.mutedText }]}>
                                            {new Date(interaction.date).toLocaleDateString()}
                                        </Text>
                                        <Text style={[styles.interactionType, { color: colors.text }]}>{interaction.type}</Text>
                                        <Text style={[styles.interactionNotes, { color: colors.text }]}>{interaction.notes}</Text>
                                        {interaction.location && (
                                            <View style={styles.locationContainer}>
                                                <MapPin size={14} color={colors.mutedText} style={{ marginRight: 4 }} />
                                                <Text style={[styles.locationText, { color: colors.mutedText }]}>{interaction.location}</Text>
                                            </View>
                                        )}
                                    </View>
                                </View>
                            ))}
                            {interactions.length === 0 && (
                                <Text style={[styles.emptyText, { color: colors.mutedText }]}>No history yet. Start logging!</Text>
                            )}
                        </View>
                    </View>
                )}

                {activeTab === 'media' && (
                    <View style={styles.mediaContainer}>
                        <View style={styles.mediaFilter}>
                            <TouchableOpacity
                                onPress={() => setActiveMediaFilter('All')}
                                style={[
                                    activeMediaFilter === 'All' ? styles.filterPillActive : styles.filterPill,
                                    activeMediaFilter === 'All' ? { backgroundColor: colors.text } : { backgroundColor: colors.card, borderColor: colors.border }
                                ]}
                            >
                                <Text style={[
                                    activeMediaFilter === 'All' ? styles.filterTextActive : styles.filterText,
                                    activeMediaFilter === 'All' ? { color: colors.background } : { color: colors.mutedText }
                                ]}>All</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => setActiveMediaFilter('Photos')}
                                style={[
                                    activeMediaFilter === 'Photos' ? styles.filterPillActive : styles.filterPill,
                                    activeMediaFilter === 'Photos' ? { backgroundColor: colors.text } : { backgroundColor: colors.card, borderColor: colors.border }
                                ]}
                            >
                                <Text style={[
                                    activeMediaFilter === 'Photos' ? styles.filterTextActive : styles.filterText,
                                    activeMediaFilter === 'Photos' ? { color: colors.background } : { color: colors.mutedText }
                                ]}>Photos</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => setActiveMediaFilter('Docs')}
                                style={[
                                    activeMediaFilter === 'Docs' ? styles.filterPillActive : styles.filterPill,
                                    activeMediaFilter === 'Docs' ? { backgroundColor: colors.text } : { backgroundColor: colors.card, borderColor: colors.border }
                                ]}
                            >
                                <Text style={[
                                    activeMediaFilter === 'Docs' ? styles.filterTextActive : styles.filterText,
                                    activeMediaFilter === 'Docs' ? { color: colors.background } : { color: colors.mutedText }
                                ]}>Docs</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.mediaGrid}>
                            <TouchableOpacity onPress={handleChooseMediaType} style={[styles.addMediaButton, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
                                <PlusCircle size={32} color={colors.mutedText} />
                            </TouchableOpacity>
                            {mediaList
                                .filter(item => {
                                    if (activeMediaFilter === 'All') return true;
                                    if (activeMediaFilter === 'Photos') return item.type === 'Image' || item.type === 'Video';
                                    if (activeMediaFilter === 'Docs') return item.type === 'Document';
                                    return true;
                                })
                                .map((item) => (
                                    <TouchableOpacity
                                        key={item.id}
                                        style={[styles.mediaItem, { backgroundColor: colors.input }]}
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
                {
                    activeTab === 'info' && (
                        <View style={styles.infoContainer}>
                            <InfoItem label="Mobile" value={contact.mobileNumber} colors={colors} />
                            <InfoItem label="Email" value={contact.email} colors={colors} />
                            <InfoItem label="Birthday" value={contact.birthday} colors={colors} />
                            <InfoItem label="Notes" value={contact.notes} colors={colors} />

                            <TouchableOpacity onPress={handleDelete} style={[styles.deleteButton, { backgroundColor: colors.secondary }]}>
                                <Text style={[styles.deleteButtonText, { color: colors.destructive }]}>Delete Contact</Text>
                            </TouchableOpacity>
                        </View>
                    )
                }

            </ScrollView >
        </Layout >
    );
}

const ActionButton = ({ icon, color, label, onPress, textColor }: any) => (
    <View style={styles.actionButtonContainer}>
        <TouchableOpacity onPress={onPress} style={[styles.actionButton, { backgroundColor: color }]}>
            {icon}
        </TouchableOpacity>
        <Text style={[styles.actionLabel, { color: textColor }]}>{label}</Text>
    </View>
);

const TabButton = ({ label, active, onPress, colors }: any) => (
    <TouchableOpacity onPress={onPress} style={[styles.tabButton, { borderBottomColor: active ? colors.primary : 'transparent' }, active && styles.activeTabButton]}>
        <Text style={[styles.tabText, { color: active ? colors.primary : colors.mutedText }, active && styles.activeTabText]}>{label}</Text>
    </TouchableOpacity>
);

const InfoItem = ({ label, value, colors }: any) => (
    <View style={[styles.infoItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.infoLabel, { color: colors.mutedText }]}>{label}</Text>
        <Text style={[styles.infoValue, { color: colors.text }]}>{value || 'N/A'}</Text>
    </View>
);

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    layout: {
        flex: 1,
    },
    header: {
        borderBottomWidth: 1,
        paddingBottom: 24,
        paddingTop: 8,
    },
    backButton: {
        position: 'absolute',
        left: 16,
        top: 16,
        zIndex: 10,
        padding: 8,
        borderRadius: RADIUS.full,
    },
    editButton: {
        position: 'absolute',
        right: 16,
        top: 16,
        zIndex: 10,
        padding: 8,
        borderRadius: RADIUS.full,
    },
    profileInfo: {
        alignItems: 'center',
        marginTop: 16,
    },
    avatar: {
        width: 112,
        height: 112,
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
    },
    name: {
        fontSize: FONT_SIZE.xxl,
        fontWeight: 'bold',
    },
    relationBadge: {
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
    },
    tabs: {
        flexDirection: 'row',
        borderBottomWidth: 1,
    },
    tabButton: {
        flex: 1,
        paddingVertical: 16,
        alignItems: 'center',
        borderBottomWidth: 2,
    },
    activeTabButton: {
        // borderBottomColor handled by inline style
    },
    tabText: {
        fontWeight: 'bold',
        fontSize: FONT_SIZE.sm,
    },
    activeTabText: {
        // color handled by inline style
    },
    content: {
        flex: 1,
    },
    tabContent: {
        padding: 24,
    },
    logButton: {
        padding: 12,
        borderRadius: RADIUS.lg,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        shadowColor: COLORS.primary, // Keep primary for shadow
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 2,
    },
    logButtonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    reminderButton: {
        borderWidth: 1,
        padding: 12,
        borderRadius: RADIUS.lg,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 32,
    },
    reminderButtonText: {
        fontWeight: 'bold',
    },
    timeline: {
        borderLeftWidth: 2,
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
        borderWidth: 2,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    timelineDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    interactionCard: {
        padding: 16,
        borderRadius: RADIUS.lg,
        shadowColor: 'black',
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
        borderWidth: 1,
    },
    interactionDate: {
        fontSize: FONT_SIZE.xs,
        fontWeight: '500',
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    interactionType: {
        fontSize: FONT_SIZE.lg,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    interactionNotes: {
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
    },
    emptyText: {
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
        borderWidth: 1,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: RADIUS.full,
    },
    filterPillActive: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: RADIUS.full,
    },
    filterText: {
        fontWeight: 'bold',
        fontSize: FONT_SIZE.xs,
    },
    filterTextActive: {
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
        borderRadius: RADIUS.lg,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderStyle: 'dashed',
    },
    mediaItem: {
        width: 112,
        height: 112,
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
        padding: 16,
        borderRadius: RADIUS.lg,
        borderWidth: 1,
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
        padding: 16,
        borderRadius: RADIUS.lg,
        alignItems: 'center',
    },
    deleteButtonText: {
        fontWeight: 'bold',
    },
});
