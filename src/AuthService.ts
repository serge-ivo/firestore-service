// src/AuthService.ts
import {
  Auth,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  User,
  UserCredential,
  signOut,
  Unsubscribe,
} from "firebase/auth";
import { FirebaseApp } from "firebase/app"; // We need the app instance

export class AuthService {
  private readonly auth: Auth;
  private googleProvider: GoogleAuthProvider;

  /**
   * Creates an instance of AuthService.
   * @param {FirebaseApp} app - The initialized Firebase App instance.
   * @throws Error if the FirebaseApp instance is not provided.
   */
  constructor(app: FirebaseApp) {
    if (!app) {
      throw new Error(
        "FirebaseApp instance is required for AuthService constructor"
      );
    }
    this.auth = getAuth(app);
    this.googleProvider = new GoogleAuthProvider(); // Initialize Google Provider
    console.log("AuthService instance created successfully.");
  }

  /**
   * Gets the underlying Firebase Auth instance.
   * @returns {Auth} The Firebase Auth instance.
   */
  getFirebaseAuth(): Auth {
    return this.auth;
  }

  /**
   * Gets the currently signed-in user.
   * @returns {User | null} The current user object or null if not signed in.
   */
  getCurrentUser(): User | null {
    return this.auth.currentUser;
  }

  /**
   * Gets the ID of the currently signed-in user.
   * @returns {string | null} The current user's ID or null if not signed in.
   */
  getCurrentUserId(): string | null {
    return this.auth.currentUser?.uid ?? null;
  }

  /**
   * Signs in a user with email and password.
   * @param {string} email - The user's email.
   * @param {string} password - The user's password.
   * @returns {Promise<UserCredential>} A promise resolving to the user credential.
   */
  async signInWithEmailPassword(
    email: string,
    password: string
  ): Promise<UserCredential> {
    try {
      return await signInWithEmailAndPassword(this.auth, email, password);
    } catch (error) {
      console.error("Error signing in with email/password:", error);
      // Re-throw the error for the caller to handle
      throw error;
    }
  }

  /**
   * Initiates sign-in with Google using a popup.
   * @returns {Promise<UserCredential>} A promise resolving to the user credential.
   */
  async signInWithGoogle(): Promise<UserCredential> {
    try {
      // Consider adding custom parameters or scopes if needed later
      // this.googleProvider.addScope('profile');
      // this.googleProvider.setCustomParameters({ login_hint: 'user@example.com' });
      return await signInWithPopup(this.auth, this.googleProvider);
    } catch (error) {
      console.error("Error signing in with Google:", error);
      // Handle specific error codes if necessary (e.g., popup closed)
      // if (error.code === 'auth/popup-closed-by-user') { ... }
      throw error;
    }
  }

  /**
   * Signs out the current user.
   * @returns {Promise<void>}
   */
  async signOut(): Promise<void> {
    try {
      await signOut(this.auth);
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  }

  /**
   * Subscribes to changes in the user's authentication state.
   * @param {(user: User | null) => void} callback - Function to call when the auth state changes.
   * @returns {Unsubscribe} A function to unsubscribe from the listener.
   */
  onAuthStateChanged(callback: (user: User | null) => void): Unsubscribe {
    return onAuthStateChanged(this.auth, callback);
  }
}
