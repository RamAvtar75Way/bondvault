

import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, StyleSheet, Platform } from 'react-native';
import { useNavigate, useParams } from 'react-router-native';
import { Layout } from '../../components/ui/Layout';
import { addInteraction } from '../../db/interactions';
import { Mic, Camera, FileText, MapPin, X } from 'lucide-react-native';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as Location from 'expo-location';
import { useAudioRecorder, useAudioRecorderState, RecordingPresets, requestRecordingPermissionsAsync } from 'expo-audio';
import { addMedia } from '../../db/media';
import { COLORS, SPACING, FONT_SIZE, RADIUS } from '../../constants/theme';

const INTERACTION_TYPES = ['Call', 'Meeting', 'Message', 'Note'];

export default function LogInteractionScreen() {
    const { contactId } = useParams();
    const navigate = useNavigate();
    const [type, setType] = useState('Call');
    const [notes, setNotes] = useState('');
    const [date, setDate] = useState(new Date());
    const [location, setLocation] = useState('');
    const [attachments, setAttachments] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Audio Recording State
    const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
    const recorderState = useAudioRecorderState(recorder);
    const isRecording = recorderState.isRecording;

    const startRecording = async () => {
        try {
            const { granted } = await requestRecordingPermissionsAsync();
            if (!granted) {
                Alert.alert('Permission Denied', 'Microphone permission is required.');
                return;
            }

            // Prepare and start
            // Prepare might be implicit or explicit, explicit covers more cases
            await recorder.prepareToRecordAsync();
            recorder.record();
            console.log('Recording started');

        } catch (err) {
            console.error('Failed to start recording', err);
            Alert.alert('Error', 'Failed to start recording');
        }
    };

    const stopRecording = async () => {
        try {
            console.log('Stopping recording..');
            await recorder.stop();
            const uri = recorder.uri;
            console.log('Recording stopped and stored at', uri);

            if (uri) {
                setAttachments([...attachments, {
                    type: 'Audio',
                    uri: uri,
                    name: `Audio Note ${new Date().toLocaleTimeString()}`,
                    mimeType: 'audio/m4a'
                }]);
            }
        } catch (e) {
            console.error('Failed to stop recording', e);
        }
    };

    const handlePickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.All,
                quality: 1,
            });
            if (!result.canceled && result.assets) {
                const asset = result.assets[0];
                setAttachments([...attachments, {
                    type: asset.type === 'video' ? 'Video' : 'Image',
                    uri: asset.uri,
                    name: asset.fileName || 'image.jpg',
                    mimeType: asset.mimeType || 'image/jpeg'
                }]);
            }
        } catch (e) {
            Alert.alert('Error', 'Failed to pick image');
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
                setAttachments([...attachments, {
                    type: 'Document',
                    uri: doc.uri,
                    name: doc.name,
                    mimeType: doc.mimeType || 'application/octet-stream'
                }]);
            }
        } catch (e) {
            Alert.alert('Error', 'Failed to pick document');
        }
    };

    const handleGetLocation = async () => {
        try {
            setLoading(true);
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Denied', 'Location permission is required.');
                setLoading(false);
                return;
            }

            const loc = await Location.getCurrentPositionAsync({});
            // Reverse geocode to get address
            const [address] = await Location.reverseGeocodeAsync({
                latitude: loc.coords.latitude,
                longitude: loc.coords.longitude
            });

            if (address) {
                const locString = `${address.street || ''} ${address.city || ''}, ${address.region || ''}`.trim();
                setLocation(locString.replace(/^,/, '').trim()); // Clean up leading comma
            } else {
                setLocation(`${loc.coords.latitude}, ${loc.coords.longitude}`);
            }
        } catch (e) {
            console.error(e);
            Alert.alert('Error', 'Failed to get location');
        } finally {
            setLoading(false);
        }
    };

    const removeAttachment = (index: number) => {
        const newAtt = [...attachments];
        newAtt.splice(index, 1);
        setAttachments(newAtt);
    };

    const handleSave = async () => {
        if (!notes) {
            Alert.alert('Error', 'Please enter some notes');
            return;
        }

        try {
            const interaction = await addInteraction({
                contactId: parseInt(contactId!),
                type,
                date,
                notes,
                location: location, // Save captured location
                transcript: '',
            });

            // Save Attachments linked to this interaction
            if (interaction && interaction[0]?.id && attachments.length > 0) {
                const interactionId = interaction[0].id;
                await Promise.all(attachments.map(att =>
                    addMedia({
                        contactId: parseInt(contactId!),
                        interactionId: interactionId,
                        type: att.type,
                        uri: att.uri,
                        mimeType: att.mimeType,
                        fileName: att.name,
                        isPrivate: false // Default to public for now
                    })
                ));
            }
            navigate(`/contact/${contactId}`);
        } catch (e) {
            console.error(e);
            Alert.alert('Error', 'Failed to save interaction');
        }
    };

    return (
        <Layout style={styles.layout}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigate(-1)} style={styles.navButton}>
                    <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Log Interaction</Text>
                <TouchableOpacity onPress={handleSave} style={styles.navButton}>
                    <Text style={styles.saveText}>Save</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.scrollView}>
                <View style={styles.content}>
                    {/* Type Selector */}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeSelector}>
                        {INTERACTION_TYPES.map(t => (
                            <TouchableOpacity
                                key={t}
                                onPress={() => setType(t)}
                                style={[
                                    styles.typePill,
                                    type === t ? styles.activeTypePill : styles.inactiveTypePill
                                ]}
                            >
                                <Text style={[
                                    styles.typeText,
                                    type === t ? styles.activeTypeText : styles.inactiveTypeText
                                ]}>{t}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    {/* Date Picker */}
                    <View style={styles.dateContainer}>
                        <Text style={styles.label}>Date:</Text>
                        {Platform.OS === 'ios' ? (
                            <DateTimePicker
                                value={date}
                                mode="date"
                                display="default"
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
                                                setDate(selectedDate);
                                            }
                                        }
                                    });
                                }}
                                style={styles.dateButton}
                            >
                                <Text style={styles.dateButtonText}>{date.toLocaleDateString()}</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Notes Input */}
                    <TextInput
                        style={styles.notesInput}
                        multiline
                        placeholder="What did you discuss?..."
                        placeholderTextColor="#94A3B8"
                        value={notes}
                        onChangeText={setNotes}
                        textAlignVertical="top"
                    />

                    {/* Attachments Preview */}
                    {location ? (
                        <View style={styles.locationTag}>
                            <MapPin size={14} color={COLORS.primary} />
                            <Text style={styles.locationText}>{location}</Text>
                            <TouchableOpacity onPress={() => setLocation('')}>
                                <X size={14} color="#64748B" />
                            </TouchableOpacity>
                        </View>
                    ) : null}

                    {/* Recording Status Indicator */}
                    {isRecording && (
                        <View style={styles.recordingIndicator}>
                            <View style={styles.recordingDot} />
                            <Text style={styles.recordingText}>
                                {recorderState.durationMillis ? `Recording... (${Math.round(recorderState.durationMillis / 1000)}s)` : 'Recording...'}
                            </Text>
                            <TouchableOpacity onPress={stopRecording} style={styles.stopButton}>
                                <Text style={styles.stopButtonText}>Stop</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {attachments.length > 0 && (
                        <View style={styles.previewContainer}>
                            {attachments.map((att, index) => (
                                <View key={index} style={styles.attachmentChip}>
                                    <Text numberOfLines={1} style={styles.chipText}>{att.name}</Text>
                                    <TouchableOpacity onPress={() => removeAttachment(index)}>
                                        <X size={14} color="#64748B" />
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                    )}

                    {/* Attachments Row */}
                    <View style={styles.attachments}>
                        <AttachmentButton
                            icon={<Camera size={24} color={COLORS.primary} />}
                            label="Photo"
                            onPress={handlePickImage}
                        />
                        <AttachmentButton
                            icon={<Mic size={24} color={isRecording ? '#EF4444' : COLORS.primary} />}
                            label={isRecording ? "Stop" : "Audio"}
                            onPress={isRecording ? stopRecording : startRecording}
                        />
                        <AttachmentButton
                            icon={<FileText size={24} color={COLORS.primary} />}
                            label="Doc"
                            onPress={handlePickDocument}
                        />
                        <AttachmentButton
                            icon={<MapPin size={24} color={COLORS.primary} />}
                            label="Location"
                            onPress={handleGetLocation}
                        />
                    </View>
                </View>
            </ScrollView>
        </Layout>
    );
}

const AttachmentButton = ({ icon, label, onPress }: any) => (
    <TouchableOpacity style={styles.attachmentButton} onPress={onPress}>
        <View style={styles.attachmentIcon}>
            {icon}
        </View>
        <Text style={styles.attachmentLabel}>{label}</Text>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
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
        borderBottomColor: '#F1F5F9',
    },
    navButton: {
        padding: 8,
    },
    cancelText: {
        color: '#64748B',
        fontSize: FONT_SIZE.lg,
    },
    saveText: {
        color: COLORS.primary,
        fontWeight: 'bold',
        fontSize: FONT_SIZE.lg,
    },
    title: {
        fontSize: FONT_SIZE.lg,
        fontWeight: 'bold',
        color: '#0F172A',
    },
    scrollView: {
        flex: 1,
    },
    content: {
        padding: 24,
    },
    typeSelector: {
        marginBottom: 24,
        flexDirection: 'row',
    },
    typePill: {
        paddingHorizontal: 24,
        paddingVertical: 8,
        borderRadius: RADIUS.full,
        borderWidth: 1,
        marginRight: 12,
    },
    activeTypePill: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    inactiveTypePill: {
        backgroundColor: '#FFFFFF',
        borderColor: '#E2E8F0',
    },
    typeText: {
        fontWeight: '500',
    },
    activeTypeText: {
        color: '#FFFFFF',
    },
    inactiveTypeText: {
        color: '#475569',
    },
    dateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    label: {
        color: '#94A3B8',
        marginRight: 8,
    },
    dateButton: {
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: RADIUS.md,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    dateButtonText: {
        color: '#0F172A',
        fontSize: FONT_SIZE.base,
    },
    notesInput: {
        fontSize: FONT_SIZE.xl,
        color: '#1E293B',
        minHeight: 200,
        lineHeight: 32,
    },
    attachments: {
        flexDirection: 'row',
        gap: 24,
        marginTop: 32,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
        paddingTop: 24,
    },
    attachmentButton: {
        alignItems: 'center',
    },
    attachmentIcon: {
        width: 48,
        height: 48,
        backgroundColor: '#F8FAFC',
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 4,
    },
    attachmentLabel: {
        fontSize: FONT_SIZE.xs,
        color: '#64748B',
    },
    locationTag: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        backgroundColor: '#F0FDFA',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: RADIUS.full,
        gap: 8,
        marginTop: 16,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: COLORS.primary,
    },
    locationText: {
        color: COLORS.primary,
        fontSize: FONT_SIZE.sm,
        fontWeight: '500',
    },
    previewContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 8,
    },
    attachmentChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F1F5F9',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: RADIUS.lg,
        gap: 8,
    },
    chipText: {
        fontSize: FONT_SIZE.xs,
        color: '#475569',
        maxWidth: 150,
    },
    recordingIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEF2F2', // red-50
        padding: 12,
        borderRadius: RADIUS.lg,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#FECACA', // red-200
    },
    recordingDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#EF4444',
        marginRight: 10,
    },
    recordingText: {
        flex: 1,
        color: '#EF4444',
        fontWeight: '600',
    },
    stopButton: {
        backgroundColor: '#EF4444',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: RADIUS.full,
    },
    stopButtonText: {
        color: 'white',
        fontSize: FONT_SIZE.xs,
        fontWeight: 'bold',
    },
});
