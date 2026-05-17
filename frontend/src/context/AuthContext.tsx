import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import apiClient from "../api/client";

export type UserRole = "newbie" | "hr" | "mentor";

interface AuthContextType {
  role: UserRole;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<string>;
  logout: () => void;
  userName: string;
  userInitials: string;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(
    () => !!localStorage.getItem("access_token"),
  );

  const [role, setRole] = useState<UserRole>("newbie");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userName, setUserName] = useState<string>("");
  const [userInitials, setUserInitials] = useState<string>("");

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      return;
    }

    apiClient
      .get("/me")
      .then((res) => {
        const userData = res.data;
        setRole(userData.role);
        setUserName(userData.name);
        const parts = userData.name.split(" ");
        setUserInitials(
          parts.length > 1 ? parts[0][0] + parts[1][0] : parts[0][0],
        );
        setIsAuthenticated(true);
      })
      .catch(() => {
        localStorage.removeItem("access_token");
        setIsAuthenticated(false);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (email: string, password: string): Promise<string> => {
    const res = await apiClient.post("/login", { email, password });
    const { access_token } = res.data;

    localStorage.setItem("access_token", access_token);

    const meRes = await apiClient.get("/me");
    const userData = meRes.data;

    setRole(userData.role);
    setUserName(userData.name);
    const parts = userData.name.split(" ");
    setUserInitials(parts.length > 1 ? parts[0][0] + parts[1][0] : parts[0][0]);
    setIsAuthenticated(true);

    return userData.role;
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    setIsAuthenticated(false);
    setUserName("");
    setUserInitials("");
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <AuthContext.Provider
      value={{
        role,
        isAuthenticated,
        login,
        logout,
        userName,
        userInitials,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
