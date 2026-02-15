"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User, signOut as firebaseSignOut, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { UserProfile } from "@/types";
import { userService } from "@/services/userService";

interface AuthContextType {
    user: User | null;
    profile: UserProfile | null;
    loading: boolean;
    isAdmin: boolean;
    emailVerified: boolean;
    isAuthorizedAdmin: boolean;
    isAdminAndUnverified: boolean;
    logout: () => Promise<void>;
    refreshProfile: () => Promise<void>;
    updateProfileData: (data: Partial<UserProfile>) => Promise<void>;
    updateUserPassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    profile: null,
    loading: true,
    isAdmin: false,
    emailVerified: false,
    isAuthorizedAdmin: false,
    isAdminAndUnverified: false,
    logout: () => Promise.resolve(),
    refreshProfile: () => Promise.resolve(),
    updateProfileData: () => Promise.resolve(),
    updateUserPassword: () => Promise.resolve(),
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            try {
                if (!isMounted) return;

                setUser(firebaseUser);

                if (firebaseUser) {
                    const userProfile = await userService.getUserProfile(firebaseUser.uid);
                    if (isMounted) {
                        if (userProfile) {
                            setProfile(userProfile);
                        } else {
                            console.warn("User authenticated but profile not found in Firestore.");
                            setProfile(null);
                        }
                    }
                } else {
                    if (isMounted) setProfile(null);
                }
            } catch (error) {
                console.error("Auth state change error:", error);
                if (isMounted) setProfile(null);
            } finally {
                if (isMounted) setLoading(false);
            }
        });

        return () => {
            isMounted = false;
            unsubscribe();
        };
    }, []);

    const refreshProfile = async () => {
        if (!user) return;
        try {
            const userProfile = await userService.getUserProfile(user.uid);
            if (userProfile) {
                setProfile(userProfile);
            }
        } catch (error) {
            console.error("Error refreshing profile:", error);
        }
    };

    const updateProfileData = async (data: Partial<UserProfile>) => {
        if (!user) throw new Error("No authenticated user");
        try {
            await userService.updateProfile(user.uid, data);
            await refreshProfile();
        } catch (error) {
            console.error("Error updating profile data:", error);
            throw error;
        }
    };

    const updateUserPassword = async (currentPassword: string, newPassword: string) => {
        if (!user || !user.email) throw new Error("No authenticated user or email");
        try {
            const credential = EmailAuthProvider.credential(user.email, currentPassword);
            await reauthenticateWithCredential(user, credential);
            await updatePassword(user, newPassword);
        } catch (error) {
            throw error;
        }
    };

    const logout = async () => {
        try {
            await firebaseSignOut(auth);
            setUser(null);
            setProfile(null);
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    const value = {
        user,
        profile,
        loading,
        isAdmin: profile?.role === "admin" && user?.email === "universityshop845@gmail.com",
        emailVerified: user?.emailVerified === true,
        isAuthorizedAdmin:
            profile?.role === "admin" &&
            user?.uid === process.env.NEXT_PUBLIC_AUTHORIZED_ADMIN_UID &&
            (user?.emailVerified === true || user?.email === "universityshop845@gmail.com"),
        isAdminAndUnverified:
            profile?.role === "admin" &&
            user?.uid === process.env.NEXT_PUBLIC_AUTHORIZED_ADMIN_UID &&
            user?.emailVerified !== true &&
            user?.email !== "universityshop845@gmail.com",
        logout,
        refreshProfile,
        updateProfileData,
        updateUserPassword,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
