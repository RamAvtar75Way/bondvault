
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Outlet, useLocation, useNavigate } from 'react-router-native';
import { Users, MessageSquare, Bell } from 'lucide-react-native';
import { COLORS, SPACING, FONT_SIZE } from '../../constants/theme';

export default function MainTabLayout() {
    const location = useLocation();
    const navigate = useNavigate();

    const isCurrent = (path: string) => location.pathname.startsWith(path);

    return (
        <View style={styles.container}>
            {/* Content Area */}
            <View style={styles.content}>
                <Outlet />
            </View>

            {/* Bottom Tab Bar */}
            <View style={styles.tabBar}>
                <TabItem
                    icon={Users}
                    label="Contacts"
                    active={isCurrent('/app/contacts')}
                    onPress={() => navigate('/app/contacts')}
                />
                <TabItem
                    icon={MessageSquare}
                    label="Interactions"
                    active={isCurrent('/app/interactions')}
                    onPress={() => navigate('/app/interactions')}
                />
                <TabItem
                    icon={Bell}
                    label="Reminders"
                    active={isCurrent('/app/reminders')}
                    onPress={() => navigate('/app/reminders')}
                />
            </View>
        </View>
    );
}

const TabItem = ({ icon: Icon, label, active, onPress }: any) => {
    const color = active ? COLORS.primary : '#94A3B8';

    return (
        <TouchableOpacity
            onPress={onPress}
            style={styles.tabItem}
        >
            <View style={styles.tabContent}>
                <Icon size={24} color={color} />
                <Text style={[styles.tabLabel, { color: active ? COLORS.primary : '#94A3B8' }]}>
                    {label}
                </Text>
            </View>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    content: {
        flex: 1,
    },
    tabBar: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        paddingBottom: 20, // pb-safe simulation
        paddingTop: 8,
    },
    tabItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
    },
    tabContent: {
        alignItems: 'center',
    },
    tabLabel: {
        fontSize: 10,
        fontWeight: '500',
        marginTop: 4,
    },
});
