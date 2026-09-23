const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  Table, TableRow, TableCell, WidthType, BorderStyle, ShadingType,
  ImageRun, PageBreak, TableOfContents, Header, Footer, PageNumber,
  LevelFormat, convertInchesToTwip, VerticalAlign, TabStopType, TabStopPosition
} = require("docx");

const IMG = "/home/claude/report/images/";

// ---------- helpers ----------
function H1(text) {
  return new Paragraph({ text, heading: HeadingLevel.HEADING_1, spacing: { before: 360, after: 200 } });
}
function H2(text) {
  return new Paragraph({ text, heading: HeadingLevel.HEADING_2, spacing: { before: 260, after: 160 } });
}
function P(text, opts = {}) {
  return new Paragraph({
    children: [new TextRun({ text, italics: opts.italics || false, bold: opts.bold || false })],
    spacing: { after: 200, line: 300 },
    alignment: opts.align || AlignmentType.JUSTIFIED,
  });
}
function Bullet(text) {
  return new Paragraph({
    text,
    bullet: { level: 0 },
    spacing: { after: 100, line: 300 },
  });
}
function imgDims(path) {
  const sizeOf = require("image-size");
  const d = sizeOf(path);
  return d;
}
function Figure(file, caption, widthIn = 6.0) {
  const path = IMG + file;
  const d = imgDims(path);
  const ratio = d.height / d.width;
  const w = widthIn * 96; // px at 96 dpi for docx-js sizing convention
  const h = w * ratio;
  return [
    new Paragraph({
      children: [ new ImageRun({ data: fs.readFileSync(path), transformation: { width: w, height: h }, type: "png" }) ],
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 80 },
    }),
    new Paragraph({
      children: [ new TextRun({ text: caption, italics: true, size: 20 }) ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 240 },
    }),
  ];
}
function cell(text, opts = {}) {
  return new TableCell({
    width: { size: opts.width || 2000, type: WidthType.DXA },
    shading: opts.header ? { fill: "1F3864", type: ShadingType.CLEAR } : undefined,
    verticalAlign: VerticalAlign.CENTER,
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    children: [ new Paragraph({
      children: [ new TextRun({ text, bold: opts.header || opts.bold || false, color: opts.header ? "FFFFFF" : undefined, size: opts.size || 21 }) ],
      alignment: opts.align || AlignmentType.LEFT,
    }) ],
  });
}
function SimpleTable(headers, rows, widths) {
  const w = widths || headers.map(() => Math.floor(9000 / headers.length));
  return new Table({
    width: { size: 9000, type: WidthType.DXA },
    columnWidths: w,
    rows: [
      new TableRow({
        tableHeader: true,
        children: headers.map((h, i) => cell(h, { header: true, width: w[i], align: AlignmentType.CENTER })),
      }),
      ...rows.map(r => new TableRow({
        children: r.map((c, i) => cell(String(c), { width: w[i] })),
      })),
    ],
  });
}
function pb() { return new Paragraph({ children: [new PageBreak()] }); }

// ---------- children array ----------
let doc = [];

// ===================== TITLE PAGE =====================
doc.push(
  new Paragraph({ text: "", spacing: { after: 1200 } }),
  new Paragraph({
    children: [ new TextRun({ text: "INDIA SPACE LAB", bold: true, size: 28, color: "1F3864" }) ],
    alignment: AlignmentType.CENTER, spacing: { after: 100 },
  }),
  new Paragraph({
    children: [ new TextRun({ text: "Rocketry Training – Aerospace Simulation Workshop", size: 22, color: "44546A" }) ],
    alignment: AlignmentType.CENTER, spacing: { after: 900 },
  }),
  new Paragraph({
    children: [ new TextRun({ text: "STRUCTURAL AND AERODYNAMIC ANALYSIS", bold: true, size: 40, color: "1F3864" }) ],
    alignment: AlignmentType.CENTER, spacing: { after: 120 },
  }),
  new Paragraph({
    children: [ new TextRun({ text: "OF A ROCKET FIN", bold: true, size: 40, color: "1F3864" }) ],
    alignment: AlignmentType.CENTER, spacing: { after: 120 },
  }),
  new Paragraph({
    children: [ new TextRun({ text: "A Finite Element Method (FEM) and Computational Fluid Dynamics (CFD) Study", size: 24, italics: true, color: "44546A" }) ],
    alignment: AlignmentType.CENTER, spacing: { after: 900 },
  }),
  new Paragraph({
    children: [ new TextRun({ text: "Performed on the SimScale Cloud Simulation Platform", size: 22 }) ],
    alignment: AlignmentType.CENTER, spacing: { after: 1600 },
  }),
  new Paragraph({
    children: [ new TextRun({ text: "Submitted in partial fulfilment of the requirements of the", size: 21 }) ],
    alignment: AlignmentType.CENTER, spacing: { after: 60 },
  }),
  new Paragraph({
    children: [ new TextRun({ text: "India Space Lab – Rocketry Training FEM + CFD Project", size: 21, bold: true }) ],
    alignment: AlignmentType.CENTER, spacing: { after: 1400 },
  }),
  new Paragraph({
    children: [ new TextRun({ text: "Submitted by: ______________________________", size: 21 }) ],
    alignment: AlignmentType.CENTER, spacing: { after: 160 },
  }),
  new Paragraph({
    children: [ new TextRun({ text: "Institution: ______________________________", size: 21 }) ],
    alignment: AlignmentType.CENTER, spacing: { after: 160 },
  }),
  new Paragraph({
    children: [ new TextRun({ text: "Date of Submission: August 2026", size: 21 }) ],
    alignment: AlignmentType.CENTER, spacing: { after: 160 },
  }),
  new Paragraph({
    children: [ new TextRun({ text: "Software Used: SimScale (FEM & CFD Cloud Simulation Suite)", size: 21 }) ],
    alignment: AlignmentType.CENTER, spacing: { after: 1600 },
  }),
);
doc.push(pb());

