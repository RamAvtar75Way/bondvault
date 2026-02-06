
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Outlet, useLocation, useNavigate } from 'react-router-native';
import { Users, MessageSquare, Bell } from 'lucide-react-native';
import { COLORS, SPACING, FONT_SIZE } from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';

export default function MainTabLayout() {
    const { colors } = useTheme();
    const location = useLocation();
    const navigate = useNavigate();

    const isCurrent = (path: string) => location.pathname.startsWith(path);

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Content Area */}
            <View style={styles.content}>
                <Outlet />
            </View>

            {/* Bottom Tab Bar */}
            <View style={[styles.tabBar, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
                <TabItem
                    icon={Users}
                    label="Contacts"
                    active={isCurrent('/app/contacts')}
                    onPress={() => navigate('/app/contacts')}
                    colors={colors}
                />
                <TabItem
                    icon={MessageSquare}
                    label="Interactions"
                    active={isCurrent('/app/interactions')}
                    onPress={() => navigate('/app/interactions')}
                    colors={colors}
                />
                <TabItem
                    icon={Bell}
                    label="Reminders"
                    active={isCurrent('/app/reminders')}
                    onPress={() => navigate('/app/reminders')}
                    colors={colors}
                />
            </View>
        </View>
    );
}

const TabItem = ({ icon: Icon, label, active, onPress, colors }: any) => {
    const color = active ? colors.primary : colors.mutedText;

    return (
        <TouchableOpacity
            onPress={onPress}
            style={styles.tabItem}
        >
            <View style={styles.tabContent}>
                <Icon size={24} color={color} />
                <Text style={[styles.tabLabel, { color }]}>
                    {label}
                </Text>
            </View>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
    },
    tabBar: {
        flexDirection: 'row',
        borderTopWidth: 1,
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
