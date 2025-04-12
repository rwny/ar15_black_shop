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
   const [selectedObject, setSelectedObject] = useState(null);
   
   // Light blue highlight color for selected objects
   const HIGHLIGHT_COLOR = new THREE.Color(0x0000ff);
   
   useEffect(() => {
     if (modelRef.current) {
       // Set all materials to be double-sided
       modelRef.current.traverse((child) => {
         if (child.isMesh && child.material) {
           // Handle both single material and material array cases
           if (Array.isArray(child.material)) {
             child.material = child.material.map(mat => {
               const clonedMat = mat.clone();
               clonedMat.side = THREE.DoubleSide;
               clonedMat.needsUpdate = true;
               return clonedMat;
             });
           } else {
             child.material = child.material.clone();
             child.material.side = THREE.DoubleSide;
             child.material.needsUpdate = true;
           }
           
           // Enable shadows
           child.castShadow = true;
           child.receiveShadow = true;
           
           // Make sure each mesh has a name
           if (!child.name) {
             child.name = `Part_${Math.random().toString(36).substr(2, 9)}`;
           }
           
           // Make clickable
           child.userData.selectable = true;
         }
       });
       
       console.log("All materials set to double-sided");
     }
   }, [ar15.scene]);
   
   const handleClick = (event) => {
     // Stop propagation to prevent multiple objects from being selected
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
     
     // If clicking on the same object, deselect it
     if (selectedObject === event.object) {
       setSelectedObject(null);
       onObjectClick(null);
       return;
     }
     
     // Select new object
     setSelectedObject(event.object);
     
     // Highlight only the selected object with light blue
     if (Array.isArray(event.object.material)) {
       event.object.material.forEach(mat => {
         mat.emissive = HIGHLIGHT_COLOR;
       });
     } else {
       event.object.material.emissive = HIGHLIGHT_COLOR;
     }
     
     // Here we're not doing any camera manipulation
     // The zooming behavior is likely controlled elsewhere
     
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
