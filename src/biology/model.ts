import {
  AMINO_ACIDS,
  type Amino_Acids,
} from "./aminoAcids";

export interface AminoAcidResidue {
  id: string;
  code: Amino_Acids;
  name: string;
  threeLetter: string;
  oneLetter: string;
  position: number;
}

export interface PeptideChain {
  id: string;
  name: string;
  residues: AminoAcidResidue[];
}

export interface ProteinComplex {
  id: string;
  name: string;
  chains: PeptideChain[];
}

export interface BiologicalModel {
  complexes: ProteinComplex[];
}