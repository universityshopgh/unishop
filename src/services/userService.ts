import {
    doc,
    getDoc,
    setDoc,
    query,
    where,
    collection,
    getDocs,
    writeBatch,
    Timestamp
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { UserProfile } from "@/types";

export const userService = {
    /**
     * Fetch a user profile by UID
     */
    async getUserProfile(uid: string): Promise<UserProfile | null> {
        const userDoc = await getDoc(doc(db, "users", uid));
        if (!userDoc.exists()) return null;
        return userDoc.data() as UserProfile;
    },

    /**
     * Find a user by username (case-insensitive)
     */
    async getUserByUsername(username: string): Promise<UserProfile | null> {
        const usernameDoc = await getDoc(doc(db, "usernames", username.toLowerCase()));
        if (!usernameDoc.exists()) return null;

        const uid = usernameDoc.data().uid;
        return this.getUserProfile(uid);
    },

    /**
     * Check if a username is available
     */
    async isUsernameAvailable(username: string): Promise<boolean> {
        if (!username || username.length < 3) return false;
        const usernameDoc = await getDoc(doc(db, "usernames", username.toLowerCase()));

        if (!usernameDoc.exists()) return true;

        // Check if the linked user actually exists (handle orphaned usernames from manual deletions)
        try {
            const uid = usernameDoc.data().uid;
            const userDoc = await getDoc(doc(db, "users", uid));
            // If the user document is missing, the username is orphaned and effectively available
            return !userDoc.exists();
        } catch (error) {
            console.error("Error checking username availability:", error);
            // Fallback: If we can't verify user, assume taken to be safe, or available? 
            // Better to assume taken if error, but here we want to allow recovery.
            // Let's assume if we can't read the user, something is wrong, but default to legacy behavior (taken).
            return false;
        }
    },

    /**
     * Check if an email is already registered
     */
    async isEmailRegistered(email: string): Promise<boolean> {
        if (!email) return false;
        const q = query(collection(db, "users"), where("email", "==", email.toLowerCase()));
        const snapshot = await getDocs(q);
        return !snapshot.empty;
    },

    /**
     * Check if a phone number is already registered
     */
    async isPhoneNumberRegistered(phone: string): Promise<boolean> {
        if (!phone) return false;
        const q = query(collection(db, "users"), where("phoneNumber", "==", phone));
        const snapshot = await getDocs(q);
        return !snapshot.empty;
    },

    /**
     * Create a new user account with a linked username
     */
    async createUserAccount(profile: UserProfile): Promise<void> {
        const batch = writeBatch(db);
        const lowerUsername = profile.username.toLowerCase();

        // 1. Create main user profile
        batch.set(doc(db, "users", profile.uid), {
            ...profile,
            username: lowerUsername,
            createdAt: Timestamp.now()
        });

        // 2. Create username mapping for faster login/lookup
        batch.set(doc(db, "usernames", lowerUsername), {
            uid: profile.uid
        });

        await batch.commit();
    },

    /**
     * Update user profile data
     */
    async updateProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
        const userRef = doc(db, "users", uid);
        await setDoc(userRef, data, { merge: true });
    }
};
