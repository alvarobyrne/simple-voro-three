
import {
  Scene,
  WebGLRenderer,
  PerspectiveCamera,
  BoxGeometry,
  MeshStandardMaterial,
  ShaderMaterial,
  Mesh,
  PointLight,
  Color,
  Clock,
  LoadingManager,
  SphereBufferGeometry,
  MeshBasicMaterial,
  Vector3
} from 'three'

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

// Remove this if you don't need to load any 3D model
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

import { Pane } from 'tweakpane'

class App {
  #resizeCallback = () => this.#onResize()

  constructor(container) {
    this.container = document.querySelector(container)
  }

  async init() {
    this.#createScene()
    this.#createCamera()
    this.#createRenderer()
    this.#createBox()
    // this.#createShadedBox()
    this.#createLight()
    this.#createClock()
    this.#addListeners()
    this.#createControls()
    // this.#createDebugPanel()
    this.#createLoaders()

    // await this.#loadModel()

    this.#loadVoronoiData();

    this.renderer.setAnimationLoop(() => {
      this.#update()
      this.#render()
    })

    console.log(this)
  }

  destroy() {
    this.renderer.dispose()
    this.#removeListeners()
  }

  #update() {
    const elapsed = this.clock.getElapsedTime()

    // this.box.rotation.y = elapsed
    // this.box.rotation.z = elapsed * 0.6

