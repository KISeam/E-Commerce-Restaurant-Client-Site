import React, { useState, useEffect, createContext } from "react";
import {
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";
import { app } from "../firebase/firebase.config";
import useAxiosPublic from "../hooks/useAxiosPublic";

export const AuthContext = createContext(null);

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Firebase user
  const [dbUser, setDbUser] = useState(null); // MongoDB user
  const [loading, setLoading] = useState(true);
  const axiosPublic = useAxiosPublic();

  // ✅ Save user to DB & store token
  const saveUserToDB = async (userData) => {
    try {
      const res = await axiosPublic.post("/users", userData);
      localStorage.setItem("access-token", res.data.token);
      setDbUser(res.data.user);
    } catch (err) {
      console.error("User save/token error:", err);
    }
  };

  // ✅ Signup with email/password
  const createUser = async (email, password) => {
    setLoading(true);
    try {
      // Input validation
      if (!email || !password) {
        throw new Error("Email and password are required.");
      }
      if (password.length < 6) {
        throw new Error("Password must be at least 6 characters long.");
      }

      // Create user in Firebase
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const currentUser = result.user;

      // Update user profile
      await updateProfile(currentUser, {
        displayName: currentUser.displayName || "User",
        photoURL: currentUser.photoURL || "",
      });

      // Prepare data for backend
      const userData = {
        name: currentUser.displayName || "User",
        email: currentUser.email,
        image: currentUser.photoURL || "",
        role: "user",
        password, // Send password to backend for hashing
      };

      await saveUserToDB(userData);
      setLoading(false);
      return result;
    } catch (error) {
      console.error("Error creating user:", error);
      setLoading(false);
      throw error;
    }
  };

  // ✅ Login with email/password
  const login = async (email, password) => {
    setLoading(true);
    const result = await signInWithEmailAndPassword(auth, email, password);
    const currentUser = result.user;

    await currentUser.reload(); // Fixes Firebase user state issue

    if (!currentUser.emailVerified) {
      throw new Error("Please verify your email before logging in.");
    }

    try {
      const res = await axiosPublic.post("/users/login", { email, password });
      localStorage.setItem("access-token", res.data.token);
      setDbUser(res.data.user);
    } catch (err) {
      console.error("Login token error:", err);
      throw err;
    }

    return result;
  };

  // ✅ Google Sign-In
  const googleSignIn = async () => {
    setLoading(true);
    const result = await signInWithPopup(auth, googleProvider);
    const currentUser = result.user;

    const userData = {
      name: currentUser.displayName,
      email: currentUser.email,
      image: currentUser.photoURL,
      role: "user",
    };

    await saveUserToDB(userData);
    return result;
  };

  const logout = () => {
    setLoading(true);
    localStorage.removeItem("access-token");
    return signOut(auth);
  };

  // ✅ Firebase user watcher
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      if (currentUser?.email) {
        try {
          const res = await axiosPublic.get(`/users/${currentUser.email}`);
          setDbUser(res.data || null);
        } catch (err) {
          console.error("Failed to fetch DB user:", err);
          setDbUser(null);
        }
      } else {
        setDbUser(null);
      }
    });

    return () => unsubscribe();
  }, [axiosPublic]);

  const authInfo = {
    user,
    dbUser,
    loading,
    createUser,
    googleSignIn,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={authInfo}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
