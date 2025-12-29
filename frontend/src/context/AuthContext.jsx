import { createContext, useState, useContext, useEffect } from "react";
import { authApi } from "../api/auth";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authApi
      .getMe()
      .then((data) => {
        if (!data) {
          setUser(null);
        } else {
          setUser(data);
        }
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (login, password, remember) => {
    const data = await authApi.login(login, password, remember);
    setUser(data);
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
  };

  const updateUser = (newData) => {
    setUser((prev) => ({ ...prev, ...newData }));
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
