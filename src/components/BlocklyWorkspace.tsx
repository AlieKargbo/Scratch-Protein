//BlocklyWorkspace.tsx
import { useEffect, useRef, useState } from "react";
import * as Blockly from "blockly";
import Theme from '@blockly/theme-modern';

import { registerAminoAcidResidueBlock } from "../blocks/aminoAcidResidue";
import { registerPeptideChainBlock } from "../blocks/peptideChain";
import { registerProteinComplexBlock } from "../blocks/proteinComplex";
import { registerAnalyzeBlock } from "../blocks/analyze";
import { registerShow3DStructureBlock } from "../blocks/show3DStructure";

import { AMINO_ACIDS } from "../biology/aminoAcids";
import { getProteinComplex, type ProteinComplex, } from "../biology/biologyModel";

import "blockly/blocks";

type BlocklyWorkspaceProps = {
  /**
   * Called whenever the built peptide chain changes, with the residue
   * codes in order (e.g. ["ALA", "GLY", ...]). Wire this to the 3D
   * viewer so it can render the current build — see App.tsx.
   */
  onSequenceChange?: (residueCodes: string[]) => void;

  onProteinComplexChange?: (proteinComplex: ProteinComplex | null) => void;
};

export default function BlocklyWorkspace({
  onSequenceChange,
  onProteinComplexChange,
}: BlocklyWorkspaceProps) {
  const blocklyDiv = useRef<HTMLDivElement | null>(null);
  const workspaceRef = useRef<Blockly.WorkspaceSvg | null>(null);

  //const [sequence, setSequence] = useState("");
  //const [threeLetterSequence, setThreeLetterSequence] = useState("");

  //BiologyModel
  const [proteinComplex, setProteinComplex] = useState<ProteinComplex | null>(null);

  useEffect(() => {
    // Make sure the Blockly container exists
    if (!blocklyDiv.current) {
      return;
    }

    console.log("Registering blocks...");

    // Register custom blocks BEFORE creating workspace
    registerAminoAcidResidueBlock();
    registerPeptideChainBlock();
    registerProteinComplexBlock();
    registerAnalyzeBlock();
    registerShow3DStructureBlock();

    console.log("Blocks registered.");

    // Blockly toolbox
    const toolbox = {
      kind: "categoryToolbox",

      contents: [
        // {
        //   kind: "category",
        //   name: "Protein",
        //   colour: "#8B5CF6",

        //   contents: [
        //     {
        //       kind: "block",
        //       type: "amino_acid_residue",
        //     },

        //     {
        //       kind: "block",
        //       type: "peptide_chain",
        //     },
        //   ],
        // },
        {
          kind: "category",
          name: "Primary",
          colour: "#8B5CF6",

          contents: [
            {
              kind: "block",
              type: "amino_acid_residue",
            },
            {
              kind: "block",
              type: "peptide_chain",
            },
            {
              kind: "block",
              type: "protein_complex",
            },
          ],
        },
        {
          kind: "category",
          name: "Secondary",
          colour: "#8B5CF6",

          contents: [
            {
              kind: "block",
              type: "peptide_chain",
            },
          ],
        },
        {
          kind: "category",
          name: "Tertiary",
          colour: "#8B5CF6",

          contents: [
            {
              kind: "block",
              type: "peptide_chain",
            },
          ],
        },
        {
          kind: "category",
          name: "Quaternary",
          colour: "#8B5CF6",

          contents: [
            {
              kind: "block",
              type: "protein_complex",
            },
          ],
        },

        {
          kind: "category",
          name: "Actions",
          colour: "#F59E0B",

          contents: [
            {
              kind: "block",
              type: "show_3d_structure",
            },
            {
              kind: "block",
              type: "analyze",
            },
          ],
        },
      ],
    };

    console.log("Creating Blockly workspace...");

    // Create Blockly workspace
    const workspace = Blockly.inject(blocklyDiv.current, {
      theme: Theme,

      toolbox,

      grid: {
        spacing: 20,
        length: 3,
        colour: "#ddd",
        snap: true,
      },

      zoom: {
        controls: true,
        wheel: true,
        startScale: 1,
        maxScale: 2,
        minScale: 0.5,
      },

      trashcan: true,
    });

    workspaceRef.current = workspace;

    console.log("Blockly workspace created.");

    // Build the initial sequence/model immediately
    updatePeptideSequence(workspace);
    updateProteinModel(workspace);

    console.log("Initial Blockly data processed.");

    // Listen for Blockly changes
    const changeListener = (
      event: Blockly.Events.Abstract
    ) => {
      // Ignore clicks and viewport movement
      if (
        event.type === Blockly.Events.CLICK ||
        event.type === Blockly.Events.VIEWPORT_CHANGE
      ) {
        return;
      }

      console.log(
        "Blockly changed:",
        event.type
      );

      updatePeptideSequence(workspace);
      updateProteinModel(workspace);
    };

    // IMPORTANT:
    // Actually register the listener
    workspace.addChangeListener(changeListener);

    // Initial update
    updatePeptideSequence(workspace);
    updateProteinModel(workspace);

    // Cleanup

    return () => {
      workspace.removeChangeListener(changeListener);

      workspace.dispose();

      workspaceRef.current = null;
    };
  }, []);

  // Read peptide sequence from Blockly

  function updatePeptideSequence(
    workspace: Blockly.WorkspaceSvg
  ) {
    const peptideBlocks = workspace
      .getAllBlocks(false)
      .filter(
        (block) => block.type === "peptide_chain"
      );

    // No peptide chains
    if (peptideBlocks.length === 0) {
      //setSequence("");
      //setThreeLetterSequence("");
      onSequenceChange?.([]);
      return;
    }

    // For now, display the first chain in the main sequence panel
    const peptide = peptideBlocks[0];

    const residues: string[] = [];

    let index = 0;

    while (true) {
      const input = peptide.getInput(`RESIDUE${index}`);

      if (!input) {
        break;
      }

      const residueBlock =
        input.connection?.targetBlock();

      if (residueBlock) {
        const aminoAcid =
          residueBlock.getFieldValue("AMINO_ACID");

        if (aminoAcid) {
          residues.push(aminoAcid);
        }
      }

      index++;
    }

    const oneLetter = residues
      .map((code) => {
        const aminoAcid =
          AMINO_ACIDS[
          code as keyof typeof AMINO_ACIDS
          ];

        return aminoAcid?.oneLetter ?? "";
      })
      .join("");

    const threeLetter = residues
      .map((code) => {
        const aminoAcid =
          AMINO_ACIDS[
          code as keyof typeof AMINO_ACIDS
          ];

        return aminoAcid?.threeLetter ?? "";
      })
      .join("-");

    //setSequence(oneLetter);
    //setThreeLetterSequence(threeLetter);

    onSequenceChange?.(residues);

    console.log("Residues:", residues);
    console.log("One-letter sequence:", oneLetter);
    console.log(
      "Three-letter sequence:",
      threeLetter
    );
  }

  //Update Protein Model
  // Update Protein Model
  function updateProteinModel(
    workspace: Blockly.WorkspaceSvg
  ) {
    const proteinComplexBlock = workspace
      .getAllBlocks(false)
      .find(
        (block) => block.type === "protein_complex"
      );

    // No protein complex exists
    if (!proteinComplexBlock) {
      setProteinComplex(null);
      onProteinComplexChange?.(null);
      return;
    }

    // Convert the Blockly block into our Biology Model
    const model = getProteinComplex(proteinComplexBlock);

    setProteinComplex(model);
    onProteinComplexChange?.(model);

    console.log("Protein Complex:", model);
  }

  // UI

  return (
    <div
      style={{
        width: "100%",
      }}
    >
      {/* Protein sequence display */}
      {/* Protein structure display */}
      <div
        style={{
          marginBottom: "16px",
          padding: "16px 20px",
          border: "1px solid #ddd",
          borderRadius: "12px",
          background: "#fafafa",
        }}
      >
        <div
          style={{
            fontSize: "14px",
            fontWeight: 600,
            color: "#666",
            marginBottom: "12px",
          }}
        >
          PROTEIN STRUCTURE
        </div>

        {proteinComplex &&
          proteinComplex.chains.length > 0 ? (
          <>
            {proteinComplex.chains.map((chain) => (
              <div
                key={chain.id}
                style={{
                  marginBottom: "16px",
                  paddingBottom: "12px",
                  borderBottom: "1px solid #eee",
                }}
              >
                {/* Chain name */}
                <div
                  style={{
                    fontSize: "16px",
                    fontWeight: 700,
                    marginBottom: "6px",
                  }}
                >
                  Chain {chain.id}
                </div>

                {/* One-letter sequence */}
                <div
                  style={{
                    fontSize: "22px",
                    fontWeight: 700,
                    letterSpacing: "4px",
                  }}
                >
                  N → {chain.sequence} → C
                </div>

                {/* Three-letter sequence */}
                <div
                  style={{
                    marginTop: "6px",
                    fontSize: "14px",
                    color: "#666",
                  }}
                >
                  {chain.threeLetterSequence}
                </div>

                {/* Residue count */}
                <div
                  style={{
                    marginTop: "6px",
                    fontSize: "13px",
                    color: "#888",
                  }}
                >
                  {chain.residues.length} residue
                  {chain.residues.length === 1
                    ? ""
                    : "s"}
                </div>
              </div>
            ))}

            {/* Complex summary */}
            <div
              style={{
                fontSize: "13px",
                color: "#888",
                marginTop: "8px",
              }}
            >
              {proteinComplex.chains.length} chain
              {proteinComplex.chains.length === 1
                ? ""
                : "s"}
              {" · "}
              {proteinComplex.totalResidues} total
              residue
              {proteinComplex.totalResidues === 1
                ? ""
                : "s"}
            </div>
          </>
        ) : (
          <div
            style={{
              color: "#999",
            }}
          >
            Build a protein complex using peptide
            chains and amino acid residues.
          </div>
        )}
      </div>

      {/* Blockly workspace */}

      <div
        ref={blocklyDiv}
        style={{
          width: "100%",
          height: "700px",
          border: "1px solid #ddd",
          borderRadius: "12px",
          overflow: "hidden",
        }}
      />
    </div>
  );
}

