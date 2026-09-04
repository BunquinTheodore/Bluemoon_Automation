import logo from 'figma:asset/3f9d5e2624d6f76604e00bccf7f947f633651625.png';
import {
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  type User as FirebaseUser,
} from 'firebase/auth';
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

const VALID_ROLES: UserRole[] = ['owner', 'manager', 'employee'];

/** Known account emails that map directly to a role when no Firestore profile exists. */
const EMAIL_ROLE_MAP: Record<string, UserRole> = {
  'bluemoon.owner.alangilan@gmail.com': 'owner',
  'bluemoon.manager.alangilan@gmail.com': 'manager',
  'bluemoon.team.alangilan@gmail.com': 'employee',
};

const NO_ROLE_MESSAGE =
  'No role configured for this account. Please contact the administrator.';

function isUserRole(value: unknown): value is UserRole {
  return typeof value === 'string' && (VALID_ROLES as string[]).includes(value);
}

function getAuthErrorCode(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const code = (error as { code?: unknown }).code;
    return typeof code === 'string' ? code : '';
  }
  return '';
}

function mapAuthError(error: unknown, fallback: string): string {
  switch (getAuthErrorCode(error)) {
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact the administrator.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
    case 'auth/invalid-login-credentials':
      return 'Incorrect email or password.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please wait a moment and try again.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection and try again.';
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
      return 'Sign-in cancelled.';
    case 'auth/popup-blocked':
      return 'Popup was blocked. Please enable popups for this site.';
    case 'auth/account-exists-with-different-credential':
      return 'An account already exists with this email using a different sign-in method.';
    default:
      return fallback;
  }
}

/**
 * Builds the app User from a Firebase user, reading role/branch from the
 * `users/{uid}` profile. Falls back to the known-email role map when no
 * profile exists. Returns null when no role can be determined.
 */
async function resolveAppUser(firebaseUser: FirebaseUser): Promise<User | null> {
  const email = firebaseUser.email ?? '';
  let role: UserRole | null = null;
  let branch = '';

  try {
    const userSnap = await getDoc(doc(db, 'users', firebaseUser.uid));
    if (userSnap.exists()) {
      const data = userSnap.data() as { role?: unknown; branch?: unknown };
      if (isUserRole(data.role)) role = data.role;
      if (typeof data.branch === 'string') branch = data.branch;
    }
  } catch (firestoreError) {
    console.error('Error fetching user profile from Firestore:', firestoreError);
  }

  if (!role) {
    role = EMAIL_ROLE_MAP[email.toLowerCase()] ?? null;
  }
  if (!role) return null;

  return {
    id: firebaseUser.uid,
    name: firebaseUser.displayName || (email ? email.split('@')[0] : 'User'),
    email,
    role,
    branch,
  };
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isBusy = isEmailLoading || isGoogleLoading;

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isBusy) return;

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setError('Please enter your email and password.');
      return;
    }

    setIsEmailLoading(true);
    setError(null);

    try {
      const result = await signInWithEmailAndPassword(auth, trimmedEmail, password);
      const appUser = await resolveAppUser(result.user);
      if (!appUser) {
        setError(NO_ROLE_MESSAGE);
        return;
      }
      onLogin(appUser);
    } catch (authError) {
      console.error('Email sign-in error:', getAuthErrorCode(authError) || authError);
      setError(mapAuthError(authError, 'Failed to sign in. Please try again.'));
    } finally {
      setIsEmailLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (isBusy) return;
    setIsGoogleLoading(true);
    setError(null);

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const appUser = await resolveAppUser(result.user);
      if (!appUser) {
        setError(NO_ROLE_MESSAGE);
        return;
      }
      onLogin(appUser);
    } catch (authError) {
      console.error('Google sign-in error:', getAuthErrorCode(authError) || authError);
      setError(mapAuthError(authError, 'Failed to sign in with Google. Please try again.'));
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
            <form onSubmit={handleLogin} className="space-y-4" noValidate>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isBusy}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isBusy}
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={isBusy}
                className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isEmailLoading ? 'Signing in...' : 'Sign In'}
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
                disabled={isBusy}
                className="w-full border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <span className="inline-flex h-5 w-5 items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 48 48"
                    className="h-5 w-5"
                    aria-hidden="true"
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
                <p role="alert" className="mt-2 text-xs text-red-500 text-center">
                  {error}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
