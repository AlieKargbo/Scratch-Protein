import * as Blockly from "blockly";

export function registerShow3DStructureBlock() {
  if (Blockly.Blocks["show_3d_structure"]) {
    return;
  }

  Blockly.Blocks["show_3d_structure"] = {
    init: function () {
      this.setColour(30);

      // this.appendValueInput("MOLECULE")
      //   .setCheck([
      //     "AMINO_ACID_RESIDUE",
      //     "PEPTIDE_CHAIN",
      //     "PROTEIN_COMPLEX",
      //   ])
      //   .appendField("show 3D structure of");

      this.appendValueInput("TARGET")
        .setCheck("PROTEIN_COMPLEX")
        .appendField("show 3D structure of");

      this.setPreviousStatement(true);

      this.setNextStatement(true);

      this.setTooltip(
        "Display a 3D representation of the selected biological structure."
      );
    },
  };
}