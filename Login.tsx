
import React from 'react';
import { auth, googleProvider } from './services/firebase';

const Login = () => {
    const signInWithGoogle = () => {
        // Use signInWithRedirect as it's more compatible with environments where popups are blocked (like iframes).
        // The result of the redirect is handled by the onAuthStateChanged listener in AuthWrapper.
        auth.signInWithRedirect(googleProvider);
    };

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center justify-center p-4">
            <div className="text-center">
                <h1 className="text-4xl font-bold mb-2">Aesthetic Progression</h1>
                <p className="text-lg text-gray-400 mb-8">Track your workouts. Sync across devices.</p>
                <button
                    onClick={signInWithGoogle}
                    className="bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center gap-3 text-lg"
                >
                    <GoogleIcon />
                    Sign in with Google
                </button>
            </div>
        </div>
    );
};

const GoogleIcon: React.FC = () => (
    <svg className="w-6 h-6" viewBox="0 0 48 48">
        <path fill="#fff" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12	s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20	s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
        <path fill="#FFC107" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657	C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36	c-5.222,0-9.582-3.699-11.07-8.516l-6.571,4.819C9.656,39.663,16.318,44,24,44z" />
        <path fill="#F44336" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238	C39.999,35.952,44,30.606,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
    </svg>
);


export default Login;