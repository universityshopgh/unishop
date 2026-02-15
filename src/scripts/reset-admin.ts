
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, deleteDoc, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyDE8zhFyTIPMCvdxzp_kZsTFkWcy65CxE8",
    authDomain: "unishop-15bb5.firebaseapp.com",
    projectId: "unishop-15bb5",
    storageBucket: "unishop-15bb5.firebasestorage.app",
    messagingSenderId: "155423477262",
    appId: "1:155423477262:web:1b8beb86749af0b549f65f",
    measurementId: "G-NG2LT57V31"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const ADMIN_USER = {
    username: "Kingsford",
    email: "universityshop845@gmail.com",
    phoneNumber: "0599764428",
    password: "ChangeMe123!", // Default password
    role: "admin"
};

async function resetUsers() {
    console.log("🔥 Starting user reset process...");

    try {
        // 1. Clear existing users collection in Firestore
        console.log("🗑️ Clearing users collection...");
        const usersRef = collection(db, "users");
        const snapshot = await getDocs(usersRef);

        if (snapshot.empty) {
            console.log("ℹ️ No users found in Firestore.");
        } else {
            const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
            await Promise.all(deletePromises);
            console.log(`✅ Deleted ${snapshot.size} user documents.`);
        }

        // 2. Create Admin User
        console.log("👑 Creating Admin User...");

        let uid = "";

        // Try to create the user in Auth
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, ADMIN_USER.email, ADMIN_USER.password);
            uid = userCredential.user.uid;
            console.log("✅ Created new Auth user:", uid);

            // Update profile
            await updateProfile(userCredential.user, {
                displayName: ADMIN_USER.username
            });
        } catch (error: any) {
            if (error.code === 'auth/email-already-in-use') {
                console.log("ℹ️ User already exists in Auth. Attempting to sign in to get UID...");
                // In a script, we can't easily sign in without the password if we didn't just create it.
                // Assuming the user might want to manually delete the user from Auth console if this fails,
                // OR we just create the Firestore doc.
                // We'll warn the user.
                console.warn("⚠️ User already exists in Firebase Auth. Make sure the UID matches or delete the user in the Firebase Console and run again.");
                console.warn("⚠️ Proceeding to force-create/update Firestore document for this email. Note: You might need to manually check the UID.");

                // We'll try to find the user by email? Client SDK can't list users.
                // We'll just create a doc with a known ID or ask user to fix it.
                // Actually, for "admin credentials", the Firestore doc ID *must* match the Auth UID.
                // Without the UID, we can't link them properly in security rules usually.
                // Use a placeholder UID or try to sign in with the default password?
                // If password matches default, we can get UID.
                try {
                    const { signInWithEmailAndPassword } = await import("firebase/auth");
                    const userCredential = await signInWithEmailAndPassword(auth, ADMIN_USER.email, ADMIN_USER.password);
                    uid = userCredential.user.uid;
                    console.log("✅ Signed in successfully. UID:", uid);
                } catch (signInError) {
                    console.error("❌ Could not sign in with default password. Cannot retrieve UID for existing user.");
                    console.error("Please delete the user 'universityshop845@gmail.com' from Firebase Authentication Console and run this script again.");
                    process.exit(1);
                }
            } else {
                throw error;
            }
        }

        if (uid) {
            // Create Firestore Document
            await setDoc(doc(db, "users", uid), {
                uid: uid,
                email: ADMIN_USER.email,
                username: ADMIN_USER.username,
                displayName: ADMIN_USER.username,
                phoneNumber: ADMIN_USER.phoneNumber,
                role: "admin",
                createdAt: serverTimestamp(),
                phoneVerified: true,
                phoneVerifiedAt: serverTimestamp()
            });
            console.log("✅ Admin user created in Firestore.");
            console.log(`
🎉 Admin Credentials Setup Complete!
------------------------------------
Email: ${ADMIN_USER.email}
Password: ${ADMIN_USER.password}
Role: admin
------------------------------------
please change the password after first login!
`);
        }

    } catch (error) {
        console.error("❌ Error resetting users:", error);
    }
}

resetUsers();
