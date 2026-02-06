
import { useState, useEffect } from 'react';
import { Text, View, TextInput, TouchableOpacity, ScrollView, Alert, Switch, Image, StyleSheet } from 'react-native';
import { useNavigate, useParams } from 'react-router-native';
import { Layout } from '../../components/ui/Layout';
import { addContact, getContactById, updateContact } from '../../db/contacts';
import { Camera, ArrowLeft } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, SPACING, FONT_SIZE, RADIUS } from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';

export default function AddContactScreen() {
    const { colors } = useTheme();
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
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => navigate(-1)}>
                    <ArrowLeft size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>{isEditMode ? 'Edit Contact' : 'New Contact'}</Text>
                <TouchableOpacity onPress={handleSubmit}>
                    <Text style={[styles.saveButtonText, { color: colors.primary }]}>{isEditMode ? 'Update' : 'Save'}</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content}>
                <View style={[styles.imageSection, { backgroundColor: colors.card }]}>
                    <TouchableOpacity onPress={handlePickImage} style={[styles.imagePicker, { backgroundColor: colors.input, borderColor: colors.card }]}>
                        {image ? (
                            <Image source={{ uri: image }} style={styles.image} />
                        ) : (
                            <Camera size={40} color={colors.mutedText} />
                        )}
                    </TouchableOpacity>
                    {!isEditMode && (
                        <TouchableOpacity
                            style={[styles.importButton, { backgroundColor: colors.card, borderColor: colors.border }]}
                            onPress={() => navigate('/import-contacts')}
                        >
                            <Text style={[styles.importButtonText, { color: colors.mutedText }]}>Import from Device</Text>
                        </TouchableOpacity>
                    )}
                </View>

                <View style={styles.form}>
                    <View style={styles.row}>
                        <View style={styles.halfInput}>
                            <Text style={[styles.label, { color: colors.mutedText }]}>First Name</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: colors.input, borderColor: colors.border, color: colors.text }]}
                                value={form.firstName}
                                onChangeText={t => setForm({ ...form, firstName: t })}
                                placeholderTextColor={colors.mutedText}
                            />
                        </View>
                        <View style={styles.halfInput}>
                            <Text style={[styles.label, { color: colors.mutedText }]}>Last Name</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: colors.input, borderColor: colors.border, color: colors.text }]}
                                value={form.lastName}
                                onChangeText={t => setForm({ ...form, lastName: t })}
                                placeholderTextColor={colors.mutedText}
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: colors.mutedText }]}>Mobile</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: colors.input, borderColor: colors.border, color: colors.text }]}
                            value={form.mobileNumber}
                            onChangeText={t => setForm({ ...form, mobileNumber: t })}
                            keyboardType="phone-pad"
                            placeholderTextColor={colors.mutedText}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: colors.mutedText }]}>Email</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: colors.input, borderColor: colors.border, color: colors.text }]}
                            value={form.email}
                            onChangeText={t => setForm({ ...form, email: t })}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            placeholderTextColor={colors.mutedText}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: colors.mutedText }]}>Birthday (YYYY-MM-DD)</Text>
                        {/* TODO: Upgrade to DatePicker */}
                        <TextInput
                            style={[styles.input, { backgroundColor: colors.input, borderColor: colors.border, color: colors.text }]}
                            value={form.birthday}
                            onChangeText={t => setForm({ ...form, birthday: t })}
                            placeholder="YYYY-MM-DD"
                            placeholderTextColor={colors.mutedText}
                        />
                    </View>

                    {/* Role Selection */}
                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: colors.mutedText }]}>Relation Type</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.roleContainer}>
                            {ROLES.map((role) => (
                                <TouchableOpacity
                                    key={role}
                                    style={[
                                        styles.rolePill,
                                        { backgroundColor: colors.input, borderColor: colors.border },
                                        form.relationType === role && { backgroundColor: colors.tealLight, borderColor: colors.primary }
                                    ]}
                                    onPress={() => setForm({ ...form, relationType: role })}
                                >
                                    <Text style={[
                                        styles.roleText,
                                        { color: colors.mutedText },
                                        form.relationType === role && { color: colors.primary }
                                    ]}>
                                        {role}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: colors.mutedText }]}>Notes</Text>
                        <TextInput
                            style={[styles.input, styles.textArea, { backgroundColor: colors.input, borderColor: colors.border, color: colors.text }]}
                            value={form.notes}
                            onChangeText={t => setForm({ ...form, notes: t })}
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                            placeholderTextColor={colors.mutedText}
                        />
                    </View>

                    {/* Vault Toggle */}
                    <View style={[styles.vaultRow, { backgroundColor: colors.tealLight, borderColor: colors.primary }]}>
                        <View>
                            <Text style={[styles.vaultTitle, { color: colors.primary }]}>Add to Secure Vault</Text>
                            <Text style={[styles.vaultSubtitle, { color: colors.mutedText }]}>Hide this contact from the main list</Text>
                        </View>
                        <Switch
                            value={form.isPrivate}
                            onValueChange={v => setForm({ ...form, isPrivate: v })}
                            trackColor={{ false: colors.border, true: colors.primary }}
                        />
                    </View>
                </View>
            </ScrollView>
        </Layout>
    );
}

const styles = StyleSheet.create({
    layout: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomWidth: 1,
    },
    headerTitle: {
        fontSize: FONT_SIZE.lg,
        fontWeight: 'bold',
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
        marginBottom: 24,
    },
    imagePicker: {
        width: 128,
        height: 128,
        borderRadius: 64,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        borderWidth: 4,
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
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: RADIUS.full,
        borderWidth: 1,
    },
    importButtonText: {
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
        textTransform: 'uppercase',
        marginBottom: 8,
    },
    input: {
        padding: 16,
        borderRadius: RADIUS.lg,
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
        borderWidth: 1,
        borderColor: 'transparent',
    },
    rolePillActive: {
        backgroundColor: COLORS.tealLight, // Specific for active role
        borderColor: COLORS.primary,
    },
    roleText: {
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
        padding: 16,
        borderRadius: RADIUS.lg,
        borderWidth: 1,
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
