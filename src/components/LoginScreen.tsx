import logo from 'figma:asset/3f9d5e2624d6f76604e00bccf7f947f633651625.png';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useState } from 'react';
import { User, UserRole } from '../App';
import { auth, db } from '../lib/firebase';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface LoginScreenProps {
  onLogin: (user: User) => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    let userRole: UserRole = 'employee';
    if (email === 'bluemoon.owner.alangilan@gmail.com') {
      userRole = 'owner';
    } else if (email === 'bluemoon.manager.alangilan@gmail.com') {
      userRole = 'manager';
    } else if (email === 'bluemoon.team.alangilan@gmail.com') {
      userRole = 'employee';
    }

    const mockUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name: email.split('@')[0],
      email,
      role: userRole,
    };
    onLogin(mockUser);
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setError(null);

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;
      let userRole: UserRole | null = null;

      // Fetch role from Firestore based on the user's UID
      try {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userSnap = await getDoc(userDocRef);

        if (userSnap.exists()) {
          const data = userSnap.data() as { role?: string };
          if (data.role && ['owner', 'manager', 'employee'].includes(data.role)) {
            userRole = data.role as UserRole;
          }
        }
      } catch (firestoreError) {
        console.error('Error fetching user role from Firestore:', firestoreError);
      }

      if (!userRole) {
        setError('No role configured for this Google account. Please contact the administrator.');
        return;
      }

      const email = firebaseUser.email ?? '';

      const mappedUser: User = {
        id: firebaseUser.uid,
        name:
          firebaseUser.displayName || (email ? email.split('@')[0] : 'User'),
        email,
        role: userRole,
      };

      onLogin(mappedUser);
    } catch (error: any) {
      console.error('Google sign-in error:', error);

      if (error.code === 'auth/popup-closed-by-user') {
        setError('Sign-in cancelled');
      } else if (error.code === 'auth/popup-blocked') {
        setError('Popup was blocked. Please enable popups for this site.');
      } else {
        setError('Failed to sign in with Google. Please try again.');
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-cyan-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img src={logo} alt="Bluemoon" className="h-12" />
        </div>

        <Card className="border-cyan-100">
          <CardHeader>
            <CardTitle className="text-center">Login to your account</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-700">
                Sign In
              </Button>
            </form>

            <div className="mt-6">
              <div className="relative mb-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">Or</span>
                </div>
              </div>
              <Button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isGoogleLoading}
                className="w-full border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <span className="inline-flex h-5 w-5 items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 48 48"
                    className="h-5 w-5"
                  >
                    <path
                      fill="#EA4335"
                      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                    />
                    <path
                      fill="#34A853"
                      d="M46.98 24.55c0-1.57-.15-3.08-.41-4.55H24v9.02h12.94c-.56 2.9-2.25 5.36-4.79 7.01l7.73 5.99C44.84 37.39 46.98 31.47 46.98 24.55z"
                    />
                    <path
                      fill="#4A90E2"
                      d="M10.54 28.41A14.5 14.5 0 0 1 9.5 24c0-1.53.26-3.01.72-4.39l-7.98-6.19A23.87 23.87 0 0 0 0 24c0 3.86.92 7.51 2.56 10.78l7.98-6.37z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M24 47.5c6.48 0 11.93-2.13 15.9-5.82l-7.73-5.99c-2.15 1.44-4.9 2.29-8.17 2.29-6.26 0-11.57-4.22-13.46-9.96l-7.98 6.37C6.51 42.62 14.62 47.5 24 47.5z"
                    />
                  </svg>
                </span>
                <span className="text-sm font-medium">
                  {isGoogleLoading ? 'Signing in with Google...' : 'Sign in with Google'}
                </span>
              </Button>
              {error && (
                <p className="mt-2 text-xs text-red-500 text-center">{error}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
