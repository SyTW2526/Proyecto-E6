import { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { SunCalc } from "./suncalc.js";
import { useAppContext } from "../AppContext.jsx";
import {
  Lensflare,
  LensflareElement,
} from "three/examples/jsm/objects/Lensflare";

let auxiliaryDate = new Date();

function ThreeComponent() {
  const ref = useRef(null);
  const {
    actualDate,
    latitudeState,
    longitudeState,
    updateLocation,
    updateSelectedDate,
    updateActualDate,
    timeSpeed,
  } = useAppContext();

  // Refs para acceder a los valores actuales dentro del loop de animación
  const timeSpeedRef = useRef(timeSpeed);
  const actualDateRef = useRef(actualDate);
  const latitudeRef = useRef(latitudeState);
  const longitudeRef = useRef(longitudeState);

  // Actualizar refs cuando cambien los valores
  useEffect(() => {
    timeSpeedRef.current = timeSpeed;
  }, [timeSpeed]);

  useEffect(() => {
    actualDateRef.current = actualDate;
  }, [actualDate]);

  useEffect(() => {
    latitudeRef.current = latitudeState;
    longitudeRef.current = longitudeState;
  }, [latitudeState, longitudeState]);

  const [configOpen, setConfigOpen] = useState(false);
  const [formDate, setFormDate] = useState("");
  const [formTime, setFormTime] = useState("");
  const [formLat, setFormLat] = useState("");
  const [formLng, setFormLng] = useState("");

  // helpers to format actualDate (which may be dayjs) for inputs
  const dateForInput = (d) => {
    try {
      const dt = d && d.toDate ? d.toDate() : new Date(d);
      return dt.toISOString().slice(0, 10);
    } catch (e) {
      return new Date().toISOString().slice(0, 10);
    }
  };

  const timeForInput = (d) => {
    try {
      const dt = d && d.toDate ? d.toDate() : new Date(d);
      return dt.toISOString().slice(11, 16);
    } catch (e) {
      return new Date().toISOString().slice(11, 16);
    }
  };

  const openConfig = async () => {
    // Determine defaults: if geolocation permission granted, use latitudeState/longitudeState
    let useLat = latitudeState;
    let useLng = longitudeState;
    try {
      if (navigator && navigator.permissions && navigator.permissions.query) {
        const perm = await navigator.permissions.query({ name: "geolocation" });
        if (perm.state === "granted") {
          useLat = latitudeState;
          useLng = longitudeState;
        }
      }
    } catch (e) {
      // Permissions API not available - fall back to context values
    }

    setFormDate(dateForInput(actualDate));
    setFormTime(timeForInput(actualDate));
    setFormLat(useLat);
    setFormLng(useLng);
    setConfigOpen(true);
  };

  const closeConfig = () => setConfigOpen(false);

  const toggleConfig = async () => {
    if (configOpen) {
      closeConfig();
    } else {
      await openConfig();
    }
  };

  const handleSave = () => {
    // combine date and time
    const iso = `${formDate}T${formTime}`;
    const newDate = new Date(iso);
    // update context
    try {
      updateLocation({ lat: parseFloat(formLat), lng: parseFloat(formLng) });
    } catch (e) {
      console.warn("updateLocation failed", e);
    }
    try {
      updateSelectedDate(newDate);
    } catch (e) {}
    try {
      updateActualDate(newDate);
    } catch (e) {}
    // ensure auxiliaryDate used by the animation is updated on next render
    setConfigOpen(false);
  };

  // Update the informational text when date or coordinates change
  useEffect(() => {
    const el = document.getElementById("texto-informativo");
    if (el) {
      el.textContent = `${actualDate}, ${latitudeState}, ${longitudeState}`;
    }
  }, [actualDate, latitudeState, longitudeState]);

  // Sincronizar auxiliaryDate cuando cambia actualDate y timeSpeed es 1 (parado)
  useEffect(() => {
    if (timeSpeed === 1) {
      auxiliaryDate =
        actualDate && actualDate.toDate
          ? actualDate.toDate()
          : new Date(actualDate);
    }
  }, [actualDate]);

  // Detectar cuando se detiene la animación y guardar la fecha
  const prevTimeSpeedRef = useRef(timeSpeed);
  useEffect(() => {
    // Solo actualizar cuando pasa de >1 a 1 (se detiene)
    if (prevTimeSpeedRef.current > 1 && timeSpeed === 1 && auxiliaryDate) {
      // Actualizar actualDate con la fecha simulada cuando se detiene
      updateActualDate(auxiliaryDate);
    }
    prevTimeSpeedRef.current = timeSpeed;
  }, [timeSpeed, updateActualDate]);

  useEffect(() => {
    if (!ref.current) return;

    // SCENE
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    // RENDERER
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    // When rendering the main scene and then a small auxiliary camera view,
    // the second render call would clear the whole canvas if autoClear is true.
    // Disable automatic clearing and perform controlled clears per-frame.
    renderer.autoClear = false;
    renderer.setSize(ref.current.clientWidth, ref.current.clientHeight);
    ref.current.appendChild(renderer.domElement);

    // CAMERA MAIN
    // 1 -> field of view in degrees
    // 2 -> aspect ratio
    // 3 and 4 -> min and max distance to the object in which it will be rendered (improve performance)
    const camera = new THREE.PerspectiveCamera(
      75,
      ref.current.clientWidth / ref.current.clientHeight,
      0.1,
      1000
    );
    const controls = new OrbitControls(camera, renderer.domElement);
    camera.position.set(0, 0, 20);
    controls.minDistance = 10; // Distancia mínima de zoom (no permite acercarse más)
    controls.maxDistance = 50; // Distancia máxima de zoom (no permite alejarse más)
    controls.update();

    // CAMERA LUNAR PHASE
    const auxCamera = new THREE.PerspectiveCamera(
      75,
      ref.current.clientWidth / ref.current.clientHeight,
      0.1,
      1000
    );
    auxCamera.position.set(0, 0, 0);
    auxCamera.zoom = 1;

    // LIGHTS (SUN)
    const light = new THREE.AmbientLight(0x404040, 2);
    scene.add(light);

    const pointLight = new THREE.DirectionalLight(0xffffff, 4);
    pointLight.castShadow = true;
    scene.add(pointLight);
    const textureLoader = new THREE.TextureLoader();

    const textureFlare0 = textureLoader.load("/lensflare0.png");
    const textureFlare1 = textureLoader.load("/lensflare2.png");
    const textureFlare2 = textureLoader.load("/lensflare3.png");

    const lensflare = new Lensflare();

    lensflare.addElement(new LensflareElement(textureFlare0, 512, 0));
    lensflare.addElement(new LensflareElement(textureFlare1, 512, 0));
    lensflare.addElement(new LensflareElement(textureFlare2, 60, 0.6));

    pointLight.add(lensflare);
    pointLight.position.z = 20;

    // EARTH MODEL
    var terrain;
    const loader_terrain = new GLTFLoader();
    loader_terrain.load(
      "/earth.glb",
      function (object) {
        terrain = object.scene;
        object.scene.scale.multiplyScalar(1);
        scene.add(object.scene);
      },
      undefined,
      function (error) {
        // Check error while loading terrain model
        console.error(error);
      }
    );

    // MOON 3D MODEL
    var moon;
    const loader_moon = new GLTFLoader();
    loader_moon.load(
      "/moon.glb",
      function (object) {
        moon = object.scene;
        object.scene.scale.multiplyScalar(1);
        scene.add(object.scene);
      },
      undefined,
      function (error) {
        // Check error while loading moon model
        console.error(error);
      }
    );

    // PLACE MOON AND SUN
    function get_position(altitude, azimuth, distance) {
      var position = new THREE.Vector3();
      position.setY(Math.sin(altitude) * distance);
      const radius = Math.sqrt(distance * distance - position.y * position.y);
      if (azimuth > Math.PI / 2 && azimuth <= Math.PI) {
        position.setX(+Math.sin(Math.PI - azimuth) * radius);
        position.setZ(+Math.cos(Math.PI - azimuth) * radius);
      } else if (azimuth > Math.PI && azimuth <= (3 * Math.PI) / 2) {
        position.setX(-Math.sin(azimuth - Math.PI) * radius);
        position.setZ(+Math.cos(azimuth - Math.PI) * radius);
      } else if (azimuth > (3 * Math.PI) / 2 && azimuth <= 2 * Math.PI) {
        position.setX(-Math.sin(2 * Math.PI - azimuth) * radius);
        position.setZ(-Math.cos(2 * Math.PI - azimuth) * radius);
      } else {
        // está comprobado -> (0º - 90º)
        position.setX(+Math.sin(azimuth) * radius);
        position.setZ(-Math.cos(azimuth) * radius);
      }
      return position;
    }

    // INFO TEXT
    const infoTextEl = document.getElementById("texto-informativo");
    if (infoTextEl) {
      infoTextEl.textContent = `${actualDate}, ${latitudeState}, ${longitudeState}`;
    }

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
    let lastFrameTime = Date.now();
    const animate = () => {
      requestAnimationFrame(animate);

      // TIME ACCELERATION - Incrementar el tiempo de forma fluida
      const currentTimeSpeed = timeSpeedRef.current;
      const currentActualDate = actualDateRef.current;
      const currentLatitude = latitudeRef.current;
      const currentLongitude = longitudeRef.current;

      if (currentTimeSpeed > 1) {
        const now = Date.now();
        const deltaTime = now - lastFrameTime;
        lastFrameTime = now;

        // Incrementar auxiliaryDate proporcionalmente al timeSpeed
        // deltaTime está en ms, lo multiplicamos por timeSpeed para acelerar
        const increment = deltaTime * (currentTimeSpeed - 1);
        auxiliaryDate = new Date(auxiliaryDate.getTime() + increment);
      } else {
        lastFrameTime = Date.now();
        // Cuando timeSpeed es 1, NO actualizar constantemente
        // auxiliaryDate solo se actualiza cuando se detiene o cuando se cambia manualmente la fecha
      }

      // Obtener posición de la luna desde la ubicación del usuario para el parallactic angle
      var moon_position_user = SunCalc.getMoonPosition(
        auxiliaryDate,
        currentLatitude,
        currentLongitude
      );
      var moon_position = SunCalc.getMoonPosition(auxiliaryDate, 89.9999, 0);
      var new_position_moon = get_position(
        moon_position.altitude,
        moon_position.azimuth,
        120.672
      );
      if (moon != undefined) {
        moon.position.set(
          new_position_moon.x,
          new_position_moon.y,
          new_position_moon.z
        );

        // LIBRACIÓN LUNAR CORRECTA
        // La luna SIEMPRE muestra la misma cara a la Tierra (rotación sincrónica)
        moon.rotation.set(0, 0, 0);
        moon.lookAt(new THREE.Vector3(0, 0, 0));
        // NO rotamos la luna - siempre mira a la Tierra con la misma cara

        if (terrain != undefined) {
          terrain.rotation.y = Math.PI / 2;
        }

        // CÁMARA AUXILIAR CON PARALLACTIC ANGLE
        // El parallactic angle afecta CÓMO VEMOS la luna, no a la luna misma
        const parallacticAngle = moon_position_user.parallacticAngle;

        // Vector desde Tierra a Luna
        let vector_earth_moon = new THREE.Vector3(0, 0, 0).sub(moon.position);
        vector_earth_moon.normalize();

        // Posicionar cámara auxiliar cerca de la luna (mirando hacia la Tierra)
        let auxCamDistance = 2.5;
        var cameraPosition = moon.position
          .clone()
          .add(vector_earth_moon.clone().multiplyScalar(auxCamDistance));
        auxCamera.position.copy(cameraPosition);

        // APLICAR PARALLACTIC ANGLE AL VECTOR UP DE LA CÁMARA
        // Esto rota la vista, simulando cómo se ve la fase desde tu ubicación
        // El eje de rotación es el vector de visión (Tierra->Luna)
        const viewAxis = vector_earth_moon.clone().negate(); // Luna->Tierra

        // Crear el vector up rotado por el parallactic angle (NEGADO para corregir orientación)
        const baseUp = new THREE.Vector3(0, 1, 0);
        const rotatedUp = baseUp
          .clone()
          .applyAxisAngle(viewAxis, -parallacticAngle);

        auxCamera.up.copy(rotatedUp);
        auxCamera.lookAt(moon.position);
      }

      var sun_position = SunCalc.getPosition(auxiliaryDate, 89.9999, 0);
      var new_position_sun = get_position(
        sun_position.altitude,
        sun_position.azimuth,
        180
      );
      pointLight.position.set(
        new_position_sun.x,
        new_position_sun.y,
        new_position_sun.z
      );
      // Clear once per frame and render the main scene
      renderer.setViewport(
        0,
        0,
        ref.current.clientWidth,
        ref.current.clientHeight
      );
      renderer.clear(); // clear color, depth and stencil once
      renderer.render(scene, camera);

      const size_aux_camera = ref.current.clientWidth / 5;
      auxCamera.aspect = 1;
      auxCamera.updateProjectionMatrix();
      renderer.setScissor(
        ref.current.clientWidth - size_aux_camera,
        0,
        size_aux_camera,
        size_aux_camera
      );
      renderer.setScissorTest(true);
      renderer.setViewport(
        ref.current.clientWidth - size_aux_camera,
        0,
        size_aux_camera,
        size_aux_camera
      );
      // Allow the auxiliary camera to render on top: clear only the depth buffer
      // so that the small viewport draws without erasing the main scene color.
      renderer.clearDepth();
      renderer.render(scene, auxCamera);

      // Reset scissor test and viewport back to full for next frame
      renderer.setScissorTest(false);
      renderer.setViewport(
        0,
        0,
        ref.current.clientWidth,
        ref.current.clientHeight
      );

      var moonIllumination = SunCalc.getMoonIllumination(auxiliaryDate);
      // var moonPhase = moonIllumination.phase;
      var moonFraction = moonIllumination.fraction;

      const moonInfoEl = document.getElementById("moon-info");
      if (moonInfoEl) {
        moonInfoEl.textContent = `${(moonFraction * 100).toFixed(2)}%`;
      }
    };
    animate();

    // CLEANUP
    return () => {
      window.removeEventListener("resize", handleResize);
      if (ref.current) {
        ref.current.removeChild(renderer.domElement);
      }
    };
  }, [actualDate, latitudeState, longitudeState]);

  return (
    <div
      ref={ref}
      style={{ width: "100%", height: "100%", position: "relative" }}
    >
      {/* Config button in top-right */}
      <button
        onClick={toggleConfig}
        title="Configuración"
        aria-label="Abrir configuración"
        style={{
          position: "absolute",
          top: "12px",
          right: "12px",
          zIndex: 70,
          background: "rgba(0,0,0,0.75)",
          color: "white",
          border: "none",
          width: "56px",
          height: "56px",
          padding: 0,
          borderRadius: "50%",
          cursor: "pointer",
          fontSize: "28px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
        }}
      >
        ⚙
      </button>

      {/* Backdrop to close when clicking outside the modal */}
      {configOpen && (
        <div
          onClick={closeConfig}
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 65,
            // transparent but still receives clicks
            background: "transparent",
          }}
        />
      )}

      {/* Modal / dialog */}
      {configOpen && (
        <div
          onClick={(e) =>
            e.stopPropagation()
          } /* prevent clicks inside modal from closing */
          style={{
            position: "absolute",
            top: "52px",
            right: "12px",
            zIndex: 75,
            background: "rgba(0,0,0,0.85)",
            color: "white",
            padding: "12px",
            borderRadius: "8px",
            minWidth: "280px",
            boxShadow: "0 6px 18px rgba(0,0,0,0.6)",
          }}
        >
          <div style={{ marginBottom: "8px", fontWeight: "600" }}>
            Configuración
          </div>
          <div style={{ marginBottom: "6px" }}>
            <label style={{ display: "block", fontSize: "12px" }}>Fecha</label>
            <input
              type="date"
              value={formDate}
              onChange={(e) => setFormDate(e.target.value)}
              style={{ width: "100%" }}
            />
          </div>
          <div style={{ marginBottom: "6px" }}>
            <label style={{ display: "block", fontSize: "12px" }}>Hora</label>
            <input
              type="time"
              value={formTime}
              onChange={(e) => setFormTime(e.target.value)}
              style={{ width: "100%" }}
            />
          </div>
          <div style={{ display: "flex", gap: "8px", marginBottom: "6px" }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", fontSize: "12px" }}>
                Latitud
              </label>
              <input
                type="number"
                step="0.0001"
                value={formLat}
                onChange={(e) => setFormLat(e.target.value)}
                style={{ width: "100%" }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", fontSize: "12px" }}>
                Longitud
              </label>
              <input
                type="number"
                step="0.0001"
                value={formLng}
                onChange={(e) => setFormLng(e.target.value)}
                style={{ width: "100%" }}
              />
            </div>
          </div>
          <div
            style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}
          >
            <button
              onClick={closeConfig}
              style={{
                padding: "6px 10px",
                borderRadius: "6px",
                background: "#d21f1991",
                color: "white",
                border: "none",
                cursor: "pointer",
              }}
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              style={{
                padding: "6px 10px",
                borderRadius: "6px",
                border: "none",
                background: "#1976d2",
                color: "white",
                cursor: "pointer",
              }}
            >
              Guardar
            </button>
          </div>
        </div>
      )}

      <div
        id="moon-info"
        style={{
          position: "absolute",
          bottom: "12%",
          right: "6%",
          color: "#ffb20bff",
          fontSize: "30px",
          fontWeight: "bold",
        }}
      />
      <div
        id="texto-informativo"
        style={{
          position: "absolute",
          bottom: "2%",
          left: "2%",
          color: "white",
          fontsize: "30px",
        }}
      />
    </div>
  );
}

export default ThreeComponent;
