export const colors = {
  cream: '#F3EADA',
  creamDeep: '#E8D9C4',
  paper: '#FBF6EC',
  charcoal: '#2A241C',
  charcoalSoft: '#5C5348',
  ink: '#1C1712',
  amber: '#C47B2A',
  amberDeep: '#9A5C18',
  amberSoft: '#E8C48A',
  olive: '#5C6844',
  oliveSoft: '#8A946F',
  terracotta: '#A65D46',
  line: '#D4C5AE',
  white: '#FFFCF6',
  overlay: 'rgba(28, 23, 18, 0.55)',
} as const;

export type ColorName = keyof typeof colors;

export const memberHues = {
  amber: colors.amber,
  olive: colors.olive,
  terracotta: colors.terracotta,
  charcoal: colors.charcoalSoft,
} as const;

export type MemberHue = keyof typeof memberHues;
