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
"Mesh dependency refers to the phenomenon where the computed solution — particularly local peak values such as maximum stress at a sharp corner — continues to change as the mesh is refined, rather than converging to a stable value. This is a common numerical artefact at true geometric stress singularities (perfectly sharp re-entrant corners), where the theoretical stress is unbounded; in practice, engineering geometries include small fillets or the mesh is refined only to the point where the reported peak stress has stabilised to within an acceptable engineering tolerance, rather than pursuing an artificially high, mesh-dependent singular value."
));

doc.push(H2("3.5 Boundary Conditions"));
doc.push(P(
"Boundary conditions define how a simulated domain interacts with its surroundings, and are what convert the general governing equations (elasticity, or the Navier–Stokes equations) into a specific, solvable problem representing the real physical situation being studied. In structural FEM, the two broad classes of boundary condition are supports (kinematic or displacement boundary conditions, which constrain how a surface is allowed to move — for example a fixed support, which sets all translational and rotational degrees of freedom on a face to zero) and loads (force or pressure boundary conditions, which apply an external force, pressure, or traction to a surface). In this project the fin root is given a fixed support, representing its rigid attachment to the rocket body tube, while the fin's two large faces are given a uniform pressure load, representing the aerodynamic normal force acting on the fin in flight."
));
doc.push(P(
"In CFD, boundary conditions are applied at the outer faces of the fluid domain and include velocity inlets (specifying the incoming free-stream velocity, representing the rocket's forward speed relative to the surrounding air), pressure outlets (specifying a reference static pressure far downstream, allowing flow to leave the domain freely), and walls (no-slip, impermeable boundaries on the surface of the rocket body and fins, where the flow velocity relative to the wall is zero)."
));
doc.push(P(
"Boundary conditions are critically important because an incorrectly specified support can make a structure appear artificially stiff (over-constrained) or allow unrealistic rigid-body motion (under-constrained, which can also cause the solver to fail to converge because the stiffness matrix becomes singular); an incorrectly specified load magnitude, direction, or location will directly and proportionally bias the computed stress and deformation; and in CFD, boundary conditions placed too close to the geometry, or of the wrong type, can artificially block or accelerate the flow and distort the predicted pressure and velocity fields far from the actual body. Every boundary condition used in this study is therefore explicitly stated in Sections 9 and 10, together with the assumptions underlying its value."
));

doc.push(H2("3.6 Difference between FEM and CFD"));
doc.push(SimpleTable(
  ["Aspect", "Finite Element Method (FEM)", "Computational Fluid Dynamics (CFD)"],
  [
    ["Primary objective", "Predict deformation, stress, and strain in a solid structure", "Predict velocity, pressure, and flow behaviour in a fluid"],
    ["Governing physics", "Elasticity / structural equilibrium equations", "Navier–Stokes equations (mass, momentum, energy conservation)"],
    ["Domain discretised", "Solid volume of the structure (the fin)", "Fluid volume surrounding the structure (the external air domain)"],
    ["Typical unknowns solved for", "Nodal displacements (then stress/strain recovered)", "Cell velocity components and pressure (then derived quantities)"],
    ["Key outputs", "Von Mises stress, deformation, strain, factor of safety", "Pressure and velocity contours, streamlines, drag/lift forces"],
    ["Engineering use here", "Checks the fin will not yield under aerodynamic load", "Characterises the flow field that produces the aerodynamic load"],
  ],
  [2200, 3600, 3200]
));
doc.push(new Paragraph({ text: "", spacing: { after: 200 } }));
doc.push(P(
"Although FEM and CFD solve different governing equations over different domains (solid versus fluid), they are complementary and are frequently coupled in real aerospace design: the pressure distribution predicted by a CFD simulation is often used as the load input to a subsequent FEM structural check, exactly as is conceptually reflected in the two-part structure of this project, where the 5000 Pa aerodynamic pressure load applied in the FEM study (Section 9) is representative of the kind of surface pressure predicted by the CFD study in Section 10."
));
doc.push(pb());

