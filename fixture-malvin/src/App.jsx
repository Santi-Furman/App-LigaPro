import { useState, useEffect, useMemo } from "react";

import { jornadas as JORNADAS_FIJAS, MI } from "./data/jornadas";
import { PLANTEL } from "./data/plantel";

import {
  subscribeToAllResults,
  subscribeToExtraJornadas,
  saveJornadaResults,
  subscribeToPlayerStats,
  savePlayerStats,
  savePrediction,
  getPrediction,
  subscribeToAllPredictions,
} from "./firestoreService";

import { computeStandings } from "./utils/standings";

import MisPartidos from "./components/MisPartidos";
import FixtureGeneral from "./components/FixtureGeneral";
import Posiciones from "./components/Posiciones";
import AgregarJornada from "./components/AgregarJornada";

import "./App.css";

/* =========================
   PRÓXIMO PARTIDO
========================= */

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

  const dias = Math.ceil(
    diferencia / (1000 * 60 * 60 * 24)
  );

  const fechaTexto = proximo.fecha.toLocaleDateString("es-UY", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <section className="next-match">
      <div className="next-match-label">
        ⚽ PRÓXIMO PARTIDO
      </div>

      <div className="next-match-jornada">
        Jornada {proximo.jornada.n}
      </div>

      <div className="next-match-teams">
        <span className={proximo.esLocal ? "our-team" : ""}>
          {proximo.esLocal ? mi : proximo.rival}
        </span>

        <span className="next-match-vs">
          VS
        </span>

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

/* =========================
   PLANTEL
========================= */

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
      asistencias:
        saved?.asistencias ?? jugador.asistencias,
    };
  }

  function updateLocalStat(jugador, field, value) {
    const id = getPlayerId(jugador);

    setFirebaseStats((prev) => ({
      ...prev,
      [id]: {
        ...getStats(jugador),
        [field]: Math.max(
          0,
          Number(value) || 0
        ),
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
      console.error(
        "Error guardando estadísticas:",
        error
      );

      alert(
        "No se pudieron guardar las estadísticas."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="plantel-section">
      <div className="section-heading">
        <div>
          <p className="section-eyebrow">
            SPORTIVO MALVIN
          </p>

          <h2>Plantel</h2>
        </div>

        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="edit-stats-btn"
          >
            ✏️ Editar
          </button>
        ) : (
          <div className="stats-actions">
            <button
              onClick={() => setEditing(false)}
              disabled={saving}
              className="cancel-stats-btn"
            >
              Cancelar
            </button>

            <button
              onClick={guardarEstadisticas}
              disabled={saving}
              className="save-stats-btn"
            >
              {saving
                ? "Guardando..."
                : "Guardar"}
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
                        updateLocalStat(
                          jugador,
                          "goles",
                          e.target.value
                        )
                      }
                      className="stat-input"
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
                      className="stat-input"
                    />
                  ) : (
                    <strong>
                      {stats.asistencias}
                    </strong>
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
                        updateLocalStat(
                          jugador,
                          "pj",
                          e.target.value
                        )
                      }
                      className="stat-input"
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

/* =========================
   HELPERS PENCA
========================= */

function getPlayerId(nombre) {
  return nombre
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-");
}

function getPartidoMalvin(jornada, mi) {
  const index = jornada.partidos.findIndex(
    (partido) => partido.includes(mi)
  );

  if (index === -1) return null;

  const partido = jornada.partidos[index];

  return {
    index,
    rival:
      partido[0] === mi
        ? partido[1]
        : partido[0],
    esLocal: partido[0] === mi,
  };
}

function getResultadoMalvin(
  jornada,
  results,
  mi
) {
  const partido = getPartidoMalvin(
    jornada,
    mi
  );

  if (!partido) return null;

  const key =
    jornada.id + "_" + partido.index;

  const resultado = results[key];

  if (!resultado) return null;

  const home = Number(resultado.h);
  const away = Number(resultado.a);

  if (
    !Number.isFinite(home) ||
    !Number.isFinite(away)
  ) {
    return null;
  }

  return partido.esLocal
    ? {
        malvin: home,
        rival: away,
      }
    : {
        malvin: away,
        rival: home,
      };
}

function calcularPuntos(
  prediccion,
  resultado
) {
  if (!resultado) return 0;

  if (
    prediccion.local === resultado.malvin &&
    prediccion.rival === resultado.rival
  ) {
    return 3;
  }

  const prediccionResultado =
    Math.sign(
      prediccion.local -
        prediccion.rival
    );

  const resultadoReal =
    Math.sign(
      resultado.malvin -
        resultado.rival
    );

  return prediccionResultado === resultadoReal
    ? 1
    : 0;
}

/* =========================
   RANKING PENCA
========================= */

function RankingPenca({
  jornadas,
  results,
  predictions,
  mi,
}) {
  const ranking = useMemo(() => {
    const puntos = {};

    PLANTEL.forEach((jugador) => {
      puntos[jugador.nombre] = 0;
    });

    predictions.forEach((prediction) => {
      const jornada = jornadas.find(
        (j) => j.id === prediction.jornadaId
      );

      if (!jornada) return;

      const resultado = getResultadoMalvin(
        jornada,
        results,
        mi
      );

      if (!resultado) return;

      const jugador = PLANTEL.find(
        (p) =>
          getPlayerId(p.nombre) ===
          prediction.playerId
      );

      if (!jugador) return;

      puntos[jugador.nombre] +=
        calcularPuntos(
          prediction,
          resultado
        );
    });

    return Object.entries(puntos)
      .map(([nombre, puntos]) => ({
        nombre,
        puntos,
      }))
      .sort((a, b) => {
        if (b.puntos !== a.puntos) {
          return b.puntos - a.puntos;
        }

        return a.nombre.localeCompare(
          b.nombre
        );
      });
  }, [
    jornadas,
    results,
    predictions,
    mi,
  ]);

  return (
    <section
      style={{
        marginTop: "30px",
      }}
    >
      <div
        style={{
          textAlign: "center",
          marginBottom: "16px",
        }}
      >
        <p className="section-eyebrow">
          LA PENCA
        </p>

        <h2
          style={{
            margin: 0,
            fontSize: "30px",
          }}
        >
          🏆 Ranking
        </h2>

        <p
          style={{
            color: "var(--muted)",
            fontSize: "13px",
            marginTop: "5px",
          }}
        >
          3 puntos exacto · 1 punto resultado
        </p>
      </div>

      <div
        style={{
          background: "var(--card)",
          borderRadius: "14px",
          overflow: "hidden",
          boxShadow:
            "0 2px 8px rgba(0,0,0,.07)",
        }}
      >
        {ranking.map((jugador, index) => (
          <div
            key={jugador.nombre}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent:
                "space-between",
              padding: "14px 18px",
              borderBottom:
                index < ranking.length - 1
                  ? "1px solid var(--line)"
                  : "none",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <strong
                style={{
                  width: "28px",
                  fontSize:
                    index < 3
                      ? "20px"
                      : "14px",
                }}
              >
                {index === 0
                  ? "🥇"
                  : index === 1
                    ? "🥈"
                    : index === 2
                      ? "🥉"
                      : `${index + 1}.`}
              </strong>

              <span
                style={{
                  fontWeight:
                    index < 3
                      ? "700"
                      : "500",
                }}
              >
                {jugador.nombre}
              </span>
            </div>

            <strong>
              {jugador.puntos}{" "}
              {jugador.puntos === 1
                ? "pt"
                : "pts"}
            </strong>
          </div>
        ))}
      </div>
    </section>
  );
}

/* =========================
   PENCA
========================= */

function Penca({
  jornadas,
  mi,
  results,
  predictions,
}) {
  const [jugador, setJugador] =
    useState("");

  const [golesMalvin, setGolesMalvin] =
    useState("");

  const [golesRival, setGolesRival] =
    useState("");

  const [enviando, setEnviando] =
    useState(false);

  const [enviada, setEnviada] =
    useState(false);

  const [error, setError] =
    useState("");

  const proximo = useMemo(() => {
    const partidos = [];

    jornadas.forEach((jornada) => {
      jornada.partidos.forEach(
        (partido) => {
          if (partido.includes(mi)) {
            const [
              dia,
              mes,
              anio,
            ] =
              jornada.fecha
                .split("/")
                .map(Number);

            partidos.push({
              jornada,
              rival:
                partido[0] === mi
                  ? partido[1]
                  : partido[0],
              fecha: new Date(
                anio,
                mes - 1,
                dia
              ),
              esLocal:
                partido[0] === mi,
            });
          }
        }
      );
    });

    return partidos
      .filter(
        (p) =>
          p.fecha >= new Date()
      )
      .sort(
        (a, b) =>
          a.fecha - b.fecha
      )[0];
  }, [jornadas, mi]);

  useEffect(() => {
    async function checkPrediction() {
      if (!jugador || !proximo)
        return;

      const prediction =
        await getPrediction(
          getPlayerId(jugador),
          proximo.jornada.id
        );

      if (prediction) {
        setEnviada(true);
      } else {
        setEnviada(false);
      }
    }

    checkPrediction();
  }, [jugador, proximo]);

  if (!proximo) return null;

  async function enviarPrediccion(e) {
    e.preventDefault();

    if (!jugador) {
      setError(
        "Elegí tu nombre."
      );
      return;
    }

    if (
      golesMalvin === "" ||
      golesRival === ""
    ) {
      setError(
        "Completá los dos resultados."
      );
      return;
    }

    setError("");
    setEnviando(true);

    try {
      await savePrediction(
        getPlayerId(jugador),
        {
          local: Number(
            golesMalvin
          ),
          rival: Number(
            golesRival
          ),
          jornadaId:
            proximo.jornada.id,
        }
      );

      setEnviada(true);
    } catch (err) {
      console.error(err);

      setError(
        "No se pudo guardar la predicción."
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    <section className="penca-section">
      <div className="penca-header">
        <p className="section-eyebrow">
          LA PENCA
        </p>

        <h2>¿Cómo sale?</h2>

        <p>
          Tu predicción queda anónima.
          Después del partido vemos
          quién la embocó.
        </p>
      </div>

      <div className="penca-card">
        <div className="penca-match">
          <strong>
            {proximo.esLocal
              ? mi
              : proximo.rival}
          </strong>

          <span>VS</span>

          <strong>
            {proximo.esLocal
              ? proximo.rival
              : mi}
          </strong>
        </div>

        {enviada ? (
          <div className="prediction-sent">
            <div className="prediction-icon">
              🔒
            </div>

            <h3>
              ¡Predicción enviada!
            </h3>

            <p>
              Tu pronóstico quedó
              guardado de forma
              anónima.
            </p>
          </div>
        ) : (
          <form
            onSubmit={enviarPrediccion}
            className="penca-form"
          >
            <label>
              ¿Quién sos?

              <select
                value={jugador}
                onChange={(e) =>
                  setJugador(
                    e.target.value
                  )
                }
              >
                <option value="">
                  Seleccionar jugador
                </option>

                {PLANTEL.map((p) => (
                  <option
                    key={p.nombre}
                    value={p.nombre}
                  >
                    {p.nombre}
                  </option>
                ))}
              </select>
            </label>

            <div className="prediction-score">
              <div>
                <span>
                  {proximo.esLocal
                    ? mi
                    : proximo.rival}
                </span>

                <input
                  type="number"
                  min="0"
                  max="20"
                  value={golesMalvin}
                  onChange={(e) =>
                    setGolesMalvin(
                      e.target.value
                    )
                  }
                />
              </div>

              <span className="prediction-vs">
                -
              </span>

              <div>
                <span>
                  {proximo.esLocal
                    ? proximo.rival
                    : mi}
                </span>

                <input
                  type="number"
                  min="0"
                  max="20"
                  value={golesRival}
                  onChange={(e) =>
                    setGolesRival(
                      e.target.value
                    )
                  }
                />
              </div>
            </div>

            {error && (
              <p className="penca-error">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={enviando}
              className="penca-submit"
            >
              {enviando
                ? "Enviando..."
                : "🔒 Enviar predicción"}
            </button>
          </form>
        )}
      </div>

      <RankingPenca
        jornadas={jornadas}
        results={results}
        predictions={predictions}
        mi={mi}
      />
    </section>
  );
}

/* =========================
   APP
========================= */

export default function App() {
  const [activeTab, setActiveTab] =
    useState("mine");

  const [results, setResults] =
    useState({});

  const [
    extraJornadas,
    setExtraJornadas,
  ] = useState([]);

  const [
    predictions,
    setPredictions,
  ] = useState([]);

  useEffect(() => {
    const unsubResults =
      subscribeToAllResults(
        setResults
      );

    const unsubExtra =
      subscribeToExtraJornadas(
        setExtraJornadas
      );

    const unsubPredictions =
      subscribeToAllPredictions(
        setPredictions
      );

    return () => {
      unsubResults();
      unsubExtra();
      unsubPredictions();
    };
  }, []);

  const allJornadas = useMemo(
    () => [
      ...JORNADAS_FIJAS,

      ...extraJornadas.map(
        (e, idx) => ({
          id: e.id,
          n:
            JORNADAS_FIJAS.length +
            idx +
            1,
          fecha: e.fecha,
          partidos: e.partidos,
          esExtra: true,
          nombre: e.nombre,
        })
      ),
    ],
    [extraJornadas]
  );

  const standings = useMemo(
    () =>
      computeStandings(
        allJornadas,
        results
      ),
    [allJornadas, results]
  );

  function handleScoreChange(
    jornadaId,
    matchIndex,
    side,
    value
  ) {
    const matchKey =
      jornadaId +
      "_" +
      matchIndex;

    const current =
      results[matchKey] || {
        h: "",
        a: "",
      };

    const updated = {
      ...current,
      [side]: value,
    };

    setResults((prev) => ({
      ...prev,
      [matchKey]: updated,
    }));

    const jornada =
      allJornadas.find(
        (j) =>
          j.id === jornadaId
      );

    const payload = {};

    jornada.partidos.forEach(
      (_, i) => {
        const key =
          jornadaId +
          "_" +
          i;

        const val =
          key === matchKey
            ? updated
            : results[key];

        if (val) {
          payload[key] = val;
        }
      }
    );

    saveJornadaResults(
      jornadaId,
      payload
    );
  }

  return (
    <div className="app">
      <header>
        <div className="header-inner">
          <p className="eyebrow">
            Serie 4 · Divisional B ·
            Clausura 2026
          </p>

          <h1>
            Fixture Sportivo Malvin
          </h1>

          <p className="subtitle">
            15 jornadas · liga a una
            vuelta entre 15 equipos ·
            Pro Fútbol
          </p>
        </div>
      </header>

      <main>
        <ProximoPartido
          jornadas={allJornadas}
          mi={MI}
        />

        <div className="tabs">
          <button
            className={`tab-btn ${
              activeTab === "mine"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setActiveTab("mine")
            }
          >
            Mis partidos
          </button>

          <button
            className={`tab-btn ${
              activeTab === "all"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setActiveTab("all")
            }
          >
            Fixture general
          </button>

          <button
            className={`tab-btn ${
              activeTab === "table"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setActiveTab("table")
            }
          >
            Posiciones
          </button>

          <button
            className={`tab-btn ${
              activeTab === "squad"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setActiveTab("squad")
            }
          >
            Plantel
          </button>

          <button
            className={`tab-btn ${
              activeTab === "penca"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setActiveTab("penca")
            }
          >
            🎯 Penca
          </button>

          <button
            className={`tab-btn ${
              activeTab === "add"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setActiveTab("add")
            }
          >
            Agregar jornada
          </button>
        </div>

        {activeTab === "mine" && (
          <MisPartidos
            jornadas={allJornadas}
            mi={MI}
          />
        )}

        {activeTab === "all" && (
          <FixtureGeneral
            jornadas={allJornadas}
            mi={MI}
            results={results}
            onScoreChange={
              handleScoreChange
            }
          />
        )}

        {activeTab === "table" && (
          <Posiciones
            standings={standings}
            mi={MI}
          />
        )}

        {activeTab === "squad" && (
          <Plantel />
        )}

        {activeTab === "penca" && (
          <Penca
            jornadas={allJornadas}
            mi={MI}
            results={results}
            predictions={
              predictions
            }
          />
        )}

        {activeTab === "add" && (
          <AgregarJornada />
        )}
      </main>

      <footer>
        Datos compartidos: todos los
        que abren este link ven y
        pueden cargar los mismos
        datos.
      </footer>
    </div>
  );
}