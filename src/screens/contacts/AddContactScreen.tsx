
import { useState, useEffect } from 'react';
import { Text, View, TextInput, TouchableOpacity, ScrollView, Alert, Switch, Image, StyleSheet } from 'react-native';
import { useNavigate, useParams } from 'react-router-native';
import { Layout } from '../../components/ui/Layout';
import { addContact, getContactById, updateContact } from '../../db/contacts';
import { Camera, ArrowLeft } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, SPACING, FONT_SIZE, RADIUS } from '../../constants/theme';

export default function AddContactScreen() {
    const navigate = useNavigate();
    const { id } = useParams(); // Check if we are in edit mode
    const isEditMode = !!id;

    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        mobileNumber: '',
        email: '',
        relationType: '',
        birthday: '',
        notes: '',
        isPrivate: false
    });
    const [image, setImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Load data if editing
    useEffect(() => {
        if (isEditMode) {
            const loadContact = async () => {
                const contact = await getContactById(parseInt(id));
                if (contact) {
                    setForm({
                        firstName: contact.firstName,
                        lastName: contact.lastName || '',
                        mobileNumber: contact.mobileNumber || '',
                        email: contact.email || '',
                        relationType: contact.relationType || '',
                        birthday: contact.birthday || '',
                        notes: contact.notes || '',
                        isPrivate: contact.isPrivate || false
                    });
                    setImage(contact.profileImageUri || null);
                }
            };
            loadContact();
        }
    }, [id]);

    const handlePickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });
        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };


    const ROLES = ['Friend', 'Family', 'Work', 'Client', 'Partner', 'Other'];

    const handleSubmit = async () => {
        if (!form.firstName || !form.mobileNumber) {
            Alert.alert('Error', 'First Name and Mobile Number are required');
            return;
        }

        try {
            const contactData = {
                firstName: form.firstName,
                lastName: form.lastName,
                mobileNumber: form.mobileNumber,
                email: form.email,
                relationType: form.relationType || 'Other',
                birthday: form.birthday,
                notes: form.notes,
                profileImageUri: image,
                isPrivate: form.isPrivate
            };

            if (isEditMode) {
                await updateContact(parseInt(id), contactData);
                Alert.alert('Success', 'Contact updated successfully');
                navigate(`/contact/${id}`); // Go back to profile
            } else {
                await addContact(contactData);
                Alert.alert('Success', 'Contact added successfully');
                navigate('/app/contacts');
            }
        } catch (e) {
            console.error(e);
            Alert.alert('Error', 'Failed to save contact');
        }
    };

    return (
        <Layout style={styles.layout}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigate(-1)}>
                    <ArrowLeft size={24} color="#334155" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{isEditMode ? 'Edit Contact' : 'New Contact'}</Text>
                <TouchableOpacity onPress={handleSubmit}>
                    <Text style={styles.saveButtonText}>{isEditMode ? 'Update' : 'Save'}</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.imageSection}>
                    <TouchableOpacity onPress={handlePickImage} style={styles.imagePicker}>
                        {image ? (
                            <Image source={{ uri: image }} style={styles.image} />
                        ) : (
                            <Camera size={40} color="#94A3B8" />
                        )}
                    </TouchableOpacity>
                    {!isEditMode && (
                        <TouchableOpacity style={styles.importButton}>
                            <Text style={styles.importButtonText}>Import from Device</Text>
                        </TouchableOpacity>
                    )}
                </View>

                <View style={styles.form}>
                    <View style={styles.row}>
                        <View style={styles.halfInput}>
                            <Text style={styles.label}>First Name</Text>
                            <TextInput
                                style={styles.input}
                                value={form.firstName}
                                onChangeText={t => setForm({ ...form, firstName: t })}
                            />
                        </View>
                        <View style={styles.halfInput}>
                            <Text style={styles.label}>Last Name</Text>
                            <TextInput
                                style={styles.input}
                                value={form.lastName}
                                onChangeText={t => setForm({ ...form, lastName: t })}
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Mobile</Text>
                        <TextInput
                            style={styles.input}
                            value={form.mobileNumber}
                            onChangeText={t => setForm({ ...form, mobileNumber: t })}
                            keyboardType="phone-pad"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email</Text>
                        <TextInput
                            style={styles.input}
                            value={form.email}
                            onChangeText={t => setForm({ ...form, email: t })}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Birthday (YYYY-MM-DD)</Text>
                        {/* TODO: Upgrade to DatePicker */}
                        <TextInput
                            style={styles.input}
                            value={form.birthday}
                            onChangeText={t => setForm({ ...form, birthday: t })}
                            placeholder="YYYY-MM-DD"
                            placeholderTextColor="#CBD5E1"
                        />
                    </View>

                    {/* Role Selection */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Relation Type</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.roleContainer}>
                            {ROLES.map((role) => (
                                <TouchableOpacity
                                    key={role}
                                    style={[
                                        styles.rolePill,
                                        form.relationType === role && styles.rolePillActive
                                    ]}
                                    onPress={() => setForm({ ...form, relationType: role })}
                                >
                                    <Text style={[
                                        styles.roleText,
                                        form.relationType === role && styles.roleTextActive
                                    ]}>
                                        {role}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Notes</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={form.notes}
                            onChangeText={t => setForm({ ...form, notes: t })}
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                        />
                    </View>

                    <View style={styles.vaultSwitch}>
                        <View>
                            <Text style={styles.vaultTitle}>Secure Vault</Text>
                            <Text style={styles.vaultSubtitle}>Hide this contact from the main list</Text>
                        </View>
                        <Switch
                            value={form.isPrivate}
                            onValueChange={v => setForm({ ...form, isPrivate: v })}
                            trackColor={{ false: '#e2e8f0', true: COLORS.primary }}
                        />
                    </View>
                </View>
            </ScrollView>
        </Layout>
    );
}

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
        borderBottomColor: '#F1F5F9', // slate-100
    },
    headerTitle: {
        fontSize: FONT_SIZE.lg,
        fontWeight: 'bold',
        color: '#0F172A',
    },
    saveButtonText: {
        color: COLORS.primary,
        fontWeight: 'bold',
        fontSize: FONT_SIZE.lg,
    },
    content: {
        flex: 1,
    },
    imageSection: {
        alignItems: 'center',
        paddingVertical: 32,
        backgroundColor: '#F8FAFC', // slate-50
        marginBottom: 24,
    },
    imagePicker: {
        width: 128,
        height: 128,
        backgroundColor: '#E2E8F0',
        borderRadius: 64,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        borderWidth: 4,
        borderColor: '#FFFFFF',
        shadowColor: 'black',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    importButton: {
        marginTop: 16,
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: RADIUS.full,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    importButtonText: {
        color: '#475569',
        fontWeight: '500',
    },
    form: {
        paddingHorizontal: 24,
        gap: 20,
        paddingBottom: 80,
    },
    row: {
        flexDirection: 'row',
        gap: 16,
    },
    halfInput: {
        flex: 1,
    },
    inputGroup: {
        marginBottom: 0,
    },
    label: {
        fontSize: FONT_SIZE.xs,
        fontWeight: 'bold',
        color: '#64748B',
        textTransform: 'uppercase',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#F8FAFC',
        padding: 16,
        borderRadius: RADIUS.lg,
        color: '#0F172A',
        fontWeight: '500',
        fontSize: FONT_SIZE.base,
    },
    textArea: {
        minHeight: 120,
    },
    roleContainer: {
        gap: 8,
    },
    rolePill: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: RADIUS.full,
        backgroundColor: '#F1F5F9', // slate-100
        borderWidth: 1,
        borderColor: 'transparent',
    },
    rolePillActive: {
        backgroundColor: '#F0FDFA', // teal-50
        borderColor: COLORS.primary,
    },
    roleText: {
        color: '#64748B',
        fontSize: FONT_SIZE.sm,
        fontWeight: '600',
    },
    roleTextActive: {
        color: COLORS.primary,
    },
    vaultSwitch: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: COLORS.tealLight,
        padding: 16,
        borderRadius: RADIUS.lg,
        borderWidth: 1,
        borderColor: 'rgba(15, 118, 110, 0.2)',
        marginTop: 16,
    },
    vaultTitle: {
        color: COLORS.primary,
        fontWeight: 'bold',
        fontSize: FONT_SIZE.base,
    },
    vaultSubtitle: {
        color: '#64748B',
        fontSize: FONT_SIZE.xs,
        marginTop: 2,
    },
});
