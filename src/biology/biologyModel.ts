import * as Blockly from "blockly";
import { AMINO_ACIDS } from "./aminoAcids";

/**
 * Represents one amino acid residue in a peptide chain.
 */
export type AminoAcidResidue = {
  type: "AMINO_ACID_RESIDUE";
  code: keyof typeof AMINO_ACIDS;
  name: string;
  threeLetter: string;
  oneLetter: string;
  position?: number;
};

/**
 * Represents one peptide/polypeptide chain.
 */
export type PeptideChain = {
  type: "PEPTIDE_CHAIN";
  id: string;
  residues: AminoAcidResidue[];
  sequence: string;
  threeLetterSequence: string;
};

/**
 * Represents a protein complex containing multiple peptide chains.
 */
export type ProteinComplex = {
  type: "PROTEIN_COMPLEX";
  chains: PeptideChain[];
  totalResidues: number;
};

/**
 * The biological object that can be produced from a Blockly block.
 */
export type BiologyObject = | AminoAcidResidue | PeptideChain | ProteinComplex;


/**
 * Read an amino acid residue block and convert it
 * into a biological model object.
 */
export function getAminoAcidResidue( block: Blockly.Block ): AminoAcidResidue | null {
  if (block.type !== "amino_acid_residue") {
    return null;
  }

  const code = block.getFieldValue(
    "AMINO_ACID"
  ) as keyof typeof AMINO_ACIDS;

  const aminoAcid = AMINO_ACIDS[code];

  if (!aminoAcid) {
    return null;
  }

  return {
    type: "AMINO_ACID_RESIDUE",
    code,
    name: aminoAcid.name,
    threeLetter: aminoAcid.threeLetter,
    oneLetter: aminoAcid.oneLetter,
  };
}


/**
 * Read a peptide chain block and convert it
 * into a biological model object.
 */
export function getPeptideChain(
  block: Blockly.Block,
  chainId = "A"
): PeptideChain | null {
  if (block.type !== "peptide_chain") {
    return null;
  }

  const residues: AminoAcidResidue[] = [];

  let index = 0;

  while (true) {
    const input = block.getInput(`RESIDUE${index}`);

    if (!input) {
      break;
    }

    const residueBlock = input.connection?.targetBlock();

    if (residueBlock) {
      const residue = getAminoAcidResidue(residueBlock);

      if (residue) {
        residue.position = residues.length + 1;
        residues.push(residue);
      }
    }

    index++;
  }

  return {
    type: "PEPTIDE_CHAIN",
    id: chainId,
    residues,
    sequence: residues
      .map((residue) => residue.oneLetter)
      .join(""),
    threeLetterSequence: residues
      .map((residue) => residue.threeLetter)
      .join("-"),
  };
}


/**
 * Read a protein complex block and convert it
 * into a biological model object.
 */
export function getProteinComplex(
  block: Blockly.Block
): ProteinComplex | null {
  if (block.type !== "protein_complex") {
    return null;
  }

  const chains: PeptideChain[] = [];

  let index = 0;

  while (true) {
    const input = block.getInput(`CHAIN${index}`);

    if (!input) {
      break;
    }

    const chainBlock = input.connection?.targetBlock();

    if (chainBlock) {
      const chainId = String.fromCharCode(65 + index);

      const chain = getPeptideChain(
        chainBlock,
        chainId
      );

      if (chain) {
        chains.push(chain);
      }
    }

    index++;
  }

  return {
    type: "PROTEIN_COMPLEX",
    chains,
    totalResidues: chains.reduce(
      (total, chain) =>
        total + chain.residues.length,
      0
    ),
  };
}


/**
 * Convert a Blockly block into its corresponding
 * biological model object.
 */
export function getBiologyObject(
  block: Blockly.Block
): BiologyObject | null {
  switch (block.type) {
    case "amino_acid_residue":
      return getAminoAcidResidue(block);

    case "peptide_chain":
      return getPeptideChain(block);

    case "protein_complex":
      return getProteinComplex(block);

    default:
      return null;
  }
}


/**
 * Find the Protein Complex that is connected
 * to an Analyze or Show 3D block.
 */
export function getTargetProteinComplex(
  actionBlock: Blockly.Block
): ProteinComplex | null {
  const targetInput = actionBlock.getInput("TARGET");

  if (!targetInput) {
    return null;
  }

  const targetBlock =
    targetInput.connection?.targetBlock();

  if (!targetBlock) {
    return null;
  }

  if (targetBlock.type !== "protein_complex") {
    return null;
  }

  return getProteinComplex(targetBlock);
}