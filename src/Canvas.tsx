import React, { useEffect, useRef } from 'react';
import * as $3Dmol from '3dmol';
import { generateSchematicPDB } from './biology/Proceduralbackbone';
import type { SchematicResidue } from './biology/Proceduralbackbone';
import { predictSecondaryStructure } from './biology/secondaryStructure';

interface MoleculeViewerProps {
  /** Loads a real structure by PDB ID — for reference antigens, not student builds. */
  pdbId?: string;
  /**
   * Student-built residue sequence. When provided, takes priority over
   * pdbId and renders a SCHEMATIC (non-predicted) backbone — see
   * biology/proceduralBackbone.ts. Pass [] or undefined to fall back
   * to the pdbId reference structure.
   */
  residues?: SchematicResidue[];
}

const MoleculeViewer: React.FC<MoleculeViewerProps> = ({
  pdbId = '4N8T',
  residues,
}) => {
  // Explicitly type the ref as HTMLDivElement | null
  const containerRef = useRef<HTMLDivElement>(null);

  const hasBuiltSequence = residues && residues.length > 0;

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear previous viewer instance
    containerRef.current.innerHTML = '';

    // Initialize 3Dmol viewer
    const config = { backgroundColor: 'white' };
    const viewer = $3Dmol.createViewer(containerRef.current, config);

    if (hasBuiltSequence) {
      // --- Tier 1: schematic backbone from the student's built chain ---
      // Not a real fold — see proceduralBackbone.ts. Rendered as a
      // sphere+stick trace rather than cartoon, since cartoon implies
      // a real secondary-structure assignment we haven't computed.
      const labels = predictSecondaryStructure(residues!.map((r) => r.code));
      const pdbText = generateSchematicPDB(residues!, labels);
      viewer.addModel(pdbText, 'pdb');
      //viewer.setStyle({}, { sphere: { scale: 0.35 }, stick: { radius: 0.15 } });
      viewer.setStyle({}, { cartoon: { colorscheme: 'ssJmol' } });
      viewer.render();
      viewer.zoomTo();
    } else {
      // --- Tier 3: real reference structure by PDB ID ---
      $3Dmol.download(`pdb:${pdbId}`, viewer, {}, () => {
        viewer.setStyle({}, { cartoon: { color: 'spectrum' } });
        viewer.addSurface($3Dmol.SurfaceType.VDW, {
          opacity: 0.7,
          color: 'white',
        });
        viewer.render();
        viewer.zoomTo();
      });
    }

    // Cleanup on unmount
    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [pdbId, residues, hasBuiltSequence]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100px', //100%
        height: '100px',
        position: 'relative',
      }}
    />
  );
};

export default MoleculeViewer;