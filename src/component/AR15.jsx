// load ar12 glb model or ifc

import { useGLTF } from "@react-three/drei";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

function Box() {
   return (
      <mesh>
         <boxGeometry args={[1, 1, 1]} />
         <meshStandardMaterial color="orange" />
      </mesh>
   )
}

// Function to calculate the bounding box and center the model
function getBoundingBox(object) {
  const boundingBox = new THREE.Box3().setFromObject(object);
  const size = new THREE.Vector3();
  boundingBox.getSize(size);
  const center = new THREE.Vector3();
  boundingBox.getCenter(center);
  
  // Calculate position adjustment to place the bottom-center at origin
  const positionAdjustment = new THREE.Vector3(
    -center.x,
    -boundingBox.min.y, // This will align the bottom to y=0
    -center.z
  );
  
  // Set all materials to be double-sided
  object.traverse((child) => {
    if (child.isMesh && child.material) {
      // Handle both single material and material array cases
      if (Array.isArray(child.material)) {
        child.material.forEach(material => {
          material.side = THREE.DoubleSide;
        });
      } else {
        child.material.side = THREE.DoubleSide;
      }
      
      // Enable shadows
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
  
  return {
    boundingBox,
    size,
    center,
    positionAdjustment
  };
}

function AR15() {
   console.log('AR15.jsx loaded')
   const ar15 = useGLTF('./models/glb/ar15_x10.glb')
   const modelRef = useRef();
   const [modelDimensions, setModelDimensions] = useState(null);
   
   useEffect(() => {
     if (modelRef.current) {
       const { size, positionAdjustment } = getBoundingBox(modelRef.current);
       
       // Apply position adjustment to center-bottom the model
       modelRef.current.position.set(
         positionAdjustment.x,
         positionAdjustment.y,
         positionAdjustment.z
       );
       
       setModelDimensions({
         width: size.x,
         height: size.y,
         depth: size.z
       });
       
       console.log("Model dimensions:", size);
       console.log("Position adjustment:", positionAdjustment);
     }
   }, [ar15.scene]);
   
   console.log(ar15)
   return(
      <>
         <primitive 
            ref={modelRef}
            object={ar15.scene} 
            scale={1} 
            position={[0, 0, 0]} 
         />

         {/* <Box /> */}
      </>
   )
}
export default AR15;
