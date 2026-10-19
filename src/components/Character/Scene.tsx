import { useEffect, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";
import setCharacter from "./utils/character";
import setLighting from "./utils/lighting";
import { useLoading } from "../../context/LoadingProvider";
import handleResize from "./utils/resizeUtils";
import {
  handleMouseMove,
  handleTouchEnd,
  handleHeadRotation,
  handleTouchMove,
} from "./utils/mouseUtils";
import setAnimations from "./utils/animationUtils";
import { setProgress } from "../Loading";
import {
  clearAllTimeline,
  clearCharacterTimeline,
  setAllTimeline,
  setCharTimeline,
} from "../utils/GsapScroll";

const Scene = () => {
  const canvasDiv = useRef<HTMLDivElement | null>(null);
  const hoverDivRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef(new THREE.Scene());
  const { setLoading } = useLoading();

  useEffect(() => {
    if (canvasDiv.current) {
      const canvasElement = canvasDiv.current;
      const rect = canvasElement.getBoundingClientRect();
      const container = { width: rect.width, height: rect.height };
      const aspect = container.width / Math.max(container.height, 1);
      const scene = sceneRef.current;
      const progress = setProgress((value) => setLoading(value));

      let renderer: THREE.WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({
          alpha: true,
          antialias: true,
        });
      } catch (error) {
        console.error("Unable to initialize WebGL:", error);
        progress.clear();
        return () => progress.stop();
      }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      renderer.setSize(container.width, container.height);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1;
      canvasElement.appendChild(renderer.domElement);

      const camera = new THREE.PerspectiveCamera(14.5, aspect, 0.1, 1000);
      camera.position.z = 10;
      camera.position.set(0, 13.1, 24.7);
      camera.zoom = 1.1;
      camera.updateProjectionMatrix();
      const initialCameraPosition = camera.position.clone();

      let headBone: THREE.Object3D | null = null;
      let screenLight: THREE.MeshStandardMaterial | null = null;
      let mixer: THREE.AnimationMixer;
      let loadedCharacter: THREE.Object3D | undefined;
      let disposed = false;
      let animationFrame = 0;
      let debounce: number | undefined;
      let introTimer: number | undefined;
      let removeHover: (() => void) | undefined;
      let touchMoveTarget: HTMLElement | undefined;
      let resizeHandler: (() => void) | undefined;

      const clock = new THREE.Clock();

      const light = setLighting(scene);
      const { loadCharacter } = setCharacter(renderer, scene, camera);

      loadCharacter().then((gltf) => {
        if (disposed) return;
        if (gltf) {
          const animations = setAnimations(gltf);
          if (hoverDivRef.current) {
            removeHover = animations.hover(gltf, hoverDivRef.current);
          }
          mixer = animations.mixer;
          const character = gltf.scene;
          loadedCharacter = character;
          const initialCharacterRotation = character.rotation.clone();
          scene.add(character);
          setCharTimeline(character, camera);
          setAllTimeline();
          headBone = character.getObjectByName("spine006") || null;
          const screenLightObject = character.getObjectByName("screenlight");
          if (screenLightObject instanceof THREE.Mesh) {
            screenLight = Array.isArray(screenLightObject.material)
              ? screenLightObject.material.find(
                  (material): material is THREE.MeshStandardMaterial =>
                    material instanceof THREE.MeshStandardMaterial
                ) || null
              : screenLightObject.material instanceof
                  THREE.MeshStandardMaterial
                ? screenLightObject.material
                : null;
          }
          progress.loaded().then(() => {
            introTimer = window.setTimeout(() => {
              if (disposed) return;
              light.turnOnLights();
              animations.startIntro();
            }, 2500);
          });
          resizeHandler = () => {
            clearCharacterTimeline(character);
            gsap.set(
              [
                ".landing-container",
                ".about-section",
                ".about-me",
                ".character-model",
                ".whatIDO",
                ".what-box-in",
                ".character-rim",
              ],
              { clearProps: "all" }
            );
            camera.position.copy(initialCameraPosition);
            camera.zoom = 1.1;
            camera.updateProjectionMatrix();
            character.rotation.copy(initialCharacterRotation);
            handleResize(renderer, camera, canvasDiv, character);
          };
          window.addEventListener("resize", resizeHandler);
        }
      }).catch((error: unknown) => {
        if (disposed) return;
        console.error("Unable to initialize the 3D character:", error);
        progress.clear();
      });

      let mouse = { x: 0, y: 0 },
        interpolation = { x: 0.1, y: 0.2 };

      const onMouseMove = (event: MouseEvent) => {
        handleMouseMove(event, (x, y) => (mouse = { x, y }));
      };
      const onTouchStart = (event: TouchEvent) => {
        const element = event.target as HTMLElement;
        debounce = window.setTimeout(() => {
          touchMoveTarget = element;
          touchMoveTarget.addEventListener("touchmove", onTouchMove);
        }, 200);
      };
      const onTouchMove = (event: TouchEvent) => {
        handleTouchMove(event, (x, y) => (mouse = { x, y }));
      };

      const onTouchEnd = () => {
        window.clearTimeout(debounce);
        touchMoveTarget?.removeEventListener("touchmove", onTouchMove);
        touchMoveTarget = undefined;
        handleTouchEnd((x, y, interpolationX, interpolationY) => {
          mouse = { x, y };
          interpolation = { x: interpolationX, y: interpolationY };
        });
      };

      document.addEventListener("mousemove", onMouseMove);
      const landingDiv = document.getElementById("landingDiv");
      if (landingDiv) {
        landingDiv.addEventListener("touchstart", onTouchStart);
        landingDiv.addEventListener("touchend", onTouchEnd);
      }
      const animate = () => {
        animationFrame = requestAnimationFrame(animate);
        if (headBone) {
          handleHeadRotation(
            headBone,
            mouse.x,
            mouse.y,
            interpolation.x,
            interpolation.y,
            THREE.MathUtils.lerp
          );
          light.setPointLight(screenLight);
        }
        const delta = clock.getDelta();
        if (mixer) {
          mixer.update(delta);
        }
        renderer.render(scene, camera);
      };
      animationFrame = requestAnimationFrame(animate);
      return () => {
        disposed = true;
        cancelAnimationFrame(animationFrame);
        window.clearTimeout(debounce);
        window.clearTimeout(introTimer);
        progress.stop();
        removeHover?.();
        if (loadedCharacter) clearCharacterTimeline(loadedCharacter);
        clearAllTimeline();
        if (resizeHandler) window.removeEventListener("resize", resizeHandler);
        document.removeEventListener("mousemove", onMouseMove);
        touchMoveTarget?.removeEventListener("touchmove", onTouchMove);
        mixer?.stopAllAction();
        scene.clear();
        renderer.dispose();
        renderer.forceContextLoss();
        if (canvasElement.contains(renderer.domElement)) {
          canvasElement.removeChild(renderer.domElement);
        }
        if (landingDiv) {
          landingDiv.removeEventListener("touchstart", onTouchStart);
          landingDiv.removeEventListener("touchend", onTouchEnd);
        }
      };
    }
  }, [setLoading]);

  return (
    <>
      <div className="character-container">
        <div className="character-model" ref={canvasDiv}>
          <div className="character-rim"></div>
          <div className="character-hover" ref={hoverDivRef}></div>
        </div>
      </div>
    </>
  );
};

export default Scene;
