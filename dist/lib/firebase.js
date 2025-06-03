"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storage = exports.analytics = exports.db = exports.auth = exports.app = void 0;
const app_1 = require("firebase/app");
const auth_1 = require("firebase/auth");
const firestore_1 = require("firebase/firestore");
const analytics_1 = require("firebase/analytics");
const storage_1 = require("firebase/storage");
const firebaseConfig = {
    apiKey: "AIzaSyAaBH5fLGpeTxZ3tujt59_OXIWE8HQHDNU",
    authDomain: "eduplus-2cadd.firebaseapp.com",
    projectId: "eduplus-2cadd",
    storageBucket: "eduplus-2cadd.appspot.com",
    messagingSenderId: "1015363195331",
    appId: "1:1015363195331:web:c9acfeba101a4d7457ad76",
    measurementId: "G-PTJBEJDYVM"
};
// Initialize Firebase
const app = (0, app_1.getApps)().length === 0 ? (0, app_1.initializeApp)(firebaseConfig) : (0, app_1.getApps)()[0];
exports.app = app;
const auth = (0, auth_1.getAuth)(app);
exports.auth = auth;
const db = (0, firestore_1.getFirestore)(app);
exports.db = db;
const storage = (0, storage_1.getStorage)(app);
exports.storage = storage;
let analytics = null;
exports.analytics = analytics;
if (typeof window !== 'undefined') {
    exports.analytics = analytics = (0, analytics_1.getAnalytics)(app);
}
