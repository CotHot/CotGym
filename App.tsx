import React, { useState, useMemo, useEffect } from 'react';
import { WorkoutSession, WorkoutTemplate, SetLog } from './types';
import { WORKOUT_TEMPLATES, EXERCISES } from './constants';
import { useWorkoutHistory } from './hooks/useWorkoutHistory';
import { useActiveWorkout } from './hooks/useActiveWorkout';
import { auth } from './services/firebase';

// Declare jsPDF types for global script
declare const jspdf: any;

type View = 'DASHBOARD' | 'WORKOUT' | 'HISTORY' | 'SUMMARY';

// --- Main App Component ---
export default function App({ user }: { user: any }) {
  const [currentView, setCurrentView] = useState<View>('DASHBOARD');
  const { 
    activeWorkout, 
    startNewWorkout, 
    updateWorkoutState, 
    clearActiveWorkout,
    isResumable
  } = useActiveWorkout();
  
  const { workoutHistory, addWorkoutSession, updateWorkoutSession, deleteWorkoutSession, loading: historyLoading } = useWorkoutHistory(user.uid);
  const [lastSessionSummary, setLastSessionSummary] = useState<WorkoutSession | null>(null);

  useEffect(() => {
    // If an active workout exists when the app loads, switch to the workout view
    if (activeWorkout) {
      setCurrentView('WORKOUT');
    }
  }, []); // Run only once on mount

  const handleStartWorkout = (template: WorkoutTemplate) => {
    startNewWorkout(template);
    setCurrentView('WORKOUT');
  };

  const endWorkout = (session: WorkoutSession) => {
    addWorkoutSession(session);
    setLastSessionSummary(session);
    clearActiveWorkout();
    setCurrentView('SUMMARY');
  };
  
  const handleLogout = () => {
    auth.signOut();
  };

  const navigateTo = (view: View) => {
      if (view === 'DASHBOARD' && activeWorkout) {
          setCurrentView('WORKOUT');
      } else {
          setCurrentView(view);
      }
  };

  const handleResumeWorkout = () => {
    if (isResumable) {
      // The hook already loaded the state, just need to set the view
      setCurrentView('WORKOUT');
    }
  };

  const handleDiscardWorkout = () => {
    if(window.confirm("Are you sure you want to discard this workout progress?")){
      clearActiveWorkout();
    }
  };


  const renderView = () => {
    if (isResumable && !activeWorkout) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center p-4">
          <h2 className="text-2xl font-bold text-blue-400 mb-4">Workout in Progress</h2>
          <p className="text-lg text-gray-300 mb-6">You have an unfinished workout. Would you like to resume?</p>
          <div className="flex gap-4">
            <button onClick={handleResumeWorkout} className="bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700">Resume</button>
            <button onClick={handleDiscardWorkout} className="bg-red-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-red-700">Discard</button>
          </div>
        </div>
      );
    }

    switch (currentView) {
      case 'WORKOUT':
        return activeWorkout && <WorkoutView activeWorkoutState={activeWorkout} onStateChange={updateWorkoutState} history={workoutHistory} onFinish={endWorkout} />;
      case 'HISTORY':
        return <HistoryView history={workoutHistory} onUpdateSession={updateWorkoutSession} onDeleteSession={deleteWorkoutSession} loading={historyLoading} />;
      case 'SUMMARY':
          return lastSessionSummary && <SessionSummaryView session={lastSessionSummary} history={workoutHistory} onDone={() => setCurrentView('DASHBOARD')}/>;
      case 'DASHBOARD':
      default:
        return <DashboardView onStartWorkout={handleStartWorkout} history={workoutHistory} loading={historyLoading} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col">
      <Header onLogout={handleLogout} user={user} />
      <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
        {renderView()}
      </main>
      <Footer currentView={currentView} setView={navigateTo} hasActiveWorkout={!!activeWorkout} />
    </div>
  );
}

// --- Sub-Components ---

const Header: React.FC<{ onLogout: () => void, user: any }> = ({ onLogout, user }) => (
    <header className="bg-gray-800 shadow-lg">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                <DumbbellIcon/>
                Aesthetic Progression
            </h1>
            <div className="flex items-center gap-4">
                {user.photoURL && <img src={user.photoURL} alt="User" className="w-8 h-8 rounded-full" />}
                <button onClick={onLogout} className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 transition-colors text-sm">Logout</button>
            </div>
        </div>
    </header>
);