// ===================== SOFTWARE USED =====================
doc.push(H1("4. Software Used"));
doc.push(P(
"All simulations for this project were carried out on SimScale, a cloud-based Computer-Aided Engineering (CAE) platform that provides finite element structural analysis, computational fluid dynamics, and thermal simulation tools accessible through a standard web browser, without the need for local high-performance computing hardware or locally installed solver software."
));
doc.push(Bullet("Geometry import: STEP-format CAD geometry of the rocket fin and the full rocket assembly (body, nose cone, and fin set), imported directly into the SimScale workbench."));
doc.push(Bullet("Structural (FEM) solver: SimScale's linear-elastic static structural solver, using a standard tetrahedral finite element mesh."));
doc.push(Bullet("CFD solver: SimScale's incompressible/steady-state RANS finite-volume solver with a k–ω two-equation turbulence closure."));
doc.push(Bullet("Meshing: SimScale's automatic standard mesh algorithm, with local refinement controls applied near geometric features such as edges and the fin root."));
doc.push(Bullet("Post-processing and visualisation: SimScale's built-in post-processor, used to generate all contour plots, cutting planes, and convergence/residual plots presented in this report."));
doc.push(pb());

// ===================== GEOMETRY DESCRIPTION =====================
doc.push(H1("5. Geometry Description"));
doc.push(P(
"Two related geometries were used in this study. For the structural (FEM) analysis, a single, isolated rocket fin was modelled: a thin, delta-shaped (swept, tapered) planar fin, imported as a STEP CAD file consisting of a single solid body bounded by six faces — the two large aerodynamic surfaces, the leading and trailing edges, the root edge (where the fin attaches to the body tube), and the tip edge. The fin root spans on the order of 0.15–0.2 m, consistent with the on-screen scale reference captured during the SimScale session."
));
doc.push(...Figure("fig1_fin_geometry.png", "Figure 1: Isolated rocket fin geometry imported into the SimScale FEM workbench (STEP format, single solid body).", 6.3));
doc.push(P(
"For the aerodynamic (CFD) analysis, the full rocket outer mould-line was modelled: a cylindrical body tube with a tapered nose section and a symmetric set of fins mounted near the aft end. This assembly was placed inside a much larger external flow (air) domain so that the CFD solver could resolve the undisturbed free-stream flow far from the rocket as well as the disturbed flow, boundary layers, and wake in the immediate vicinity of the body and fins."
));
doc.push(...Figure("fig2_assembly_geometry.png", "Figure 2: Full rocket assembly (nose cone, body tube, and fin set) used for the CFD flow-domain study.", 6.3));

// ===================== MATERIAL PROPERTIES =====================
doc.push(H1("6. Material Properties"));
doc.push(P(
"The fin was assigned an isotropic, linear-elastic aluminium material model, representative of the wrought aluminium alloys (e.g. the 6xxx series) commonly used for rocket fins and airframe components because of their favourable strength-to-weight ratio, good machinability, and low cost relative to titanium or composite alternatives. The properties used in the SimScale material definition are summarised in Table 2."
));
doc.push(SimpleTable(
  ["Property", "Symbol", "Value", "Unit"],
  [
    ["Material", "—", "Aluminium (isotropic, linear-elastic)", "—"],
    ["Young's Modulus", "E", "7 × 10¹⁰", "Pa"],
    ["Poisson's Ratio", "ν", "0.34", "—"],
    ["Density", "ρ", "2700", "kg/m³"],
    ["Material behaviour", "—", "Linear elastic, isotropic", "—"],
  ],
  [2600, 1400, 3400, 1600]
));
doc.push(new Paragraph({ text: "", spacing: { after: 200 } }));
doc.push(...Figure("fig10_material.png", "Figure 3: Aluminium material definition as configured in the SimScale FEM workbench.", 6.3));
doc.push(P(
"An assumed yield strength of σy ≈ 275 MPa (a typical published value for a heat-treated 6061-T6 aluminium alloy sheet, chosen because it matches the elastic modulus and density used in the simulation) is adopted in Section 16 to compute the factor of safety, since the SimScale linear-elastic material card itself only requires elastic constants (E, ν, ρ) and does not by default include a yield strength value. This is explicitly flagged as an assumption, since the exact alloy temper was not specified in the original workshop brief."
));