// ===================== ABSTRACT =====================
doc.push(H1("Abstract"));
doc.push(P(
"This report documents a combined structural (Finite Element Method) and aerodynamic (Computational Fluid Dynamics) simulation study carried out on a rocket fin as part of the India Space Lab Rocketry Training – Aerospace Simulation Workshop. The objective of the exercise was to build practical, hands-on competence in setting up, running, and interpreting FEM and CFD simulations using the SimScale cloud simulation platform, applied to a representative sub-component of a sounding rocket: the aerodynamic stabilising fin."
));
doc.push(P(
"In the structural study, a single delta-shaped aluminium fin was modelled as a linear-elastic solid, fixed at its root and loaded with a uniform aerodynamic pressure of 5000 Pa on both faces to represent an in-flight normal load. The resulting Von Mises stress distribution, deformation, and strain fields were extracted and used to compute the factor of safety against yielding. In the aerodynamic study, the complete rocket assembly (nose cone, body tube and fin set) was placed inside an external flow domain and subjected to a free-stream velocity inlet, a pressure outlet and no-slip wall conditions, with turbulence modelled using a two-equation k–ω closure. Flow was solved iteratively for 1000 iterations, with residual monitoring used to confirm convergence."
));
doc.push(P(
"The structural analysis showed a maximum Von Mises stress of approximately 5.97 kPa concentrated near the fin's trailing tip, corresponding to a maximum tip deflection on the order of 3.8 nanometres — several orders of magnitude below the yield strength of the aluminium alloy, giving a very large calculated factor of safety under the assumed static pressure load. The CFD analysis captured strongly three-dimensional flow separation and wake formation behind the fins, with local flow velocities reaching values consistent with a high subsonic to low-supersonic free-stream condition and corresponding static pressure variation across the surface of the body and fins. The results, engineering interpretation, assumptions, and recommendations for further work (including flutter and dynamic loading checks) are presented in the sections that follow."
));
doc.push(pb());

// ===================== INTRODUCTION =====================
doc.push(H1("1. Introduction"));
doc.push(P(
"Rocket fins are thin, aerodynamically shaped surfaces mounted near the aft end of a rocket body. Their primary role is to provide passive aerodynamic stability by shifting the centre of pressure of the vehicle aft of its centre of gravity, so that any small angle of attack generates a restoring moment that keeps the rocket flying along its intended trajectory. Because fins are thin, cantilevered structures exposed directly to the airstream, they experience simultaneous aerodynamic loading and structural bending, making them a good introductory case study for coupled structural and fluid simulation."
));
doc.push(P(
"Historically, fin design relied on empirical correlations and wind-tunnel testing. Modern aerospace engineering increasingly uses numerical simulation — specifically the Finite Element Method (FEM) for structural response and Computational Fluid Dynamics (CFD) for aerodynamic behaviour — to predict performance early in the design cycle, reduce the number of physical prototypes required, and build engineering intuition about how geometry, material, and loading interact. This project was designed to introduce these two numerical techniques in an integrated way: the aerodynamic pressure field obtained conceptually from the CFD study motivates the structural pressure load applied in the FEM study, mirroring the way a real design process moves between aerodynamic and structural disciplines."
));
doc.push(P(
"This report follows the workshop's prescribed two-part structure. Part B applies FEM to a single rocket fin to evaluate its structural integrity under an assumed aerodynamic pressure load, including a mesh-dependent stress and deformation study and a factor-of-safety calculation. Part C applies CFD to the full rocket assembly to visualise the external flow field, pressure distribution, and wake behind the fins, and to discuss the resulting drag and aerodynamic stability characteristics. Both simulations were carried out on the SimScale cloud-based simulation platform, and all figures in this report are screen captures taken directly from the SimScale post-processing workbench during the course of the project."
));

