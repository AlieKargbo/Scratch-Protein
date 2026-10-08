import * as Blockly from "blockly";

export function registerAnalyzeBlock() {
  if (Blockly.Blocks["analyze"]) {
    return;
  }

  Blockly.Blocks["analyze"] = {
    init: function () {
      this.setColour(60);

      // this.appendValueInput("TARGET")
      //   .setCheck([
      //     "AMINO_ACID_RESIDUE",
      //     "PEPTIDE_CHAIN",
      //     "PROTEIN_COMPLEX",
      //   ])
      //   .appendField("analyze");

      this.appendValueInput("TARGET")
        .setCheck("PROTEIN_COMPLEX")
        .appendField("analyze");

      this.setPreviousStatement(true);

      this.setNextStatement(true);

      this.setTooltip(
        "Analyze the selected biological structure."
      );
    },
  };
}