// export default function MathWorkspace({
//     challengeId,
//     userId,
//     question = "Solve the mathematical problem.",
//     expectedAnswer,
// }: MathWorkspaceProps) {

//     const hasQuestion =
//         question &&
//         question !==
//         "Generate a question above to begin.";

//     // Blockly
//     const blocklyDiv = useRef<HTMLDivElement | null>(null);

//     const workspaceRef =
//         useRef<Blockly.WorkspaceSvg | null>(null);

//     // Convex
//     const saveAttempt = useMutation(
//         api.attempts.saveAttempt
//     );

//     // UI state
//     const [result, setResult] =
//         useState("");

//     const [studentAnswer, setStudentAnswer] =
//         useState<number | null>(null);

//     const [correctAnswer, setCorrectAnswer] =
//         useState<number | null>(null);

//     const [isCorrect, setIsCorrect] =
//         useState<boolean | null>(null);

//     const [studentSolution, setStudentSolution] =
//         useState("");

//     const [showTutor, setShowTutor] =
//         useState(false);

//     // Register Blockly blocks
//     useEffect(() => {

//         registerNumberBlock();
//         registerVariableBlock();
//         registerOperationBlock();
//         registerEquationBlock();
//         registerCalculateBlock();
//         registerSolveBlock();

//         registerAdvancedArithmeticBlocks();
//         registerAlgebraBlocks();
//         registerFunctionBlocks();
//         registerGraphingBlocks();
//         registerGeometryBlocks();
//         registerTrigonometryBlocks();