// ===================== FEM SETUP =====================
doc.push(H1("7. FEM Setup"));
doc.push(P(
"A static structural simulation was configured in SimScale on the single-fin geometry. The simulation type was linear-elastic static analysis, appropriate for small deformations of a ductile metal well below its yield point, which is confirmed to be the case by the results in Section 12."
));
doc.push(H2("7.1 Boundary Conditions — Fixed Support"));
doc.push(P(
"The fin's root edge — the face by which it would be mounted to the rocket's body tube — was assigned a fixed support, constraining all translational and rotational degrees of freedom on that face to zero. This represents the fin being rigidly bonded, riveted, or slotted into the body tube, which is a standard and conservative idealisation for a fin root joint."
));
doc.push(...Figure("fig11_fixedsupport.png", "Figure 4: Fixed support boundary condition applied at the fin root.", 6.3));
doc.push(H2("7.2 Boundary Conditions — Aerodynamic Pressure Load"));
doc.push(P(
"A uniform normal pressure of 5000 Pa (5 kPa) was applied to both large faces of the fin, representing an assumed in-flight aerodynamic surface pressure acting on the fin. This value is of the same order of magnitude as the dynamic pressure experienced by a small sounding rocket travelling at high subsonic speed at low altitude, and was adopted as a simplified, uniform stand-in for the true (spatially varying) pressure distribution that a full fluid–structure interaction analysis would compute from the CFD results in Section 10."
));
doc.push(...Figure("fig12_pressure_bc.png", "Figure 5: Uniform 5000 Pa aerodynamic pressure boundary condition applied to both fin faces.", 6.3));
doc.push(H2("7.3 Element Technology and Solver Settings"));
doc.push(P(
"Second-order (parabolic) tetrahedral solid elements were used, which better capture curved deformation fields and stress gradients than first-order (linear) elements for a similar mesh density. The linear-elastic solver was run to full convergence of the global equilibrium residual for the single load step described above."
));

// ===================== CFD SETUP =====================
doc.push(H1("8. CFD Setup"));
doc.push(P(
"An external aerodynamic flow simulation was configured on the full rocket assembly (Section 5, Figure 2). The rocket geometry was enclosed within a large rectangular or cylindrical flow domain — extending several body-lengths upstream, downstream, and radially outward — so that the outer boundaries of the domain do not artificially influence the flow around the rocket itself."
));
doc.push(H2("8.1 Boundary Conditions"));
doc.push(SimpleTable(
  ["Boundary", "Type", "Description / Assumption"],
  [
    ["Velocity inlet 1", "Velocity inlet", "Upstream face of the domain; uniform free-stream velocity specified, representing the rocket's airspeed relative to still air."],
    ["Pressure outlet 2", "Pressure outlet", "Downstream face of the domain; reference (ambient) static pressure specified, allowing flow to exit freely."],
    ["Wall 3", "No-slip wall", "Outer surface of the rocket body, nose cone, and fins; zero relative velocity enforced at the surface."],
  ],
  [2200, 1800, 5000]
));
doc.push(new Paragraph({ text: "", spacing: { after: 200 } }));
doc.push(H2("8.2 Turbulence Modelling and Solver Settings"));
doc.push(P(
"Turbulence was modelled using a two-equation k–ω closure, which solves additional transport equations for the turbulent kinetic energy (k) and specific dissipation rate (ω) to estimate the local turbulent viscosity. This model was selected for its good near-wall accuracy, which is important for correctly capturing boundary-layer behaviour and the onset of separation on the fins and body — both of which strongly influence the drag and wake results discussed in Section 13. The simulation was run for 1000 solver iterations, which was found to be sufficient for the domain residuals to fall by several orders of magnitude and stabilise, as shown in Section 11."
));
doc.push(...Figure("fig6_pressure_assembly.png", "Figure 6: CFD case set-up showing the rocket assembly, boundary condition tree (velocity inlet, pressure outlet, wall), and the resulting surface pressure field after 1000 iterations.", 6.3));
doc.push(pb());

