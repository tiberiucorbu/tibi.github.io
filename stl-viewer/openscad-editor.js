import OpenSCAD from "/openscad-wasm/openscad.js";
// OPTIONAL: add fonts to the FS
// import {addFonts} from "/openscad-wasm/openscad.fonts.js";
// OPTIONAL: add MCAD liibrary to the FS
// import {addMCAD} from "/openscad-wasm/openscad.mcad.js";

// Instantiate the application
const instance = await OpenSCAD();

// OPTIONAL: add fonts to the FS
// addFonts(instance);

// OPTIONAL: add MCAD liibrary to the FS
// addMCAD(instance);

// Write a file to the filesystem
instance.FS.writeFile("/input.scad", `cube(10);`);

// Run OpenSCAD with the arguments "/input.scad -o cube.stl"
instance.callMain(["/input.scad", "-o", "cube.stl"]);

// Read the data from cube.stl
const output = new Blob([instance.FS.readFile("/cube.stl")]);

console.log(output);
