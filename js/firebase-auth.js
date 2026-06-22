/**
 * Firebase Authentication Module
 * Handles login, registration, and session management
 */

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { 
  getAuth, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
  signOut,
  onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

let auth, db, currentUser = null;

/**
 * Initialize Firebase Auth & Firestore
 */
export async function initFirebase() {
  const app = initializeApp(APP_CONFIG.firebase);
  auth = getAuth(app);
  db = getFirestore(app);

  // Listen for auth state changes
  onAuthStateChanged(auth, async (user) => {
    currentUser = user;
    if (user) {
      await ensureUserDocument(user);
      window.NW_EVENTS?.emit('auth:login', user);
    } else {
      window.NW_EVENTS?.emit('auth:logout');
    }
  });

  return { auth, db };
}

/**
 * Ensure user document exists in Firestore
 */
async function ensureUserDocument(user) {
  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || 'Usuario',
      photoURL: user.photoURL || null,
      plan: 'free',
      createdAt: new Date().toISOString(),
      quotaUsedToday: {
        downloads: 0,
        downloadMinutes: 0,
        renderMinutes: 0
      },
      quotaResetAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      totalDownloads: 0,
      totalRenderMinutes: 0,
      lastRenderAt: null,
      settings: {
        theme: 'dark',
        mode: 'basic',
        notifications: true
      }
    });
  }
}

/**
 * Register with Email & Password
 */
export async function registerWithEmail(email, password) {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    return { success: true, user: result.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Login with Email & Password
 */
export async function loginWithEmail(email, password) {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: result.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Login with Google
 */
export async function loginWithGoogle() {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    return { success: true, user: result.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Login with GitHub
 */
export async function loginWithGithub() {
  try {
    const provider = new GithubAuthProvider();
    const result = await signInWithPopup(auth, provider);
    return { success: true, user: result.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Logout
 */
export async function logout() {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Get current user
 */
export function getCurrentUser() {
  return currentUser;
}

/**
 * Get user profile from Firestore
 */
export async function getUserProfile() {
  if (!currentUser) return null;
  try {
    const userRef = doc(db, 'users', currentUser.uid);
    const userSnap = await getDoc(userRef);
    return userSnap.exists() ? userSnap.data() : null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

/**
 * Update user quota usage
 */
export async function updateQuotaUsage(downloads = 0, downloadMinutes = 0) {
  if (!currentUser) return false;
  try {
    const userRef = doc(db, 'users', currentUser.uid);
    await updateDoc(userRef, {
      'quotaUsedToday.downloads': increment(downloads),
      'quotaUsedToday.downloadMinutes': increment(downloadMinutes),
      'totalDownloads': increment(downloads),
      'totalRenderMinutes': increment(downloadMinutes),
      'lastRenderAt': new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error('Error updating quota:', error);
    return false;
  }
}

/**
 * Check if user can render
 */
export async function canUserRender(durationSeconds) {
  if (!APP_CONFIG.features.quotaEnforcement) return true;
  if (!currentUser) return false;

  try {
    const profile = await getUserProfile();
    if (!profile) return false;

    const plan = profile.plan || 'free';
    const quota = APP_CONFIG.quotas[plan];
    const durationMinutes = Math.ceil(durationSeconds / 60);

    // Check duration limit
    if (durationSeconds > quota.maxDurationPerFile) {
      return { allowed: false, reason: 'duration_too_long' };
    }

    // Check daily limits
    if (profile.quotaUsedToday.downloads >= quota.dailyDownloads) {
      return { allowed: false, reason: 'daily_downloads_exceeded' };
    }

    if (profile.quotaUsedToday.downloadMinutes + durationMinutes > quota.dailyDownloadMinutes) {
      return { allowed: false, reason: 'daily_minutes_exceeded' };
    }

    return { allowed: true };
  } catch (error) {
    console.error('Error checking quota:', error);
    return { allowed: false, reason: 'error' };
  }
}

/**
 * Event Emitter (simple pub/sub)
 */
window.NW_EVENTS = {
  listeners: {},
  on(event, callback) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
  },
  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(cb => cb(data));
    }
  }
};

// Initialize Firebase when module loads
initFirebase().catch(console.error);