const firebase = require('firebase');
const Slack = require('node-slack');

const slack = new Slack(process.env.REACT_APP_SLACK_HOOK_URL, {});

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET
};

const firebaseApp = firebase.initializeApp(firebaseConfig);
const ref = firebaseApp.database().ref().child('web').child('forms');

const date = new Date();
const localeDateString = date.toLocaleDateString('en-US');

ref.once('value').then(async (snap) => {
  const submissions = Object.keys(snap.val()).map((k) => snap.val()[k]);
  const submittedToday = submissions.filter((s) => s.date === localeDateString);

  for (let submission of submittedToday) {
    await postToSlack(submission);
  }

  process.exit()
});

const postToSlack = async (data) => {
  let message = `${data.firstName} ${data.lastName} (email: ${data.email}) from ${data.school} just submitted a form.\n\n`
  
  if (data.comments.length) {
    message += `In the comments section he/she wrote: ${data.comments}`
  }

  await slack.send({
    text: message,
    channel: '#growth',
    username: 'Form-Bot'
  });

  return;
}