import React, { useState, useEffect, createContext } from "react";
import {
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
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

  const createUser = (email, password) => {
    setLoading(true);
    return createUserWithEmailAndPassword(auth, email, password);
  };

  const login = (email, password) => {
    setLoading(true);
    return signInWithEmailAndPassword(auth, email, password)
      .then((result) => {
        const user = result.user;
        if (!user.emailVerified) {
          throw new Error("Please verify your email before logging in.");
        }
        return result;
      })
      .catch((err) => {
        setLoading(false);
        throw err;
      });
  };

  const googleSignIn = () => {
    setLoading(true);
    return signInWithPopup(auth, googleProvider)
      .then((result) => {
        return result;
      })
      .catch((error) => {
        setLoading(false);
        throw error;
      });
  };

  const logout = () => {
    setLoading(true);
    return signOut(auth);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      if (currentUser?.email) {
        try {
          const res = await useAxiosPublic(`/users/${currentUser.email}`);
          setDbUser(res.data);
        } catch (err) {
          console.error("Failed to fetch DB user:", err);
          setDbUser(null);
        }
      } else {
        setDbUser(null);
      }
    });

    return () => unsubscribe();
  }, []);
  
  const axiosPublic = useAxiosPublic();
  useEffect(() => {
    if (user) {
      axiosPublic
        .get(`/users/${user.email}`)
        .then((res) => setDbUser(res.data))
        .catch((err) => console.error("Failed to fetch DB user:", err));
    }
  }, [user, axiosPublic]);

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
    <AuthContext.Provider value={authInfo}>{children}</AuthContext.Provider>
  );
};

export default AuthProvider;
