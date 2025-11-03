
import { ExerciseDefinition, WorkoutTemplate, WorkoutSession } from './types';

// Exercise Definitions
export const EXERCISES: { [key: string]: ExerciseDefinition } = {
  'abdos_maquina': { id: 'abdos_maquina', name: 'Abdos (Máquina)', muscleGroup: 'Abdos', defaultRestTimer: 60 },
  'press_pecho_plano_maquina': { id: 'press_pecho_plano_maquina', name: 'Press Pecho Plano (Máquina)', muscleGroup: 'Pecho', defaultRestTimer: 150 },
  'apertura_inclinada_maquina': { id: 'apertura_inclinada_maquina', name: 'Apertura Inclinada (Máquina)', muscleGroup: 'Pecho', defaultRestTimer: 150 },
  'press_hombro_inclinado_maquina': { id: 'press_hombro_inclinado_maquina', name: 'Press Hombro (Máquina Inclinada)', muscleGroup: 'Hombro', defaultRestTimer: 150 },
  'elevacion_lateral_maquina': { id: 'elevacion_lateral_maquina', name: 'Elevación Lateral (Máquina)', muscleGroup: 'Hombro', defaultRestTimer: 150 },
  'ext_triceps_polea_1_brazo_d': { id: 'ext_triceps_polea_1_brazo_d', name: 'Ext. Tríceps Polea (1 Brazo) - Derecho', muscleGroup: 'Tríceps', defaultRestTimer: 150 },
  'ext_triceps_polea_1_brazo_i': { id: 'ext_triceps_polea_1_brazo_i', name: 'Ext. Tríceps Polea (1 Brazo) - Izquierdo', muscleGroup: 'Tríceps', defaultRestTimer: 150 },
  'fondos_sentado_maquina': { id: 'fondos_sentado_maquina', name: 'Fondos Sentado (Máquina)', muscleGroup: 'Tríceps', defaultRestTimer: 150 },
  'jalon_pecho_neutro': { id: 'jalon_pecho_neutro', name: 'Jalón al Pecho (Agarre Neutro)', muscleGroup: 'Espalda', defaultRestTimer: 150 },
  'remo_sentado_maquina': { id: 'remo_sentado_maquina', name: 'Remo Sentado (Máquina)', muscleGroup: 'Espalda', defaultRestTimer: 150 },
  'curl_biceps_polea_recta': { id: 'curl_biceps_polea_recta', name: 'Curl Bíceps Polea (Barra Recta)', muscleGroup: 'Bíceps', defaultRestTimer: 150 },
  'curl_martillo_polea': { id: 'curl_martillo_polea', name: 'Curl Martillo (Polea/Cuerda)', muscleGroup: 'Bíceps', defaultRestTimer: 150 },
  'curl_muneca_polea_recta': { id: 'curl_muneca_polea_recta', name: 'Curl Muñeca Polea (Barra Recta)', muscleGroup: 'Antebrazo', defaultRestTimer: 90 },
  'curl_muneca_inverso_polea': { id: 'curl_muneca_inverso_polea', name: 'Curl Muñeca Inverso Polea (Barra)', muscleGroup: 'Antebrazo', defaultRestTimer: 90 },
  'encogimientos_mancuernas': { id: 'encogimientos_mancuernas', name: 'Encogimientos (Mancuernas, de pie)', muscleGroup: 'Trapecio', defaultRestTimer: 60 },
  'press_pecho_inclinado_maquina': { id: 'press_pecho_inclinado_maquina', name: 'Press de Pecho Inclinado (Máquina)', muscleGroup: 'Pecho', defaultRestTimer: 150 },
  'aperturas_mancuernas_hombro': { id: 'aperturas_mancuernas_hombro', name: 'Aperturas con Mancuernas (hombro)', muscleGroup: 'Hombro', defaultRestTimer: 150 },
  'press_hombro_maquina': { id: 'press_hombro_maquina', name: 'Press de Hombro (Máquina)', muscleGroup: 'Hombro', defaultRestTimer: 150 },
  'ext_triceps_polea_curvo': { id: 'ext_triceps_polea_curvo', name: 'Ext. Tríceps Polea (Agarre Curvo)', muscleGroup: 'Tríceps', defaultRestTimer: 150 },
  'ext_triceps_polea_recta': { id: 'ext_triceps_polea_recta', name: 'Ext. Tríceps Polea (Barra Recta)', muscleGroup: 'Tríceps', defaultRestTimer: 150 },
  'jalon_pecho_maquina_espalda': { id: 'jalon_pecho_maquina_espalda', name: 'Jalón al Pecho (Máquina - Espalda)', muscleGroup: 'Espalda', defaultRestTimer: 150 },
  'remo_sentado_maquina_espalda': { id: 'remo_sentado_maquina_espalda', name: 'Remo Sentado (Máquina - Espalda)', muscleGroup: 'Espalda', defaultRestTimer: 150 },
  'curl_biceps_inclinado_manc': { id: 'curl_biceps_inclinado_manc', name: 'Curl de Bíceps Inclinado (Manc.)', muscleGroup: 'Bíceps', defaultRestTimer: 150 },
  'curl_martillo_mancuerna': { id: 'curl_martillo_mancuerna', name: 'Curl Martillo (Mancuerna)', muscleGroup: 'Bíceps', defaultRestTimer: 150 },
  'curl_muneca_mancuerna_d': { id: 'curl_muneca_mancuerna_d', name: 'Curl de Muñeca (Mancuerna) - Derecho', muscleGroup: 'Antebrazo', defaultRestTimer: 90 },
  'curl_muneca_mancuerna_i': { id: 'curl_muneca_mancuerna_i', name: 'Curl de Muñeca (Mancuerna) - Izquierdo', muscleGroup: 'Antebrazo', defaultRestTimer: 90 },
  'encogimientos_manc_trapecio_d': { id: 'encogimientos_manc_trapecio_d', name: 'Encogimientos (Manc. - Trapecio) - Derecho', muscleGroup: 'Trapecio', defaultRestTimer: 60 },
  'encogimientos_manc_trapecio_i': { id: 'encogimientos_manc_trapecio_i', name: 'Encogimientos (Manc. - Trapecio) - Izquierdo', muscleGroup: 'Trapecio', defaultRestTimer: 60 },
  'encogimientos_sentado_manc': { id: 'encogimientos_sentado_manc', name: 'Encogimientos Sentado (Manc.)', muscleGroup: 'Trapecio', defaultRestTimer: 60 },
};

