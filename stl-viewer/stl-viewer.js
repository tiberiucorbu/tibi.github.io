import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
import {STLLoader} from 'three/examples/jsm/loaders/STLLoader'
import {css, html, LitElement} from "lit";

import OpenSCAD from "/openscad-wasm/openscad.js";
// OPTIONAL: add fonts to the FS
// import {addFonts} from "/openscad-wasm/openscad.fonts.js";
// OPTIONAL: add MCAD liibrary to the FS
// import {addMCAD} from "/openscad-wasm/openscad.mcad.js";
import './editor.js';

export class StlLoaderComponent extends LitElement {
    static properties = {
        results: {
            state: true,
            type: Array
        }
    };

    static get styles() {
        return css`
        .item {
            display: grid;
            grid-columns: 1fr 1fr 64px 64px; 
        }`
    }


    displayFromUrl(url) {
        console.profile('displayFromUrl')
        console.timeLog('displayFromUrl', 'Loading model from url')
        this.loader.load(
            url,
            (geometry) => {
                console.log(geometry)
                const mesh = new THREE.Mesh(geometry, this.material)

                const edges = new THREE.EdgesGeometry(geometry);
                const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({color: 0x000000}));
                this.scene.add(line);

                this.scene.add(mesh)
            },
            (xhr) => {
                console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
            },
            (error) => {
                console.log(error)
            }
        )

    }

    adjustLighting() {
        const pointLight = new THREE.PointLight(0xdddddd)
        pointLight.position.set(-5, -3, 3)
        this.scene.add(pointLight)

        const ambientLight = new THREE.AmbientLight(0x505050)
        this.scene.add(ambientLight)
    }

    vertexShader() {
        return `
        varying vec3 vUv; 
    
        void main() {
          vUv = position; 
    
          vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * modelViewPosition; 
        }
  `
    }

    fragmentShader() {
        return `
          uniform vec3 colorA; 
          uniform vec3 colorB; 
          varying vec3 vUv;
    
          void main() {
            gl_FragColor = vec4(mix(colorA, colorB, vUv.z), 1.0);
          }
      `
    }

    constructor() {
        super()
        this.results = [];
        this.scene = new THREE.Scene()
        // this.scene.add(new THREE.AxesHelper(5))

        this.adjustLighting();

        const scale = 1;
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth * scale / window.innerHeight * scale,
            0.1,
            1000
        )
        this.camera.position.z = 3

        this.renderer = new THREE.WebGLRenderer()
        this.renderer.setSize(100 * scale, 200* scale)


        const controls = new OrbitControls(this.camera, this.renderer.domElement)
        controls.enableDamping = true


        this.setupMaterial();

        this.loader = new STLLoader()

// Instantiate the application
        const instance = OpenSCAD().then((instance) => {
// OPTIONAL: add fonts to the FS
//             addFonts(instance);

// OPTIONAL: add MCAD liibrary to the FS
//             addMCAD(instance);

// Write a file to the filesystem
            instance.FS.writeFile("/input.scad", `
                cube(10);
            `);

// Run OpenSCAD with the arguments "/input.scad -o cube.stl"
            instance.callMain(["/input.scad", "-o", "output.stl"]);

            instance.FS.readFile("/output.stl");

// Read the data from cube.stl
            const blob = new Blob([instance.FS.readFile("/cube.stl")]);
            this.displayFromUrl(URL.createObjectURL(blob))
        });
        const animate = () => {
            requestAnimationFrame(animate)
            // controls.update()
            this.renderer.render(this.scene, this.camera)
            // stats.update()
        }
        animate();
    }

    setupMaterial() {

        //         const envTexture = new THREE.CubeTextureLoader().load([
        //             'img/IMG_20230615_190952.jpg',
        //             'img/IMG_20230615_190952.jpg',
        //             'img/IMG_20230615_190952.jpg',
        //             'img/IMG_20230615_190952.jpg',
        //             'img/IMG_20230615_190952.jpg',
        //             'img/IMG_20230615_190952.jpg'
        //         ])
        //         envTexture.mapping = THREE.CubeReflectionMapping

        // this.material = new THREE.MeshPhysicalMaterial({
        //     color: 0xb2ffc8,
        //     envMap: envTexture,
        //     metalness: 0.25,
        //     roughness: 0.1,
        //     opacity: 1.0,
        //     transparent: true,
        //     transmission: 0.99,
        //     clearcoat: 1.0,
        //     clearcoatRoughness: 0.25
        // })


        //
        // const color = new THREE.Color();
        // color.setHSL( Math.random(), 0.7, Math.random() * 0.2 + 0.05 );
        //
        // this.material = new THREE.MeshBasicMaterial( { color: color } );


        // this.material = new THREE.MeshLambertMaterial()

        let uniforms = {
            colorB: {type: 'vec3', value: new THREE.Color(0xACB6E5)},
            colorA: {type: 'vec3', value: new THREE.Color(0x74ebd5)}
        }

        this.material = new THREE.ShaderMaterial({
            uniforms: uniforms,
            fragmentShader: this.fragmentShader(),
            vertexShader: this.vertexShader(),
        })
    }

    loadModel(event) {
        const firstFile = [...event.target.files][0];
        this.displayFromUrl(URL.createObjectURL(firstFile));
        // this.display('img/bord_holder_makita_battery-Body.stl');
    }

    render() {
        return html`
            <p>Select a local file or simply paste from the clipboard</p>
            <input type=file @change=${this.loadModel}>
            <tc-editor-wrapper></tc-editor-wrapper>
            ${this.renderer.domElement}
        `
    }


}

customElements.define('tc-stl-loader', StlLoaderComponent)
