// NucleotideEditor.jsx
//
// First working block for the protein/vaccine builder: a single
// "nucleotide" block (A / U / G / C) that you can drag out of the
// toolbox and drop on the canvas.
//
// Setup:
//   npm install blockly
//
// Usage:
//   import NucleotideEditor from './NucleotideEditor';
//   <NucleotideEditor />
//
// This is deliberately the smallest possible working example — one
// block, one toolbox category, one workspace. Once this renders and
// you can drag the block onto the canvas, we add the codon block
// (which accepts three nucleotide blocks) and wire up live
// translation feedback.

import { useEffect, useRef } from 'react';
import * as Blockly from 'blockly/core';
import 'blockly/blocks';
import * as En from 'blockly/msg/en';

Blockly.setLocale(En as unknown as Record<string, string>);

// --- 1. Define the block ---------------------------------------------
// "type" is the block's internal id, used later when the codon block
// says "only accept blocks whose type/check is 'nucleotide'".
Blockly.defineBlocksWithJsonArray([
  {
    type: 'nucleotide',
    message0: '%1',
    args0: [
      {
        type: 'field_dropdown',
        name: 'BASE',
        options: [
          ['A', 'A'],
          ['U', 'U'],
          ['G', 'G'],
          ['C', 'C'],
        ],
      },
    ],
    // "nucleotide" here is a custom connection-check string, not a
    // built-in Blockly type. It means: this block's previous/next
    // connections will only snap to other blocks that also declare
    // "nucleotide" as their check. That's what stops a student from
    // accidentally snapping a nucleotide block onto an amino-acid block.
    previousStatement: 'nucleotide',
    nextStatement: 'nucleotide',
    colour: 160, // teal-ish — matches the "nucleic acid" tier color
    tooltip: 'A single DNA/RNA base',
  },
]);

// --- 2. Toolbox -------------------------------------------------------
// The palette on the left. One category for now; you'll add
// "Protein" and "Vaccine" categories as those block types come online.
const toolbox = {
  kind: 'categoryToolbox',
  contents: [
    {
      kind: 'category',
      name: 'Nucleic acid',
      colour: '160',
      contents: [{ kind: 'block', type: 'nucleotide' }],
    },
  ],
};

// --- 3. React wrapper ---------------------------------------------------
export default function NucleotideEditor() {
  const blocklyDivRef = useRef<HTMLDivElement | null>(null);
  const workspaceRef = useRef<Blockly.WorkspaceSvg | null>(null);

  useEffect(() => {
    if (!blocklyDivRef.current) {
      return;
    }

    const workspace = Blockly.inject(blocklyDivRef.current, {
      toolbox,
      trashcan: true,
      zoom: { controls: true, wheel: true },
      grid: { spacing: 24, length: 3, colour: '#e5e5e5', snap: true },
    });

    workspaceRef.current = workspace;

    const onChange = () => {
      const currentWorkspace = workspaceRef.current;
      if (!currentWorkspace) {
        return;
      }

      const blocks = currentWorkspace.getAllBlocks(false);
      const bases = blocks
        .filter((block: Blockly.Block) => block.type === 'nucleotide')
        .map((block: Blockly.Block) => block.getFieldValue('BASE'));
      console.log('Current bases on canvas:', bases);
    };

    workspaceRef.current.addChangeListener(onChange);

    return () => {
      const currentWorkspace = workspaceRef.current;
      if (currentWorkspace) {
        currentWorkspace.dispose();
        workspaceRef.current = null;
      }
    };
  }, []);

  return (
      <div
        ref={blocklyDivRef}
        style={{ height: '480px', width: '100%', border: '1px solid #ddd' }}
      />
  );
}
