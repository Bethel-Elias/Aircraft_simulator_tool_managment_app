
// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import styles from "./Login.module.css";
// import { Eye, EyeOff } from "lucide-react";
// import api from "../../services/api";

// export default function Login() {
//   const [username, setUsername] = useState("");
//   const [password, setPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);

//   const navigate = useNavigate();

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!username.trim() || !password) {
//       alert("Please enter your username and password.");
//       return;
//     }

//     try {
//       // Connect this to your Express login API.
//       const response = await api.post("http://localhost:5000/auth/login", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           employee_id: username,
//           password,
//         }),
//       });

//       const data = await response.json();

//       if (!response.ok || !data.success) {
//         alert(data.message || "Invalid username or password.");
//         return;
//       }

//       localStorage.setItem("token", data.token);
//       navigate("/dashboard");
//     } catch (error) {
//       console.error("Login error:", error);
//       alert("Unable to connect to the server. Please try again.");
//     }
//   };

//   return (
//     <main className={styles["login-page"]}>
//       <section className={styles["login-layout"]}>
//         <div className={styles["login-card"]}>
//           <div className={styles["login-heading"]}>
//             <h2>Welcome Back</h2>
//             <p>Sign in to manage your tools and workshop operations</p>
//           </div>

//           <form onSubmit={handleSubmit}>
//             <div className={styles["form-group"]}>
//               <label htmlFor="username">Username</label>

//               <input
//                 id="username"
//                 type="text"
//                 placeholder="e.g. 12345"
//                 value={username}
//                 onChange={(e) => setUsername(e.target.value)}
//                 autoComplete="username"
//                 required
//               />
//             </div>

//             <div
//               className={`${styles["form-group"]} ${styles["password-group"]}`}
//             >
//               <div className={styles["password-label-row"]}>
//                 <label htmlFor="password">Password</label>

//                 <button
//                   type="button"
//                   className={styles["forgot-link"]}
//                   onClick={() => navigate("/forgot-password")}
//                 >
//                   Forgot password?
//                 </button>
//               </div>

//               <div className={styles["password-input-wrapper"]}>
//                 <input
//                   id="password"
//                   type={showPassword ? "text" : "password"}
//                   placeholder="Enter your password"
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   autoComplete="current-password"
//                   required
//                 />

//                 <button
//                   type="button"
//                   className={styles["password-toggle"]}
//                   onClick={() => setShowPassword((prev) => !prev)}
//                   aria-label={showPassword ? "Hide password" : "Show password"}
//                 >
//                   {showPassword ? (
//                     <EyeOff size={18} strokeWidth={1.8} />
//                   ) : (
//                     <Eye size={18} strokeWidth={1.8} />
//                   )}
//                 </button>
//               </div>
//             </div>

//             <button type="submit" className={styles["sign-in-button"]}>
//               Sign In
//             </button>
//           </form>

//           <footer className={styles["login-footer"]}>
//             <span className={styles["footer-plane"]} aria-hidden="true">
//               ✈
//             </span>
//             <span>Ethiopian Airlines Aviation Academy</span>
//           </footer>
//         </div>
//       </section>
//     </main>
//   );
// }


import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Login.module.css";
import { Eye, EyeOff } from "lucide-react";
import api from "../../services/api";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!username.trim() || !password) {
      setError("Please enter your employee ID and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/auth/login", {
        employee_id: username.trim(),
        password,
      });

      const data = response.data;

      if (!data.success || !data.token) {
        setError(data.message || "Login failed.");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      navigate("/dashboard", { replace: true });
    } catch (error) {
      console.error("Login error:", error);

      setError(
        error.response?.data?.message ||
          "Unable to connect to the server. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles["login-page"]}>
      <section className={styles["login-layout"]}>
        <div className={styles["login-card"]}>
          <div className={styles["login-heading"]}>
            <h2>Welcome Back</h2>
            <p>
              Sign in to manage your tools and workshop operations
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className={styles["form-group"]}>
              <label htmlFor="username">Employee ID</label>

              <input
                id="username"
                type="text"
                placeholder="e.g. 18040"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                required
                disabled={loading}
              />
            </div>

            <div
              className={`${styles["form-group"]} ${styles["password-group"]}`}
            >
              <div className={styles["password-label-row"]}>
                <label htmlFor="password">Password</label>

                <button
                  type="button"
                  className={styles["forgot-link"]}
                  onClick={() => navigate("/forgot-password")}
                  disabled={loading}
                >
                  Forgot password?
                </button>
              </div>

              <div className={styles["password-input-wrapper"]}>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  disabled={loading}
                />

                <button
                  type="button"
                  className={styles["password-toggle"]}
                  onClick={() =>
                    setShowPassword((prev) => !prev)
                  }
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff size={18} strokeWidth={1.8} />
                  ) : (
                    <Eye size={18} strokeWidth={1.8} />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <p role="alert" className={styles["login-error"]}>
                {error}
              </p>
            )}

            <button
              type="submit"
              className={styles["sign-in-button"]}
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <footer className={styles["login-footer"]}>
            <span
              className={styles["footer-plane"]}
              aria-hidden="true"
            >
              ✈
            </span>
            <span>Ethiopian Airlines Aviation Academy</span>
          </footer>
        </div>
      </section>
    </main>
  );
}