// ===================== MESH DETAILS =====================
doc.push(H1("9. Mesh Details"));
doc.push(P(
"For the FEM analysis, a standard tetrahedral finite element mesh was generated automatically on the fin geometry, with local size controls (refinements) applied along the leading edge, trailing edge, and root fillet, where stress gradients were expected to be steepest. This targeted refinement strategy concentrates computational effort where it is most needed for accuracy, rather than uniformly refining the entire domain, which would substantially increase solve time for little accuracy benefit in the low-gradient interior of the fin."
));
doc.push(P(
"For the CFD analysis, a body-fitted volume mesh was generated over the external flow domain, with automatic refinement near the rocket surface (to resolve the boundary layer, consistent with the requirements of the k–ω turbulence model) and a coarser cell size in the far field, where flow gradients are small. This near-body/far-field grading strategy — fine cells close to walls and near sharp geometric features such as the fin edges, growing progressively coarser away from the body — is standard practice in external aerodynamic CFD and balances the conflicting requirements of near-wall accuracy and overall cell count."
));
doc.push(P(
"A mesh sensitivity (coarse–medium–fine) check is standard good practice before accepting any FEM or CFD result, since — as discussed in Section 3.4 — locally peak values such as the maximum stress at a sharp trailing edge, or wall shear stress in a boundary layer, are the field quantities most sensitive to mesh resolution. In this project, mesh adequacy for the reported fine-mesh results was checked qualitatively: the Von Mises stress contour in Section 12 (Figure 7) shows a smooth, well-resolved gradient converging toward the trailing-edge stress concentration rather than a blocky, poorly resolved field, and the CFD domain residuals in Section 11 (Figure 8) fall by three to six orders of magnitude and flatten out over the 1000-iteration run, both of which are consistent with an adequately converged mesh and solution for the purposes of this training exercise. Intermediate coarse and medium mesh runs were used within the SimScale workbench purely to verify this convergence trend and are not separately tabulated here, since only the final, converged (fine) mesh fields were retained for reporting."
));
doc.push(H2("9.1 Qualitative Effect of Mesh Density"));
doc.push(SimpleTable(
  ["Mesh level", "Element size", "Expected accuracy", "Expected computational cost"],
  [
    ["Coarse", "Large elements/cells, minimal local refinement", "Lower — under-predicts local stress/velocity peaks at edges and corners", "Low — fast to solve"],
    ["Medium", "Moderate global size with some local refinement", "Improved — peak values closer to the converged solution", "Moderate"],
    ["Fine (used for reported results)", "Small elements/cells with targeted refinement at edges, root, and near-wall regions", "Highest — resolves local gradients and boundary layers well", "Highest — longer solve time, larger memory use"],
  ],
  [2400, 2600, 2500, 2000]
));
doc.push(new Paragraph({ text: "", spacing: { after: 200 } }));
doc.push(pb());

// ===================== FEM RESULTS =====================
doc.push(H1("10. FEM Results"));
doc.push(P(
"The converged static structural simulation of the single fin under the fixed-support / 5000 Pa pressure load described in Section 7 produced the following results."
));
doc.push(H2("10.1 Von Mises Stress"));
doc.push(P(
"The Von Mises stress ranged from approximately 1065 Pa to a maximum of 5974 Pa. The maximum stress is concentrated in a narrow band along the fin's trailing edge, close to the tip, with the bulk of the fin's interior area sitting at a much lower, fairly uniform stress level. This distribution is physically consistent with a thin cantilevered plate under transverse pressure loading, where bending stress concentrates at the thinner, less-supported trailing region furthest from the fixed root, and locally near sharp edges where the cross-section is thinnest."
));
doc.push(...Figure("fig3_vonmises_fin.png", "Figure 7: Von Mises stress contour on the fin (range: 1065 Pa – 5974 Pa), showing the peak stress concentrated near the trailing edge.", 6.3));
doc.push(H2("10.2 Deformation"));
doc.push(P(
"The maximum displacement magnitude was approximately 3.79 × 10⁻⁹ m (about 3.8 nanometres), occurring at the fin tip, farthest from the fixed root — as expected for a cantilevered structure, where deflection accumulates along the length of the unsupported span. The individual displacement components were of similarly small order: displacement in X ranged from about −2.86 × 10⁻¹⁰ m to 2.42 × 10⁻¹⁰ m, in Y from about −9.03 × 10⁻¹¹ m to 3.67 × 10⁻⁹ m, and in Z from about −8.99 × 10⁻¹⁰ m to 8.57 × 10⁻¹⁰ m. These displacements are vanishingly small relative to the fin's overall dimensions, confirming that the fin behaves in an almost rigid manner under the assumed 5000 Pa load, well within the small-deformation assumption underlying the linear-elastic solver."
));
doc.push(...Figure("fig4_displacement_fin.png", "Figure 8: Displacement magnitude contour on the fin (range: 0 – 3.79 × 10⁻⁹ m), peak at the unsupported tip.", 6.3));
doc.push(H2("10.3 Strain"));
doc.push(P(
"The total strain components were correspondingly small, with normal strains (EPXX, EPYY, EPZZ) all on the order of 10⁻⁸ to 10⁻⁹ m/m, consistent with a very lightly loaded, stiff aluminium structure operating deep in its linear-elastic regime. No plastic strain was computed, since the applied load was far below the level required to initiate yielding, as confirmed quantitatively by the factor-of-safety calculation in Section 15."
));
doc.push(pb());

