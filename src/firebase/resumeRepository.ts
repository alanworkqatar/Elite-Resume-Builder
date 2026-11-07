import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './config';
import { ResumeData } from '../types/resume';
import { normalizeResumeData } from '../utils/normalizeResume';

export interface CloudSaveResult {
  success: boolean;
  error?: string;
  timestamp?: number;
}

/**
 * Saves the candidate's master resume and photo into Firestore database.
 * Path: /users/{userId}/resumes/master
 */
export async function saveMasterResumeToCloud(
  userId: string,
  resumeData: ResumeData
): Promise<CloudSaveResult> {
  if (!userId) {
    return { success: false, error: 'User ID is required to save to database.' };
  }

  try {
    const resumeRef = doc(db, 'users', userId, 'resumes', 'master');
    const userRef = doc(db, 'users', userId);

    // Sanitize payload to guarantee plain JSON without undefined values
    const sanitizedResume = JSON.parse(JSON.stringify(resumeData));

    // Update user profile document
    await setDoc(
      userRef,
      {
        userId,
        fullName: resumeData.personal?.fullName || 'Candidate',
        email: resumeData.personal?.email || '',
        headline: resumeData.personal?.headline || '',
        hasPhoto: Boolean(resumeData.personal?.photoUrl),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    // Save complete master resume & photo document
    await setDoc(
      resumeRef,
      {
        id: 'master',
        ownerId: userId,
        ...sanitizedResume,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    console.log(`[Firestore] Successfully saved master resume & photo for user: ${userId}`);
    return { success: true, timestamp: Date.now() };
  } catch (error: any) {
    console.error('[Firestore] Error saving resume to cloud:', error);
    return {
      success: false,
      error: error?.message || 'Failed to save resume to cloud database.',
    };
  }
}

/**
 * Loads the candidate's master resume and photo from Firestore database.
 * Path: /users/{userId}/resumes/master
 */
export async function loadMasterResumeFromCloud(
  userId: string
): Promise<ResumeData | null> {
  if (!userId) return null;

  try {
    const resumeRef = doc(db, 'users', userId, 'resumes', 'master');
    const snapshot = await getDoc(resumeRef);

    if (snapshot.exists()) {
      const data = snapshot.data();
      console.log(`[Firestore] Loaded master resume & photo for user: ${userId}`);
      return normalizeResumeData(data as ResumeData);
    }

    return null;
  } catch (error: any) {
    console.warn('[Firestore] Could not load resume from cloud, will use local copy:', error);
    return null;
  }
}
