export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  points: number;
  weeklyPoints?: number;
  lastActiveWeek?: string; // Format: "YYYY-WW"
  createdAt: any;
}

export type Tab = 'home' | 'tasks' | 'athkar' | 'groups' | 'assistant';

export interface Task {
  id: string;
  userId: string;
  title: string;
  category: 'work' | 'study' | 'sport' | 'worship' | 'other';
  completed: boolean;
  isPriority?: boolean;
  groupId?: string;
  time?: string;
  date: string;
  createdAt: any;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  inviteCode: string;
  creatorId: string;
  members: string[];
  createdAt: any;
}

export interface Message {
  id: string;
  groupId?: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: any;
}

export interface AthkarItem {
  id: string;
  text: string;
  count: number;
  total: number;
}

export interface AthkarProgress {
  userId: string;
  date: string;
  thikrId: string;
  count: number;
  target: number;
  updatedAt: any;
}
