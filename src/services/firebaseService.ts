import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  deleteDoc,
  serverTimestamp, 
  onSnapshot,
  orderBy,
  limit,
  Timestamp,
  increment
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { signOut, updateProfile } from 'firebase/auth';
import { Task, UserProfile, Group, Message, AthkarProgress } from '../types';

export const getLeaderboard = (sortBy: 'points' | 'weeklyPoints' = 'points', callback: (users: UserProfile[]) => void) => {
  const q = query(collection(db, 'users'), orderBy(sortBy, 'desc'), limit(10));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile)));
  });
};

const getCurrentWeekString = () => {
  const d = new Date();
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const year = d.getUTCFullYear();
  const week = Math.ceil((((d.getTime() - new Date(Date.UTC(year, 0, 1)).getTime()) / 86400000) + 1) / 7);
  return `${year}-${week.toString().padStart(2, '0')}`;
};

export const checkAndResetWeeklyPoints = async (uid: string) => {
  const userRef = doc(db, 'users', uid);
  const currentWeek = getCurrentWeekString();
  
  try {
    const snap = await getDocs(query(collection(db, 'users'), where('uid', '==', uid)));
    if (!snap.empty) {
      const userData = snap.docs[0].data() as UserProfile;
      if (userData.lastActiveWeek !== currentWeek) {
        await updateDoc(userRef, {
          weeklyPoints: 0,
          lastActiveWeek: currentWeek,
          updatedAt: serverTimestamp()
        });
      }
    }
  } catch (e) {
    console.error("Error resetting weekly points:", e);
  }
};

// Error handling helper as per instructions
export const handleFirestoreError = (error: any, operation: string, path: string | null = null) => {
  if (error?.code === 'permission-denied') {
    const errorInfo = {
      error: error.message,
      operationType: operation,
      path: path,
      authInfo: {
        userId: auth.currentUser?.uid || 'anonymous',
        email: auth.currentUser?.email || 'none',
        emailVerified: auth.currentUser?.emailVerified || false,
        isAnonymous: auth.currentUser?.isAnonymous || false,
        providerInfo: auth.currentUser?.providerData.map(p => ({
          providerId: p.providerId,
          displayName: p.displayName || '',
          email: p.email || ''
        })) || []
      }
    };
    throw new Error(JSON.stringify(errorInfo));
  }
  throw error;
};

// User Profile
export const syncUserProfile = async (user: any) => {
  const userRef = doc(db, 'users', user.uid);
  const snap = await getDocs(query(collection(db, 'users'), where('uid', '==', user.uid)));
  
  if (snap.empty) {
    await setDoc(userRef, {
      uid: user.uid,
      displayName: user.displayName || 'User',
      email: user.email,
      photoURL: user.photoURL || '',
      points: 0,
      weeklyPoints: 0,
      lastActiveWeek: getCurrentWeekString(),
      createdAt: serverTimestamp()
    });
  }
};

export const getUserProfile = (uid: string, callback: (profile: UserProfile) => void) => {
  return onSnapshot(doc(db, 'users', uid), (doc) => {
    if (doc.exists()) {
      callback(doc.data() as UserProfile);
    }
  });
};

// Tasks
export const addTask = async (userId: string, task: Partial<Task>) => {
  const taskRef = collection(db, 'tasks');
  try {
    await addDoc(taskRef, {
      ...task,
      userId,
      completed: false,
      isPriority: task.isPriority || false,
      groupId: task.groupId || null,
      createdAt: serverTimestamp(),
      date: new Date().toISOString().split('T')[0]
    });
  } catch (e) {
    handleFirestoreError(e, 'create', 'tasks');
  }
};

export const updateTaskStatus = async (taskId: string, completed: boolean) => {
  const taskRef = doc(db, 'tasks', taskId);
  try {
    await updateDoc(taskRef, { 
      completed,
      updatedAt: serverTimestamp()
    });
    
    // If completed, increment points
    if (completed && auth.currentUser) {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, { 
        points: increment(10),
        weeklyPoints: increment(10)
      });
    }
  } catch (e) {
    handleFirestoreError(e, 'update', `tasks/${taskId}`);
  }
};

export const deleteTask = async (taskId: string) => {
  const taskRef = doc(db, 'tasks', taskId);
  try {
    await deleteDoc(taskRef);
  } catch (e) {
    handleFirestoreError(e, 'delete', `tasks/${taskId}`);
  }
};

