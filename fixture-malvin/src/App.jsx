import { useState, useEffect, useMemo } from "react";
import { jornadas as JORNADAS_FIJAS, MI } from "./data/jornadas";
import { subscribeToAllResults, subscribeToExtraJornadas, saveJornadaResults } from "./firestoreService";
import { computeStandings } from "./utils/standings";
import MisPartidos from "./components/MisPartidos";
import FixtureGeneral from "./components/FixtureGeneral";
import Posiciones from "./components/Posiciones";
import AgregarJornada from "./components/AgregarJornada";
import "./App.css";

export default function App() {
  const [activeTab, setActiveTab] = useState("mine");
  const [results, setResults] = useState({});
  const [extraJornadas, setExtraJornadas] = useState([]);

  useEffect(() => {
    const unsubResults = subscribeToAllResults(setResults);
    const unsubExtra = subscribeToExtraJornadas(setExtraJornadas);
    return () => {
      unsubResults();
      unsubExtra();
    };
  }, []);

  const allJornadas = useMemo(
    () => [
      ...JORNADAS_FIJAS,
      ...extraJornadas.map((e, idx) => ({
        id: e.id,
        n: JORNADAS_FIJAS.length + idx + 1,
        fecha: e.fecha,
        partidos: e.partidos,
        esExtra: true,
        nombre: e.nombre,
      })),
    ],
    [extraJornadas]
  );

  const standings = useMemo(() => computeStandings(allJornadas, results), [allJornadas, results]);

  function handleScoreChange(jornadaId, matchIndex, side, value) {
    const matchKey = jornadaId + "_" + matchIndex;
    const current = results[matchKey] || { h: "", a: "" };
    const updated = { ...current, [side]: value };

    setResults((prev) => ({ ...prev, [matchKey]: updated }));

    const jornada = allJornadas.find((j) => j.id === jornadaId);
    const payload = {};
    jornada.partidos.forEach((_, i) => {
      const key = jornadaId + "_" + i;
      const val = key === matchKey ? updated : results[key];
      if (val) payload[key] = val;
    });
    saveJornadaResults(jornadaId, payload);
  }

  return (
    <div className="app">
      <header>
        <div className="header-inner">
          <p className="eyebrow">Serie 4 · Divisional B · Clausura 2026</p>
          <h1>Fixture Sportivo Malvin</h1>
          <p className="subtitle">15 jornadas · liga a una vuelta entre 15 equipos · Pro Fútbol</p>
        </div>
      </header>

      <div className="tabs">
        <button className={`tab-btn ${activeTab === "mine" ? "active" : ""}`} onClick={() => setActiveTab("mine")}>Mis partidos</button>
        <button className={`tab-btn ${activeTab === "all" ? "active" : ""}`} onClick={() => setActiveTab("all")}>Fixture general</button>
        <button className={`tab-btn ${activeTab === "table" ? "active" : ""}`} onClick={() => setActiveTab("table")}>Posiciones</button>
        <button className={`tab-btn ${activeTab === "add" ? "active" : ""}`} onClick={() => setActiveTab("add")}>Agregar jornada</button>
      </div>

      <main>
        {activeTab === "mine" && <MisPartidos jornadas={allJornadas} mi={MI} />}
        {activeTab === "all" && (
          <FixtureGeneral jornadas={allJornadas} mi={MI} results={results} onScoreChange={handleScoreChange} />
        )}
        {activeTab === "table" && <Posiciones standings={standings} mi={MI} />}
        {activeTab === "add" && <AgregarJornada />}
      </main>

      <footer>Datos compartidos: todos los que abren este link ven y pueden cargar los mismos datos.</footer>
    </div>
  );
}