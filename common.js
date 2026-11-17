// 1. Colle ici la configuration de ton projet Firebase
const CFG = {
  apiKey: "A_REMPLIR",
  authDomain: "A_REMPLIR",
  databaseURL: "A_REMPLIR",
  projectId: "A_REMPLIR",
  appId: "A_REMPLIR"
};
firebase.initializeApp(CFG);
const db = firebase.database();
let off = 0; db.ref('.info/serverTimeOffset').on('value', s => off = s.val() || 0);
const now = () => Date.now() + off;
const $ = s => document.querySelector(s);

// Réglages par défaut, tous modifiables par l'hôte pendant la partie
const DEF = {lat:48.8566, lng:2.3522, zoneR:1000, headStart:5, revealSec:150, fuzzM:150, durationMin:60};
const S = {id: localStorage.mhId || (localStorage.mhId = Math.random().toString(36).slice(2,10)),
  name:'', code:null, role:null, host:false, rules:{...DEF}, status:'lobby', startedAt:0,
  players:{}, pos:null, pick:false, out:false, drawn:-1};

const toast = t => { const e = $('#toast'); e.textContent = t; e.style.display = 'block'; setTimeout(() => e.style.display = 'none', 2500); };
const fmt = ms => { const s = Math.max(0, Math.ceil(ms/1000)); return Math.floor(s/60) + ' min ' + String(s%60).padStart(2,'0') + ' s'; };
const dist = (a,b) => { const R=6371000,t=Math.PI/180,x=(b.lat-a.lat)*t,y=(b.lng-a.lng)*t,h=Math.sin(x/2)**2+Math.cos(a.lat*t)*Math.cos(b.lat*t)*Math.sin(y/2)**2; return 2*R*Math.asin(Math.sqrt(h)); };
function rnd(str){ let h = 1779033703 ^ str.length; for (let i=0;i<str.length;i++){ h = Math.imul(h ^ str.charCodeAt(i), 3432918353); h = h<<13 | h>>>19; }
  return () => { h = Math.imul(h ^ h>>>16, 2246822507); h = Math.imul(h ^ h>>>13, 3266489909); return ((h ^= h>>>16) >>> 0) / 4294967296; }; }
const getPos = () => new Promise((ok, ko) => navigator.geolocation.getCurrentPosition(p => ok({lat:p.coords.latitude, lng:p.coords.longitude}), ko, {enableHighAccuracy:true, timeout:8000}));
function notify(t, b){ if (window.Notification && Notification.permission === 'granted' && navigator.serviceWorker)
  navigator.serviceWorker.ready.then(r => r.showNotification(t, {body:b, icon:'icon.svg', vibrate:[200,100,200]})); if (navigator.vibrate) navigator.vibrate([200,100,200]); }

S.name = localStorage.mhName || '';
S.role = localStorage.mhRole || null;

if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js');
