import type { MemberHue } from '@/theme';

export type DayStatus = 'pendiente' | 'en_curso' | 'completado';

export type PlanKind = 'group' | 'personal' | 'duo';

export interface VerseLine {
  n: number;
  text: string;
}

export interface FeaturedVerse {
  reference: string;
  text: string;
}

export interface PlanDay {
  id: string;
  dayNumber: number;
  title: string;
  reference: string;
  teaser: string;
  prompt?: string;
  verses: VerseLine[];
  featured: FeaturedVerse;
}

export interface Plan {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  durationLabel: string;
  recommendedFor: PlanKind;
  days: PlanDay[];
}

export interface Member {
  id: string;
  name: string;
  hue: MemberHue;
  isSelf?: boolean;
  isSpecialFriend?: boolean;
}

export type MoodId = 'paz' | 'lucha' | 'gratitud' | 'duda' | 'esperanza';

export interface CheckIn {
  id: string;
  authorId: string;
  date: string;
  mood: MoodId;
  note: string;
}

export interface PrayerRequest {
  id: string;
  authorId: string;
  text: string;
  createdAt: string;
  prayedBy: string[];
}

export interface DuoAnswer {
  id: string;
  authorId: string;
  date: string;
  planDayId: string;
  question: string;
  text: string;
}

export interface HeartVerse {
  id: string;
  authorId: string;
  reference: string;
  text: string;
  note: string;
  createdAt: string;
}

export interface ThreadMessage {
  id: string;
  authorId: string;
  text: string;
  verseRef?: string;
  createdAt: string;
}

export interface GroupInfo {
  id: string;
  name: string;
  inviteCode: string;
}

export interface PersistedState {
  version: 4;
  onboardingComplete: boolean;
  userName: string;
  userId: string | null;
  remoteDuoId: string | null;
  remotePlanId: string | null;
  notificationsEnabled: boolean;
  group: GroupInfo;
  groupPlanId: string;
  personalPlanId: string | null;
  groupPlanStartDate: string;
  personalPlanStartDate: string | null;
  userCompletedDates: string[];
  inProgressDate: string | null;
  personalBest: number;
  groupBest: number;
  thread: ThreadMessage[];
  checkIns: CheckIn[];
  prayerRequests: PrayerRequest[];
  heartVerses: HeartVerse[];
  duoAnswers: DuoAnswer[];
  graceDates: string[];
}

export interface OnboardingDraft {
  name: string;
  mode: 'create' | 'join';
  groupName: string;
  inviteCode: string;
  planId: string;
}

export interface DayProgress {
  done: number;
  total: number;
  completedIds: string[];
  allDone: boolean;
}
