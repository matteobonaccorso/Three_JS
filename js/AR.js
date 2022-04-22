//function to manage AR functionality
async function activateXR() {
    // Add a canvas element and initialize a WebGL context that is compatible with WebXR.
    const canvas = document.createElement("canvas");
    document.body.appendChild(canvas);
    const gl = canvas.getContext("webgl", { xrCompatible: true });

    const scene = new THREE.Scene();

    const light = new THREE.AmbientLight(0xeeeeee);
    scene.add(light);

    // Set up the WebGLRenderer, which handles rendering to the session's base layer.
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      preserveDrawingBuffer: true,
      canvas: canvas,
      context: gl
    });
    renderer.autoClear = false;

    // The API directly updates the camera matrices.
    // Disable matrix auto updates so three.js doesn't attempt
    // to handle the matrices independently.
    const camera = new THREE.PerspectiveCamera();
    camera.matrixAutoUpdate = false;

    // Initialize a WebXR session using "immersive-ar".
    const session = await navigator.xr.requestSession("immersive-ar", { requiredFeatures: ['hit-test'] });
    session.updateRenderState({
      baseLayer: new XRWebGLLayer(session, gl)
    });

    // A 'local' reference space has a native origin that is located
    // near the viewer's position at the time the session was created.
    const referenceSpace = await session.requestReferenceSpace('local');

    // Create another XRReferenceSpace that has the viewer as the origin.
    const viewerSpace = await session.requestReferenceSpace('viewer');
    // Perform hit testing using the viewer as origin.
    // const hitTestSource = await session.requestHitTestSource({ space: viewerSpace });

    /*session.addEventListener("select", (event) => {
      if (flower) {
        const clone = flower.clone();
        clone.position.copy(reticle.position);
        scene.add(clone);
      }
    })*/

    // Create a render loop that allows us to draw on the AR view.
    const onXRFrame = (time, frame) => {
      // Queue up the next draw request.
      session.requestAnimationFrame(onXRFrame);

      const group = new THREE.InteractiveGroup(renderer, camera);
      scene.add(group);

      detectImages(canvas);

      for(uiContent of squares){
        let object = new THREE.HTMLMesh(uiContent);
        object.scale.setScalar(2);

        group.add(object);
      }

      // Bind the graphics framebuffer to the baseLayer's framebuffer
      gl.bindFramebuffer(gl.FRAMEBUFFER, session.renderState.baseLayer.framebuffer)

      // Retrieve the pose of the device.
      // XRFrame.getViewerPose can return null while the session attempts to establish tracking.
      const pose = frame.getViewerPose(referenceSpace);
      if (pose) {
        // In mobile AR, we only have one view.
        const view = pose.views[0];

        const viewport = session.renderState.baseLayer.getViewport(view);
        renderer.setSize(viewport.width, viewport.height)

        // Use the view's transform matrix and projection matrix to configure the THREE.camera.
        camera.matrix.fromArray(view.transform.matrix)
        camera.projectionMatrix.fromArray(view.projectionMatrix);
        camera.updateMatrixWorld(true);

        // Render the scene with THREE.WebGLRenderer.
        renderer.render(scene, camera)
      }
    }

    session.requestAnimationFrame(onXRFrame);
}