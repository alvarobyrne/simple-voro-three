
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
  Vector3,
  LineBasicMaterial,
  BufferGeometry,
  Line,
  Group,
  DoubleSide
} from 'three'

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

// Remove this if you don't need to load any 3D model
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

import { Pane } from 'tweakpane'

class App {
  #voronoiModel = [];
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
    this.#createDebugPanel()
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

    this.controls.update()
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
    this.camera.position.multiplyScalar(.4)
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
    this.controls.enableDamping = true;
  }
  #getOnClick(href) {
    return () => {
      const clicker = document.createElement('a')
      clicker.href = href
      clicker.target = '_blank'
      clicker.click()
    }
  }
  #createDebugPanel() {
    this.pane = new Pane({
      container: document.querySelector('#debug')
    })
    this.pane.addButton({ title: 'voro++' }).on('click', this.#getOnClick('https://math.lbl.gov/voro++'))
    this.pane.addButton({ title: 'voro++: examples' }).on('click', this.#getOnClick('https://math.lbl.gov/voro++/examples'))
    this.pane.addButton({ title: 'voro++: custom output' }).on('click', this.#getOnClick('https://math.lbl.gov/voro++/doc/custom.html'))
    //
    return
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
    const points = this.#parsePoints(dataPoints).filter(x => x.length > 0);
    this.#drawPoints(points, 0.05)
    const edgesVerticesResponse = await fetch('random_points_v.gnu')
    const edgesVertices = await edgesVerticesResponse.text();
    const lines = this.#parseEdgesVertices(edgesVertices).filter(x => x.length > 0)
    this.#drawLines(lines, 'red');

    const responseVerticesCells = await fetch('vertices.txt')
    const verticesCellsRaw = await responseVerticesCells.text();


    const verticesCells = this.#numberParser(verticesCellsRaw);

    const responseIndicesCells = await fetch('indices.txt');
    const indicesCellsRaw = await responseIndicesCells.text()
    const indicesCells = this.#numberParser(indicesCellsRaw, 'parseInt')

    const trianglesIndicesFromPolygonsIndices = (poyhedronFaces) => {
      const triangles = [];
      for (let i = 0; i < poyhedronFaces.length; i++) {
        const face = poyhedronFaces[i];
        const faceLength = face.length;
        for (let j = 0; j < faceLength - 2; j++) {
          const triangle = [face[0], face[j + 1], face[j + 2]];
          triangles.push(triangle);
        }
      }
      return triangles;
    };
    const trianglesIndices = indicesCells.map(trianglesIndicesFromPolygonsIndices)
    // const cells3d = this.#drawCellPolyhedra(verticesCells, trianglesIndices)

    const responseCentroids = await fetch('centroids.txt');
    const centroidsRaw = await responseCentroids.text();
    const centroids = this.#numberParserColumn(centroidsRaw);
    this.#drawPoints(centroids, 0.03, 'red');

    this.#voronoiModel = this.#makePolyhedronModel({
      indices: trianglesIndices,
      vertices: verticesCells,
      centroids
    })

    this.#scaleAroundCentroid(this.#voronoiModel);
    const verticesCellsScaled = this.#scaleAroundCentroids(verticesCells, centroids, 0.1)

    const cellsScaled3d = this.#drawCellPolyhedra(verticesCellsScaled, trianglesIndices);

    this.#drawLinesPerFace(indicesCells, verticesCellsScaled)

  }

  #drawLinesPerFace(voronoiIndices, voronoiVertices) {
    const material = new LineBasicMaterial({
      color: "white",
      linewidth: 5,
    });
    voronoiIndices.forEach((face, i) => {
      const group = new Group();
      face.forEach((faceIndices) => {
        const faceVertices = faceIndices.map(
          (index) => new Vector3(...voronoiVertices[i][index])
        );
        const geometry = new BufferGeometry().setFromPoints(faceVertices);
        const line = new Line(geometry, material);
        group.add(line);
      });
      this.scene.add(group);
    })

  }


  #scaleAroundCentroids(voronoiVertices, voronoiCentroids, amount) {
    return voronoiVertices.map((vertices, i) => {
      const centroid = new Vector3(...voronoiCentroids[i]);
      return vertices.map(vertexArray => {
        const vertex = new Vector3(...vertexArray)
        // console.log('vertex: ', vertex);
        const difference = new Vector3().copy(centroid).sub(vertex);
        const length = difference.length();
        // console.log('length: ', length);
        const v = new Vector3().copy(vertex).add(difference.setLength(amount))
        const length2 = v.length();
        const d = length2 - length;
        return [v.x, v.y, v.z]
      })
    })
  }

  #makePolyhedronModel(model) {
    return model.centroids.map((centroid, i) => {
      const vertices = model.vertices[i].map(vertex => new Vector3(...vertex));
      // const indices = model.indices[i].map(index=>Vector3(...index));
      return {
        centroid: new Vector3(...centroid),
        vertices,
        indices: model.vertices[i]
      }
    })
  }

  #scaleAroundCentroid(model) {
    model.forEach(polyhedron => {
      polyhedron.vertices.map(vertex => {
        // console.log('vertex: ', vertex);
        const difference = new Vector3().copy(polyhedron.centroid).sub(vertex);
        const length = difference.length();
        // console.log('length: ', length);
        const v = new Vector3().copy(vertex).add(difference.setLength(0.01))
        const length2 = v.length();
        const d = length2 - length;
        // console.log('d: ', d);
        if (!polyhedron.scaled) {
          polyhedron.scaled = [v]
        } else {
          polyhedron.scaled.push(v)
        }
      })
    })
  }

  #drawCellPolyhedra(vertices, indices) {
    const colors = ['red', 'green', 'blue', 'cyan', 'magenta', 'yellow', 'gray', 'white']
    if (indices.length !== vertices.length) {
      throw 'Arrays must be of same length'
    }
    const meshes = vertices.map((polyhedronVertices, i) => {
      const polyhedronIndices = indices[i];
      return this.#drawCellPolyhedron(polyhedronVertices, polyhedronIndices, colors[i % colors.length])

    })
    return meshes
  }

  #drawCellPolyhedron(vertices, indices, color) {
    const index = indices.flat();
    const maxIndex = Math.max(...index)
    if (vertices.length - 1 !== maxIndex) {
      throw new Error('maxIndex should be equal to vertices length')
    }
    const points = vertices.map(vectorAsArray => new Vector3(...vectorAsArray));
    return this.#drawPolyhedron(points, index, color)
  }

  #drawPolyhedron(vertex, index, color) {
    const g = new BufferGeometry().setFromPoints(vertex);
    g.setIndex(index)
    const m = new MeshBasicMaterial({
      color,
      // transparent: true,
      // opacity: 0.3,
      side: DoubleSide
    })
    const mesh = new Mesh(g, m)
    this.scene.add(mesh)
    return mesh
  }

  #numberParser(rawData, parser = 'parseFloat') {
    const perLine = rawData.split('\n')
    return perLine.map(x => {
      const y = x.split(' ')
        .map(stringPoint => stringPoint.slice(1, -1)
          .split(',')
          .map(stringNumber => window[parser](stringNumber)))
      return y
    }).filter(list => list.length > 3)
  }

  #numberParserColumn(rawData, parser = 'parseFloat') {
    const perLine = rawData.split('\n').filter(list => list.length > 3)
    return perLine.map(x => {
      const y = x.split(' ')
        .map(stringNumber => window[parser](stringNumber))
      return y
    })
  }

  #parsePoints(rawPoints) {
    const lines = rawPoints.split('\n')
    const IS_SHIFTNG = true;
    const points = lines.map(x => this.#stringLineToPoints(x, IS_SHIFTNG))
    return points
  }

  #parseEdgesVertices(vertices) {
    const facesRaw = vertices.split('\n\n')
    const lines = facesRaw.map(face => {
      const pointsString = face.split('\n').filter(x => x != '')
      const IS_SHIFTNG = false;
      const points = pointsString.map(x => this.#stringLineToPoints(x, IS_SHIFTNG))
      return points
    })
    return lines
  }

  #stringLineToPoints(stringLine, isShifting = false) {
    const strings = stringLine.split(' ')
    const numbers = strings.map(x => +x)
    if (isShifting) numbers.shift();
    return numbers

  }

  #drawPoints(points, size = 0.1, color = 'white') {
    points.forEach(element => {
      const g = new SphereBufferGeometry(size)
      const m = new MeshBasicMaterial({ color });
      const s = (new Mesh(g, m));
      s.position.set(...element)
      this.scene.add(s);
    });
  }

  #drawLines(lines, color = 'lightblue') {
    const m = new LineBasicMaterial({ color })
    const vectors = lines.map(line => line.map(x => new Vector3(...x)))
    vectors.forEach(v => {
      const g = new BufferGeometry().setFromPoints(v);
      const line = new Line(g, m);
      this.scene.add(line);
    })
  }
}

const app = new App('#app')
app.init()