// Workout Templates
export const WORKOUT_TEMPLATES: WorkoutTemplate[] = [
  {
    id: 'dia_1',
    name: 'Día 1: Abdos, Pecho, Hombro, Tríceps',
    exercises: [
      { id: 'd1_e1', exerciseDefinitionId: 'abdos_maquina', order: 1 },
      { id: 'd1_e2', exerciseDefinitionId: 'press_pecho_plano_maquina', order: 2 },
      { id: 'd1_e3', exerciseDefinitionId: 'apertura_inclinada_maquina', order: 3 },
      { id: 'd1_e4', exerciseDefinitionId: 'press_hombro_inclinado_maquina', order: 4 },
      { id: 'd1_e5', exerciseDefinitionId: 'elevacion_lateral_maquina', order: 5 },
      { id: 'd1_e6_d', exerciseDefinitionId: 'ext_triceps_polea_1_brazo_d', order: 6 },
      { id: 'd1_e6_i', exerciseDefinitionId: 'ext_triceps_polea_1_brazo_i', order: 7 },
      { id: 'd1_e7', exerciseDefinitionId: 'fondos_sentado_maquina', order: 8 },
    ],
  },
  {
    id: 'dia_2',
    name: 'Día 2: Abdos, Espalda, Bíceps, Antebrazo, Trapecio',
    exercises: [
      { id: 'd2_e1', exerciseDefinitionId: 'abdos_maquina', order: 1 },
      { id: 'd2_e2', exerciseDefinitionId: 'jalon_pecho_neutro', order: 2 },
      { id: 'd2_e3', exerciseDefinitionId: 'remo_sentado_maquina', order: 3 },
      { id: 'd2_e4', exerciseDefinitionId: 'curl_biceps_polea_recta', order: 4 },
      { id: 'd2_e5', exerciseDefinitionId: 'curl_martillo_polea', order: 5 },
      { id: 'd2_e6', exerciseDefinitionId: 'curl_muneca_polea_recta', order: 6 },
      { id: 'd2_e7', exerciseDefinitionId: 'curl_muneca_inverso_polea', order: 7 },
      { id: 'd2_e8', exerciseDefinitionId: 'encogimientos_mancuernas', order: 8 },
    ],
  },
  {
    id: 'dia_3',
    name: 'Día 3: Abdos, Pecho, Hombro, Tríceps',
    exercises: [
      { id: 'd3_e1', exerciseDefinitionId: 'abdos_maquina', order: 1 },
      { id: 'd3_e2', exerciseDefinitionId: 'press_pecho_inclinado_maquina', order: 2 },
      { id: 'd3_e3', exerciseDefinitionId: 'press_pecho_plano_maquina', order: 3 },
      { id: 'd3_e4', exerciseDefinitionId: 'aperturas_mancuernas_hombro', order: 4 },
      { id: 'd3_e5', exerciseDefinitionId: 'press_hombro_maquina', order: 5 },
      { id: 'd3_e6', exerciseDefinitionId: 'ext_triceps_polea_curvo', order: 6 },
      { id: 'd3_e7', exerciseDefinitionId: 'ext_triceps_polea_recta', order: 7 },
    ],
  },
  {
    id: 'dia_4',
    name: 'Día 4: Abdos, Espalda, Bíceps, Antebrazo, Trapecio',
    exercises: [
      { id: 'd4_e1', exerciseDefinitionId: 'abdos_maquina', order: 1 },
      { id: 'd4_e2', exerciseDefinitionId: 'jalon_pecho_maquina_espalda', order: 2 },
      { id: 'd4_e3', exerciseDefinitionId: 'remo_sentado_maquina_espalda', order: 3 },
      { id: 'd4_e4', exerciseDefinitionId: 'curl_biceps_inclinado_manc', order: 4 },
      { id: 'd4_e5', exerciseDefinitionId: 'curl_martillo_mancuerna', order: 5 },
      { id: 'd4_e6_d', exerciseDefinitionId: 'curl_muneca_mancuerna_d', order: 6 },
      { id: 'd4_e6_i', exerciseDefinitionId: 'curl_muneca_mancuerna_i', order: 7 },
      { id: 'd4_e7_d', exerciseDefinitionId: 'encogimientos_manc_trapecio_d', order: 8 },
      { id: 'd4_e7_i', exerciseDefinitionId: 'encogimientos_manc_trapecio_i', order: 9 },
      { id: 'd4_e8', exerciseDefinitionId: 'encogimientos_sentado_manc', order: 10 },
    ],
  },
];

// FIX: Export INITIAL_WORKOUT_HISTORY to resolve import error in services/storageService.ts
export const INITIAL_WORKOUT_HISTORY: WorkoutSession[] = [];
