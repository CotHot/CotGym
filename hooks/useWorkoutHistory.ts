
import { useState, useEffect, useCallback } from 'react';
import { WorkoutSession } from '../types';
import { db } from '../services/firebase';

export const useWorkoutHistory = (userId: string | null) => {
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setWorkoutHistory([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const collectionRef = db.collection('users').doc(userId).collection('workoutSessions').orderBy('date', 'desc');

    const unsubscribe = collectionRef.onSnapshot(
      (snapshot: any) => {
        const historyData = snapshot.docs.map((doc: any) => ({
          id: doc.id,
          ...doc.data(),
        })) as WorkoutSession[];
        setWorkoutHistory(historyData);
        setLoading(false);
      },
      (error: any) => {
        console.error("Error fetching workout history:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  const addWorkoutSession = useCallback(async (session: WorkoutSession) => {
    if (!userId) return;
    const { id, ...sessionData } = session; // Firestore will generate its own ID
    try {
      await db.collection('users').doc(userId).collection('workoutSessions').add(sessionData);
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  }, [userId]);

  const updateWorkoutSession = useCallback(async (updatedSession: WorkoutSession) => {
    if (!userId || !updatedSession.id) return;
    const { id, ...sessionData } = updatedSession;
    try {
      await db.collection('users').doc(userId).collection('workoutSessions').doc(id).set(sessionData);
    } catch (error)      {
      console.error("Error updating document: ", error);
    }
  }, [userId]);

  const deleteWorkoutSession = useCallback(async (sessionId: string) => {
    if (!userId) return;
    try {
      await db.collection('users').doc(userId).collection('workoutSessions').doc(sessionId).delete();
    } catch(error) {
      console.error("Error deleting document: ", error);
    }
  }, [userId]);

  return {
    workoutHistory,
    loading,
    addWorkoutSession,
    updateWorkoutSession,
    deleteWorkoutSession,
  };
};
