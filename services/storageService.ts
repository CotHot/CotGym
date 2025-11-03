import { WorkoutSession } from '../types';
import { INITIAL_WORKOUT_HISTORY } from '../constants';

const HISTORY_KEY = 'workoutHistory';

export const saveWorkoutHistory = (history: WorkoutSession[]): void => {
  try {
    const serializedState = JSON.stringify(history);
    localStorage.setItem(HISTORY_KEY, serializedState);
  } catch (error) {
    console.error("Could not save workout history to local storage", error);
  }
};

export const loadWorkoutHistory = (): WorkoutSession[] => {
  try {
    const serializedState = localStorage.getItem(HISTORY_KEY);
    if (serializedState === null) {
      // If no data, initialize with default and save it
      saveWorkoutHistory(INITIAL_WORKOUT_HISTORY);
      return INITIAL_WORKOUT_HISTORY;
    }
    return JSON.parse(serializedState);
  } catch (error) {
    console.error("Could not load workout history from local storage", error);
    // If loading fails, return the initial data to prevent app crash
    return INITIAL_WORKOUT_HISTORY;
  }
};
