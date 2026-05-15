import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, User as FirebaseUser, signInAnonymously } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { UserProfile } from '../types';
import { handleFirestoreError, OperationType } from '../lib/firestore-utils';

interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  isOnline: boolean;
  isLocalGuest: boolean;
  signIn: () => Promise<void>;
  signInGuest: () => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(() => {
    const saved = localStorage.getItem('lingoleap_local_guest');
    return saved ? JSON.parse(saved) : null;
  });
  const [profile, setProfile] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('lingoleap_profile');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const isLocalGuest = user?.uid.startsWith('local-guest-') || false;

  useEffect(() => {
    const handleStatusChange = () => {
      setIsOnline(navigator.onLine);
      if (navigator.onLine) {
        syncPendingUpdates();
      }
    };
    window.addEventListener('online', handleStatusChange);
    window.addEventListener('offline', handleStatusChange);
    return () => {
      window.removeEventListener('online', handleStatusChange);
      window.removeEventListener('offline', handleStatusChange);
    };
  }, []);

  const syncPendingUpdates = async () => {
    const pendingJson = localStorage.getItem('lingoleap_pending_updates');
    if (!pendingJson) return;

    try {
      const pendingUpdates = JSON.parse(pendingJson);
      if (pendingUpdates.length === 0) return;

      console.log('Syncing pending updates...', pendingUpdates.length);
      
      // We take the last profile state if we have a user
      const currentUser = auth.currentUser;
      if (currentUser && profile && !isLocalGuest) {
        const userRef = doc(db, 'users', currentUser.uid);
        try {
          await setDoc(userRef, profile, { merge: true });
          localStorage.removeItem('lingoleap_pending_updates');
          console.log('Sync complete!');
        } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, `users/${currentUser.uid}`);
        }
      }
    } catch (e) {
      console.error('Sync failed', e);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        if (navigator.onLine) {
          // Look up profile if online
          const path = `users/${firebaseUser.uid}`;
          try {
            const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
            if (userDoc.exists()) {
              const data = userDoc.data() as UserProfile;
              setProfile(data);
              localStorage.setItem('lingoleap_profile', JSON.stringify(data));
            }
          } catch (error) {
            handleFirestoreError(error, OperationType.GET, path);
          }
        }
      } else {
        setProfile(null);
        localStorage.removeItem('lingoleap_profile');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Real-time profile updates (only when online and real user)
  useEffect(() => {
    if (!user || !isOnline || isLocalGuest) return;
    const path = `users/${user.uid}`;
    const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as UserProfile;
        setProfile(data);
        localStorage.setItem('lingoleap_profile', JSON.stringify(data));
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    });
    return () => unsubscribe();
  }, [user, isOnline, isLocalGuest]);

  const signIn = async () => {
    if (!isOnline) {
      alert("You need to be online to sign in for the first time!");
      return;
    }
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const signInGuest = async () => {
    try {
      await signInAnonymously(auth);
    } catch (error: any) {
      if (error.code === 'auth/admin-restricted-operation') {
        // Fallback for when Anonymous Auth is not enabled in Firebase Console yet
        console.warn("Anonymous Auth is not enabled in Firebase Console. Using local-only guest mode.");
        // We create a mock user object for the local session
        const mockUser = {
          uid: 'local-guest-' + Math.random().toString(36).substr(2, 9),
          isAnonymous: true,
          email: null,
          displayName: 'Guest Explorer',
        } as any;
        setUser(mockUser);
        localStorage.setItem('lingoleap_local_guest', JSON.stringify(mockUser));
        setLoading(false);
      } else {
        console.error("Error signing in as guest:", error);
        alert("Oops! Could not start guest mode. Please check your internet!");
      }
    }
  };

  const signOut = async () => {
    await auth.signOut();
    localStorage.removeItem('lingoleap_local_guest');
    localStorage.removeItem('lingoleap_profile');
    localStorage.removeItem('lingoleap_pending_updates');
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    const updatedProfile = { ...profile, ...data } as UserProfile;
    setProfile(updatedProfile);
    localStorage.setItem('lingoleap_profile', JSON.stringify(updatedProfile));

    if (user && isOnline && !isLocalGuest) {
      const path = `users/${user.uid}`;
      try {
        const userRef = doc(db, 'users', user.uid);
        await setDoc(userRef, updatedProfile, { merge: true });
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, path);
      }
    } else if (user && !isOnline) {
      const pendingJson = localStorage.getItem('lingoleap_pending_updates');
      const pending = pendingJson ? JSON.parse(pendingJson) : [];
      pending.push({ ...data, timestamp: Date.now() });
      localStorage.setItem('lingoleap_pending_updates', JSON.stringify(pending));
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, isOnline, isLocalGuest, signIn, signInGuest, signOut, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
