export default function Posiciones({ standings, mi }) {
  const anyPlayed = standings.some((t) => t.pj > 0);

  return (
    <div className="panel active">
      <p className="info-line">
        {anyPlayed
          ? "Se arma en vivo a medida que se cargan resultados en Fixture general."
          : "Todavía no hay resultados cargados. Entrá a Fixture general y completá los marcadores para que la tabla se arme sola."}
      </p>
      <div className="table-scroll">
        <table className="standings">
          <thead>
            <tr>
              <th></th><th className="team-col">Equipo</th><th>PJ</th><th>PG</th><th>PE</th><th>PP</th>
              <th>GF</th><th>GC</th><th>DG</th><th>Pts</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((t, idx) => (
              <tr className={t.name === mi ? "mine" : ""} key={t.name}>
                <td className="pos">{idx + 1}</td>
                <td className="team-col">{t.name}</td>
                <td>{t.pj}</td><td>{t.pg}</td><td>{t.pe}</td><td>{t.pp}</td>
                <td>{t.gf}</td><td>{t.gc}</td>
                <td>{t.dg > 0 ? `+${t.dg}` : t.dg}</td>
                <td className="pts">{t.pts}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}