import React, { forwardRef } from 'react';
import { TouchableOpacity, Text, StyleSheet, TouchableOpacityProps } from 'react-native';
import { useStyles } from '../../theme/ThemeContext';

export interface ButtonProps extends TouchableOpacityProps {
    variant?: 'default' | 'secondary' | 'outline' | 'ghost';
    size?: 'default' | 'sm' | 'lg' | 'icon';
    children: React.ReactNode;
}

export const Button = forwardRef<any, ButtonProps>(
    ({ variant = 'default', size = 'default', children, style: customStyle, ...props }, ref) => {
        const styles = useStyles(createStyles);

        const getContainerStyle = (): any[] => {
            let style: any[] = [styles.base];
            switch (variant) {
                case 'default':
                style.push(styles.defaultVariant);
                break;
                case 'secondary':
                style.push(styles.secondaryVariant);
                break;
                case 'outline':
                style.push(styles.outlineVariant);
                break;
                case 'ghost':
                style.push(styles.ghostVariant);
                break;
            }

            switch (size) {
                case 'default':
                style.push(styles.defaultSize);
                break;
                case 'sm':
                style.push(styles.smSize);
                break;
                case 'lg':
                style.push(styles.lgSize);
                break;
                case 'icon':
                style.push(styles.iconSize);
                break;
            }

            return style;
        };

        const getTextStyle = (): any[] => {
            let style: any[] = [styles.textBase];
            switch (variant) {
                case 'default':
                style.push(styles.defaultText);
                break;
                case 'secondary':
                style.push(styles.secondaryText);
                break;
                case 'outline':
                case 'ghost':
                style.push(styles.outlineText);
                break;
            }
            return style;
        };
        return (
            <TouchableOpacity
                ref={ref}
                style={[getContainerStyle(), customStyle]}
                activeOpacity={0.8}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                {...props}
            >
                {typeof children === 'string' ? (
                <Text style={getTextStyle()}>{children}</Text>
                ) : (
                children
                )}
            </TouchableOpacity>
        );
    }
);

Button.displayName = 'Button';

const createStyles = (colors: any) => StyleSheet.create({
    base: {
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
        flexDirection: 'row',
    },
    defaultVariant: {
        backgroundColor: colors.primaryHover, // or primary depending on interaction, primaryHover matches #6366f1 locally for button
    },
    secondaryVariant: {
        backgroundColor: colors.surfaceHighlight, 
    },
    outlineVariant: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: colors.primaryHover,
    },
    ghostVariant: {
        backgroundColor: 'transparent',
    },
    defaultSize: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        minHeight: 48,
    },
    smSize: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 6,
    },
    lgSize: {
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 12,
        minHeight: 56,
    },
    iconSize: {
        height: 48,
        width: 48,
        justifyContent: 'center',
        alignItems: 'center',
    },
    textBase: {
        fontWeight: '600',
        fontSize: 16,
    },
    defaultText: {
        color: '#ffffff', // Keep button text white for high contrast on primary colored button usually
    },
    secondaryText: {
        color: colors.primary,
    },
    outlineText: {
        color: colors.primaryHover,
    },
});