    // this.shadedBox.rotation.y = elapsed
    // this.shadedBox.rotation.z = elapsed * 0.6
  }

  #render() {
    this.renderer.render(this.scene, this.camera)
  }

  #createScene() {
    this.scene = new Scene()
  }

  #createCamera() {
    this.camera = new PerspectiveCamera(75, this.container.clientWidth / this.container.clientHeight, 0.1, 100)
    this.camera.position.set(-4, 4, 10)
  }

  #createRenderer() {
    this.renderer = new WebGLRenderer({
      alpha: true,
      antialias: window.devicePixelRatio === 1
    })

    this.container.appendChild(this.renderer.domElement)

    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight)
    this.renderer.setPixelRatio(Math.min(1.5, window.devicePixelRatio))
    this.renderer.setClearColor(0x121212)
    this.renderer.physicallyCorrectLights = true
  }

  #createLight() {
    this.pointLight = new PointLight(0xff0055, 500, 100, 2)
    this.pointLight.position.set(0, 10, 13)
    this.scene.add(this.pointLight)
  }

  /**
   * Create a box with a PBR material
   */
  #createBox() {
    const geometry = new BoxGeometry(1, 1, 1, 1, 1, 1)

    const material = new MeshBasicMaterial({
      color: 0xff0000,
      wireframe: true,
    })

    this.box = new Mesh(geometry, material)

    const scale = 2;
    this.box.scale.x = scale;
    this.box.scale.y = scale;
    this.box.scale.z = scale;

    // this.box.position.x = -5

    this.scene.add(this.box)
  }

  /**
   * Create a box with a custom ShaderMaterial
   */
  #createShadedBox() {
    const geometry = new BoxGeometry(1, 1, 1, 1, 1, 1)

    const material = new ShaderMaterial({
      vertexShader: require('./shaders/sample.vertex.glsl'),
      fragmentShader: require('./shaders/sample.fragment.glsl'),
      transparent: true
    })

    this.shadedBox = new Mesh(geometry, material)

    this.shadedBox.scale.x = 4
    this.shadedBox.scale.y = 4
    this.shadedBox.scale.z = 4

    this.shadedBox.position.x = 5

    this.scene.add(this.shadedBox)
  }

  #createLoaders() {
    this.loadingManager = new LoadingManager()

    this.loadingManager.onProgress = (url, loaded, total) => {
      // In case the progress count is not correct, see this:
      // https://discourse.threejs.org/t/gltf-file-loaded-twice-when-loading-is-initiated-in-loadingmanager-inside-onprogress-callback/27799/2
      console.log(`Loaded ${loaded} resources out of ${total} -> ${url}`)
    }

    this.loadingManager.onLoad = () => {
      console.log('All resources loaded')
    }

    this.gltfLoader = new GLTFLoader(this.loadingManager)
  }

  /**
   * Load a 3D model and append it to the scene
   */
  #loadModel() {
    return new Promise(resolve => {
      this.gltfLoader.load('./model.glb', gltf => {
        const mesh = gltf.scene.children[0]

        mesh.scale.x = 4
        mesh.scale.y = 4
        mesh.scale.z = 4

        mesh.position.z = 5

        const material = new ShaderMaterial({
          vertexShader: require('./shaders/sample.vertex.glsl'),
          fragmentShader: require('./shaders/sample.fragment.glsl'),
          transparent: true,
          wireframe: true
        })

        mesh.material = material

        this.scene.add(mesh)

        resolve()
      })
    })
  }

  #createControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
  }

  #createDebugPanel() {
    this.pane = new Pane({
      container: document.querySelector('#debug')
    })

    /**
     * Scene configuration
     */
    const sceneFolder = this.pane.addFolder({ title: 'Scene' })

    let params = { background: { r: 18, g: 18, b: 18 } }

    sceneFolder.addInput(params, 'background', { label: 'Background Color' }).on('change', e => {
      this.renderer.setClearColor(new Color(e.value.r / 255, e.value.g / 255, e.value.b / 255))
    })

    /**
     * Box configuration
     */
    const boxFolder = this.pane.addFolder({ title: 'Box' })

    boxFolder.addInput(this.box.scale, 'x', { label: 'Width', min: 1, max: 8 })
      .on('change', e => this.shadedBox.scale.x = e.value)

    boxFolder.addInput(this.box.scale, 'y', { label: 'Height', min: 1, max: 8 })
      .on('change', e => this.shadedBox.scale.y = e.value)

    boxFolder.addInput(this.box.scale, 'z', { label: 'Depth', min: 1, max: 8 })
      .on('change', e => this.shadedBox.scale.z = e.value)

    boxFolder.addInput(this.box.material, 'metalness', { label: 'Metallic', min: 0, max: 1 })

    boxFolder.addInput(this.box.material, 'roughness', { label: 'Roughness', min: 0, max: 1 })

    /**
     * Light configuration
     */
    const lightFolder = this.pane.addFolder({ title: 'Light' })

    params = {
      color: { r: 255, g: 0, b: 85 }
    }

    lightFolder.addInput(params, 'color', { label: 'Color' }).on('change', e => {
      this.pointLight.color = new Color(e.value.r / 255, e.value.g / 255, e.value.b / 255)
    })

    lightFolder.addInput(this.pointLight, 'intensity', { label: 'Intensity', min: 0, max: 1000 })
  }

  #createClock() {
    this.clock = new Clock()
  }

  #addListeners() {
    window.addEventListener('resize', this.#resizeCallback, { passive: true })
  }

  #removeListeners() {
    window.removeEventListener('resize', this.#resizeCallback, { passive: true })
  }

  #onResize() {
    this.camera.aspect = this.container.clientWidth / this.container.clientHeight
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight)
  }

  async #loadVoronoiData() {
    // return
    const response = await fetch('random_points_p.gnu')
    const dataPoints = await response.text()
    const points = this.#parsePoints(dataPoints);
    this.#drawPoints(points)
    const verticesResponse = await fetch('random_points_v.gnu')
    const vertices = await verticesResponse.text();
    const lines = this.#parseVertices(vertices)
    console.log('lines: ', lines);
  }

  #parsePoints(rawPoints) {
    const lines = rawPoints.split('\n')
    const points = lines.map(this.#stringLineToPoints)
    return points


  }

  #parseVertices(vertices) {
    const facesRaw = vertices.split('\n\n')
    const lines = facesRaw.map(face => {
      const pointsString = face.split('\n').filter(x => x != '')
      const points = pointsString.map(this.#stringLineToPoints)
      return points
    })
    return lines
  }

  #stringLineToPoints(stringLine) {
    const strings = stringLine.split(' ')
    const numbers = strings.map(x => +x)
    numbers.shift();
    return numbers

  }

  #drawPoints(points) {
    console.log('points: ', points);
    points.forEach(element => {
      const g = new SphereBufferGeometry(0.1)
      const m = new MeshBasicMaterial();
      const s = (new Mesh(g, m));
      s.position.set(...element)
      this.scene.add(s);
    });

  }
}

const app = new App('#app')
app.init()
