import { useRef, useEffect } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

function ThreeComponent() {
  const ref = useRef(null);

  useEffect(() => {
    // SCENE
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x222222);

    // CAMERA
    const camera = new THREE.PerspectiveCamera(
      75,
      ref.current.clientWidth / ref.current.clientHeight,
      0.1,                                                                    
      1000
    );
    camera.position.z = 5;

    // RENDERER
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(ref.current.clientWidth, ref.current.clientHeight);
    ref.current.appendChild(renderer.domElement);

    // CONTROLS
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // LIGHT
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // CUBE
    const geometry = new THREE.BoxGeometry(2, 2, 2);
    const material = new THREE.MeshStandardMaterial({
      color: 0x1976d2,
      metalness: 0.3,
      roughness: 0.4,
    });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    // RESIZE LISTENER
    const handleResize = () => {
      const width = ref.current.clientWidth;
      const height = ref.current.clientHeight;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", handleResize);

    // ANIMATION LOOP
    const animate = () => {
      requestAnimationFrame(animate);

      // Rotate cube
      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // CLEANUP
    return () => {
      window.removeEventListener("resize", handleResize);
      if (ref.current) {
        ref.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={ref}
      style={{ width: "100%", height: "100%", position: "relative" }}
    />
  );
}

export default ThreeComponent;
