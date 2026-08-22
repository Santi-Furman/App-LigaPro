export default function MisPartidos({ jornadas, mi }) {
  const rows = jornadas.map((j) => {
    const pair = j.partidos.find((p) => p[0] === mi || p[1] === mi) || null;
    return { ...j, pair };
  });

  const jugados = rows.filter((r) => r.pair).length;

  return (
    <div className="panel active">
      <p className="info-line">{jugados} partidos en el torneo, todos en la misma cancha (Pro Fútbol).</p>
      {rows.map((r) => {
        if (!r.pair) {
          return (
            <div className="match-row bye" key={r.id}>
              <span className="jornada-tag">Fecha {r.n}</span>
              <span className="bye-text">Fecha libre</span>
            </div>
          );
        }
        const [a, b] = r.pair;
        return (
          <div className="match-row" key={r.id}>
            <span className="jornada-tag">{r.esExtra ? r.nombre : `Fecha ${r.n}`}</span>
            <span className="teams">
              <span className={`team-name ${a === mi ? "malvin" : ""}`}>{a}</span>
              <span className="vs">vs</span>
              <span className={`team-name ${b === mi ? "malvin" : ""}`}>{b}</span>
            </span>
            <span className="match-date">{r.fecha}</span>
          </div>
        );
      })}
    </div>
  );
}