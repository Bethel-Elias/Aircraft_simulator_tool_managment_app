// import { createContext, useContext, useState } from "react";
// import api from "../services/api";

// const AuthContext = createContext();

// export function AuthProvider({ children }) {
//   const [user, setUser] = useState(() => {
//     const saved = localStorage.getItem("user");
//     return saved ? JSON.parse(saved) : null;
//   });

//   const [loading, setLoading] = useState(false);

//   const login = async (employee_id, password) => {
//     setLoading(true);

//     try {
//       const response = await api.post("/auth/login", {
//         employee_id,
//         password,
//       });

//       const { token, user } = response.data;

//       localStorage.setItem("token", token);
//       localStorage.setItem("user", JSON.stringify(user));

//       setUser(user);

//       return {
//         success: true,
//       };
//     } catch (error) {
//       return {
//         success: false,
//         message: error.response?.data?.message || "Unable to login",
//       };
//     } finally {
//       setLoading(false);
//     }
//   };

//   const logout = () => {
//     localStorage.removeItem("token");
//     localStorage.removeItem("user");
//     setUser(null);
//   };

//   return (
//     <AuthContext.Provider
//       value={{
//         user,
//         loading,
//         login,
//         logout,
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// }

// export function useAuth() {
//   return useContext(AuthContext);
// }



import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(true);

  // Restore and verify the session after refresh.
  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      const token = localStorage.getItem("token");

      if (!token) {
        localStorage.removeItem("user");
        setUser(null);
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const response = await api.get("/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Supports common API response formats.
        const body = response.data;
        const currentUser = body?.data?.user ?? body?.data ?? body?.user;

        if (!currentUser || !currentUser.id) {
          throw new Error("Invalid current-user response");
        }

        if (!cancelled) {
          setUser(currentUser);
          localStorage.setItem("user", JSON.stringify(currentUser));
        }
      } catch (error) {
        console.error(
          "Failed to restore session:",
          error.response?.status,
          error.response?.data || error.message
        );

        if (!cancelled) {
          // Avoid retaining an invalid session.
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setUser(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    restoreSession();

    return () => {
      cancelled = true;
    };
  }, []);

  const login = async (employee_id, password) => {
    setLoading(true);

    try {
      const response = await api.post("/auth/login", {
        employee_id,
        password,
      });

      const body = response.data;
      const payload = body?.data ?? body;
      const token = payload?.token ?? body?.token;
      const loggedInUser = payload?.user ?? body?.user;

      if (!token || !loggedInUser) {
        throw new Error("Login response does not contain a token and user");
      }

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(loggedInUser));

      setUser(loggedInUser);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message || error.message || "Unable to login",
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