export const updateUserPhoto = async (photoURL: string) => {
  if (!auth.currentUser) return;
  try {
    await updateProfile(auth.currentUser, { photoURL });
    const userRef = doc(db, 'users', auth.currentUser.uid);
    await updateDoc(userRef, { photoURL });
  } catch (e) {
    handleFirestoreError(e, 'update', `users/${auth.currentUser.uid}`);
  }
};

export const getTasks = (userId: string, callback: (tasks: Task[]) => void) => {
  const q = query(
    collection(db, 'tasks'), 
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(q, (snap) => {
    const tasks = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
    callback(tasks);
  });
};

export const getGroupTasks = (groupId: string, callback: (tasks: Task[]) => void) => {
  const q = query(
    collection(db, 'tasks'), 
    where('groupId', '==', groupId),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task)));
  });
};

// Groups
export const createGroup = async (userId: string, name: string, description: string) => {
  const inviteCode = Math.random().toString(36).substring(2, 10).toUpperCase();
  try {
    const groupRef = await addDoc(collection(db, 'groups'), {
      name,
      description,
      creatorId: userId,
      inviteCode,
      members: [userId],
      createdAt: serverTimestamp()
    });
    return groupRef.id;
  } catch (e) {
    handleFirestoreError(e, 'create', 'groups');
  }
};

export const joinGroupByCode = async (userId: string, code: string) => {
  try {
    const q = query(collection(db, 'groups'), where('inviteCode', '==', code));
    const snap = await getDocs(q);
    if (snap.empty) throw new Error('Invalid invite code');
    
    const groupDoc = snap.docs[0];
    const members = groupDoc.data().members || [];
    if (!members.includes(userId)) {
      await updateDoc(doc(db, 'groups', groupDoc.id), {
        members: [...members, userId]
      });
    }
    return groupDoc.id;
  } catch (e) {
    handleFirestoreError(e, 'update', 'groups/join');
  }
};

export const getGroups = (userId: string, callback: (groups: Group[]) => void) => {
  const q = query(collection(db, 'groups'), where('members', 'array-contains', userId));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Group)));
  });
};

// Messages
export const sendMessage = async (groupId: string, senderId: string, senderName: string, text: string) => {
  try {
    await addDoc(collection(db, 'groups', groupId, 'messages'), {
      groupId,
      senderId,
      senderName,
      text,
      createdAt: serverTimestamp()
    });
  } catch (e) {
    handleFirestoreError(e, 'create', `groups/${groupId}/messages`);
  }
};

export const getMessages = (groupId: string, callback: (messages: Message[]) => void) => {
  const q = query(
    collection(db, 'groups', groupId, 'messages'), 
    orderBy('createdAt', 'asc'),
    limit(100)
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message)));
  });
};

// Athkar Progress
export const updateAthkarProgress = async (userId: string, thikrId: string, count: number, target: number) => {
  const date = new Date().toISOString().split('T')[0];
  const progressId = `${userId}_${date}_${thikrId}`;
  const ref = doc(db, 'athkarProgress', progressId);
  
  try {
    await setDoc(ref, {
      userId,
      date,
      thikrId,
      count,
      target,
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (e) {
    handleFirestoreError(e, 'write', `athkarProgress/${progressId}`);
  }
};

export const getAthkarProgress = (userId: string, callback: (progress: AthkarProgress[]) => void) => {
  const date = new Date().toISOString().split('T')[0];
  const q = query(
    collection(db, 'athkarProgress'), 
    where('userId', '==', userId),
    where('date', '==', date)
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(doc => doc.data() as AthkarProgress));
  });
};

// Assistant Messages
export const saveAssistantMessage = async (userId: string, message: Message) => {
  try {
    await addDoc(collection(db, 'assistantMessages', userId, 'chat'), {
      ...message,
      createdAt: serverTimestamp()
    });
  } catch (e) {
    handleFirestoreError(e, 'create', `assistantMessages/${userId}/chat`);
  }
};

export const getAssistantMessages = (userId: string, callback: (messages: Message[]) => void) => {
  const q = query(
    collection(db, 'assistantMessages', userId, 'chat'), 
    orderBy('createdAt', 'asc'),
    limit(50)
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message)));
  });
};

export const deleteAssistantHistory = async (userId: string) => {
  try {
    const q = query(collection(db, 'assistantMessages', userId, 'chat'));
    const snap = await getDocs(q);
    const deleteOps = snap.docs.map(d => deleteDoc(d.ref));
    await Promise.all(deleteOps);
  } catch (e) {
    handleFirestoreError(e, 'delete', `assistantMessages/${userId}/chat`);
  }
};
