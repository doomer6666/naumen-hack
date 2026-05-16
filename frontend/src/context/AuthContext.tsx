import React, {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

export type UserRole = "newbie" | "hr" | "mentor";

interface AuthContextType {
  role: UserRole;
  isAuthenticated: boolean;
  login: (role: UserRole) => void;
  logout: () => void;
  userName: string;
  userInitials: string;
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
  const [role, setRole] = useState<UserRole>("newbie");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const login = (selectedRole: UserRole) => {
    setRole(selectedRole);
    setIsAuthenticated(true);
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        role,
        isAuthenticated,
        login,
        logout,
        userName: "Владимир Прямых",
        userInitials: "ВК",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
