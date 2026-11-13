// Três pixels RGB, tirados da arte do olho. `animado` indica espera.
export default function Pixels({ animado = false }) {
  return <span className={"pixels" + (animado ? " pixels-animado" : "")} aria-hidden="true"><i /><i /><i /></span>;
}
