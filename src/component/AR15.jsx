// load ar12 glb model or ifc
import { useGLTF } from "@react-three/drei";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { inspectObject, extractIFCInformation } from "../utils/objectUtils";

function AR15({ onObjectClick = () => {} }) {
   console.log('AR15.jsx loaded')
   const ar15 = useGLTF('./models/glb/ar15_x12.glb')
   const modelRef = useRef();
   const [selectedObject, setSelectedObject] = useState(null);
   
   // Define material colors
   const DEFAULT_COLOR = new THREE.Color(0xf0ffff);  // Green default color
   const HIGHLIGHT_COLOR = new THREE.Color(0xffa07a); // Highlight color (salmon)
   
   // Store original materials for future use
   const [originalMaterials, setOriginalMaterials] = useState({});
   
   useEffect(() => {
     if (modelRef.current) {
       // 1. Store original materials
       const origMaterials = {};
       
       modelRef.current.traverse((child) => {
         if (child.isMesh && child.material) {
           // Save reference to original material
           if (Array.isArray(child.material)) {
             origMaterials[child.uuid] = child.material.map(mat => mat.clone());
           } else {
             origMaterials[child.uuid] = child.material.clone();
           }
           
           // 2. Create new default material
           if (Array.isArray(child.material)) {
             child.material = child.material.map(mat => {
               const newMat = mat.clone();
               newMat.color = DEFAULT_COLOR.clone();
               newMat.side = THREE.DoubleSide;
               newMat.needsUpdate = true;
               return newMat;
             });
           } else {
             child.material = child.material.clone();
             child.material.color = DEFAULT_COLOR.clone();
             child.material.side = THREE.DoubleSide;
             child.material.needsUpdate = true;
           }
           
           // Enable shadows
           child.castShadow = true;
           child.receiveShadow = true;
           
           // Set name if needed
           if (!child.name) {
             child.name = `Part_${Math.random().toString(36).substr(2, 9)}`;
           }
           
           // Make clickable
           child.userData.selectable = true;
         }
       });
       
       // Store original materials
       setOriginalMaterials(origMaterials);
       console.log("Original materials stored:", origMaterials);
       
       // Log the full model structure and search for IFC data
       console.log("Full GLB model structure:", modelRef.current);
       console.log("Searching for IFC data...");
       
       // Look for IFC properties in userData or custom properties
       let ifcDataFound = false;
       modelRef.current.traverse((node) => {
         if (node.userData && Object.keys(node.userData).length > 0) {
           // Check for IFC data in userData
           if (node.userData.ifcData || 
               node.userData.IFC || 
               node.userData.properties || 
               node.name.includes('IFC')) {
             console.log(`IFC data found in node: ${node.name}`, inspectObject(node.userData));
             ifcDataFound = true;
           }
         }
       });
       
       if (!ifcDataFound) {
         console.log("No explicit IFC data found in the model");
       }
     }
   }, [ar15.scene]);
   
   const handleClick = (event) => {
     // Stop propagation to prevent multiple objects from being selected
     event.stopPropagation();
     
     // If click didn't hit a mesh, do nothing
     if (!event.object || !event.object.isMesh) return;
     
     console.log("====== CLICKED OBJECT ANALYSIS ======");
     
     // Log detailed information about clicked object
     console.log("Clicked object:", event.object);
     console.log("Object name:", event.object.name);
     console.log("Object type:", event.object.type);
     console.log("Object UUID:", event.object.uuid);
     
     // Extract IFC info from clicked object
     const ifcInfo = extractIFCInformation(event.object);
     console.log("Extracted IFC information:", ifcInfo);

     // Recursively check parent objects for IFC data
     console.log("====== CHECKING PARENT HIERARCHY FOR IFC DATA ======");
     let parent = event.object.parent;
     let depth = 0;
     let fullHierarchyData = [];
     
     while (parent && depth < 1) {
       console.log(`Level ${depth} parent:`, parent.name);
       const parentIfcInfo = extractIFCInformation(parent);
       console.log(`Parent IFC Info: `, parentIfcInfo);
       fullHierarchyData.push(parentIfcInfo);
       parent = parent.parent;
       depth++;
     }
     
     // Reset previous selection if any (restore default color)
     if (selectedObject) {
       if (Array.isArray(selectedObject.material)) {
         selectedObject.material.forEach(mat => {
           mat.color.copy(DEFAULT_COLOR);
           mat.needsUpdate = true;
         });
       } else {
         selectedObject.material.color.copy(DEFAULT_COLOR);
         selectedObject.material.needsUpdate = true;
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
     
     // 3. Apply highlight material to selected object
     if (Array.isArray(event.object.material)) {
       event.object.material.forEach(mat => {
         mat.color.copy(HIGHLIGHT_COLOR);
         mat.needsUpdate = true;
       });
     } else {
       event.object.material.color.copy(HIGHLIGHT_COLOR);
       event.object.material.needsUpdate = true;
     }
     
     // Prepare object info for sidebar
     const boundingBox = event.object.geometry.boundingBox;
     const dimensions = boundingBox ? {
       width: boundingBox.max.x - boundingBox.min.x,
       height: boundingBox.max.y - boundingBox.min.y,
       depth: boundingBox.max.z - boundingBox.min.z
     } : { width: 'N/A', height: 'N/A', depth: 'N/A' };
     
     // Build the object hierarchy - use a different variable name to avoid conflict
     let currentNode = event.object;
     const hierarchy = [];
     let hierarchyDepth = 0; // Changed variable name from 'depth' to 'hierarchyDepth'
     
     while (currentNode && hierarchyDepth < 10) { // Limit depth to prevent infinite loops
       hierarchy.unshift({
         name: currentNode.name,
         type: currentNode.type,
         uuid: currentNode.uuid
       });
       currentNode = currentNode.parent;
       hierarchyDepth++;
     }
     
     // Enhance the data sent to sidebar with the IFC information
     const ifcData = {
       type: ifcInfo.type,
       dimensions: ifcInfo.dimensions,
       properties: ifcInfo.properties,
       hierarchy: fullHierarchyData
     };
     
     // Send data to sidebar
     onObjectClick({
       name: event.object.name,
       type: event.object.type,
       position: [
         event.object.position.x.toFixed(2),
         event.object.position.y.toFixed(2),
         event.object.position.z.toFixed(2)
       ],
       dimensions,
       hierarchy // Add the hierarchy data
     }, 
     // Send enhanced IFC data to sidebar
     ifcData);
   };
   
   return(
      <>
         <primitive 
            ref={modelRef}
            object={ar15.scene} 
            scale={1} 
            position={[0, 0, 0]} 
            onClick={handleClick}
            castShadow={true}
            receiveShadow={true}
         />
      </>
   )
}
export default AR15;