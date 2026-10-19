import * as THREE from "three";
import { DRACOLoader, GLTF, GLTFLoader } from "three-stdlib";
import { decryptFile } from "./decrypt";

const setCharacter = (
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera
) => {
  const loader = new GLTFLoader();
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath("/draco/");
  loader.setDRACOLoader(dracoLoader);

  const loadCharacter = async (): Promise<GLTF> => {
    let blobUrl: string | undefined;
    try {
      const encryptedBlob = await decryptFile(
        "/models/character.enc",
        "Character3D#@"
      );
      const modelUrl = URL.createObjectURL(new Blob([encryptedBlob]));
      blobUrl = modelUrl;

      return await new Promise<GLTF>((resolve, reject) => {
        loader.load(
          modelUrl,
          (gltf) => {
            void (async () => {
              try {
                await renderer.compileAsync(gltf.scene, camera, scene);
                gltf.scene.traverse((child) => {
                  if (child instanceof THREE.Mesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                    child.frustumCulled = true;
                  }
                });
                const rightFoot = gltf.scene.getObjectByName("footR");
                const leftFoot = gltf.scene.getObjectByName("footL");
                if (rightFoot) rightFoot.position.y = 3.36;
                if (leftFoot) leftFoot.position.y = 3.36;
                resolve(gltf);
              } catch (error) {
                reject(error);
              }
            })();
          },
          undefined,
          reject
        );
      });
    } finally {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
      dracoLoader.dispose();
    }
  };

  return { loadCharacter };
};

export default setCharacter;
