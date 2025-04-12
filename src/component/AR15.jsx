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

function AR15({ onObjectClick = () => {} }) {
   console.log('AR15.jsx loaded')
   const ar15 = useGLTF('./models/glb/ar15_x10.glb')
   const modelRef = useRef();
   const [modelDimensions, setModelDimensions] = useState(null);
   const [selectedObject, setSelectedObject] = useState(null);
   
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
       
       // Make each part of the model selectable
       modelRef.current.traverse((child) => {
         if (child.isMesh) {
           // Make sure each mesh has a name
           if (!child.name) {
             child.name = `Part_${Math.random().toString(36).substr(2, 9)}`;
           }
           
           // Ensure geometry has a bounding box
           if (!child.geometry.boundingBox) {
             child.geometry.computeBoundingBox();
           }
           
           // Store original material color
           child.userData.originalColor = child.material.color.clone();
           
           // Make clickable
           child.userData.selectable = true;
         }
       });
     }
   }, [ar15.scene]);
   
   const handleClick = (event) => {
     event.stopPropagation();
     
     // If click didn't hit a mesh, do nothing
     if (!event.object || !event.object.isMesh) return;
     
     // Reset previous selection if any
     if (selectedObject) {
       if (Array.isArray(selectedObject.material)) {
         selectedObject.material.forEach(mat => {
           mat.emissive = new THREE.Color(0x000000);
         });
       } else {
         selectedObject.material.emissive = new THREE.Color(0x000000);
       }
     }
     
     // Select new object
     setSelectedObject(event.object);
     
     // Highlight selected object
     if (Array.isArray(event.object.material)) {
       event.object.material.forEach(mat => {
         mat.emissive = new THREE.Color(0x555555);
       });
     } else {
       event.object.material.emissive = new THREE.Color(0x555555);
     }
     
     // Prepare object info for sidebar
     const boundingBox = event.object.geometry.boundingBox;
     const dimensions = boundingBox ? {
       width: boundingBox.max.x - boundingBox.min.x,
       height: boundingBox.max.y - boundingBox.min.y,
       depth: boundingBox.max.z - boundingBox.min.z
     } : { width: 'N/A', height: 'N/A', depth: 'N/A' };
     
     // Send data to sidebar
     onObjectClick({
       name: event.object.name,
       type: event.object.type,
       position: [
         event.object.position.x.toFixed(2),
         event.object.position.y.toFixed(2),
         event.object.position.z.toFixed(2)
       ],
       dimensions
     });
   };
   
   return(
      <>
         <primitive 
            ref={modelRef}
            object={ar15.scene} 
            scale={1} 
            position={[0, 0, 0]} 
            onClick={handleClick}
         />

         {/* <Box /> */}
      </>
   )
}
export default AR15;
