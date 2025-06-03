"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.useAuth = void 0;
exports.AuthProvider = AuthProvider;
const react_1 = require("react");
const auth_1 = require("firebase/auth");
const firebase_1 = require("./firebase");
const AuthContext = (0, react_1.createContext)({});
function AuthProvider({ children }) {
    const [user, setUser] = (0, react_1.useState)(null);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [isAdmin, setIsAdmin] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        const unsubscribe = (0, auth_1.onAuthStateChanged)(firebase_1.auth, async (user) => {
            setUser(user);
            if (user) {
                const adminStatus = await (0, firebase_1.isUserAdmin)(user.uid);
                setIsAdmin(adminStatus);
            }
            else {
                setIsAdmin(false);
            }
            setLoading(false);
        });
        return unsubscribe;
    }, []);
    const signIn = async (email, password) => {
        await (0, auth_1.signInWithEmailAndPassword)(firebase_1.auth, email, password);
    };
    const signUp = async (email, password) => {
        await (0, auth_1.createUserWithEmailAndPassword)(firebase_1.auth, email, password);
    };
    const logout = async () => {
        await (0, auth_1.signOut)(firebase_1.auth);
    };
    return (<AuthContext.Provider value={{ user, loading, isAdmin, signIn, signUp, logout }}>
      {!loading && children}
    </AuthContext.Provider>);
}
const useAuth = () => (0, react_1.useContext)(AuthContext);
exports.useAuth = useAuth;
