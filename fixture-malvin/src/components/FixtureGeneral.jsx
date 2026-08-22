import { useState } from "react";

function parseFecha(str) {
  const [d, m, y] = str.split("/");
  return new Date(parseInt(y, 10), parseInt(m, 10) - 1, parseInt(d, 10));
}

function defaultOpenId(jornadas) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const next = jornadas.find((j) => parseFecha(j.fecha) >= today);
  return next ? next.id : jornadas[jornadas.length - 1]?.id;
}

function clampScore(v) {
  if (v === "") return "";
  const n = parseInt(v, 10);
  if (isNaN(n) || n < 0) return "";
  if (n > 99) return "99";
  return String(n);
}

export default function FixtureGeneral({ jornadas, mi, results, onScoreChange }) {
  const [openIds, setOpenIds] = useState(() => new Set([defaultOpenId(jornadas)]));

  function toggleJornada(id) {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setOpenIds((prev) =>
      prev.size === jornadas.length ? new Set() : new Set(jornadas.map((j) => j.id))
    );
  }

  const allOpen = openIds.size === jornadas.length;

  return (
    <div className="panel active">
      <div className="panel-top-bar">
        <button className="refresh-btn" onClick={toggleAll}>
          {allOpen ? "Colapsar todas" : "Expandir todas"}
        </button>
      </div>

      {jornadas.map((j) => {
        const isOpen = openIds.has(j.id);
        return (
          <div className={`jornada-block ${isOpen ? "" : "collapsed"}`} key={j.id}>
            <div className="jornada-head" onClick={() => toggleJornada(j.id)}>
              <div className="jornada-head-left">
                <span className="jn">{j.esExtra ? j.nombre : `Fecha ${j.n}`}</span>
                <span className="jd">{j.fecha}</span>
              </div>
              <span className="jornada-chevron">▾</span>
            </div>
            {isOpen && (
              <div className="jornada-matches">
                {j.partidos.map((p, i) => {
                  const isMine = p[0] === mi || p[1] === mi;
                  const id = `${j.id}_${i}`;
                  const res = results[id] || { h: "", a: "" };
                  const played = res.h !== "" && res.a !== "" && res.h !== undefined && res.a !== undefined;
                  return (
                    <div className={`score-row ${isMine ? "highlight" : ""}`} key={id}>
                      <span className="score-team-l">{p[0]}</span>
                      <span className="score-inputs">
                        <input
                          type="number" min="0" max="99"
                          value={res.h === undefined ? "" : res.h}
                          onChange={(e) => onScoreChange(j.id, i, "h", clampScore(e.target.value))}
                        />
                        <span className="dash">-</span>
                        <input
                          type="number" min="0" max="99"
                          value={res.a === undefined ? "" : res.a}
                          onChange={(e) => onScoreChange(j.id, i, "a", clampScore(e.target.value))}
                        />
                      </span>
                      <span className={`played-tick ${played ? "" : "empty"}`}></span>
                      <span className="score-team-r">{p[1]}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}