//     }, []);

//     // Create Blockly workspace

//     useEffect(() => {

//         if (!blocklyDiv.current) {
//             return;
//         }

//         // Prevent creating Blockly twice
//         if (workspaceRef.current) {
//             return;
//         }

//         const toolbox = {

//             kind: "categoryToolbox",

//             contents: [

//                 // Numbers

//                 {
//                     kind: "category",
//                     name: "Numbers",
//                     colour: "230",

//                     contents: [
//                         {
//                             kind: "block",
//                             type: "math_number_custom",
//                         },

//                         {
//                             kind: "block",
//                             type: "math_variable_custom",
//                         },
//                     ],
//                 },

//                 // Arithmetic

//                 {
//                     kind: "category",
//                     name: "Arithmetic",
//                     colour: "120",

//                     contents: [

//                         {
//                             kind: "block",
//                             type: "math_operation",
//                         },

//                         {
//                             kind: "block",
//                             type: "math_exponent",
//                         },

//                         {
//                             kind: "block",
//                             type: "math_square_root",
//                         },

//                         {
//                             kind: "block",
//                             type: "math_absolute",
//                         },

//                         {
//                             kind: "block",
//                             type: "math_negative",
//                         },

//                         {
//                             kind: "block",
//                             type: "math_modulo",
//                         },

