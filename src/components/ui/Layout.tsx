
import { SafeAreaView } from 'react-native-safe-area-context';
import { ViewStyle } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface LayoutProps {
    children: React.ReactNode;
    style?: ViewStyle;
}

export const Layout = ({ children, style }: LayoutProps) => {
    const { colors } = useTheme();

    return (
        <SafeAreaView style={[{ flex: 1, backgroundColor: colors.background }, style]}>
            {children}
        </SafeAreaView>
    );
};
