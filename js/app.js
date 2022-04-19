import 'regenerator-runtime/runtime'

import gsap from "gsap"
import * as THREE from "three"
import * as dat from 'dat.gui';

import vertex from "../shaders/vertex.glsl"
import fragment from "../shaders/fragment.glsl"

const shaders = {
  vertex,
  fragment
}

class Stage {
    constructor() {
      this.renderParam = {
        clearColor: 0x666666,
        width: window.innerWidth,
        height: window.innerHeight
      };

      this.cameraParam = {
        left: -1,
        right: 1,
        top: 1,
        bottom: 1,
        near: 0,
        far: -1
      };

      this.scene = null;
      this.camera = null;
      this.renderer = null;
      this.geometry = null;
      this.material = null;
      this.mesh = null;

      this.isInitialized = false;
    }

    init() {
      this._setScene();
      this._setRender();
      this._setCamera();

      this.isInitialized = true;
    }

    _setScene() {
      this.scene = new THREE.Scene();
    }

    _setRender() {
      this.renderer = new THREE.WebGLRenderer({
        canvas: document.getElementById("webgl-canvas")
      });
      this.renderer.setPixelRatio(window.devicePixelRatio);
      this.renderer.setClearColor(new THREE.Color(this.renderParam.clearColor));
      this.renderer.setSize(this.renderParam.width, this.renderParam.height);
    }

    _setCamera() {
      if (!this.isInitialized) {
        this.camera = new THREE.OrthographicCamera(
          this.cameraParam.left,
          this.cameraParam.right,
          this.cameraParam.top,
          this.cameraParam.bottom,
          this.cameraParam.near,
          this.cameraParam.far
        );
      }

      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;

      this.camera.aspect = windowWidth / windowHeight;

      this.camera.updateProjectionMatrix();
      this.renderer.setSize(windowWidth, windowHeight);
    }

    _render() {
      this.renderer.render(this.scene, this.camera);
    }

    onResize() {
      this._setCamera();
    }

    onRaf() {
      this._render();
    }
  }

  class Mesh {
    constructor(stage) {
      this.canvas = document.getElementById("webgl-canvas");
      this.canvasWidth = this.canvas.width;
      this.canvasHeight = this.canvas.height;

      this.uniforms = {
        resolution: { type: "v2", value: [ this.canvasWidth, this.canvasHeight ] },
        time: { type: "f", value: 0.0 },
        xScale: { type: "f", value: 1.0 },
        yScale: { type: "f", value: 0.5 },
        distortion: { type: "f", value: 0.050 }
      };

      this.stage = stage;

      this.mesh = null;

      this.xScale = 1.0;
      this.yScale = 0.5;
      this.distortion = 0.050;
    }

    init() {
      this._setMesh();
      this._setGui();
    }

    _setMesh() {
      const position = [
        -1.0, -1.0, 0.0,
         1.0, -1.0, 0.0,
        -1.0,  1.0, 0.0,
         1.0, -1.0, 0.0,
        -1.0,  1.0, 0.0,
         1.0,  1.0, 0.0
      ];

      const positions = new THREE.BufferAttribute(new Float32Array(position), 3);

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", positions);

      const material = new THREE.RawShaderMaterial({
        // vertexShader: document.getElementById("js-vertex-shader").textContent,
        vertexShader: shaders.vertex,
        // fragmentShader: document.getElementById("js-fragment-shader").textContent,
        fragmentShader : shaders.fragment,
        uniforms: this.uniforms,
        side: THREE.DoubleSide
      });

      this.mesh = new THREE.Mesh(geometry, material);

      this.stage.scene.add(this.mesh);
    }

    _diffuse() {
      // gsap.to(this.mesh.material.uniforms.xScale, {
      //   value: 2,
      //   duration: 2,
      //   ease: 'power2.inOut',
      //   repeat: -1,
      //   yoyo: true
      // });
      // gsap.to(this.mesh.material.uniforms.yScale, {
      //   value: 1,
      //   duration: 2,
      //   ease: 'power2.inOut',
      //   repeat: -1,
      //   yoyo: true
      // });
    }

    _render() {
      this.uniforms.time.value += 0.01;
    }

    _setGui() {
      const parameter = {
        xScale: this.xScale,
        yScale: this.yScale,
        distortion: this.distortion
      }
      const gui = new dat.GUI();
      gui.add(parameter, "xScale", 0.00, 5.00, 0.01).onChange((value) => {
        this.mesh.material.uniforms.xScale.value = value;
      });
      gui.add(parameter, "yScale", 0.00, 1.00, 0.01).onChange((value) => {
        this.mesh.material.uniforms.yScale.value = value;
      });
      gui.add(parameter, "distortion", 0.001, 0.100, 0.001).onChange((value) => {
        this.mesh.material.uniforms.distortion.value = value;
      });
    }

    onRaf() {
      this._render();
    }
  }

  (() => {
    const stage = new Stage();

    stage.init();

    const mesh = new Mesh(stage);

    mesh.init();

    window.addEventListener("resize", () => {
      stage.onResize();
    });

    window.addEventListener("load", () => {
      setTimeout(() => {
        mesh._diffuse();
      }, 1000);
    });

    const _raf = () => {
      window.requestAnimationFrame(() => {
        stage.onRaf();
        mesh.onRaf();

        _raf();
      });
    };

    _raf();
  })();