// ===================== AIM AND OBJECTIVES =====================
doc.push(H1("2. Aim and Objectives"));
doc.push(H2("2.1 Aim"));
doc.push(P(
"To perform a coupled structural (FEM) and aerodynamic (CFD) simulation study of a rocket fin, in order to evaluate its structural adequacy under an assumed aerodynamic pressure load and to characterise the external flow field and aerodynamic behaviour of the rocket assembly."
));
doc.push(H2("2.2 Objectives"));
doc.push(Bullet("To model the geometry and assign realistic material properties to a rocket fin for structural analysis."));
doc.push(Bullet("To apply realistic boundary conditions — a fixed structural support at the fin root and a representative aerodynamic pressure load on the fin surfaces."));
doc.push(Bullet("To generate and evaluate a finite element mesh, and to check that the computed stress and deformation fields are adequately resolved."));
doc.push(Bullet("To interpret the resulting Von Mises stress, deformation, and strain fields, and to identify structurally critical regions of the fin."));
doc.push(Bullet("To calculate the factor of safety of the fin against yielding under the assumed load."));
doc.push(Bullet("To construct an external flow domain around the full rocket assembly and to define inlet, outlet, and wall boundary conditions for a CFD simulation."));
doc.push(Bullet("To generate a volume mesh suitable for external aerodynamic flow simulation and to monitor solution convergence via residuals."));
doc.push(Bullet("To visualise and interpret pressure and velocity contours, and to discuss drag, wake formation, and aerodynamic stability."));
doc.push(Bullet("To document all assumptions, and to draw sound engineering conclusions from the combined structural and aerodynamic results."));
doc.push(pb());

// ===================== THEORY =====================
doc.push(H1("3. Theory"));

doc.push(H2("3.1 Finite Element Method (FEM)"));
doc.push(P(
"The Finite Element Method is a numerical technique for finding approximate solutions to boundary value problems described by partial differential equations, most commonly the equations of static or dynamic structural equilibrium. The fundamental idea is to divide (\"discretise\") a continuous physical domain — in this case, the solid volume of the rocket fin — into a finite number of small, simple-shaped sub-domains called elements (typically tetrahedra or hexahedra in three dimensions), which are connected at shared points called nodes."
));
doc.push(P(
"Within each element, the unknown field (here, the displacement vector) is approximated by simple polynomial shape functions defined in terms of the nodal values. Substituting these approximations into the governing equilibrium equations, and applying the principle of virtual work or an equivalent energy minimisation, converts the continuous differential equation into a large but sparse system of linear algebraic equations of the form [K]{u} = {F}, where [K] is the global stiffness matrix, {u} is the vector of unknown nodal displacements, and {F} is the vector of externally applied nodal loads. Solving this system yields the displacement at every node, from which strains and stresses are recovered element-by-element using the material's constitutive relationship (Hooke's law for a linear-elastic material)."
));
doc.push(P(
"FEM is used extensively throughout aerospace engineering because most real structures — airframes, fins, brackets, pressure vessels, engine mounts — have geometries and loading conditions too complex for closed-form analytical solutions. Typical aerospace applications include static strength and stiffness analysis, modal (natural frequency) analysis to avoid resonance and flutter, thermal-stress analysis for re-entry or propulsion components, and fatigue-life prediction under repeated loading. In this project, FEM is used to predict how the rocket fin deforms and where it experiences the highest stress under an assumed aerodynamic pressure load, so that its adequacy against yielding can be checked before any physical part is built."
));

