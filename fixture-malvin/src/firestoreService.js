import { db } from "./firebase";
import {
  doc, getDoc, setDoc,
  collection, onSnapshot, addDoc, orderBy, query, serverTimestamp
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
    snap.forEach((docSnap) => { Object.assign(all, docSnap.data()); });
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
  const ref = query(collection(db, "jornadasExtra"), orderBy("creadoEn", "asc"));
  return onSnapshot(ref, (snap) => {
    const extra = snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
    callback(extra);
  });
}