const Footer: React.FC<{ currentView: View, setView: (view: View) => void, hasActiveWorkout: boolean }> = ({ currentView, setView, hasActiveWorkout }) => {
    const navItems: { view: View; label: string; icon: React.ReactNode }[] = [
        { view: 'DASHBOARD', label: hasActiveWorkout ? 'Workout' : 'Home', icon: hasActiveWorkout ? <WorkoutInProgressIcon /> : <HomeIcon /> },
        { view: 'HISTORY', label: 'History', icon: <HistoryIcon /> },
    ];

    const getButtonClass = (view: View) => {
        let isActive = currentView === view;
        // Special case: if we are in WORKOUT view, the DASHBOARD button should also be active.
        if (currentView === 'WORKOUT' && view === 'DASHBOARD') {
            isActive = true;
        }
        return `flex flex-col items-center justify-center w-24 p-2 rounded-lg transition-colors duration-200 ${isActive ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'}`;
    };

    return (
        <footer className="sticky bottom-0 bg-gray-800 border-t border-gray-700 z-10">
            <nav className="container mx-auto flex justify-around p-2">
                {navItems.map(item => (
                    <button
                        key={item.view}
                        onClick={() => setView(item.view)}
                        className={getButtonClass(item.view)}
                    >
                        {item.icon}
                        <span className="text-xs font-medium mt-1">{item.label}</span>
                    </button>
                ))}
            </nav>
        </footer>
    );
};

