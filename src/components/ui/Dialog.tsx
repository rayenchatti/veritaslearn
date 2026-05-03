import React from 'react';
import { Modal, View, StyleSheet, TouchableOpacity, ModalProps } from 'react-native';
import { useStyles } from '../../theme/ThemeContext';

export interface DialogProps extends ModalProps {
    open?: boolean;
    onClose?: () => void;
    children: React.ReactNode;
}

export function Dialog({ open = false, onClose, children, ...props }: DialogProps) {
    const styles = useStyles(createStyles);
    if (!open) return null;

    return (
        <Modal
            transparent
            visible={open}
            animationType="fade"
            onRequestClose={onClose}
            {...props}
        >
            <View style={styles.overlay}>
                <TouchableOpacity 
                    style={[StyleSheet.absoluteFill, { backgroundColor: 'transparent' }]} 
                    activeOpacity={1} 
                    onPress={onClose} 
                />
                <View style={styles.contentContainer}>
                    {children}
                </View>
            </View>
        </Modal>
    );
}

export function DialogContent({ children, style }: { children: React.ReactNode; style?: any }) {
    const styles = useStyles(createStyles);
    return <View style={[styles.content, style]}>{children}</View>;
}

export function DialogHeader({ children }: { children: React.ReactNode }) {
    const styles = useStyles(createStyles);
    return <View style={styles.header}>{children}</View>;
}

export function DialogTitle({ children }: { children: React.ReactNode }) {
    const styles = useStyles(createStyles);
    return <View style={styles.title}>{children}</View>;
}

const createStyles = (colors: any) => StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    contentContainer: {
        width: '90%',
        maxHeight: '90%',
        backgroundColor: colors.surface,
        borderRadius: 16,
        overflow: 'hidden',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    content: {
        padding: 20,
    },
    header: {
        marginBottom: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 8,
    },
});