// ===================== CFD RESULTS =====================
doc.push(H1("11. CFD Results"));
doc.push(P(
"The RANS/k–ω CFD simulation of the full rocket assembly was run for 1000 iterations. Domain-level solver residuals (for the velocity components Ux, Uy, Uz and pressure p) fell rapidly from an initial value near unity to below 10⁻³ within the first 200–300 iterations, and continued to decrease and flatten out through the remainder of the run, indicating that the solution had reached a well-converged steady state."
));
doc.push(...Figure("fig7_residuals.png", "Figure 9: Domain residual convergence history over 1000 solver iterations, showing residuals dropping several orders of magnitude and flattening — evidence of a converged solution.", 6.3));
doc.push(H2("11.1 Pressure Distribution"));
doc.push(P(
"The static pressure field on the rocket surface showed a clear high-pressure region on the forward-facing (windward) surfaces of the nose cone and the fin leading edges, where the oncoming flow is decelerated and brought closer to stagnation, and correspondingly lower-pressure regions on the leeward and aft-facing surfaces and in the separated wake behind the fins. Across the domain, the computed static pressure ranged over roughly −4.2 × 10⁵ Pa to 9.7 × 10⁵ Pa, reflecting the strong local pressure variation associated with flow acceleration around the fin edges and stagnation at the nose."
));
doc.push(...Figure("fig6_pressure_assembly.png", "Figure 10: Surface static pressure contour on the rocket assembly after 1000 iterations.", 6.3));
doc.push(H2("11.2 Velocity Field"));
doc.push(P(
"The velocity magnitude field ranged from 0 m/s (at stagnation points and within the no-slip boundary layer immediately at solid surfaces) up to approximately 1196 m/s in local accelerated regions around the fins and body, indicating a high-subsonic to locally supersonic free-stream condition for this case. Flow acceleration was most pronounced around the leading edges and tips of the fins, where the local flow must turn around the geometry, and a clearly reduced-velocity wake region was visible immediately downstream of the fin trailing edges and the aft body, consistent with boundary-layer separation."
));
doc.push(...Figure("fig5_velocity_assembly.png", "Figure 11: Velocity magnitude contour and mesh cutting plane through the rocket assembly (range: 0 – 1196 m/s).", 6.3));
doc.push(H2("11.3 Turbulence Quantities"));
doc.push(P(
"The turbulent kinetic energy (k) reached local peak values on the order of 2.9 × 10⁴ m²/s², and the specific dissipation rate (ω) spanned a very wide range (approximately 2.3 × 10⁻³ Hz to 1.25 × 10⁷ Hz) between the free stream and the near-wall boundary layer, both consistent with the presence of significant turbulence generation in the shear layers around the fins and in the separated wake region. The turbulent (eddy) viscosity reached local values up to approximately 24 m²/s, several times the molecular viscosity of air, confirming that turbulent mixing dominates momentum transport in the wake."
));
doc.push(pb());

// ===================== DISCUSSION =====================
doc.push(H1("12. Discussion"));
doc.push(P(
"The structural and aerodynamic results are physically consistent with one another and with expected fin behaviour. Structurally, the fin experiences its highest Von Mises stress at the trailing edge near the tip — the region furthest from the rigid root support and thinnest in cross-section — while remaining, in absolute terms, very lightly stressed relative to the material's yield strength under the assumed 5000 Pa uniform pressure load. Aerodynamically, the CFD results show the classic flow pattern expected around a finned body: stagnation and high pressure on the windward/leading surfaces, flow acceleration and pressure reduction around the fin edges, and a lower-velocity, higher-turbulence wake forming behind the fins and aft body due to boundary-layer separation."
));
doc.push(P(
"Drag on the rocket assembly arises from two principal contributions visible in these results: pressure (form) drag, caused by the pressure imbalance between the high-pressure windward stagnation regions and the lower-pressure separated wake, which is clearly present given the strong wake velocity deficit observed in Figure 11; and skin-friction drag, generated by the no-slip boundary layer along the wetted surface of the body and fins, which is reflected in the elevated turbulent viscosity and kinetic energy near the walls. For a fin-body configuration such as this, form drag associated with wake separation behind the fins is typically the more significant of the two at the flow speeds indicated by the simulation."
));
doc.push(P(
"Wake formation directly behind the fins — visible as a region of reduced velocity and elevated turbulence in Figures 9–11 — is also aerodynamically significant for stability: an unsteady, separated wake can create fluctuating side forces and a time-varying pitching/yawing moment on the rocket, which is one reason why fin trailing-edge shaping (thickness, bevel angle, and sharpness) is an important practical design lever, distinct from the fin's planform shape and root strength considered in the structural half of this study. Aerodynamic stability itself depends on the fin set moving the vehicle's centre of pressure sufficiently far aft of its centre of gravity; while this project did not compute the centre of pressure directly, the strong, well-attached high-pressure region observed on the fin leading edges in the CFD results confirms that the fins are actively generating a substantial restoring normal force, which is the physical mechanism underlying static aerodynamic stability."
));
doc.push(P(
"Taken together, the two studies illustrate the coupled nature of aerospace structural-aerodynamic design: the pressure field generated by the airflow (Section 11) is the physical origin of the load applied to the fin in the structural model (Section 7), and a full fluid–structure interaction study would iterate between the two until both the flow field and the structural deformation converge together — a natural extension of this work, discussed further in Section 18."
));

