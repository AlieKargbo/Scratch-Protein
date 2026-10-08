import * as Blockly from "blockly";

import {
  AMINO_ACIDS,
  type AminoAcidCode,
} from "./aminoAcids";

import type {
  AminoAcidResidue,
  PeptideChain,
  ProteinComplex,
} from "./model";

function createResidue(
  code: AminoAcidCode,
  position: number,
  chainId: string
): AminoAcidResidue {
  const aminoAcid = AMINO_ACIDS[code];

  return {
    id: `${chainId}-residue-${position}`,
    code,
    name: aminoAcid.name,
    threeLetter: aminoAcid.threeLetter,
    oneLetter: aminoAcid.oneLetter,
    position,
  };
}