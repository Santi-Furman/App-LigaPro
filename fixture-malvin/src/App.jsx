import { useState, useEffect, useMemo } from "react";
import { jornadas as JORNADAS_FIJAS, MI } from "./data/jornadas";
import { PLANTEL } from "./data/plantel";
import {
  subscribeToAllResults,
  subscribeToExtraJornadas,
  saveJornadaResults,
  subscribeToPlayerStats,
  savePlayerStats,
} from "./firestoreService";
import { computeStandings } from "./utils/standings";
import MisPartidos from "./components/MisPartidos";
import FixtureGeneral from "./components/FixtureGeneral";
import Posiciones from "./components/Posiciones";
import AgregarJornada from "./components/AgregarJornada";
import "./App.css";

function ProximoPartido({ jornadas, mi }) {
  const [hoy, setHoy] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setHoy(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const proximo = useMemo(() => {
    const partidos = [];

    jornadas.forEach((jornada) => {
      jornada.partidos.forEach((partido) => {
        if (partido.includes(mi)) {
          const [dia, mes, anio] = jornada.fecha.split("/").map(Number);

          partidos.push({
            jornada,
            rival: partido[0] === mi ? partido[1] : partido[0],
            fecha: new Date(anio, mes - 1, dia),
            esLocal: partido[0] === mi,
          });
        }
      });
    });

    return partidos
      .filter((partido) => {
        const fechaPartido = new Date(partido.fecha);
        fechaPartido.setHours(23, 59, 59, 999);
        return fechaPartido >= hoy;
      })
      .sort((a, b) => a.fecha - b.fecha)[0];
  }, [jornadas, mi, hoy]);

  if (!proximo) return null;

  const hoySinHora = new Date(hoy);
  hoySinHora.setHours(0, 0, 0, 0);

  const partidoSinHora = new Date(proximo.fecha);
  partidoSinHora.setHours(0, 0, 0, 0);

  const diferencia = partidoSinHora - hoySinHora;
  const dias = Math.ceil(diferencia / (1000 * 60 * 60 * 24));

  const fechaTexto = proximo.fecha.toLocaleDateString("es-UY", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <section className="next-match">
      <div className="next-match-label">⚽ PRÓXIMO PARTIDO</div>

      <div className="next-match-jornada">
        Jornada {proximo.jornada.n}
      </div>

      <div className="next-match-teams">
        <span className={proximo.esLocal ? "our-team" : ""}>
          {proximo.esLocal ? mi : proximo.rival}
        </span>

        <span className="next-match-vs">VS</span>

        <span className={!proximo.esLocal ? "our-team" : ""}>
          {proximo.esLocal ? proximo.rival : mi}
        </span>
      </div>

      <div className="next-match-date">
        📅 {fechaTexto}
      </div>

      <div className="next-match-countdown">
        {dias === 0
          ? "¡ES HOY!"
          : dias === 1
            ? "FALTA 1 DÍA"
            : `FALTAN ${dias} DÍAS`}
      </div>
    </section>
  );
}

function Plantel() {
  const [firebaseStats, setFirebaseStats] = useState({});
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToPlayerStats(setFirebaseStats);

    return () => unsubscribe();
  }, []);

  function getPlayerId(jugador) {
    return jugador.nombre
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "-");
  }

  function getStats(jugador) {
    const id = getPlayerId(jugador);
    const saved = firebaseStats[id];

    return {
      pj: saved?.pj ?? jugador.pj,
      goles: saved?.goles ?? jugador.goles,
      asistencias: saved?.asistencias ?? jugador.asistencias,
    };
  }

  function updateLocalStat(jugador, field, value) {
    const id = getPlayerId(jugador);

    setFirebaseStats((prev) => ({
      ...prev,
      [id]: {
        ...getStats(jugador),
        [field]: Math.max(0, Number(value) || 0),
      },
    }));
  }

  async function guardarEstadisticas() {
    setSaving(true);

    try {
      for (const jugador of PLANTEL) {
        const id = getPlayerId(jugador);
        const stats = getStats(jugador);

        await savePlayerStats(id, stats);
      }

      setEditing(false);
    } catch (error) {
      console.error("Error guardando estadísticas:", error);
      alert("No se pudieron guardar las estadísticas.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="plantel-section">
      <div
        className="section-heading"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <div>
          <p className="section-eyebrow">SPORTIVO MALVIN</p>
          <h2>Plantel</h2>
        </div>

        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            style={{
              border: "none",
              borderRadius: "8px",
              padding: "9px 14px",
              background: "var(--pitch)",
              color: "#fff",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            ✏️ Editar
          </button>
        ) : (
          <div style={{ display: "flex", gap: "6px" }}>
            <button
              onClick={() => setEditing(false)}
              disabled={saving}
              style={{
                border: "1px solid var(--line)",
                borderRadius: "8px",
                padding: "9px 12px",
                background: "#fff",
                color: "var(--muted)",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Cancelar
            </button>

            <button
              onClick={guardarEstadisticas}
              disabled={saving}
              style={{
                border: "none",
                borderRadius: "8px",
                padding: "9px 12px",
                background: "var(--gold)",
                color: "var(--pitch-dark)",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              {saving ? "Guardando..." : "Guardar"}
            </button>
          </div>
        )}
      </div>

      <div className="plantel-grid">
        {PLANTEL.map((jugador) => {
          const stats = getStats(jugador);

          return (
            <article
              className="player-card"
              key={`${jugador.numero}-${jugador.nombre}`}
            >
              <div className="player-top">
                <div className="player-number">
                  {jugador.numero ?? "—"}
                </div>

                <div className="player-info">
                  <h3>{jugador.nombre}</h3>
                  <p>{jugador.posicion}</p>
                </div>
              </div>

              <div className="player-stats">
                <div className="player-stat">
                  {editing ? (
                    <input
                      type="number"
                      min="0"
                      value={stats.goles}
                      onChange={(e) =>
                        updateLocalStat(jugador, "goles", e.target.value)
                      }
                      style={{
                        width: "48px",
                        textAlign: "center",
                        border: "1px solid var(--line)",
                        borderRadius: "6px",
                        fontSize: "18px",
                        fontWeight: 700,
                      }}
                    />
                  ) : (
                    <strong>{stats.goles}</strong>
                  )}
                  <span>⚽ Goles</span>
                </div>

                <div className="player-stat">
                  {editing ? (
                    <input
                      type="number"
                      min="0"
                      value={stats.asistencias}
                      onChange={(e) =>
                        updateLocalStat(
                          jugador,
                          "asistencias",
                          e.target.value
                        )
                      }
                      style={{
                        width: "48px",
                        textAlign: "center",
                        border: "1px solid var(--line)",
                        borderRadius: "6px",
                        fontSize: "18px",
                        fontWeight: 700,
                      }}
                    />
                  ) : (
                    <strong>{stats.asistencias}</strong>
                  )}
                  <span>🎯 Asist.</span>
                </div>

                <div className="player-stat">
                  {editing ? (
                    <input
                      type="number"
                      min="0"
                      value={stats.pj}
                      onChange={(e) =>
                        updateLocalStat(jugador, "pj", e.target.value)
                      }
                      style={{
                        width: "48px",
                        textAlign: "center",
                        border: "1px solid var(--line)",
                        borderRadius: "6px",
                        fontSize: "18px",
                        fontWeight: 700,
                      }}
                    />
                  ) : (
                    <strong>{stats.pj}</strong>
                  )}
                  <span>👕 PJ</span>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

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

  const standings = useMemo(
    () => computeStandings(allJornadas, results),
    [allJornadas, results]
  );

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
          <p className="eyebrow">
            Serie 4 · Divisional B · Clausura 2026
          </p>

          <h1>Fixture Sportivo Malvin</h1>

          <p className="subtitle">
            15 jornadas · liga a una vuelta entre 15 equipos · Pro Fútbol
          </p>
        </div>
      </header>

      <main>
        <ProximoPartido jornadas={allJornadas} mi={MI} />

        <div className="tabs">
          <button
            className={`tab-btn ${activeTab === "mine" ? "active" : ""}`}
            onClick={() => setActiveTab("mine")}
          >
            Mis partidos
          </button>

          <button
            className={`tab-btn ${activeTab === "all" ? "active" : ""}`}
            onClick={() => setActiveTab("all")}
          >
            Fixture general
          </button>

          <button
            className={`tab-btn ${activeTab === "table" ? "active" : ""}`}
            onClick={() => setActiveTab("table")}
          >
            Posiciones
          </button>

          <button
            className={`tab-btn ${activeTab === "squad" ? "active" : ""}`}
            onClick={() => setActiveTab("squad")}
          >
            Plantel
          </button>

          <button
            className={`tab-btn ${activeTab === "add" ? "active" : ""}`}
            onClick={() => setActiveTab("add")}
          >
            Agregar jornada
          </button>
        </div>

        {activeTab === "mine" && (
          <MisPartidos jornadas={allJornadas} mi={MI} />
        )}

        {activeTab === "all" && (
          <FixtureGeneral
            jornadas={allJornadas}
            mi={MI}
            results={results}
            onScoreChange={handleScoreChange}
          />
        )}

        {activeTab === "table" && (
          <Posiciones standings={standings} mi={MI} />
        )}

        {activeTab === "squad" && <Plantel />}

        {activeTab === "add" && <AgregarJornada />}
      </main>

      <footer>
        Datos compartidos: todos los que abren este link ven y pueden cargar
        los mismos datos.
      </footer>
    </div>
  );
}