doc.push(H2("3.2 Computational Fluid Dynamics (CFD)"));
doc.push(P(
"Computational Fluid Dynamics is the numerical solution of the governing equations of fluid motion — conservation of mass (continuity), conservation of momentum (the Navier–Stokes equations), and, where relevant, conservation of energy — over a discretised flow domain. As in FEM, the continuous domain (here, the air surrounding the rocket) is divided into a large number of small control volumes or cells, and the governing equations are integrated over each cell using a numerical scheme such as the finite volume method."
));
doc.push(P(
"Because the flow around a rocket at typical launch and ascent speeds is turbulent, directly resolving every turbulent eddy (Direct Numerical Simulation) is computationally prohibitive for routine engineering work. Instead, engineering CFD commonly solves the Reynolds-Averaged Navier–Stokes (RANS) equations, in which the instantaneous flow variables are decomposed into a mean and a fluctuating component, and the effect of the fluctuations is modelled using a turbulence closure model rather than solved directly. In this project, a two-equation k–ω turbulence model is used, which solves additional transport equations for the turbulent kinetic energy (k) and the specific dissipation rate (ω) to estimate the local turbulent (eddy) viscosity, which in turn augments the molecular viscosity in the momentum equations."
));
doc.push(P(
"CFD is used throughout aerospace engineering to predict aerodynamic forces and moments (lift, drag, pitching moment), to visualise flow separation, shock formation, and wake structures, to optimise external shapes for minimum drag or maximum stability, and to generate the pressure loads that are subsequently fed into structural analyses — the same coupling that motivates the two-part structure of this project. Here, CFD is used to characterise the pressure and velocity field around the rocket body and fins, and to qualitatively assess drag and aerodynamic stability."
));

doc.push(H2("3.3 Von Mises Stress"));
doc.push(P(
"Real structural materials such as aluminium alloys are subjected to a fully three-dimensional, multi-axial state of stress, described at any point by six independent stress components (three normal stresses σxx, σyy, σzz and three shear stresses τxy, τyz, τzx). However, the material property that is experimentally measured and tabulated — the yield strength — is obtained from a simple uniaxial tensile test. To compare a complex, multi-axial stress state against a single uniaxial yield strength, an equivalent scalar stress measure is required."
));
doc.push(P(
"The Von Mises stress (also called the equivalent stress) is such a measure, derived from the distortion-energy (maximum distortion energy) theory of yielding, which proposes that a ductile material begins to yield when the distortional (shape-changing, as opposed to purely volumetric) strain energy per unit volume reaches the same critical value as at yielding in a simple tension test. Mathematically, for the general three-dimensional stress state,"
));
doc.push(P(
"σᵥ = √[ ½ ( (σxx − σyy)² + (σyy − σzz)² + (σzz − σxx)² + 6(τxy² + τyz² + τzx²) ) ]", { align: AlignmentType.CENTER, bold: true }
));
doc.push(P(
"Yielding is predicted to begin when σᵥ reaches the material's uniaxial yield strength, σy. Von Mises stress is important in structural design because it collapses a complicated multi-axial stress tensor into a single, physically meaningful number that can be directly compared to a tabulated material property, is always positive, and correctly captures the fact that yielding in ductile metals is governed primarily by shear/distortion rather than by hydrostatic (volume-changing) stress alone. It is the standard failure criterion used for ductile metals such as the aluminium alloy considered in this report, and is the field plotted in the FEM results of Section 12."
));

doc.push(H2("3.4 Meshing"));
doc.push(P(
"Meshing is the process of discretising the continuous geometry of the fin (for FEM) or the fluid domain around the rocket (for CFD) into a finite number of small elements or cells over which the governing equations are numerically approximated. Mesh quality and resolution have a direct and significant influence on solution accuracy, on the size of the algebraic system that must be solved, and on the total computational cost and run time of the simulation."
));
doc.push(P(
"A coarse mesh uses relatively few, larger elements. It is computationally inexpensive and fast to solve, but the shape functions within each element are less able to capture rapid spatial variation in the underlying field. Coarse meshes tend to under-predict local stress or velocity peaks, particularly in regions of geometric discontinuity such as sharp corners, edges, and fillets, where the true physical field varies steeply over a short distance. A fine mesh, by contrast, uses many small elements and can capture such local gradients much more accurately, at the cost of a much larger number of degrees of freedom, longer solve times, and greater memory usage. Beyond a certain refinement level, further mesh refinement produces a diminishing change in the computed result — a state referred to as mesh (or grid) convergence — and continuing to refine the mesh beyond this point wastes computational resources without materially improving accuracy. This trade-off between accuracy and computational cost is why a mesh sensitivity or mesh-independence check (coarse–medium–fine comparison) is considered good engineering practice before accepting a simulation result, and is discussed further for this project in Section 11."
));
doc.push(P(
"Mesh dependency refers to the phenomenon where the computed solution — particularly local pea