
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { COLORS } from '../../constants/theme';

interface LayoutProps {
    children: React.ReactNode;
    style?: ViewStyle;
}

export const Layout = ({ children, style }: LayoutProps) => {
    return (
        <SafeAreaView style={[styles.container, style]}>
            <View style={styles.content}>{children}</View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    content: {
        flex: 1,
        paddingHorizontal: 16, // px-4
    },
});
