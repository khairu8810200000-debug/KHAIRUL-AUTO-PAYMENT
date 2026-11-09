// Run only in a trusted local environment or Google Cloud Shell.
// Requires: npm install firebase-admin
// Authenticate with Application Default Credentials that have permission to
// update Firebase Authentication users, then run:
// node scripts/set-admin-claim.cjs 7SaWJmeHqrUbWK9VX9GqUX0abQA2
const admin = require("firebase-admin");
const uid = process.argv[2];
if (!uid) { console.error("Usage: node scripts/set-admin-claim.cjs <FIREBASE_USER_UID>"); process.exit(1); }
admin.initializeApp({ credential: admin.credential.applicationDefault(), projectId: "khairul-auto-payment" });
(async () => {
  await admin.auth().setCustomUserClaims(uid, { admin: true });
  console.log("Admin claim set. Sign out and sign in again in the web app to refresh the ID token.");
  await admin.app().delete();
})().catch(async (error) => { console.error(error); try { await admin.app().delete(); } catch {} process.exit(1); });
