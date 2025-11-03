import { useState, useEffect, useCallback } from 'react';
import { WorkoutTemplate, ActiveWorkoutState } from '../types';

const ACTIVE_WORKOUT_KEY = 'activeWorkoutState';

export const useActiveWorkout = () => {
  const [activeWorkout, setActiveWorkout] = useState<ActiveWorkoutState | null>(null);
  const [isResumable, setIsResumable] = useState(false);

  // Load from localStorage on initial mount
  useEffect(() => {
    try {
      const savedState = localStorage.getItem(ACTIVE_WORKOUT_KEY);
      if (savedState) {
        // Don't set the active workout immediately, instead, set a flag
        // to prompt the user to resume.
        setIsResumable(true);
      }
    } catch (error) {
      console.error("Could not load active workout state", error);
    }
  }, []);

  // This effect runs when the user decides to resume.
  useEffect(() => {
    if (isResumable && !activeWorkout) {
        try {
            const savedState = localStorage.getItem(ACTIVE_WORKOUT_KEY);
            if (savedState) {
                setActiveWorkout(JSON.parse(savedState));
            } else {
                // If state is gone for some reason, reset the flag
                setIsResumable(false);
            }
        } catch (error) {
            console.error("Could not parse active workout state", error);
            setIsResumable(false);
        }
    }
  }, [isResumable, activeWorkout]);


  const saveState = (state: ActiveWorkoutState | null) => {
    try {
      if (state) {
        localStorage.setItem(ACTIVE_WORKOUT_KEY, JSON.stringify(state));
      } else {
        localStorage.removeItem(ACTIVE_WORKOUT_KEY);
      }
    } catch (error) {
      console.error("Could not save active workout state", error);
    }
  };

  const startNewWorkout = useCallback((template: WorkoutTemplate) => {
    const newState: ActiveWorkoutState = {
      template,
      sessionLogs: {},
      currentExerciseIndex: 0,
      currentSetIndex: 0,
      startTime: new Date().toISOString(),
      timerEndTime: null,
    };
    setActiveWorkout(newState);
    saveState(newState);
    setIsResumable(false); // New workout overrides resumable state
  }, []);

  const updateWorkoutState = useCallback((updates: Partial<ActiveWorkoutState>) => {
    setActiveWorkout(prevState => {
      if (!prevState) return null;
      const newState = { ...prevState, ...updates };
      saveState(newState);
      return newState;
    });
  }, []);

  const clearActiveWorkout = useCallback(() => {
    setActiveWorkout(null);
    saveState(null);
    setIsResumable(false);
  }, []);

  return {
    activeWorkout,
    isResumable,
    startNewWorkout,
    updateWorkoutState,
    clearActiveWorkout,
  };
};
