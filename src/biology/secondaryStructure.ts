// biology/secondaryStructure.ts
//
// SIMPLIFIED, TEACHING-ONLY secondary structure prediction. This is a
// crude approximation of the classic Chou-Fasman method: each amino
// acid has a relative propensity to appear in a helix, sheet, or turn,
// based on statistics from known protein structures. Real secondary
// structure prediction (e.g. PSIPRED, AlphaFold) uses sequence context,
// evolutionary information, and/or deep learning — this does not, and
// should be labeled to students as an approximation, not ground truth.
//
// Propensity values below are illustrative relative tendencies (loosely
// following Chou-Fasman's original scale where >1.0 favors that
// structure), not the exact published table. Good enough to teach the
// *concept* that sequence biases structure — not accurate enough for
// any real design decision.

export type SecondaryStructureLabel = 'helix' | 'sheet' | 'coil';

interface Propensity {
  helix: number;
  sheet: number;
  turn: number;
}

// Keyed by three-letter code, matching AMINO_ACIDS keys elsewhere in
// the project.
const PROPENSITY: Record<string, Propensity> = {
  ALA: { helix: 1.42, sheet: 0.83, turn: 0.66 },
  ARG: { helix: 0.98, sheet: 0.93, turn: 0.95 },
  ASN: { helix: 0.67, sheet: 0.89, turn: 1.56 },
  ASP: { helix: 1.01, sheet: 0.54, turn: 1.46 },
  CYS: { helix: 0.70, sheet: 1.19, turn: 1.19 },
  GLN: { helix: 1.11, sheet: 1.10, turn: 0.98 },
  GLU: { helix: 1.51, sheet: 0.37, turn: 0.74 },
  GLY: { helix: 0.57, sheet: 0.75, turn: 1.56 }, // flexible, common in turns
  HIS: { helix: 1.00, sheet: 0.87, turn: 0.95 },
  ILE: { helix: 1.08, sheet: 1.60, turn: 0.47 },
  LEU: { helix: 1.21, sheet: 1.30, turn: 0.59 },
  LYS: { helix: 1.16, sheet: 0.74, turn: 1.01 },
  MET: { helix: 1.45, sheet: 1.05, turn: 0.60 },
  PHE: { helix: 1.13, sheet: 1.38, turn: 0.60 },
  PRO: { helix: 0.34, sheet: 0.31, turn: 1.52 }, // rigid, disrupts helices
  SER: { helix: 0.77, sheet: 0.75, turn: 1.43 },
  THR: { helix: 0.83, sheet: 1.19, turn: 0.96 },
  TRP: { helix: 1.08, sheet: 1.37, turn: 0.96 },
  TYR: { helix: 0.69, sheet: 1.47, turn: 1.14 },
  VAL: { helix: 1.06, sheet: 1.70, turn: 0.50 },
};

/**
 * Assigns a coarse secondary structure label to each residue using a
 * sliding-window average of propensity scores. Windowing smooths out
 * single-residue noise the way real helix/sheet formation requires
 * multiple consecutive favorable residues, not just one.
 */
export function predictSecondaryStructure(
  residueCodes: string[],
  windowSize = 4
): SecondaryStructureLabel[] {
  const half = Math.floor(windowSize / 2);

  return residueCodes.map((_, i) => {
    const start = Math.max(0, i - half);
    const end = Math.min(residueCodes.length, i + half + 1);
    const window = residueCodes.slice(start, end);

    const avg = window.reduce(
      (sum, code) => {
        const p = PROPENSITY[code];
        if (!p) return sum;
        return {
          helix: sum.helix + p.helix,
          sheet: sum.sheet + p.sheet,
          turn: sum.turn + p.turn,
        };
      },
      { helix: 0, sheet: 0, turn: 0 }
    );

    const n = window.length || 1;
    avg.helix /= n;
    avg.sheet /= n;
    avg.turn /= n;

    // Require a clear lean above baseline (1.0) to call helix/sheet;
    // otherwise default to coil rather than force a noisy guess.
    if (avg.helix > 1.05 && avg.helix >= avg.sheet) return 'helix';
    if (avg.sheet > 1.05 && avg.sheet > avg.helix) return 'sheet';
    return 'coil';
  });
}