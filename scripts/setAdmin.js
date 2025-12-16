const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const uid = "54XPPDAv7faWrJjLaT5SdkkSk8K2";

admin.auth().setCustomUserClaims(uid, {
  admin: true,
})
.then(() => {
  console.log("✅ Admin role assigned");
  process.exit();
})
.catch(err => {
  console.error("❌ Error:", err);
  process.exit(1);
});
