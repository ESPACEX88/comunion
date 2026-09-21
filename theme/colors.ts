export type ThemeColors = {
  cream: string;
  creamDeep: string;
  paper: string;
  charcoal: string;
  charcoalSoft: string;
  ink: string;
  amber: string;
  amberDeep: string;
  amberSoft: string;
  olive: string;
  oliveSoft: string;
  terracotta: string;
  line: string;
  white: string;
  overlay: string;
  tabBar: string;
  tabActive: string;
  tabInactive: string;
  streakBg: string;
  statusPendienteBg: string;
  statusPendienteFg: string;
  statusCursoBg: string;
  statusCursoFg: string;
  statusDoneBg: string;
  statusDoneFg: string;
};

export const lightColors: ThemeColors = {
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
  tabBar: '#2A241C',
  tabActive: '#E8C48A',
  tabInactive: '#8A8176',
  streakBg: '#2A241C',
  statusPendienteBg: '#EFE3CF',
  statusPendienteFg: '#5C5348',
  statusCursoBg: '#F3DEC0',
  statusCursoFg: '#9A5C18',
  statusDoneBg: '#E0E6D4',
  statusDoneFg: '#5C6844',
};

export const darkColors: ThemeColors = {
  cream: '#1C1712',
  creamDeep: '#16110D',
  paper: '#2A241C',
  charcoal: '#F3EADA',
  charcoalSoft: '#C9BBA8',
  ink: '#F3EADA',
  amber: '#D4923F',
  amberDeep: '#E8C48A',
  amberSoft: '#C47B2A',
  olive: '#A8B57C',
  oliveSoft: '#8A946F',
  terracotta: '#D48A72',
  line: '#3F362C',
  white: '#1C1712',
  overlay: 'rgba(10, 8, 6, 0.62)',
  tabBar: '#16110D',
  tabActive: '#E8C48A',
  tabInactive: '#8A8176',
  streakBg: '#241E18',
  statusPendienteBg: '#3A3228',
  statusPendienteFg: '#E8C48A',
  statusCursoBg: '#3D2E1A',
  statusCursoFg: '#E0A04A',
  statusDoneBg: '#2C3324',
  statusDoneFg: '#A8B57C',
};

/** Paleta clara por defecto (avatares y tipos). */
export const colors = lightColors;

export type ColorName = keyof ThemeColors;

export const memberHues = {
  amber: '#C47B2A',
  olive: '#5C6844',
  terracotta: '#A65D46',
  charcoal: '#5C5348',
} as const;

export type MemberHue = keyof typeof memberHues;