//                         {
//                             kind: "block",
//                             type: "math_fraction",
//                         },
//                     ],
//                 },

//                 // Algebra

//                 {
//                     kind: "category",
//                     name: "Algebra",
//                     colour: "60",

//                     contents: [

//                         {
//                             kind: "block",
//                             type: "math_equation",
//                         },

//                         {
//                             kind: "block",
//                             type: "math_solve",
//                         },

//                         {
//                             kind: "block",
//                             type: "math_inequality",
//                         },

//                         {
//                             kind: "block",
//                             type: "math_simplify",
//                         },

//                         {
//                             kind: "block",
//                             type: "math_coefficient",
//                         },

//                         {
//                             kind: "block",
//                             type: "math_constant_term",
//                         },
//                     ],
//                 },

//                 // Functions

//                 {
//                     kind: "category",
//                     name: "Functions",
//                     colour: "180",

//                     contents: [

//                         {
//                             kind: "block",
//                             type: "math_function",
//                         },

//                         {
//                             kind: "block",
//                             type: "math_evaluate_function",
//                         },

//                         {
//                             kind: "block",
//                             type: "math_domain",
//                         },

//                         {
//                             kind: "block",
//                             type: "math_range",
//                         },
//                     ],
//                 },

//                 // Graphing

//                 {
//                     kind: "category",
//                     name: "Graphing",
//                     colour: "290",

//                     contents: [

//                         {
//                             kind: "block",
//                             type: "math_point",
//                         },

//                         {
//                             kind: "block",
//                             type: "math_slope",
//                         },

//                         {
//                             kind: "block",
//                             type: "math_line",
//                         },

//                         {
//                             kind: "block",
//                             type: "math_y_intercept",
//                         },

//                         {
//                             kind: "block",
//                             type: "math_graph",
//                         },
//                     ],
//                 },

//                 // Geometry

//                 {
//                     kind: "category",
//                     name: "Geometry",
//                     colour: "20",

//                     contents: [

//                         {
//                             kind: "block",
//                             type: "geometry_rectangle",
//                         },

//                         {
//                             kind: "block",
//                             type: "geometry_triangle",
//                         },

//                         {
//                             kind: "block",
//                             type: "geometry_circle",
//                         },

//                         {
//                             kind: "block",
//                             type: "geometry_area",
//                         },

//                         {
//                             kind: "block",
//                             type: "geometry_perimeter",
//                         },

//                         {
//                             kind: "block",
//                             type: "geometry_circumference",
//                         },

//                         {
//                             kind: "block",
//                             type: "geometry_volume",
//                         },
//                     ],
//                 },

//                 // Trigonometry

//                 {
//                     kind: "category",
//                     name: "Trigonometry",
//                     colour: "330",

//                     contents: [

//                         {
//                             kind: "block",
//                             type: "math_sin",
//                         },

//                         {
//                             kind: "block",
//                             type: "math_cos",
//                         },

//                         {
//                             kind: "block",
//                             type: "math_tan",
//                         },

//                         {
//                             kind: "block",
//                             type: "math_arcsin",
//                         },

//                         {
//                             kind: "block",
//                             type: "math_arccos",
//                         },

//                         {
//                             kind: "block",
//                             type: "math_arctan",
//                         },

//                         {
//                             kind: "block",
//                             type: "math_degrees",
//                         },

//                         {
//                             kind: "block",
//                             type: "math_radians",
//                         },
//                     ],
//                 },

//                 // Calculate
//                 {
//                     kind: "category",
//                     name: "Calculate",
//                     colour: "160",

//                     contents: [

//                         {
//                             kind: "block",
//                             type: "math_calculate",
//                         },
//                     ],
//                 },
//             ],
//         };

//         // Create workspace

//         const workspace = Blockly.inject(blocklyDiv.current, {
//             toolbox,

//             grid: {
//                 spacing: 20,
//                 length: 3,
//                 colour: "#ddd",
//                 snap: true,
//             },

//             zoom: {
//                 controls: true,
//                 wheel: true,
//                 startScale: 1,
//                 maxScale: 1.5,
//                 minScale: 0.5,
//                 scaleSpeed: 1.1,
//             },

//             trashcan: true,
//         }
//         );


//         workspaceRef.current = workspace;

//         // Automatically close toolbox/flyout

//         const listener = (
//             event: Blockly.Events.Abstract
//         ) => {
//             if (event.type === Blockly.Events.BLOCK_DRAG) {
//                 const dragEvent =
//                     event as Blockly.Events.BlockDrag;