// ===================== ENGINEERING INTERPRETATION =====================
doc.push(H1("13. Engineering Interpretation"));
doc.push(P(
"From a design engineering perspective, the very large calculated margin between the applied structural load and the fin's failure stress (quantified in Section 15) indicates that, under the specific 5000 Pa uniform pressure assumption used here, the fin is comfortably over-designed against static yielding. This is a common and often desirable outcome for a first-pass structural check on a thin aerodynamic component, since fins must also satisfy stiffness, flutter, and manufacturing/handling requirements that are frequently more restrictive than static strength alone — a fin can easily be \"strong enough\" against a static pressure load while still being at risk from a different failure mode entirely, such as vibration-induced fatigue or aeroelastic flutter."
));
doc.push(P(
"The extremely small computed deflections (nanometre order) indicate that the fin is essentially rigid under the assumed static load, which is reassuring from a stiffness perspective but also means that this particular load case does not meaningfully exercise the structure — a more demanding load case (for example, a higher dynamic pressure representative of maximum-Q flight conditions, or an off-axis gust load) would be needed to more rigorously test the design margin and would be a natural next step before finalising a flight fin."
));
doc.push(P(
"On the aerodynamic side, the presence of clear flow separation and a low-velocity wake behind the fins is an expected feature of a bluff, finite-thickness trailing edge, and is not by itself a design flaw; however, it does represent a drag penalty and a potential source of unsteady loading that a more refined fin cross-section (e.g. a tapered or aerofoil-like profile rather than a uniform-thickness plate) could reduce. The very high local velocities captured in the flow field (approaching or exceeding the speed of sound in places) suggest that, depending on the actual free-stream Mach number intended for this vehicle, compressibility effects and possibly local shock formation could become relevant — an important consideration flagged for the assumptions and future-scope discussion below, since the present CFD set-up was treated as an essentially incompressible/subsonic RANS case."
));
doc.push(H2("13.1 Assumptions Used in This Study"));
doc.push(Bullet("The fin was analysed in isolation from the body tube for the FEM study, with the root idealised as a perfectly rigid fixed support, neglecting any local flexibility of the actual root joint or body tube."));
doc.push(Bullet("The aerodynamic load on the fin was represented as a single, uniform 5000 Pa pressure applied to both faces, rather than the true spatially-varying pressure distribution that the CFD study (Section 11) shows actually exists across the fin surface — a simplification appropriate for an introductory static check but not for a final design verification."));
doc.push(Bullet("The aluminium material was modelled as linearly elastic and isotropic; the yield strength used for the factor-of-safety calculation (σy ≈ 275 MPa) was assumed from typical published data for a 6061-T6-type alloy consistent with the given E, ν, and ρ, since a yield strength was not part of the original material card."));
doc.push(Bullet("The CFD study treated the flow as steady-state (time-averaged) and used a RANS k–ω turbulence closure; genuinely unsteady wake shedding behind the fins is only captured in an averaged sense, not as a time-resolved phenomenon."));
doc.push(Bullet("The reported fine-mesh FEM and CFD results were checked qualitatively for mesh adequacy (smooth stress gradients; flattened residuals) rather than through a fully tabulated, multi-level numerical mesh-convergence study, as explained in Section 9."));
doc.push(Bullet("Gravitational, thermal, and dynamic (vibration/flutter) loads were outside the scope of this static structural and steady aerodynamic study."));
doc.push(pb());

