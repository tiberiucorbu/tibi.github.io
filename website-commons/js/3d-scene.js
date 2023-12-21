import {css, html, LitElement} from "lit";
import * as THREE from 'three'
// import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
import {STLLoader} from 'three/examples/jsm/loaders/STLLoader'

export class TheeScene extends LitElement {
    render() {
        return html`
            <canvas class="scene"></canvas>
            <slot></slot>
        `
    }


    static properties = {
        results: {
            state: true,
            type: Array
        }
    };

    static get styles() {
        return css`
        .scene {
            position: absolute;
            background: transparent
            inset: 0;
            width: 100%;
            height: 100%;
            display: block;
        }`
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
            gl_FragColor = vec4(mix(vUv.x, colorA , colorB), 1.0);
          }
      `
    }

    constructor() {
        super()
        this.results = [];
        this.scene = new THREE.Scene()
       //  this.setupMaterial();
       //  this.geometry = new THREE.PlaneGeometry( window.innerWidth,  window.innerHeight );
       //
       //  let uniforms = {
       //      colorB: {type: 'vec3', value: new THREE.Color( 0xff69b4)},
       //      colorA: {type: 'vec3', value: new THREE.Color(0x00ffef)}
       //  }
       //
       //  this.material = new THREE.ShaderMaterial({
       //      uniforms: uniforms,
       //      fragmentShader: this.fragmentShader(),
       //      vertexShader: this.vertexShader(),
       //  })
       //  const plane = new THREE.Mesh( this.geometry, this.material )
       //  console.log(this.geometry);
       // this.scene.add( plane );

        // this.scene.add(new THREE.AxesHelper(5))

        this.adjustLighting();

        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth  / window.innerHeight ,
            0.1,
            1000
        )
        this.camera.position.z = 100

    }

    firstUpdated(_changedProperties) {
        super.firstUpdated(_changedProperties);
        this.canvas = this.shadowRoot.querySelector('canvas');
        this.renderer = new THREE.WebGLRenderer({canvas: this.canvas, alpha: true});
        this.renderer.setClearColor( 0x000000, 0 )
        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                if (entry.contentBoxSize) {
                    console.log(entry.contentBoxSize[0]);
                    const inlineSize = entry.contentBoxSize[0].inlineSize;
                    const blockSize = entry.contentBoxSize[0].blockSize;
                    this.canvas.width = inlineSize;
                    this.canvas.height = blockSize;
                    this.renderer.setSize(inlineSize, blockSize);


                }
            }
        })
        resizeObserver.observe(this);





        //
        //  const controls = new OrbitControls(this.camera, this.renderer.domElement)
        // controls.noPan = true;
        // controls.maxDistance = controls.minDistance = 100;
        // controls.noKeys = true;
        // controls.noRotate = true;
        // controls.noZoom = true;





        this.loader = new STLLoader()
//
// // Instantiate the application
//         const instance = OpenSCAD().then((instance) => {
// // OPTIONAL: add fonts to the FS
// //             addFonts(instance);
//
// // OPTIONAL: add MCAD liibrary to the FS
// //             addMCAD(instance);
//
// // Write a file to the filesystem
//             instance.FS.writeFile("/input.scad", `
//                 cube(10);
//             `);
//
// // Run OpenSCAD with the arguments "/input.scad -o cube.stl"
//             instance.callMain(["/input.scad", "-o", "output.stl"]);
//
//             instance.FS.readFile("/output.stl");
//
// // Read the data from cube.stl
//             const blob = new Blob([instance.FS.readFile("/cube.stl")]);
//             this.displayFromUrl(URL.createObjectURL(blob))
//         });
        const animate = () => {
            requestAnimationFrame(animate)

            this.renderer.render(this.scene, this.camera)
            // controls.update()
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

    }

    loadModel(event) {
        const firstFile = [...event.target.files][0];
        this.displayFromUrl(URL.createObjectURL(firstFile));
        // this.display('img/bord_holder_makita_battery-Body.stl');
    }


}

customElements.define('tc-3d-scene', TheeScene);
