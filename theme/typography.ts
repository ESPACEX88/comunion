export const fonts = {
  display: 'Fraunces_700Bold',
  displayItalic: 'Fraunces_600SemiBold_Italic',
  title: 'Fraunces_600SemiBold',
  ui: 'Fraunces_500Medium',
  uiItalic: 'Fraunces_400Regular_Italic',
  caption: 'Fraunces_400Regular',
  reading: 'Literata_400Regular',
  readingMedium: 'Literata_500Medium',
  readingItalic: 'Literata_400Regular_Italic',
} as const;

export const typeScale = {
  display: { fontSize: 40, lineHeight: 42, letterSpacing: -1.4 },
  numeral: { fontSize: 26, lineHeight: 30, letterSpacing: -0.8 },
  title: { fontSize: 32, lineHeight: 36, letterSpacing: -0.9 },
  subtitle: { fontSize: 23, lineHeight: 30, letterSpacing: -0.4 },
  body: { fontSize: 17, lineHeight: 28 },
  verse: { fontSize: 19, lineHeight: 32, letterSpacing: 0.1 },
  ui: { fontSize: 15, lineHeight: 22, letterSpacing: 0.2 },
  caption: { fontSize: 12, lineHeight: 16, letterSpacing: 1.2 },
  label: { fontSize: 11, lineHeight: 14, letterSpacing: 1.6 },
} as const;
