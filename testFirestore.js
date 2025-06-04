const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

db.collection('cursos').get()
  .then(snapshot => {
    snapshot.forEach(doc => {
      console.log(doc.id, '=>', doc.data());
    });
    process.exit(0);
  })
  .catch(error => {
    console.error('Error al conectar a Firestore:', error);
    process.exit(1);
  });
