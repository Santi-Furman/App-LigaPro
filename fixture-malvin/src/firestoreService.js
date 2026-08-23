import { db } from "./firebase";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  collectionGroup,
  onSnapshot,
  addDoc,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";

export async function getJornadaResults(jornadaId) {
  const ref = doc(db, "resultados", jornadaId);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : {};
}

export async function saveJornadaResults(jornadaId, payload) {
  const ref = doc(db, "resultados", jornadaId);
  await setDoc(ref, payload, { merge: true });
}

export function subscribeToAllResults(callback) {
  const ref = collection(db, "resultados");

  return onSnapshot(ref, (snap) => {
    const all = {};

    snap.forEach((docSnap) => {
      Object.assign(all, docSnap.data());
    });

    callback(all);
  });
}

export async function addExtraJornada({ fecha, partidos, nombre }) {
  const ref = collection(db, "jornadasExtra");

  await addDoc(ref, {
    fecha,
    partidos,
    nombre: nombre || "Desempate",
    creadoEn: serverTimestamp(),
  });
}

export function subscribeToExtraJornadas(callback) {
  const ref = query(
    collection(db, "jornadasExtra"),
    orderBy("creadoEn", "asc")
  );

  return onSnapshot(ref, (snap) => {
    const extra = snap.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    }));

    callback(extra);
  });
}

/* =========================
   ESTADÍSTICAS DEL PLANTEL
========================= */

export function subscribeToPlayerStats(callback) {
  const ref = doc(db, "plantel", "estadisticas");

  return onSnapshot(ref, (snap) => {
    callback(snap.exists() ? snap.data() : {});
  });
}

export async function savePlayerStats(playerId, stats) {
  const ref = doc(db, "plantel", "estadisticas");

  await setDoc(
    ref,
    {
      [playerId]: stats,
    },
    { merge: true }
  );
}

/* =========================
   PENCA
========================= */

export async function savePrediction(playerId, prediction) {
  const ref = doc(
    db,
    "predicciones",
    prediction.jornadaId,
    "jugadores",
    playerId
  );

  await setDoc(ref, {
    playerId,
    local: prediction.local,
    rival: prediction.rival,
    jornadaId: prediction.jornadaId,
    creadaEn: serverTimestamp(),
  });
}

export async function getPrediction(playerId, jornadaId) {
  const ref = doc(
    db,
    "predicciones",
    jornadaId,
    "jugadores",
    playerId
  );

  const snap = await getDoc(ref);

  return snap.exists() ? snap.data() : null;
}

export function subscribeToAllPredictions(callback) {
  const ref = collectionGroup(db, "jugadores");

  return onSnapshot(ref, (snap) => {
    const predictions = snap.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    }));

    callback(predictions);
  });
}