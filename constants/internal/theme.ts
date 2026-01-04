import { StyleSheet } from 'react-native';
import colors from './colors';

export const theme = {
  glassCard: {
    backgroundColor: colors.surface.glass,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.surface.glassEdge,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    padding: 16,
  },
  primaryButton: {
    backgroundColor: colors.accent.blue,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    shadowColor: colors.accent.blue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: colors.surface.glassEdge,
  },
  text: {
    header: {
      fontSize: 28,
      fontWeight: '800' as const,
      color: colors.text.primary,
      marginBottom: 8,
    },
    subheader: {
      fontSize: 20,
      fontWeight: '600' as const,
      color: colors.text.secondary,
      marginBottom: 4,
    },
    body: {
      fontSize: 16,
      fontWeight: '400' as const,
      color: colors.text.secondary,
    },
    caption: {
      fontSize: 14,
      fontWeight: '500' as const,
      color: colors.text.muted,
    },
    mono: {
      fontSize: 14,
      fontFamily: 'monospace',
      color: colors.text.secondary,
    },
  },
};

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.dark,
  },
  glassCard: theme.glassCard,
  primaryButton: theme.primaryButton,
  secondaryButton: theme.secondaryButton,
  headerText: theme.text.header,
  subheaderText: theme.text.subheader,
  bodyText: theme.text.body,
  captionText: theme.text.caption,
  monoText: theme.text.mono,
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default theme;