//                 // Close toolbox when dragging finishes
//                 if (!dragEvent.isStart) {
//                     workspace.getToolbox()
//                         ?.getFlyout()
//                         ?.hide();

//                     workspace.getToolbox()
//                         ?.clearSelection();
//                 }
//             }
//         };


//         workspace.addChangeListener(listener);

//         // Cleanup

//         return () => {

//             workspace.removeChangeListener(listener);

//             workspace.dispose();

//             workspaceRef.current = null;
//         };

//     }, []);

//     // Find top-level block

//     function getMainBlock():
//         Blockly.Block | null {

//         const workspace =
//             workspaceRef.current;

//         if (!workspace) {
//             return null;
//         }

//         const blocks =
//             workspace.getTopBlocks(true);

//         if (blocks.length === 0) {
//             return null;
//         }

//         return blocks[0];
//     }

//     // Get expression from Calculate

//     function getCalculateExpressionBlock(
//         block: Blockly.Block
//     ): Blockly.Block | null {

//         if (
//             block.type !== "math_calculate"
//         ) {
//             return block;
//         }

//         return block.getInputTargetBlock(
//             "EXPRESSION"
//         );
//     }

//     // Convert block to readable math

//     function getStudentSolution(
//         block: Blockly.Block
//     ): string {

//         const expressionBlock =
//             getCalculateExpressionBlock(block);

//         if (!expressionBlock) {
//             return "";
//         }

//         const expression =
//             blockToExpression(
//                 expressionBlock
//             );

//         return expressionToString(
//             expression
//         );
//     }

//     // Calculate

//     function evaluateWorkspace() {

//         console.log("Testing...");
//         const workspace =
//             workspaceRef.current;

//         if (!workspace) {
//             setResult(
//                 "Workspace is not ready."
//             );

//             return null;
//         }


//         const topBlocks =
//             workspace.getTopBlocks(true);


//         if (topBlocks.length === 0) {

//             setResult(
//                 "Build an expression first."
//             );

//             return null;
//         }


//         const topBlock =
//             topBlocks[0];

//         // Calculate block

//         if (
//             topBlock.type ===
//             "math_calculate"
//         ) {

//             const expressionBlock =
//                 topBlock.getInputTargetBlock(
//                     "EXPRESSION"
//                 );


//             if (!expressionBlock) {

//                 setResult(
//                     "Connect an expression to Calculate."
//                 );

//                 return null;
//             }


//             const expression =
//                 blockToExpression(
//                     expressionBlock
//                 );


//             if (!expression) {

//                 setResult(
//                     "I couldn't understand this expression."
//                 );

//                 return null;
//             }

//             const answer = evaluateExpression(
//                 expression
//             );


//             if (answer === null) {

//                 setResult(
//                     "This expression contains a variable or cannot be evaluated yet."
//                 );

//                 return null;
//             }


//             setResult(
//                 `Answer: ${answer}`
//             );

//             return answer;
//         }

//         // Inequality
//         if (
//             topBlock.type ===
//             "math_inequality"
//         ) {

//             const algebraResult =
//                 evaluateInequality(
//                     topBlock
//                 );


//             setResult(
//                 algebraResult.message
//             );


//             if (
//                 algebraResult.value !== undefined
//             ) {
//                 return algebraResult.value;
//             }

//             return null;
//         }

//         // Simplify

//         if (
//             topBlock.type ===
//             "math_simplify"
//         ) {

//             const algebraResult =
//                 simplifyExpression(
//                     topBlock
//                 );


//             setResult(
//                 algebraResult.message
//             );


//             if (
//                 algebraResult.value !== undefined
//             ) {
//                 return algebraResult.value;
//             }

//             return null;
//         }

//         // Coefficient
//         if (
//             topBlock.type ===
//             "math_coefficient"
//         ) {

//             const algebraResult =
//                 getCoefficient(
//                     topBlock
//                 );


//             setResult(
//                 algebraResult.message
//             );


//             if (
//                 algebraResult.value !== undefined
//             ) {
//                 return algebraResult.value;
//             }

//             return null;
//         }

//         // Constant

//         if (
//             topBlock.type ===
//             "math_constant_term"
//         ) {

//             const algebraResult =
//                 getConstantTerm(
//                     topBlock
//                 );


//             setResult(
//                 algebraResult.message
//             );


