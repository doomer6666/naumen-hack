import React, {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

export type UserRole = "newbie" | "hr" | "mentor";

interface AuthContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
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
  //'newbie', 'hr', 'mentor'
  const [role, setRole] = useState<UserRole>("newbie");

  return (
    <AuthContext.Provider
      value={{
        role,
        setRole,
        userName: "Владимир Прямых",
        userInitials: "ВК",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
