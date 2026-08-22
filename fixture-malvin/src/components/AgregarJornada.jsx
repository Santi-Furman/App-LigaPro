import { useState } from "react";
import { EQUIPOS } from "../data/jornadas";
import { addExtraJornada } from "../firestoreService";

export default function AgregarJornada() {
  const [nombre, setNombre] = useState("");
  const [fecha, setFecha] = useState("");
  const [partidos, setPartidos] = useState([{ local: "", visitante: "" }]);
  const [status, setStatus] = useState("");

  function updatePartido(index, side, value) {
    setPartidos((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [side]: value };
      return next;
    });
  }

  function addPartidoRow() {
    setPartidos((prev) => [...prev, { local: "", visitante: "" }]);
  }

  function removePartidoRow(index) {
    setPartidos((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!fecha) {
      setStatus("Falta la fecha.");
      return;
    }
    const partidosValidos = partidos.filter((p) => p.local && p.visitante);
    if (partidosValidos.length === 0) {
      setStatus("Agregá al menos un partido con ambos equipos.");
      return;
    }

    setStatus("Guardando...");
    try {
      await addExtraJornada({
        nombre: nombre || "Desempate",
        fecha,
        partidos: partidosValidos.map((p) => [p.local, p.visitante]),
      });
      setStatus("Jornada agregada.");
      setNombre("");
      setFecha("");
      setPartidos([{ local: "", visitante: "" }]);
    } catch (err) {
      console.error(err);
      setStatus("No se pudo guardar. Intentá de nuevo.");
    }
  }

  return (
    <div className="panel active">
      <form onSubmit={handleSubmit} className="add-jornada-form">
        <label>
          Nombre de la jornada (opcional)
          <input type="text" placeholder="Ej: Desempate 3er puesto" value={nombre} onChange={(e) => setNombre(e.target.value)} />
        </label>

        <label>
          Fecha (dd/mm/aaaa)
          <input type="text" placeholder="05/12/2026" value={fecha} onChange={(e) => setFecha(e.target.value)} />
        </label>

        <p className="info-line">Partidos</p>
        {partidos.map((p, i) => (
          <div className="add-partido-row" key={i}>
            <select value={p.local} onChange={(e) => updatePartido(i, "local", e.target.value)}>
              <option value="">Local</option>
              {EQUIPOS.map((eq) => <option value={eq} key={eq}>{eq}</option>)}
            </select>
            <span className="vs">vs</span>
            <select value={p.visitante} onChange={(e) => updatePartido(i, "visitante", e.target.value)}>
              <option value="">Visitante</option>
              {EQUIPOS.map((eq) => <option value={eq} key={eq}>{eq}</option>)}
            </select>
            {partidos.length > 1 && (
              <button type="button" className="refresh-btn" onClick={() => removePartidoRow(i)}>Quitar</button>
            )}
          </div>
        ))}

        <button type="button" className="refresh-btn" onClick={addPartidoRow}>+ Agregar partido</button>
        <button type="submit" className="submit-btn">Guardar jornada</button>

        {status && <p className="info-line">{status}</p>}
      </form>
    </div>
  );
}