//             if (
//                 algebraResult.value !== undefined
//             ) {
//                 return algebraResult.value;
//             }

//             return null;
//         }

//         // Solve equation

//         if (
//             topBlock.type ===
//             "math_solve"
//         ) {

//             const variable =
//                 String(
//                     topBlock.getFieldValue(
//                         "VARIABLE"
//                     )
//                 ).trim() || "x";


//             const solveResult =
//                 solveEquation(
//                     topBlock.getInputTargetBlock(
//                         "EQUATION"
//                     )!,
//                     variable
//                 );


//             if (!solveResult.success) {

//                 setResult(
//                     solveResult.message ??
//                     "Could not solve the equation."
//                 );

//                 return null;
//             }


//             setResult(
//                 `x = ${solveResult.answer}`
//             );


//             return solveResult.answer;
//         }

//         // Generic expression

//         const expression =
//             blockToExpression(
//                 topBlock
//             );


//         if (!expression) {

//             setResult(
//                 "I couldn't understand this mathematical block."
//             );

//             return null;
//         }


//         const answer =
//             evaluateExpression(
//                 expression
//             );


//         if (
//             typeof answer !== "number" ||
//             !Number.isFinite(answer)
//         ) {

//             setResult(
//                 "This expression contains a variable or cannot be evaluated yet."
//             );

//             return null;
//         }


//         setResult(
//             `Answer: ${answer}`
//         );


//         return answer;
//     }

//     // Submit answer
//     async function submitAnswer() {

//         if (
//             expectedAnswer === undefined
//         ) {

//             setResult(
//                 "No challenge answer has been provided."
//             );

//             return;
//         }


//         const workspace =
//             workspaceRef.current;


//         if (!workspace) {

//             setResult(
//                 "Workspace is not ready."
//             );

//             return;
//         }


//         const topBlocks =
//             workspace.getTopBlocks(true);


//         if (topBlocks.length === 0) {

//             setResult(
//                 "Build a solution first."
//             );

//             return;
//         }


//         const topBlock =
//             topBlocks[0];

//         // Calculate answer
//         const answer =
//             evaluateWorkspace();


//         if (
//             typeof answer !== "number" ||
//             !Number.isFinite(answer)
//         ) {

//             return;
//         }

//         // Check answer

//         const correct =
//             Math.abs(
//                 answer - expectedAnswer
//             ) < 0.000001;

//         // Convert Blockly work into readable math

//         const solution =
//             getStudentSolution(
//                 topBlock
//             );


//         setStudentAnswer(answer);

//         setCorrectAnswer(
//             expectedAnswer
//         );

//         setIsCorrect(correct);

//         setStudentSolution(
//             solution
//         );

//         // Show result

//         if (correct) {

//             setResult(
//                 `✓ Correct! Your answer is ${answer}.`
//             );

//         } else {

//             setResult(
//                 `✗ Your answer is ${answer}.`
//             );
//         }

//         // Save to Convex

//         if (
//             userId &&
//             challengeId
//         ) {

//             try {

//                 await saveAttempt({

//                     userId,

//                     challengeId,

//                     solution,

//                     answer,

//                     correct,

//                 });

//             } catch (error) {

//                 console.error(
//                     "Failed to save attempt:",
//                     error
//                 );

//                 setResult(
//                     correct
//                         ? `✓ Correct! Your answer is ${answer}. Your result could not be saved.`
//                         : `✗ Your answer is ${answer}. Your result could not be saved.`
//                 );
//             }
//         }

//         // Show AI Tutor

//         setShowTutor(true);
//     }

//     // Clear workspace

//     function clearWorkspace() {

//         const workspace =
//             workspaceRef.current;

//         if (!workspace) {
//             return;
//         }


//         workspace.clear();


//         setResult("");

//         setStudentAnswer(null);

//         setCorrectAnswer(null);

//         setIsCorrect(null);

//         setStudentSolution("");

//         setShowTutor(false);
//     }

//     // UI

//     return (

//         <div
//             style={{
//                 display: "flex",
//                 width: "100%",
//                 height: "100%",
//                 minHeight: "650px",
//                 gap: "16px",
//             }}
//         >

//             {/*
//           Blockly Workspace*/}

//             <div
//                 style={{
//                     flex: 1,
//                     minWidth: 0,
//                     border: "1px solid #ddd",
//                     borderRadius: "12px",
//                     overflow: "hidden",
//                     background: "#fff",
//                 }}
//             >

