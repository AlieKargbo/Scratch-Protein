// biology/aminoAcids.ts
//
// Single source of truth for amino acid data — this replaces both the
// old aminoAcids.ts (name/threeLetter/oneLetter only) and aminoAcids.tsx
// (partial list with polarity/charge) which had drifted into two
// incompatible shapes under the same import path. Delete aminoAcids.tsx
// once this is in place; nothing should import from it anymore.
//
// polarity/charge are filled in for all 20 now, not just the original 6,
// since ProteinSequence's secondary-structure coloring and any future
// side-chain-property coloring (Phase 4 in the roadmap) both need the
// full set.

export type Polarity = "Nonpolar" | "Polar" | "Acidic" | "Basic" | "Aromatic";

export interface AminoAcidInfo {
  name: string;
  threeLetter: string;
  oneLetter: string;
  polarity: Polarity;
  charge: -1 | 0 | 1;
}

export const AMINO_ACIDS: Record<string, AminoAcidInfo> = {
  ALA: { 
    name: "Alanine", 
    threeLetter: "Ala", 
    oneLetter: "A", 
    polarity: "Nonpolar", 
    charge: 0 },
  ARG: { 
    name: "Arginine", 
    threeLetter: "Arg", 
    oneLetter: "R", 
    polarity: "Basic", 
    charge: 1 },
  ASN: { 
    name: "Asparagine", 
    threeLetter: "Asn", 
    oneLetter: "N", 
    polarity: "Polar", 
    charge: 0 },
  ASP: { 
    name: "Aspartic acid", 
    threeLetter: "Asp", 
    oneLetter: "D", 
    polarity: "Acidic", 
    charge: -1 },
  CYS: { 
    name: "Cysteine", 
    threeLetter: "Cys", 
    oneLetter: "C", 
    polarity: "Polar", 
    charge: 0 },
  GLN: { 
    name: "Glutamine", 
    threeLetter: "Gln", 
    oneLetter: "Q", 
    polarity: "Polar", 
    charge: 0 },
  GLU: { 
    name: "Glutamic acid", 
    threeLetter: "Glu", 
    oneLetter: "E", 
    polarity: "Acidic", 
    charge: -1 },
  GLY: { 
    name: "Glycine", 
    threeLetter: "Gly", 
    oneLetter: "G", 
    polarity: "Nonpolar", 
    charge: 0 },
  HIS: { 
    name: "Histidine", 
    threeLetter: "His", 
    oneLetter: "H", 
    polarity: "Basic", 
    charge: 0 }, // near-neutral at physiological pH
  ILE: { 
    name: "Isoleucine", 
    threeLetter: "Ile", 
    oneLetter: "I", 
    polarity: "Nonpolar", 
    charge: 0 },
  LEU: { 
    name: "Leucine", 
    threeLetter: "Leu", 
    oneLetter: "L", 
    polarity: "Nonpolar", 
    charge: 0 },
  LYS: { 
    name: "Lysine", 
    threeLetter: "Lys", 
    oneLetter: "K", 
    polarity: "Basic", 
    charge: 1 },
  MET: { 
    name: "Methionine", 
    threeLetter: "Met", 
    oneLetter: "M", 
    polarity: "Nonpolar", 
    charge: 0 },
  PHE: { 
    name: "Phenylalanine", 
    threeLetter: "Phe", 
    oneLetter: "F", 
    polarity: "Aromatic", 
    charge: 0 },
  PRO: { 
    name: "Proline", 
    threeLetter: "Pro", 
    oneLetter: "P", 
    polarity: "Nonpolar", 
    charge: 0 },
  SER: { 
    name: "Serine", 
    threeLetter: "Ser", 
    oneLetter: "S", 
    polarity: "Polar", 
    charge: 0 },
  THR: { 
    name: "Threonine", 
    threeLetter: "Thr", 
    oneLetter: "T", 
    polarity: "Polar", 
    charge: 0 },
  TRP: { 
    name: "Tryptophan", 
    threeLetter: "Trp", 
    oneLetter: "W", 
    polarity: "Aromatic", 
    charge: 0 },
  TYR: { 
    name: "Tyrosine", 
    threeLetter: "Tyr", 
    oneLetter: "Y", 
    polarity: "Aromatic", 
    charge: 0 },
  VAL: { 
    name: "Valine", 
    threeLetter: "Val", 
    oneLetter: "V", 
    polarity: "Nonpolar", 
    charge: 0 },
} as const;