import * as THREE from "three";
import gsap from "gsap";

const characterAnimations = new WeakMap<
  THREE.Object3D,
  gsap.core.Animation[]
>();
let careerTimeline: gsap.core.Timeline | undefined;

export function clearCharacterTimeline(character: THREE.Object3D) {
  characterAnimations.get(character)?.forEach((animation) => {
    (animation as gsap.core.Tween).scrollTrigger?.kill();
    animation.kill();
  });
  characterAnimations.delete(character);
}

export function setCharTimeline(
  character: THREE.Object3D<THREE.Object3DEventMap> | null,
  camera: THREE.PerspectiveCamera
) {
  if (character) {
    clearCharacterTimeline(character);
  }
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
  const createdAnimations: gsap.core.Animation[] = [];
  const tl1 = gsap.timeline({
    scrollTrigger: {
      trigger: ".landing-section",
      start: "top top",
      end: "bottom top",
      scrub: true,
      invalidateOnRefresh: true,
    },
  });
  const tl2 = gsap.timeline({
    scrollTrigger: {
      trigger: ".about-section",
      start: "center 55%",
      end: "bottom top",
      scrub: true,
      invalidateOnRefresh: true,
    },
  });
  const tl3 = gsap.timeline({
    scrollTrigger: {
      trigger: ".whatIDO",
      start: "top top",
      end: "bottom top",
      scrub: true,
      invalidateOnRefresh: true,
    },
  });
  createdAnimations.push(tl1, tl2, tl3);
  let screenLight: THREE.MeshStandardMaterial | undefined;
  let monitor: THREE.Mesh | undefined;
  let monitorMaterial: THREE.MeshStandardMaterial | undefined;
  character?.children.forEach((object) => {
    if (object.name === "Plane004") {
      object.children.forEach((child) => {
        if (child instanceof THREE.Mesh) {
          const materials = Array.isArray(child.material)
            ? child.material
            : [child.material];
          materials.forEach((material) => {
            if (material instanceof THREE.MeshStandardMaterial) {
              material.transparent = true;
              material.opacity = 0;
              if (material.name === "Material.027") {
                monitor = child;
                monitorMaterial = material;
                material.color.set("#FFFFFF");
              }
            }
          });
        }
      });
    }
    if (object.name === "screenlight" && object instanceof THREE.Mesh) {
      const material = Array.isArray(object.material)
        ? object.material.find(
            (item): item is THREE.MeshStandardMaterial =>
              item instanceof THREE.MeshStandardMaterial
          )
        : object.material instanceof THREE.MeshStandardMaterial
          ? object.material
          : undefined;
      if (material) {
        material.transparent = true;
        material.opacity = 0;
        material.emissive.set("#C8BFFF");
        material.emissiveIntensity = 0.8;
        screenLight = material;
      }
    }
  });
  const neckBone = character?.getObjectByName("spine005");
  if (window.innerWidth > 1024) {
    if (character && neckBone && monitor && monitorMaterial && screenLight) {
      tl1
        .fromTo(character.rotation, { y: 0 }, { y: 0.7, duration: 1 }, 0)
        .to(camera.position, { z: 22 }, 0)
        .fromTo(".character-model", { x: 0 }, { x: "-25%", duration: 1 }, 0)
        .to(".landing-container", { opacity: 0, duration: 0.4 }, 0)
        .to(".landing-container", { y: "40%", duration: 0.8 }, 0)
        .fromTo(".about-me", { y: "-50%" }, { y: "0%" }, 0);

      tl2
        .to(
          camera.position,
          { z: 75, y: 8.4, duration: 6, delay: 2, ease: "power3.inOut" },
          0
        )
        .to(".about-section", { y: "30%", duration: 6 }, 0)
        .to(".about-section", { opacity: 0, delay: 3, duration: 2 }, 0)
        .fromTo(
          ".character-model",
          { pointerEvents: "inherit" },
          { pointerEvents: "none", x: "-12%", delay: 2, duration: 5 },
          0
        )
        .to(character.rotation, { y: 0.92, x: 0.12, delay: 3, duration: 3 }, 0)
        .to(neckBone!.rotation, { x: 0.6, delay: 2, duration: 3 }, 0)
        .to(monitorMaterial, { opacity: 1, duration: 0.8, delay: 3.2 }, 0)
        .to(screenLight, { opacity: 1, duration: 0.8, delay: 4.5 }, 0)
        .fromTo(
          ".what-box-in",
          { display: "none" },
          { display: "flex", duration: 0.1, delay: 6 },
          0
        )
        .fromTo(
          monitor.position,
          { y: -10, z: 2 },
          { y: 0, z: 0, delay: 1.5, duration: 3 },
          0
        )
        .fromTo(
          ".character-rim",
          { opacity: 1, scaleX: 1.4 },
          { opacity: 0, scale: 0, y: "-70%", duration: 5, delay: 2 },
          0.3
        );

      tl3
        .fromTo(
          ".character-model",
          { y: "0%" },
          { y: "-100%", duration: 4, ease: "none", delay: 1 },
          0
        )
        .fromTo(".whatIDO", { y: 0 }, { y: "15%", duration: 2 }, 0)
        .to(character.rotation, { x: -0.04, duration: 2, delay: 1 }, 0);
    }
  } else {
    if (character) {
      const tM2 = gsap.timeline({
        scrollTrigger: {
          trigger: ".what-box-in",
          start: "top 70%",
          end: "bottom top",
        },
      });
      createdAnimations.push(tM2);
      tM2.to(".what-box-in", { display: "flex", duration: 0.1, delay: 0 }, 0);
    }
  }
  if (character) characterAnimations.set(character, createdAnimations);
}

export function setAllTimeline() {
  careerTimeline?.scrollTrigger?.kill();
  careerTimeline?.kill();
  careerTimeline = gsap.timeline({
    scrollTrigger: {
      trigger: ".career-section",
      start: "top 30%",
      end: "100% center",
      scrub: true,
      invalidateOnRefresh: true,
    },
  });
  careerTimeline
    .fromTo(
      ".career-timeline",
      { maxHeight: "10%" },
      { maxHeight: "100%", duration: 0.5 },
      0
    )

    .fromTo(
      ".career-timeline",
      { opacity: 0 },
      { opacity: 1, duration: 0.1 },
      0
    )
    .fromTo(
      ".career-info-box",
      { opacity: 0 },
      { opacity: 1, stagger: 0.1, duration: 0.5 },
      0
    )
    .fromTo(
      ".career-dot",
      { animationIterationCount: "infinite" },
      {
        animationIterationCount: "1",
        delay: 0.3,
        duration: 0.1,
      },
      0
    );

  if (window.innerWidth > 1024) {
    careerTimeline.fromTo(
      ".career-section",
      { y: 0 },
      { y: "20%", duration: 0.5, delay: 0.2 },
      0
    );
  } else {
    careerTimeline.fromTo(
      ".career-section",
      { y: 0 },
      { y: 0, duration: 0.5, delay: 0.2 },
      0
    );
  }
}

export function clearAllTimeline() {
  careerTimeline?.scrollTrigger?.kill();
  careerTimeline?.kill();
  careerTimeline = undefined;
}