//                 <div
//                     ref={blocklyDiv}
//                     style={{
//                         width: "100%",
//                         height: "100%",
//                         minHeight: "650px",
//                     }}
//                 />

//             </div>


//             {/* 
//           Right Sidebar
//           */}

//             <div
//                 style={{
//                     width: "340px",
//                     minWidth: "300px",
//                     padding: "20px",
//                     borderRadius: "12px",
//                     border: "1px solid #ddd",
//                     background: "#ffffff",
//                     overflowY: "auto",
//                 }}
//             >

//                 <h2
//                     style={{
//                         marginTop: 0,
//                         marginBottom: "20px",
//                     }}
//                 >
//                     MathBlocks
//                 </h2>


//                 {/* 
//             Expression
//              */}

//                 <div
//                     style={{
//                         marginBottom: "16px",
//                     }}
//                 >

//                     <strong>
//                         Expression
//                     </strong>


//                     <div
//                         style={{
//                             marginTop: "8px",
//                             padding: "12px",
//                             minHeight: "40px",
//                             borderRadius: "8px",
//                             background: "#f5f5f5",
//                             fontFamily: "monospace",
//                         }}
//                     >

//                         {(() => {

//                             const block =
//                                 getMainBlock();

//                             if (!block) {
//                                 return "No expression yet.";
//                             }

//                             return (
//                                 getStudentSolution(
//                                     block
//                                 ) ||
//                                 "Connect your blocks."
//                             );

//                         })()}

//                     </div>

//                 </div>


//                 {/* 
//             Result
//              */}

//                 <div
//                     style={{
//                         marginBottom: "16px",
//                     }}
//                 >

//                     <strong>
//                         Result
//                     </strong>


//                     <div
//                         style={{
//                             marginTop: "8px",
//                             padding: "12px",
//                             minHeight: "40px",
//                             borderRadius: "8px",
//                             background: "#f3f4f6",
//                         }}
//                     >

//                         {result ||
//                             "No result yet."}

//                     </div>

//                 </div>


//                 {/* 
//             Calculate
//              */}

//                 <button
//                     onClick={evaluateWorkspace}
//                     style={{
//                         width: "100%",
//                         padding: "12px",
//                         marginBottom: "10px",
//                         border: "none",
//                         borderRadius: "8px",
//                         background: "#4f46e5",
//                         color: "white",
//                         fontWeight: 600,
//                         cursor: "pointer",
//                     }}
//                 >
//                     Calculate
//                 </button>


//                 {/*
//             Submit
//             */}

//                 {expectedAnswer !== undefined && (

//                     <button
//                         onClick={submitAnswer}
//                         disabled={!hasQuestion}
//                         style={{
//                             width: "100%",
//                             padding: "12px",
//                             marginBottom: "10px",
//                             border: "none",
//                             borderRadius: "8px",
//                             background: "#16a34a",
//                             color: "white",
//                             fontWeight: 600,
//                             cursor: "pointer",
//                         }}
//                     >
//                         Submit Answer
//                     </button>

//                 )}


//                 {/* 
//             Clear
//             */}

//                 <button
//                     onClick={clearWorkspace}
//                     style={{
//                         width: "100%",
//                         padding: "12px",
//                         border: "1px solid #d1d5db",
//                         borderRadius: "8px",
//                         background: "white",
//                         color: "#374151",
//                         fontWeight: 600,
//                         cursor: "pointer",
//                     }}
//                 >
//                     Clear Workspace
//                 </button>


//                 {/*
//             AI Tutor
//              */}

//                 {/* {showTutor &&
//                     studentAnswer !== null &&
//                     correctAnswer !== null &&
//                     isCorrect !== null && ( */}
//                 <AITutor
//                     question="What is 2 + 2?"
//                     studentSolution="2 + 2"
//                     studentAnswer={4}
//                     correctAnswer={4}
//                     isCorrect={true}
//                 />
//                 {/* )} */}

//                 {showTutor &&
//                     studentAnswer !== null &&
//                     correctAnswer !== null &&
//                     isCorrect !== null && (
//                         <AITutor question={question}
//                             studentSolution={studentSolution}
//                             studentAnswer={studentAnswer}
//                             correctAnswer={correctAnswer}
//                             isCorrect={isCorrect} />
//                     )
//                 }
//             </div>

//         </div>
//     );
// }