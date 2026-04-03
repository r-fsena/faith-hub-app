import { createContext, useContext, useEffect, useState } from 'react';
import { 
  getCurrentUser, 
  signIn as amplifySignIn, 
  signOut as amplifySignOut, 
  signUp as amplifySignUp, 
  confirmSignUp as amplifyConfirmSignUp,
  signInWithRedirect,
  resetPassword as amplifyResetPassword,
  confirmResetPassword as amplifyConfirmResetPassword,
  confirmSignIn as amplifyConfirmSignIn
} from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';

interface AuthContextType {
  user: any | null;
  isLoading: boolean;
  signIn: (username: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
  signUp: (username: string, password: string, email: string) => Promise<any>;
  confirmSignUp: (username: string, code: string) => Promise<any>;
  federatedSignIn: (provider: 'Google' | 'Facebook' | 'Apple') => Promise<void>;
  resetPassword: (username: string) => Promise<any>;
  confirmResetPassword: (username: string, confirmationCode: string, newPassword: string) => Promise<void>;
  confirmSignIn: (challengeResponse: string) => Promise<any>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  signIn: async () => {},
  signOut: async () => {},
  signUp: async () => {},
  confirmSignUp: async () => {},
  federatedSignIn: async () => {},
  resetPassword: async () => {},
  confirmResetPassword: async () => {},
  confirmSignIn: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkUser();

    const listener = Hub.listen('auth', (data: any) => {
      switch (data.payload.event) {
        case 'signedIn':
          checkUser();
          break;
        case 'signedOut':
          setUser(null);
          break;
      }
    });

    return () => listener(); // Hub.listen returns a function to unsubscribe in v6
  }, []);

  async function checkUser() {
    try {
      const authUser = await getCurrentUser();
      setUser(authUser);
    } catch (error) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }

  async function signIn(username: string, password: string) {
    try {
      const result = await amplifySignIn({ username, password });
      return result;
    } catch (error) {
      throw error;
    }
  }

  async function signUp(username: string, password: string, email: string) {
    try {
      const result = await amplifySignUp({
        username,
        password,
        options: {
          userAttributes: {
            email,
          },
        }
      });
      return result;
    } catch (error) {
      throw error;
    }
  }

  async function confirmSignUp(username: string, code: string) {
    try {
      await amplifyConfirmSignUp({ username, confirmationCode: code });
    } catch (error) {
      throw error;
    }
  }

  async function signOut() {
    try {
      await amplifySignOut();
    } catch (error) {
      console.error('Error signing out: ', error);
    }
  }

  async function federatedSignIn(provider: 'Google' | 'Facebook' | 'Apple') {
    try {
      if (provider === 'Google') {
        await signInWithRedirect({ provider: 'Google' });
      } else if (provider === 'Facebook') {
        await signInWithRedirect({ provider: 'Facebook' });
      } else if (provider === 'Apple') {
        await signInWithRedirect({ provider: 'Apple' });
      }
    } catch (error) {
      console.error('Error signing in with provider', error);
      throw error;
    }
  }

  async function resetPassword(username: string) {
    try {
      const output = await amplifyResetPassword({ username });
      return output;
    } catch (error) {
      throw error;
    }
  }

  async function confirmResetPassword(username: string, confirmationCode: string, newPassword: string) {
    try {
      await amplifyConfirmResetPassword({ username, confirmationCode, newPassword });
    } catch (error) {
      throw error;
    }
  }

  async function confirmSignIn(challengeResponse: string) {
    try {
      const result = await amplifyConfirmSignIn({ challengeResponse });
      return result;
    } catch (error) {
      throw error;
    }
  }

  const value = {
    user,
    isLoading,
    signIn,
    signOut,
    signUp,
    confirmSignUp,
    federatedSignIn,
    resetPassword,
    confirmResetPassword,
    confirmSignIn,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
