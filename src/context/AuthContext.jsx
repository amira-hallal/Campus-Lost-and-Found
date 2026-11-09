import { createContext, useContext, useState } from "react";
import { useData } from "./DataContext";

const AuthContext = createContext(null);

const sameEmail = (a, b) => a.trim().toLowerCase() === b.trim().toLowerCase();

export function AuthProvider({ children }) {
  const { users, addUser } = useData();
  const [currentUserId, setCurrentUserId] = useState(null);

  // Read the user from DataContext so profile changes show up everywhere
  const currentUser = users.find((user) => user.id === currentUserId) ?? null;

  const emailExists = (email) => users.some((user) => sameEmail(user.email, email));

  // Returns the user if the email and password match, otherwise null
  const login = (email, password) => {
    const user = users.find((entry) => sameEmail(entry.email, email) && entry.password === password);
    if (user) setCurrentUserId(user.id);
    return user ?? null;
  };

  const logout = () => setCurrentUserId(null);

  // Adds the new user to the users array and logs them in
  const register = ({ name, email, password, role }) => {
    const newUser = addUser({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      role: role || "student",
    });
    setCurrentUserId(newUser.id);
    return newUser;
  };

  const value = { currentUser, login, logout, register, emailExists };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside <AuthProvider>");
  return context;
}