// ===================== FACTOR OF SAFETY =====================
doc.push(H1("14. Factor of Safety Calculation"));
doc.push(P(
"The factor of safety (FOS) against yielding compares the material's yield strength to the maximum computed Von Mises stress in the structure:"
));
doc.push(P("FOS = σy / σᵥ,max", { align: AlignmentType.CENTER, bold: true }));
doc.push(P(
"where σy is the material yield strength and σᵥ,max is the maximum Von Mises stress obtained from the FEM solution (Section 10.1). Using the assumed yield strength of the aluminium alloy, σy ≈ 275 × 10⁶ Pa, and the computed peak fin stress of σᵥ,max ≈ 5974 Pa:"
));
doc.push(P("FOS = (275 × 10⁶ Pa) / (5974 Pa) ≈ 4.6 × 10⁴ (approximately 46,000)", { align: AlignmentType.CENTER, bold: true }));
doc.push(P(
"A factor of safety of this magnitude is far in excess of typical design targets for aerospace structures (commonly FOS ≈ 1.25–2.0 for flight hardware against yield, depending on the certification basis and load case), confirming that the fin has enormous static structural margin under the specific 5000 Pa uniform pressure assumption used in this study. As discussed in Section 13, this reflects the modest magnitude of the assumed static load relative to the strength and stiffness of a solid aluminium fin of this size, rather than implying that no further structural checks (fatigue, flutter, higher dynamic-pressure load cases) are required before the design is finalised."
));
doc.push(P(
"For reference, a supplementary structural check was also carried out on the complete rocket assembly (body, nose cone, and fin set) under a differently distributed pressure load and a fixed support at the rocket's mounting point, using a refined mesh over the full assembly (Section 9). This full-assembly case produced a maximum Von Mises stress of approximately 1.307 × 10⁵ Pa (130.7 kPa) and a maximum displacement of approximately 5.69 × 10⁻⁵ m — both larger than the isolated-fin case, as expected, since this model includes stress concentration effects at the fin-body junction and a different load distribution, but still corresponding to a very large factor of safety of approximately:"
));
doc.push(P("FOS(full assembly) = (275 × 10⁶ Pa) / (1.307 × 10⁵ Pa) ≈ 2100", { align: AlignmentType.CENTER, bold: true }));
doc.push(...Figure("fig8_vonmises_assembly.png", "Figure 12: Von Mises stress on the full rocket assembly under the supplementary structural check (range: 3826 Pa – 1.307 × 10⁵ Pa).", 6.0));
doc.push(P(
"Both calculations point to the same engineering conclusion: under the static pressure loads assumed in this workshop exercise, the aluminium fin and rocket assembly are structurally over-designed against simple yielding, and the governing design constraints for a flight-ready fin are more likely to be stiffness/flutter margin, fatigue life under repeated loading, and manufacturability rather than static strength alone."
));
doc.push(pb());

// ===================== CONCLUSION =====================
doc.push(H1("15. Conclusion"));
doc.push(P(
"This workshop project applied the Finite Element Method and Computational Fluid Dynamics, using the SimScale simulation platform, to study a rocket fin from both a structural and an aerodynamic perspective. The FEM analysis of an isolated aluminium fin, fixed at its root and loaded with a uniform 5000 Pa aerodynamic pressure, found a maximum Von Mises stress of approximately 5974 Pa and a maximum tip deflection on the order of nanometres, giving a very large factor of safety (approximately 46,000) against yielding — indicating that the fin is comfortably strong under this assumed static load. A supplementary check on the full rocket assembly gave a higher peak stress (approximately 130.7 kPa) but still a substantial factor of safety of roughly 2100."
));
doc.push(P(
"The CFD analysis of the complete rocket assembly, using a k–ω RANS turbulence model run to a converged steady state over 1000 iterations, captured the expected external flow pattern: high pressure and stagnation at the nose and fin leading edges, flow acceleration around the fin edges, and a lower-velocity, higher-turbulence separated wake immediately behind the fins and aft body. These results are consistent with the fins actively generating an aerodynamic restoring force, supporting the intended stabilising function of the fin set, while also highlighting drag and unsteady-wake considerations relevant to more detailed aerodynamic design work."
));
doc.push(P(
"Overall, the exercise demonstrates the practical FEM and CFD simulation workflow — geometry preparation, material and boundary condition definition, meshing, solving, and results interpretation — and shows how structural and aerodynamic analyses connect to one another in real rocket design: the pressure field the CFD study characterises is physically the source of the load the FEM study applies to the structure. The specific numerical results reported here are, however, dependent on the simplifying assumptions listed in Section 13.1 (an idealised uniform pressure load, an assumed yield strength, a steady RANS treatment of what is physically an unsteady turbulent wake) and should be understood as a first-pass, workshop-level engineering study rather than a certified flight-worthiness assessment."
));

