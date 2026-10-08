import { predictSecondaryStructure } from "../biology/secondaryStructure";

type Residue = {
  name: string;
  threeLetter: string;
  oneLetter: string;
  /** three-letter code (e.g. "ALA") used to look up structure propensity */
  code: string;
};

type ProteinSequenceProps = {
  residues: Residue[];
};

const STRUCTURE_COLOR: Record<string, string> = {
  helix: "#EF4444", // red — matches common convention
  sheet: "#F59E0B", // yellow/amber
  coil: "#8B5CF6", // purple — your existing default
};

export default function ProteinSequence({
  residues,
}: ProteinSequenceProps) {
  const structureLabels = predictSecondaryStructure(
    residues.map((r) => r.code)
  );

  return (
    <div
      style={{
        padding: "20px",
        border: "1px solid #ddd",
        borderRadius: "12px",
        background: "#fff",
      }}
    >
      <div
        style={{
          fontSize: "14px",
          fontWeight: 600,
          marginBottom: "8px",
        }}
      >
        PROTEIN SEQUENCE
      </div>

      <div
        style={{
          fontSize: "12px",
          color: "#999",
          marginBottom: "12px",
        }}
      >
        Ring color = predicted secondary structure (approximate — see
        note below)
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0",
          overflowX: "auto",
        }}
      >
        {/* N terminus */}
        <div
          style={{
            fontWeight: 700,
            marginRight: "12px",
          }}
        >
          N
        </div>

        {residues.map((residue, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              alignItems: "center",
            }}
          >
            {/* Residue */}
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                border: `3px solid ${
                  STRUCTURE_COLOR[structureLabels[index]]
                }`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                background: "#f5f3ff",
                flexShrink: 0,
              }}
            >
              <strong>
                {residue.oneLetter}
              </strong>

              <span
                style={{
                  fontSize: "11px",
                }}
              >
                {residue.threeLetter}
              </span>
            </div>

            {/* Bond */}
            {index < residues.length - 1 && (
              <div
                style={{
                  width: "40px",
                  height: "3px",
                  background: "#999",
                }}
              />
            )}
          </div>
        ))}

        {/* C terminus */}
        <div
          style={{
            fontWeight: 700,
            marginLeft: "12px",
          }}
        >
          C
        </div>
      </div>

      <div
        style={{
          marginTop: "16px",
          display: "flex",
          gap: "16px",
          fontSize: "12px",
          color: "#666",
        }}
      >
        <span>
          <span style={{ color: STRUCTURE_COLOR.helix }}>●</span> Helix
        </span>
        <span>
          <span style={{ color: STRUCTURE_COLOR.sheet }}>●</span> Sheet
        </span>
        <span>
          <span style={{ color: STRUCTURE_COLOR.coil }}>●</span> Coil
        </span>
      </div>
    </div>
  );
}