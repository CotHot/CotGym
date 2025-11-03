export interface SetLog {
  setNumber: number;
  weight_kg: number;
  repetitions: number;
}

export interface ExerciseDefinition {
  id: string;
  name: string;
  muscleGroup: string;
  defaultRestTimer: number; // in seconds
}

export interface RoutineExercise {
  id: string; // unique ID for this instance in the routine
  exerciseDefinitionId: string;
  order: number;
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  exercises: RoutineExercise[];
}

export interface WorkoutSession {
  id: string;
  templateId: string;
  date: string; // ISO string
  logs: {
    [key: string]: SetLog[]; // key is routineExerciseId
  };
}

export interface ActiveWorkoutState {
  template: WorkoutTemplate;
  sessionLogs: { [key: string]: SetLog[] };
  currentExerciseIndex: number;
  currentSetIndex: number;
  startTime: string; // ISO string
  timerEndTime: number | null; // Timestamp
}