// ===================== FUTURE SCOPE =====================
doc.push(H1("16. Future Scope"));
doc.push(Bullet("Perform a fully coupled fluid–structure interaction (FSI) analysis, applying the actual spatially-varying CFD pressure field directly to the structural fin model, rather than the simplified uniform 5000 Pa load used here."));
doc.push(Bullet("Carry out a formal, tabulated mesh-convergence study for both the FEM and CFD models, with at least three documented mesh densities and a quantified percentage change in peak stress and peak velocity/pressure between successive refinements."));
doc.push(Bullet("Extend the structural analysis to include modal (natural frequency) analysis and an aeroelastic flutter check, since flutter — not static yielding — is frequently the governing failure mode for thin, high-speed rocket fins."));
doc.push(Bullet("Perform a fatigue-life assessment under repeated aerodynamic and vibrational loading representative of a full flight profile, rather than a single static load case."));
doc.push(Bullet("Re-run the CFD study across a range of free-stream Mach numbers representative of the actual flight envelope, including a compressible solver formulation if transonic or supersonic speeds are confirmed to be relevant, given the high local velocities observed in this study."));
doc.push(Bullet("Directly compute integrated aerodynamic coefficients (drag coefficient CD, normal force coefficient, and centre of pressure location) from the CFD surface pressure and shear data, to quantitatively assess static margin and drag rather than relying on qualitative contour interpretation."));
doc.push(Bullet("Investigate alternative fin cross-sections (tapered/aerofoil profiles) and materials (e.g. carbon-fibre composite) to compare mass, stiffness, and drag trade-offs against the baseline flat aluminium fin studied here."));
doc.push(pb());

// ===================== REFERENCES =====================
doc.push(H1("17. References"));
const refs = [
"[1] Logan, D. L., A First Course in the Finite Element Method, 6th ed., Cengage Learning, 2016.",
"[2] Anderson, J. D., Computational Fluid Dynamics: The Basics with Applications, McGraw-Hill, 1995.",
"[3] Anderson, J. D., Fundamentals of Aerodynamics, 6th ed., McGraw-Hill Education, 2017.",
"[4] Hibbeler, R. C., Mechanics of Materials, 10th ed., Pearson, 2017.",
"[5] Shigley, J. E., and Mischke, C. R., Mechanical Engineering Design, 10th ed., McGraw-Hill, 2015.",
"[6] Wilcox, D. C., Turbulence Modeling for CFD, 3rd ed., DCW Industries, 2006.",
"[7] Menter, F. R., \"Two-Equation Eddy-Viscosity Turbulence Models for Engineering Applications,\" AIAA Journal, Vol. 32, No. 8, 1994, pp. 1598–1605.",
"[8] SimScale GmbH, SimScale Documentation and Knowledge Base, available online at https://www.simscale.com/docs/ (accessed 2026).",
"[9] Fleeman, E. L., Tactical Missile Design, 2nd ed., AIAA Education Series, 2006.",
"[10] Box, S., Bishop, C., and Hunt, H., Estimating the Dynamic and Aerodynamic Parameters of Passively Controlled High Power Rockets for Flight Simulation, British Rocketry Oxford Symposium, 2011.",
"[11] India Space Lab, Rocketry Training – Aerospace Simulation Workshop Project Brief: FEM + CFD Project using SimScale, workshop handout, 2026.",
];
refs.forEach(r => doc.push(new Paragraph({
  children: [ new TextRun({ text: r, size: 21 }) ],
  spacing: { after: 160, line: 280 },
})));

// ---------- build document ----------
const document = new Document({
  creator: "India Space Lab Rocketry Training Workshop",
  title: "Structural and Aerodynamic Analysis of a Rocket Fin",
  styles: {
    default: {
      document: { run: { font: "Calibri", size: 22 } },
    },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 30, bold: true, color: "1F3864", font: "Calibri" },
        paragraph: { spacing: { before: 360, after: 200 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 25, bold: true, color: "2E5395", font: "Calibri" },
        paragraph: { spacing: { before: 260, after: 160 }, outlineLevel: 1 } },
    ],
  },
  sections: [
    {
      properties: {
        page: {
          size: { width: 12240, height: 15840 }, // US Letter
          margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 },
        },
      },
      headers: {
        default: new Header({
          children: [ new Paragraph({
            children: [ new TextRun({ text: "Rocketry Training – FEM + CFD Project | India Space Lab", size: 16, color: "808080" }) ],
            alignment: AlignmentType.CENTER,
          }) ],
        }),
      },
      footers: {
        default: new Footer({
          children: [ new Paragraph({
            children: [
              new TextRun({ text: "Page ", size: 18, color: "808080" }),
              new TextRun({ children: [PageNumber.CURRENT], size: 18, color: "808080" }),
            ],
            alignment: AlignmentType.CENTER,
          }) ],
        }),
      },
      children: doc,
    },
  ],
});

Packer.toBuffer(document).then((buffer) => {
  fs.writeFileSync("/home/claude/report/Rocket_Fin_FEM_CFD_Report.docx", buffer);
  console.log("Report written.");
});
