// biology/proceduralBackbone.ts
//
// Tier 1 visualization: SCHEMATIC 3D coordinates driven by the
// predicted secondary structure labels (helix/sheet/coil) from
// secondaryStructure.ts. Still not a real fold — no energy
// minimization, no side-chain packing, no tertiary contacts — just
// three different idealized local geometries stitched together so a
// helix visually looks like a helix and a sheet looks extended,
// matching what the 2D ring view already predicts.
//
// Emits HELIX/SHEET PDB records (in addition to ATOM records) so
// 3Dmol.js's cartoon renderer can color/shape by secondary structure
// instead of guessing from raw CA geometry.

import type { SecondaryStructureLabel } from './secondaryStructure';

export interface SchematicResidue {
  /** three-letter residue code, e.g. "ALA" */
  code: string;
  /** one-letter code, used only for labeling, not geometry */
  oneLetter: string;
}

// Rise per residue along the chain's forward axis, in Å. Loosely
// realistic: alpha helices rise ~1.5 Å/residue (3.6 residues/turn),
// beta strands are near-fully-extended (~3.4 Å/residue), coil/loop
// sits in between with added wobble (~3.6 Å/residue).
const RISE = { helix: 1.5, sheet: 3.4, coil: 3.6 };
const HELIX_RADIUS = 2.3;
const HELIX_DEGREES_PER_RESIDUE = 100; // 360/3.6 residues-per-turn
const SHEET_ZIGZAG_AMPLITUDE = 1.4;
const COIL_WOBBLE_AMPLITUDE = 1.8;

interface Vec3 {
  x: number;
  y: number;
  z: number;
}

function helixPoint(indexInSegment: number, z: number): Vec3 {
  const angleRad = (indexInSegment * HELIX_DEGREES_PER_RESIDUE * Math.PI) / 180;
  return {
    x: HELIX_RADIUS * Math.cos(angleRad),
    y: HELIX_RADIUS * Math.sin(angleRad),
    z,
  };
}

function sheetPoint(indexInSegment: number, z: number): Vec3 {
  // Pleated zigzag: alternates up/down each residue, near-flat otherwise.
  const y = indexInSegment % 2 === 0 ? SHEET_ZIGZAG_AMPLITUDE : -SHEET_ZIGZAG_AMPLITUDE;
  return { x: 0, y, z };
}

function coilPoint(globalIndex: number, z: number): Vec3 {
  // Deterministic pseudo-wobble (not true randomness) using two
  // incommensurate frequencies so the path looks irregular but is
  // reproducible for the same sequence.
  const x = COIL_WOBBLE_AMPLITUDE * Math.sin(globalIndex * 0.9);
  const y = COIL_WOBBLE_AMPLITUDE * Math.cos(globalIndex * 1.7);
  return { x, y, z };
}

/**
 * Builds a minimal PDB-format string: one CA atom per residue,
 * geometry varied by predicted secondary structure, plus HELIX/SHEET
 * records describing contiguous runs so 3Dmol's cartoon mode can
 * render them correctly. Purely schematic — do not present this to
 * students as a real fold.
 */
export function generateSchematicPDB(
  residues: SchematicResidue[],
  labels: SecondaryStructureLabel[] = residues.map(() => 'coil')
): string {
  const headerLines: string[] = [];
  const atomLines: string[] = [];

  let z = 0;
  let segmentLocalIndex = 0;
  let currentSegmentLabel: SecondaryStructureLabel | null = null;
  let currentSegmentStart = 0; // residue index (0-based) where current run started
  let helixSerial = 1;
  let sheetSerial = 1;

  const flushSegment = (endResNumInclusive: number) => {
    if (currentSegmentLabel === null) return;
    const startResNum = currentSegmentStart + 1; // PDB residue numbers are 1-based
    const length = endResNumInclusive - startResNum + 1;
    if (length < 2) return; // a single-residue "helix" isn't meaningful to annotate

    if (currentSegmentLabel === 'helix') {
      headerLines.push(buildHelixRecord(helixSerial, startResNum, endResNumInclusive, length));
      helixSerial++;
    } else if (currentSegmentLabel === 'sheet') {
      headerLines.push(buildSheetRecord(sheetSerial, startResNum, endResNumInclusive));
      sheetSerial++;
    }
  };

  residues.forEach((residue, i) => {
    const label = labels?.[i] ?? 'coil';

    if (label !== currentSegmentLabel) {
      flushSegment(i); // i (0-based) == previous run's last resNum (1-based), since it ended at residue i-1
      currentSegmentLabel = label;
      currentSegmentStart = i;
      segmentLocalIndex = 0;
    }

    const point =
      label === 'helix'
        ? helixPoint(segmentLocalIndex, z)
        : label === 'sheet'
        ? sheetPoint(segmentLocalIndex, z)
        : coilPoint(i, z);

    atomLines.push(buildAtomRecord(i + 1, residue.code, point));

    z += RISE[label];
    segmentLocalIndex++;
  });

  // Flush whatever segment was in progress at the end of the chain.
  flushSegment(residues.length);

  return [...headerLines, ...atomLines, 'END'].join('\n');
}

function buildAtomRecord(serial: number, resCode: string, p: Vec3): string {
  return (
    'ATOM  ' +
    String(serial).padStart(5, ' ') +
    '  CA  ' +
    resCode.padEnd(3, ' ') +
    ' A' +
    String(serial).padStart(4, ' ') +
    '    ' +
    p.x.toFixed(3).padStart(8, ' ') +
    p.y.toFixed(3).padStart(8, ' ') +
    p.z.toFixed(3).padStart(8, ' ') +
    '  1.00  0.00           C'
  );
}

// Column positions follow the PDB spec loosely (close enough for
// 3Dmol's lenient parser); see the wwPDB format guide for exact spec
// if interop with stricter tools is ever needed.
function buildHelixRecord(
  serial: number,
  startResNum: number,
  endResNum: number,
  length: number
): string {
  const line = ' '.repeat(80).split('');
  place(line, 1, 'HELIX ');
  place(line, 8, String(serial).padStart(3, ' '));
  place(line, 12, `H${serial}`.padEnd(3, ' '));
  place(line, 20, 'A');
  place(line, 22, String(startResNum).padStart(4, ' '));
  place(line, 32, 'A');
  place(line, 34, String(endResNum).padStart(4, ' '));
  place(line, 39, '1');
  place(line, 72, String(length).padStart(5, ' '));
  return line.join('').trimEnd();
}

function buildSheetRecord(serial: number, startResNum: number, endResNum: number): string {
  const line = ' '.repeat(80).split('');
  place(line, 1, 'SHEET ');
  place(line, 8, String(serial).padStart(3, ' '));
  place(line, 12, `S${serial}`.padEnd(3, ' '));
  place(line, 15, '  1'); // single-strand sheet, simplified
  place(line, 22, 'A');
  place(line, 23, String(startResNum).padStart(4, ' '));
  place(line, 33, 'A');
  place(line, 34, String(endResNum).padStart(4, ' '));
  return line.join('').trimEnd();
}

// Overwrites characters in `line` starting at 1-indexed column `col`.
function place(line: string[], col: number, text: string) {
  for (let k = 0; k < text.length; k++) {
    line[col - 1 + k] = text[k];
  }
}