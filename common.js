// Configuration Firebase partagée par creer.html et jeu.html.
const firebaseConfig = {
  apiKey: "AIzaSyBs1dxrsJKjYZQwk9s-6A5JUMAgUz2Umc8",
  authDomain: "manhunt-42850.firebaseapp.com",
  projectId: "manhunt-42850",
  storageBucket: "manhunt-42850.firebasestorage.app",
  messagingSenderId: "721791132248",
  appId: "1:721791132248:web:a7dd7fbaf9deadddf9e02d",
  measurementId: "G-VHSC50F5ZM"
};

if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
const db = firebase.database();
let off = 0;
db.ref('.info/serverTimeOffset').on('value', snapshot => off = snapshot.val() || 0);
const now = () => Date.now() + off;
const $ = selector => document.querySelector(selector);

const DEF = {lat:48.8566, lng:2.3522, zoneR:1000, headStart:5, revealSec:150, fuzzM:150, durationMin:60};
const S = {
  id: localStorage.mhId || (localStorage.mhId = Math.random().toString(36).slice(2,10)),
  name: localStorage.mhName || '',
  code: null,
  role: localStorage.mhRole || null,
  host: false,
  rules: {...DEF},
  status: 'lobby',
  startedAt: 0,
  players: {},
  pos: null,
  pick: false,
  out: false,
  drawn: -1
};

const toast = message => {
  const element = $('#toast');
  if (!element) return;
  element.textContent = message;
  element.style.display = 'block';
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => element.style.display = 'none', 2500);
};
const fmt = ms => {
  const seconds = Math.max(0, Math.ceil(ms / 1000));
  return Math.floor(seconds / 60) + ' min ' + String(seconds % 60).padStart(2, '0') + ' s';
};
const dist = (a,b) => {
  const R=6371000,t=Math.PI/180,x=(b.lat-a.lat)*t,y=(b.lng-a.lng)*t;
  const h=Math.sin(x/2)**2+Math.cos(a.lat*t)*Math.cos(b.lat*t)*Math.sin(y/2)**2;
  return 2*R*Math.asin(Math.sqrt(h));
};
function rnd(str) {
  let h=1779033703^str.length;
  for(let i=0;i<str.length;i++){h=Math.imul(h^str.charCodeAt(i),3432918353);h=h<<13|h>>>19;}
  return()=>{h=Math.imul(h^h>>>16,2246822507);h=Math.imul(h^h>>>13,3266489909);return((h^=h>>>16)>>>0)/4294967296;};
}
const getPos = () => new Promise((resolve,reject) => {
  if (!navigator.geolocation) return reject(new Error('La géolocalisation n’est pas disponible.'));
  navigator.geolocation.getCurrentPosition(position=>resolve({lat:position.coords.latitude,lng:position.coords.longitude}),reject,{enableHighAccuracy:true,timeout:8000});
});
function notify(title,body) {
  if(window.Notification&&Notification.permission==='granted'&&navigator.serviceWorker)
    navigator.serviceWorker.ready.then(registration=>registration.showNotification(title,{body,icon:'icon.svg',vibrate:[200,100,200]})).catch(()=>{});
  if(navigator.vibrate)navigator.vibrate([200,100,200]);
}
if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(error=>console.warn('Service worker non enregistré:',error));
