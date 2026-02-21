import { useState, useEffect } from 'react';

const SESSION_KEY = 'money_acumen_session_id';

function generateSessionId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `session_${timestamp}_${random}`;
}

export function useSession() {
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    // Check for existing session
    let existingSession = localStorage.getItem(SESSION_KEY);
    
    if (!existingSession) {
      // Generate new session
      existingSession = generateSessionId();
      localStorage.setItem(SESSION_KEY, existingSession);
    }
    
    setSessionId(existingSession);
  }, []);

  const clearSession = () => {
    localStorage.removeItem(SESSION_KEY);
    const newSession = generateSessionId();
    localStorage.setItem(SESSION_KEY, newSession);
    setSessionId(newSession);
  };

  return {
    sessionId,
    isReady: sessionId !== null,
    clearSession,
  };
}
