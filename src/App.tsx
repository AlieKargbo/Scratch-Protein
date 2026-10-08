//App.tsx
import { useEffect, useRef, useState } from 'react';
import BlocklyWorkspace from "./components/BlocklyWorkspace";
import ProteinSequence from "./components/ProteinSequence";

import NucleotideEditor from "./components/NucleotideEditor";
import './App.css'
import * as $3Dmol from '3dmol';

import MoleculeViewer from './Canvas'
import type { SchematicResidue } from './biology/Proceduralbackbone';
import { AMINO_ACIDS } from './biology/aminoAcids';
import type { ProteinComplex } from "./biology/biologyModel";

function App() {
  // Residue codes from the Blockly-built peptide chain (e.g. "ALA",
  // "GLY", ...), lifted here so both the block editor and the 3D
  // viewer can share it.
  const [builtResidues, setBuiltResidues] = useState<SchematicResidue[]>([]);
  const [proteinComplex, setProteinComplex] = useState<ProteinComplex | null>(null);

  function handleSequenceChange(residueCodes: string[]) {
    // BlocklyWorkspace gives us three-letter codes like "ALA"; the
    // schematic viewer only needs the code for labeling, so oneLetter
    // is left blank here rather than re-deriving it (avoids depending
    // on the ambiguous aminoAcids.ts / .tsx import — fix that first).
    setBuiltResidues(
      residueCodes.map((code) => ({ code, oneLetter: '' }))
    );
  }

  function handleProteinComplexChange(
    model: ProteinComplex | null
  ) {
    setProteinComplex(model);
  }
 
  // ProteinSequence wants the full record (name/threeLetter/oneLetter/code)
  // per residue, looked up from the single AMINO_ACIDS source of truth.
  const proteinSequenceResidues = builtResidues.map(({ code }) => {
    const info = AMINO_ACIDS[code];
    return {
      name: info?.name ?? code,
      threeLetter: info?.threeLetter ?? code,
      oneLetter: info?.oneLetter ?? '?',
      code,
    };
  });

  return (
    <div className="app-container">
      <header>
        {/* Sidebar Section */}
          <h2>Run Simulation</h2>
          <h2>Build a Protein</h2>
          <h2>Molecules</h2>
          <div className="sidebar-item">DNA</div>
          <div className="sidebar-item">mRNA</div>
          <div className="sidebar-item">Amino Acid</div>
          <div>Protein</div>
          <div className="sidebar-item" style={{ marginTop: 'auto' }}>
            Settings
          </div>
          <h2>Build a Protein</h2>
      </header>
        {/* <aside className="sidebar">

        </aside> */}
 
        {/* Main Canvas Section */}
        {/*header} */}
      <div className="canvas-container">
        <main className="main-canvas">
          <h1>Hello World</h1>
            <BlocklyWorkspace 
              onSequenceChange={handleSequenceChange}
              onProteinComplexChange={handleProteinComplexChange}
            />
        </main>
        <aside className='output-aside'>

        </aside>
      </div>



    </div>
  );
}
 
export default App;


          // <header>
          //   <BlocklyWorkspace onSequenceChange={handleSequenceChange} />
          // </header>

          // {proteinSequenceResidues.length > 0 && (
          //   <section>
          //     <ProteinSequence residues={proteinSequenceResidues} />
          //   </section>
          // )}

          // <section className="canvas-content">
          //   {/* Renders the schematic backbone once residues exist,
          //       otherwise falls back to the default reference pdbId */}
          //     <MoleculeViewer residues={builtResidues} />
          // </section>