
import React, { useState, useEffect } from 'react';
import { auth } from './services/firebase';
import App from './App';
import Login from './Login';

const AuthWrapper = () => {
    const [user, setUser] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((firebaseUser: any) => {
            setUser(firebaseUser);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
                <p>Loading...</p>
            </div>
        );
    }
    
    if (user) {
        return <App user={user} />;
    }

    return <Login />;
};

export default AuthWrapper;
