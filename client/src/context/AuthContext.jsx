import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

const STORAGE_AUTH_KEY = 'ipl_auth_user';
const STORAGE_STATS_KEY = 'ipl_career_stats';
const STORAGE_SQUADS_KEY = 'ipl_saved_squads';
const STORAGE_ROOM_KEY = 'ipl_active_room_id';

const DEFAULT_STATS = {
  auctionsJoined: 0,
  tournamentsWon: 0,
  playersBought: 0,
  totalPurseSpent: 0
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_AUTH_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [careerStats, setCareerStats] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_STATS_KEY);
      return saved ? { ...DEFAULT_STATS, ...JSON.parse(saved) } : DEFAULT_STATS;
    } catch {
      return DEFAULT_STATS;
    }
  });

  const [savedSquads, setSavedSquads] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_SQUADS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [activeRoomId, setActiveRoomIdState] = useState(() => {
    return localStorage.getItem(STORAGE_ROOM_KEY) || '';
  });

  const setActiveRoomId = useCallback((roomId) => {
    if (roomId) {
      localStorage.setItem(STORAGE_ROOM_KEY, roomId);
      setActiveRoomIdState(roomId);
    } else {
      localStorage.removeItem(STORAGE_ROOM_KEY);
      setActiveRoomIdState('');
    }
  }, []);

  // Sync profile & stats from server when user is logged in
  useEffect(() => {
    if (!user?.id) return;

    fetch('/api/user/profile/' + encodeURIComponent(user.id))
      .then(res => res.json())
      .then(data => {
        if (data?.success && data?.user) {
          if (data.user.stats) {
            setCareerStats(prev => {
              const merged = { ...prev, ...data.user.stats };
              localStorage.setItem(STORAGE_STATS_KEY, JSON.stringify(merged));
              return merged;
            });
          }
          if (Array.isArray(data.user.savedSquads) && data.user.savedSquads.length > 0) {
            setSavedSquads(data.user.savedSquads);
            localStorage.setItem(STORAGE_SQUADS_KEY, JSON.stringify(data.user.savedSquads));
          }
        }
      })
      .catch(() => {});
  }, [user?.id]);

  // Decode Google JWT Token
  const decodeGoogleToken = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (err) {
      console.error('Error decoding Google JWT:', err);
      return null;
    }
  };

  // Google Login Callback (Handles official Google Identity Services credential response)
  const loginWithGoogleCredential = useCallback((credential) => {
    const payload = decodeGoogleToken(credential);
    if (!payload) return false;

    const userData = {
      id: 'google_' + payload.sub,
      googleId: payload.sub,
      name: payload.name || payload.given_name || 'Cricket Fan',
      email: payload.email || '',
      avatar: payload.picture || '',
      provider: 'google',
      loggedInAt: Date.now()
    };

    setUser(userData);
    localStorage.setItem(STORAGE_AUTH_KEY, JSON.stringify(userData));
    localStorage.setItem('ipl_user_name', userData.name);

    // Sync to backend
    fetch('/api/user/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: userData.id,
        name: userData.name,
        email: userData.email,
        avatar: userData.avatar
      })
    }).catch(() => {});

    return true;
  }, []);

  // Quick Google Account Login (For instant one-click testing or custom nickname linking)
  const quickGoogleLogin = useCallback((profile = {}) => {
    const email = profile.email || 'player@gmail.com';
    const name = profile.name || 'Cricket Champion';
    const avatar = profile.avatar || ('https://api.dicebear.com/7.x/bottts/svg?seed=' + encodeURIComponent(name));
    const userId = 'google_' + Math.abs(email.split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0));

    const userData = {
      id: userId,
      name,
      email,
      avatar,
      provider: 'google',
      loggedInAt: Date.now()
    };

    setUser(userData);
    localStorage.setItem(STORAGE_AUTH_KEY, JSON.stringify(userData));
    localStorage.setItem('ipl_user_name', userData.name);

    fetch('/api/user/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: userData.id,
        name: userData.name,
        email: userData.email,
        avatar: userData.avatar
      })
    }).catch(() => {});

    return userData;
  }, []);

  // Logout
  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(STORAGE_AUTH_KEY);
    localStorage.removeItem(STORAGE_ROOM_KEY);
    setActiveRoomIdState('');
  }, []);

  // Update Stats
  const updateStats = useCallback((delta) => {
    setCareerStats(prev => {
      const updated = {
        auctionsJoined: prev.auctionsJoined + (delta.auctionsJoined || 0),
        tournamentsWon: prev.tournamentsWon + (delta.tournamentsWon || 0),
        playersBought: prev.playersBought + (delta.playersBought || 0),
        totalPurseSpent: prev.totalPurseSpent + (delta.totalPurseSpent || 0)
      };
      localStorage.setItem(STORAGE_STATS_KEY, JSON.stringify(updated));

      if (user?.id) {
        fetch('/api/user/stats', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, deltaStats: delta })
        }).catch(() => {});
      }

      return updated;
    });
  }, [user?.id]);

  // Save Assembled Squad
  const saveSquad = useCallback(async (squadData) => {
    const squadItem = {
      id: 'squad-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      teamId: squadData.teamId,
      teamName: squadData.teamName || squadData.name || 'Franchise Squad',
      shortName: squadData.shortName || 'IPL',
      color: squadData.color || '#F59E0B',
      totalPlayers: squadData.squad ? squadData.squad.length : 0,
      totalSpent: squadData.spent || (1000000000 - (squadData.purse || 0)),
      purseLeft: squadData.purse || 0,
      squad: squadData.squad || [],
      savedAt: Date.now()
    };

    setSavedSquads(prev => {
      const next = [squadItem, ...prev.slice(0, 24)];
      localStorage.setItem(STORAGE_SQUADS_KEY, JSON.stringify(next));
      return next;
    });

    if (user?.id) {
      fetch('/api/user/save-squad', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, squadData })
      }).catch(() => {});
    }

    return squadItem;
  }, [user?.id]);

  return (
    <AuthContext.Provider
      value={{
        user,
        careerStats,
        savedSquads,
        activeRoomId,
        setActiveRoomId,
        loginWithGoogleCredential,
        quickGoogleLogin,
        logout,
        updateStats,
        saveSquad
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
