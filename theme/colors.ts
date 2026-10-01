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
  tabOnBg: string;
  tabOnFg: string;
  streakBg: string;
  statusPendienteBg: string;
  statusPendienteFg: string;
  statusCursoBg: string;
  statusCursoFg: string;
  statusDoneBg: string;
  statusDoneFg: string;
  glass: string;
  glassStrong: string;
  glassBorder: string;
  blobAmber: string;
  blobViolet: string;
  glowFrom: string;
  glowTo: string;
  glowFg: string;
  glowShadow: string;
  danger: string;
  dangerBg: string;
  dangerBorder: string;
};

export const lightColors: ThemeColors = {
  cream: '#F3EADA',
  creamDeep: '#E8D9C4',
  paper: 'rgba(255, 252, 246, 0.72)',
  charcoal: '#2A241C',
  charcoalSoft: '#5C5348',
  ink: '#1C1712',
  amber: '#C47B2A',
  amberDeep: '#9A5C18',
  amberSoft: '#E8C48A',
  olive: '#5C6844',
  oliveSoft: '#8A946F',
  terracotta: '#A65D46',
  line: 'rgba(42, 36, 28, 0.12)',
  white: '#FFFCF6',
  overlay: 'rgba(28, 23, 18, 0.45)',
  tabBar: 'rgba(28, 23, 18, 0.78)',
  tabActive: '#E8C48A',
  tabInactive: 'rgba(255, 252, 246, 0.45)',
  tabOnBg: '#FFFCF6',
  tabOnFg: '#0A090C',
  streakBg: '#2A241C',
  statusPendienteBg: '#EFE3CF',
  statusPendienteFg: '#5C5348',
  statusCursoBg: '#F3DEC0',
  statusCursoFg: '#9A5C18',
  statusDoneBg: '#E0E6D4',
  statusDoneFg: '#5C6844',
  glass: 'rgba(255, 252, 246, 0.55)',
  glassStrong: 'rgba(255, 252, 246, 0.78)',
  glassBorder: 'rgba(42, 36, 28, 0.12)',
  blobAmber: 'rgba(245, 158, 11, 0.38)',
  blobViolet: 'rgba(124, 58, 237, 0.12)',
  glowFrom: '#FBBF24',
  glowTo: '#F97316',
  glowFg: '#1A0F05',
  glowShadow: 'rgba(249, 115, 22, 0.35)',
  danger: '#B45353',
  dangerBg: 'rgba(180, 83, 83, 0.08)',
  dangerBorder: 'rgba(180, 83, 83, 0.35)',
};

export const darkColors: ThemeColors = {
  cream: '#07060B',
  creamDeep: '#0C0A10',
  paper: 'rgba(255, 255, 255, 0.08)',
  charcoal: '#FAF8F5',
  charcoalSoft: 'rgba(250, 248, 245, 0.55)',
  ink: '#FAF8F5',
  amber: '#FBBF24',
  amberDeep: '#FBBF24',
  amberSoft: '#F59E0B',
  olive: '#A8B57C',
  oliveSoft: '#8A946F',
  terracotta: '#FCA5A5',
  line: 'rgba(255, 255, 255, 0.14)',
  white: '#FAF8F5',
  overlay: 'rgba(7, 6, 11, 0.62)',
  tabBar: 'rgba(0, 0, 0, 0.35)',
  tabActive: '#FAF8F5',
  tabInactive: 'rgba(255, 255, 255, 0.4)',
  tabOnBg: '#FFFFFF',
  tabOnFg: '#0A090C',
  streakBg: '#0C0A10',
  statusPendienteBg: 'rgba(255,255,255,0.08)',
  statusPendienteFg: '#FBBF24',
  statusCursoBg: 'rgba(251, 191, 36, 0.16)',
  statusCursoFg: '#FBBF24',
  statusDoneBg: 'rgba(168, 181, 124, 0.18)',
  statusDoneFg: '#A8B57C',
  glass: 'rgba(255, 255, 255, 0.08)',
  glassStrong: 'rgba(255, 255, 255, 0.14)',
  glassBorder: 'rgba(255, 255, 255, 0.14)',
  blobAmber: 'rgba(245, 158, 11, 0.45)',
  blobViolet: 'rgba(124, 58, 237, 0.32)',
  glowFrom: '#FBBF24',
  glowTo: '#F97316',
  glowFg: '#1A0F05',
  glowShadow: 'rgba(249, 115, 22, 0.4)',
  danger: '#FCA5A5',
  dangerBg: 'rgba(248, 113, 113, 0.08)',
  dangerBorder: 'rgba(248, 113, 113, 0.4)',
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
