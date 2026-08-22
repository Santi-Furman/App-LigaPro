export function computeStandings(allJornadas, results) {
  const table = {};
  function ensure(name) {
    if (!table[name]) table[name] = { name, pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0 };
    return table[name];
  }

  allJornadas.forEach((j) => {
    j.partidos.forEach((p, i) => {
      ensure(p[0]); ensure(p[1]);
      const id = j.id + "_" + i;
      const res = results[id];
      if (!res || res.h === "" || res.a === "" || res.h === undefined || res.a === undefined) return;
      const gh = parseInt(res.h, 10), ga = parseInt(res.a, 10);
      if (isNaN(gh) || isNaN(ga)) return;
      const th = ensure(p[0]), ta = ensure(p[1]);
      th.pj++; ta.pj++;
      th.gf += gh; th.gc += ga;
      ta.gf += ga; ta.gc += gh;
      if (gh > ga) { th.pg++; ta.pp++; }
      else if (gh < ga) { ta.pg++; th.pp++; }
      else { th.pe++; ta.pe++; }
    });
  });

  const list = Object.values(table).map((t) => {
    const dg = t.gf - t.gc;
    const pts = t.pg * 3 + t.pe;
    return { ...t, dg, pts };
  });

  list.sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts;
    if (b.dg !== a.dg) return b.dg - a.dg;
    if (b.gf !== a.gf) return b.gf - a.gf;
    return a.name.localeCompare(b.name);
  });

  return list;
}