const DashboardView: React.FC<{ onStartWorkout: (template: WorkoutTemplate) => void, history: WorkoutSession[], loading: boolean }> = ({ onStartWorkout, history, loading }) => {
  const lastWorkoutDates = useMemo(() => {
    const dates: { [key: string]: string } = {};
    history.forEach(session => {
        const existing = dates[session.templateId];
        if (!existing || new Date(session.date) > new Date(existing)) {
            dates[session.templateId] = session.date;
        }
    });
    return dates;
  }, [history]);
  
  if (loading) {
    return <div className="text-center text-gray-400 p-8">Loading dashboard...</div>;
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="md:col-span-2">
          <h2 className="text-2xl font-semibold mb-4 text-blue-400">Select Your Workout</h2>
      </div>
      {WORKOUT_TEMPLATES.map(template => (
        <div key={template.id} className="bg-gray-800 rounded-xl shadow-lg hover:shadow-blue-500/20 transition-all duration-300 transform hover:-translate-y-1">
          <div className="p-6">
            <h3 className="text-xl font-bold text-white">{template.name}</h3>
            <p className="text-gray-400 mt-2 text-sm">
                Last workout: {lastWorkoutDates[template.id] ? new Date(lastWorkoutDates[template.id]).toLocaleDateString() : 'Never'}
            </p>
            <button onClick={() => onStartWorkout(template)} className="mt-6 w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center gap-2">
                <PlayIcon />
                Start Session
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

import { ActiveWorkoutState } from './types';

interface WorkoutViewProps {
    activeWorkoutState: ActiveWorkoutState;
    onStateChange: (newState: Partial<ActiveWorkoutState>) => void;
    history: WorkoutSession[];
    onFinish: (session: WorkoutSession) => void;
}

const WorkoutView: React.FC<WorkoutViewProps> = ({ activeWorkoutState, onStateChange, history, onFinish }) => {
    const { template, sessionLogs, currentExerciseIndex, currentSetIndex, startTime, timerEndTime } = activeWorkoutState;
    
    const [weight, setWeight] = useState<number | ''>('');
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [displayTime, setDisplayTime] = useState(0);

    const currentRoutineExercise = template.exercises[currentExerciseIndex];
    const currentExerciseDef = EXERCISES[currentRoutineExercise.exerciseDefinitionId];
    
    const lastSessionForTemplate = useMemo(() => 
        history.filter(s => s.templateId === template.id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0],
        [history, template.id]
    );

    const previousWeight = useMemo(() => {
      if (!lastSessionForTemplate) return 0;
      const lastLogs = lastSessionForTemplate.logs[currentRoutineExercise.id];
      return lastLogs?.[0]?.weight_kg || 0;
    }, [lastSessionForTemplate, currentRoutineExercise]);

    const targetReps = useMemo(() => {
        if (currentSetIndex > 0) return 8;

        const allLogsForThisExercise = history.flatMap(s => Object.values(s.logs).flat()).filter(log => {
             const routineExercise = WORKOUT_TEMPLATES.flatMap(t => t.exercises).find(e => sessionLogs[e.id]?.includes(log));
             if(!routineExercise) return false;
             return EXERCISES[routineExercise.exerciseDefinitionId].name === currentExerciseDef.name && log.weight_kg === weight;
        });

        if (allLogsForThisExercise.length === 0) return 8; // First time at this weight

        const maxRepsHistoric = Math.max(...allLogsForThisExercise.map(l => l.repetitions), 0);
        
        const lastTimeAtThisWeightLogs = lastSessionForTemplate?.logs[currentRoutineExercise.id]?.filter(l => l.weight_kg === weight);
        const lastS1Reps = lastTimeAtThisWeightLogs?.[0]?.repetitions;

        if (lastS1Reps && lastS1Reps >= maxRepsHistoric) {
            return lastS1Reps + 1;
        }
        return maxRepsHistoric + 1;
    }, [currentSetIndex, weight, history, currentRoutineExercise.id, lastSessionForTemplate, currentExerciseDef.name]);

    React.useEffect(() => {
        if (weight === '' && previousWeight > 0) {
            setWeight(previousWeight);
        }
    }, [previousWeight, weight, currentExerciseIndex]);

    React.useEffect(() => {
        if (Notification.permission !== 'granted') {
            Notification.requestPermission();
        }
    }, []);

    // Timer effect
    React.useEffect(() => {
        let intervalId: number | undefined;

        const updateTimer = () => {
            if (timerEndTime) {
                const remaining = Math.round((timerEndTime - Date.now()) / 1000);
                if (remaining > 0) {
                    setDisplayTime(remaining);
                } else {
                    setDisplayTime(0);
                    onStateChange({ timerEndTime: null }); // Stop timer
                    clearInterval(intervalId);
                }
            }
        };

        if (timerEndTime) {
            updateTimer(); // Initial update
            intervalId = window.setInterval(updateTimer, 1000);
        }

        return () => clearInterval(intervalId);
    }, [timerEndTime, onStateChange]);

    const logSet = (reps: number) => {
        if (weight === '') return;
        const newLog: SetLog = { setNumber: currentSetIndex + 1, weight_kg: +weight, repetitions: reps };
        const updatedLogs = { ...sessionLogs, [currentRoutineExercise.id]: [...(sessionLogs[currentRoutineExercise.id] || []), newLog] };
        
        if (currentSetIndex === 2) {
            const sets = updatedLogs[currentRoutineExercise.id];
            if (sets[0].repetitions >= 12 && sets[1].repetitions >= 8 && sets[2].repetitions >= 8) {
                setShowSuccessModal(true);
            }
        }
        
        const restDuration = currentExerciseDef.defaultRestTimer;
        const newTimerEndTime = Date.now() + restDuration * 1000;

        // Post message to Service Worker for background notification
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            const nextExercise = template.exercises[currentExerciseIndex + 1];
            const nextUpMessage = currentSetIndex < 2 ? `Set ${currentSetIndex + 2}` : (nextExercise ? EXERCISES[nextExercise.exerciseDefinitionId].name : 'Last Set!');
            navigator.serviceWorker.controller.postMessage({
                type: 'START_TIMER',
                duration: restDuration,
                nextUp: nextUpMessage,
            });
        }

        let nextExerciseIndex = currentExerciseIndex;
        let nextSetIndex = currentSetIndex + 1;

        if (nextSetIndex > 2) {
            nextSetIndex = 0;
            nextExerciseIndex += 1;
            setWeight('');
        }

        onStateChange({
            sessionLogs: updatedLogs,
            currentSetIndex: nextSetIndex,
            currentExerciseIndex: nextExerciseIndex,
            timerEndTime: newTimerEndTime,
        });

        if (nextExerciseIndex >= template.exercises.length) {
            const finalSession: WorkoutSession = {
                id: `session_${new Date().toISOString()}`,
                templateId: template.id,
                date: new Date().toISOString(),
                logs: updatedLogs,
            };
            onFinish(finalSession);
        }
    };

    const totalTime = Math.floor((new Date().getTime() - new Date(startTime).getTime()) / 1000);

    if (timerEndTime) {
        const nextExercise = template.exercises[currentExerciseIndex];
        const nextUpMessage = currentSetIndex < 3 ? `Set ${currentSetIndex + 1}` : (nextExercise ? EXERCISES[nextExercise.exerciseDefinitionId].name : 'Last Set!');
        return (
            <div className="flex flex-col items-center justify-center h-full bg-gray-900 text-center p-4">
                <h2 className="text-2xl font-bold text-blue-400 mb-4">Rest Time</h2>
                <div className="text-8xl font-mono font-bold text-white mb-6">{displayTime}s</div>
                <p className="text-lg text-gray-300">Next up: <span className="font-semibold">{nextUpMessage}</span></p>
                <button onClick={() => onStateChange({ timerEndTime: null })} className="mt-8 bg-red-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-red-700 transition-colors">Skip Rest</button>
            </div>
        );
    }
    
    return (
        <div className="max-w-2xl mx-auto w-full">
            <div className="bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-blue-400">{template.name}</h2>
                    <div className="text-lg font-mono bg-gray-700 px-3 py-1 rounded">
                        {String(Math.floor(totalTime / 60)).padStart(2, '0')}:{String(totalTime % 60).padStart(2, '0')}
                    </div>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2.5">
                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${(currentExerciseIndex / template.exercises.length) * 100}%` }}></div>
                </div>
            </div>

            <div className="bg-gray-800 rounded-xl shadow-lg p-6 text-center">
                <h3 className="text-2xl font-semibold mb-2">{currentExerciseDef.name}</h3>
                <p className="text-gray-400 mb-6">{`Set ${currentSetIndex + 1} of 3`}</p>

                {currentSetIndex === 0 && (
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-300 mb-2">Weight (kg)</label>
                        <div className="flex items-center justify-center gap-4">
                            <input type="number" value={weight} onChange={e => setWeight(e.target.value === '' ? '' : +e.target.value)} className="bg-gray-700 text-white text-center text-2xl font-bold w-32 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                            <button onClick={() => setWeight(previousWeight)} className="bg-gray-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-gray-500 transition-colors">{`SAME (${previousWeight} kg)`}</button>
                        </div>
                    </div>
                )}
                
                <div className="mb-6">
                    <p className="text-lg text-gray-300">Your Target: <span className="font-bold text-blue-400 text-xl">{targetReps}+ Reps</span></p>
                </div>

                <div className="grid grid-cols-4 gap-3">
                    {[...Array(12).keys()].map(i => (
                        <button key={i} onClick={() => logSet(i + 1)} className="bg-blue-600 h-16 rounded-lg text-xl font-bold hover:bg-blue-700 transition-transform transform hover:scale-105 disabled:bg-gray-600 disabled:cursor-not-allowed" disabled={weight === ''}>
                            {i + 1}
                        </button>
                    ))}
                    <button onClick={() => logSet(13)} className="bg-emerald-600 h-16 rounded-lg text-xl font-bold hover:bg-emerald-700 transition-transform transform hover:scale-105 disabled:bg-gray-600 disabled:cursor-not-allowed col-span-4" disabled={weight === ''}>
                        12+
                    </button>
                </div>
            </div>
            {showSuccessModal && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-800 rounded-lg p-8 text-center shadow-2xl">
                        <h3 className="text-2xl font-bold text-emerald-400 mb-4">Progression Unlocked!</h3>
                        <p className="text-gray-300 mb-6">You've hit the 12/8/8 target. Increase the weight next week!</p>
                        <button onClick={() => setShowSuccessModal(false)} className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700">Awesome!</button>
                    </div>
                </div>
            )}
        </div>
    );
};

const SessionSummaryView: React.FC<{session: WorkoutSession, history: WorkoutSession[], onDone: () => void}> = ({session, history, onDone}) => {
    const lastSessionForTemplate = useMemo(() => 
        history.filter(s => s.templateId === session.templateId && s.id !== session.id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0],
        [history, session]
    );

    return (
        <div className="max-w-3xl mx-auto bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-center text-blue-400 mb-6">Workout Complete!</h2>
            <div className="space-y-4">
                {Object.keys(session.logs).map(routineExerciseId => {
                    const currentLogs = session.logs[routineExerciseId];
                    const exerciseDef = EXERCISES[WORKOUT_TEMPLATES.flatMap(t => t.exercises).find(e => e.id === routineExerciseId)!.exerciseDefinitionId];
                    const lastLogs = lastSessionForTemplate?.logs[routineExerciseId];
                    const weight = currentLogs[0].weight_kg;
                    const repsS1 = currentLogs[0].repetitions;
                    const lastRepsS1 = lastLogs?.[0]?.repetitions;

                    let comparisonColor = 'text-gray-400';
                    if (lastRepsS1) {
                        if (repsS1 > lastRepsS1) comparisonColor = 'text-emerald-400';
                        if (repsS1 < lastRepsS1) comparisonColor = 'text-red-400';
                    }

                    return (
                        <div key={routineExerciseId} className="bg-gray-700 p-4 rounded-lg flex justify-between items-center">
                            <div>
                                <p className="font-semibold text-white">{exerciseDef.name}</p>
                                <p className="text-sm text-gray-300">Weight: {weight} kg</p>
                            </div>
                            <div className="text-right">
                                <p className="font-mono text-lg">{currentLogs.map(l => l.repetitions).join(' / ')}</p>
                                <p className={`text-sm ${comparisonColor}`}>
                                    S1 vs. last: {repsS1} vs. {lastRepsS1 || 'N/A'}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
            <button onClick={onDone} className="mt-8 w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                Back to Dashboard
            </button>
        </div>
    );
};

interface HistoryViewProps {
    history: WorkoutSession[];
    onUpdateSession: (session: WorkoutSession) => void;
    onDeleteSession: (sessionId: string) => void;
    loading: boolean;
}

const HistoryView: React.FC<HistoryViewProps> = ({ history, onUpdateSession, onDeleteSession, loading }) => {
    const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
    const [sessionDataForEdit, setSessionDataForEdit] = useState<WorkoutSession | null>(null);
    const [openSessionIds, setOpenSessionIds] = useState<Set<string>>(new Set());

    const toggleSessionOpen = (sessionId: string) => {
        setOpenSessionIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(sessionId)) {
                newSet.delete(sessionId);
            } else {
                newSet.add(sessionId);
            }
            return newSet;
        });
    };

    const handleEditStart = (session: WorkoutSession) => {
        setEditingSessionId(session.id);
        setSessionDataForEdit(JSON.parse(JSON.stringify(session))); // Deep copy
        setOpenSessionIds(prev => new Set(prev).add(session.id)); // Ensure session is open
    };

    const handleEditCancel = () => {
        setEditingSessionId(null);
        setSessionDataForEdit(null);
    };

    const handleEditSave = () => {
        if (!sessionDataForEdit) return;
        onUpdateSession(sessionDataForEdit);
        handleEditCancel();
    };

    const handleDelete = (sessionId: string) => {
        if (window.confirm("Are you sure you want to delete this session permanently? This action cannot be undone.")) {
            onDeleteSession(sessionId);
        }
    };

    const handleInputChange = (routineId: string, logIndex: number, field: 'repetitions' | 'weight_kg', value: string) => {
        if (!sessionDataForEdit) return;

        const numericValue = parseInt(value, 10);
        if (isNaN(numericValue) || numericValue < 0) return;

        const newLogs = { ...sessionDataForEdit.logs };
        const logsForExercise = [...newLogs[routineId]];

        if (field === 'weight_kg') {
            const updatedLogs = logsForExercise.map(log => ({ ...log, weight_kg: numericValue }));
            newLogs[routineId] = updatedLogs;
        } else {
            const logToUpdate = { ...logsForExercise[logIndex], repetitions: numericValue };
            logsForExercise[logIndex] = logToUpdate;
            newLogs[routineId] = logsForExercise;
        }

        setSessionDataForEdit({ ...sessionDataForEdit, logs: newLogs });
    };

    const getStartOfWeek = (date: string) => {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
        const startOfWeek = new Date(d.setDate(diff));
        startOfWeek.setHours(0, 0, 0, 0);
        return startOfWeek;
    };

    const groupedHistory = useMemo(() => {
        return history.reduce((acc, session) => {
            const weekStartDate = getStartOfWeek(session.date);
            const weekKey = `Week of ${weekStartDate.toLocaleDateString()}`;
            if (!acc[weekKey]) {
                acc[weekKey] = [];
            }
            acc[weekKey].push(session);
            return acc;
        }, {} as Record<string, WorkoutSession[]>);
    }, [history]);
    
    const sortedWeeks = Object.keys(groupedHistory).sort((a, b) => new Date(b.split(' of ')[1]).getTime() - new Date(a.split(' of ')[1]).getTime());
    
    const handleExportCSV = () => {
        let csvContent = "data:text/csv;charset=utf-8,";
        const headers = ["Date", "Workout Name", "Exercise Name", "Weight (kg)", "Set 1 Reps", "Set 2 Reps", "Set 3 Reps"];
        csvContent += headers.join(",") + "\r\n";

        history.forEach(session => {
            const sessionDate = new Date(session.date).toLocaleDateString();
            const templateName = WORKOUT_TEMPLATES.find(t => t.id === session.templateId)?.name || "Unknown Workout";
            
            Object.entries(session.logs).forEach(([routineId, logs]) => {
                const exerciseDef = EXERCISES[WORKOUT_TEMPLATES.flatMap(t => t.exercises).find(e => e.id === routineId)!.exerciseDefinitionId];
                const row = [
                    sessionDate,
                    `"${templateName}"`,
                    `"${exerciseDef.name}"`,
                    (logs as SetLog[])[0].weight_kg,
                    (logs as SetLog[])[0]?.repetitions || 0,
                    (logs as SetLog[])[1]?.repetitions || 0,
                    (logs as SetLog[])[2]?.repetitions || 0,
                ];
                csvContent += row.join(",") + "\r\n";
            });
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "workout_history.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleExportPDF = () => {
        const { jsPDF } = jspdf;
        const doc = new jsPDF();

        doc.setFontSize(18);
        doc.text("Workout History", 14, 22);

        let yPos = 30;

        sortedWeeks.forEach(weekKey => {
            if (yPos > 250) { 
                doc.addPage();
                yPos = 20;
            }
            doc.setFontSize(14);
            doc.text(weekKey, 14, yPos);
            yPos += 8;

            groupedHistory[weekKey].forEach(session => {
                const templateName = WORKOUT_TEMPLATES.find(t => t.id === session.templateId)?.name;
                const sessionDate = new Date(session.date).toLocaleDateString();
                
                doc.setFontSize(11);
                doc.setTextColor(80);
                doc.text(`${templateName} - ${sessionDate}`, 15, yPos);
                yPos += 6;
                doc.setTextColor(0);

                const tableBody = (Object.entries(session.logs) as [string, SetLog[]][]).map(([routineId, logs]) => {
                    const exerciseDef = EXERCISES[WORKOUT_TEMPLATES.flatMap(t => t.exercises).find(e => e.id === routineId)!.exerciseDefinitionId];
                    return [
                        exerciseDef.name,
                        logs[0].weight_kg + ' kg',
                        logs.map(l => l.repetitions).join(' / ')
                    ];
                });

                (doc as any).autoTable({
                    head: [['Exercise', 'Weight', 'Reps (S1/S2/S3)']],
                    body: tableBody,
                    startY: yPos,
                    theme: 'striped',
                    headStyles: { fillColor: [34, 102, 153] },
                });
                
                yPos = (doc as any).lastAutoTable.finalY + 10;
            });
        });
        
        doc.save("workout-history.pdf");
    };


    return (
        <div className="bg-gray-800 p-6 rounded-xl">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-blue-400 mb-4 sm:mb-0">Workout History</h2>
                <div className="flex gap-2">
                    <button onClick={handleExportPDF} className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 text-sm"><DownloadIcon/>PDF</button>
                    <button onClick={handleExportCSV} className="bg-emerald-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2 text-sm"><DownloadIcon/>Excel</button>
                </div>
            </div>
            <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-2">
                {loading ? <p className="text-gray-400 text-center py-4">Loading history...</p> : (sortedWeeks.length > 0 ? sortedWeeks.map(weekKey => (
                    <details key={weekKey} className="bg-gray-700 rounded-lg" open>
                        <summary className="p-4 cursor-pointer font-semibold text-lg">{weekKey}</summary>
                        <div className="p-4 border-t border-gray-600 space-y-3">
                            {groupedHistory[weekKey].map(session => {
                                const isEditing = editingSessionId === session.id;
                                const isOpen = openSessionIds.has(session.id);
                                const data = isEditing ? sessionDataForEdit : session;
                                if (!data) return null;

                                return (
                                    <div key={session.id} className="bg-gray-800 rounded-lg">
                                        <div className="p-4 font-medium flex justify-between items-center">
                                            <div className="flex-grow cursor-pointer" onClick={() => !isEditing && toggleSessionOpen(session.id)}>
                                                <span>{WORKOUT_TEMPLATES.find(t => t.id === session.templateId)?.name}</span>
                                                <span className="text-sm text-gray-400 block">{new Date(session.date).toLocaleDateString()}</span>
                                            </div>
                                            {!isEditing && (
                                                <div className="flex items-center gap-2">
                                                    <button onClick={(e) => { e.stopPropagation(); handleEditStart(session); }} className="p-2 text-blue-400 hover:text-blue-300"><EditIcon /></button>
                                                    <button onClick={(e) => { e.stopPropagation(); handleDelete(session.id); }} className="p-2 text-red-500 hover:text-red-400"><DeleteIcon /></button>
                                                </div>
                                            )}
                                        </div>
                                        {isOpen && (
                                            <div className="p-4 border-t border-gray-600">
                                                <ul className="space-y-3">
                                                    {(Object.entries(data.logs) as [string, SetLog[]][]).map(([routineId, logs]) => {
                                                        const exerciseDef = EXERCISES[WORKOUT_TEMPLATES.flatMap(t => t.exercises).find(e => e.id === routineId)!.exerciseDefinitionId];
                                                        return (
                                                            <li key={routineId} className="flex flex-col sm:flex-row justify-between text-sm">
                                                                <div className="font-semibold mb-1 sm:mb-0">{exerciseDef.name}</div>
                                                                {isEditing ? (
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="flex items-center gap-1">
                                                                            <input type="number" value={logs[0].weight_kg} onChange={e => handleInputChange(routineId, 0, 'weight_kg', e.target.value)} className="w-12 bg-gray-700 p-1 rounded text-center"/> kg
                                                                        </div>
                                                                        <div className="flex items-center gap-1 font-mono">
                                                                            <input type="number" value={logs[0]?.repetitions || ''} onChange={e => handleInputChange(routineId, 0, 'repetitions', e.target.value)} className="w-10 bg-gray-700 p-1 rounded text-center"/>/
                                                                            <input type="number" value={logs[1]?.repetitions || ''} onChange={e => handleInputChange(routineId, 1, 'repetitions', e.target.value)} className="w-10 bg-gray-700 p-1 rounded text-center"/>/
                                                                            <input type="number" value={logs[2]?.repetitions || ''} onChange={e => handleInputChange(routineId, 2, 'repetitions', e.target.value)} className="w-10 bg-gray-700 p-1 rounded text-center"/>
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <div className="flex items-center gap-2">
                                                                        <span>@ {logs[0].weight_kg}kg</span>
                                                                        <span className="font-mono">{logs.map(l => l.repetitions).join('/')}</span>
                                                                    </div>
                                                                )}
                                                            </li>
                                                        );
                                                    })}
                                                </ul>
                                                {isEditing && (
                                                    <div className="flex justify-end gap-2 mt-4">
                                                        <button onClick={handleEditCancel} className="bg-gray-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-500"><CancelIcon/></button>
                                                        <button onClick={handleEditSave} className="bg-emerald-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-emerald-500"><SaveIcon/></button>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </details>
                )) : <p className="text-gray-400 text-center py-4">No workout history found. Start a new workout!</p>)}
            </div>
        </div>
    );
};


// --- SVG Icons ---
const DumbbellIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v11.494m-6.253-11.494v11.494M18.253 6.253v11.494M1 12h22" /></svg>;
const HomeIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
const HistoryIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const PlayIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>;
const EditIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>;
const DeleteIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg>;
const SaveIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>;
const CancelIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;
const DownloadIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>;
const WorkoutInProgressIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;