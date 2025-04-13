// load ar12 glb model or ifc

import { useGLTF } from "@react-three/drei";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";


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
   const ar15 = useGLTF('./models/glb/ar15_x12.glb')
   const modelRef = useRef();
   const [selectedObject, setSelectedObject] = useState(null);
   // Store original materials for future use
   const [originalGlbMaterials, setOriginalGlbMaterials] = useState({});
   
   // Highlight color for selected objects (bright red)
   const HIGHLIGHT_COLOR = new THREE.Color(0xffa07a);
   
   // Function to deeply inspect an object
   const inspectObject = (obj, depth = 0, maxDepth = 3) => {
     if (depth > maxDepth) return "Max depth reached";
     
     const result = {};
     
     // Skip certain properties that cause circular references
     const skipProps = ['parent', 'children', 'geometry', 'material'];
     
     for (let key in obj) {
       if (!obj.hasOwnProperty(key)) continue;
       if (skipProps.includes(key)) continue;
       if (key.startsWith('_')) continue;
       
       const value = obj[key];
       
       if (value === null || value === undefined) {
         result[key] = value;
       }
       else if (typeof value === 'function') {
         result[key] = 'function';
       }
       else if (typeof value === 'object') {
         if (value instanceof THREE.Vector3) {
           result[key] = `Vector3(${value.x}, ${value.y}, ${value.z})`;
         }
         else if (value instanceof THREE.Color) {
           result[key] = `Color(${value.r}, ${value.g}, ${value.b})`;
         }
         else if (value instanceof THREE.Quaternion) {
           result[key] = `Quaternion(${value.x}, ${value.y}, ${value.z}, ${value.w})`;
         }
         else if (depth < maxDepth) {
           result[key] = inspectObject(value, depth + 1, maxDepth);
         }
         else {
           result[key] = "Object...";
         }
       }
       else {
         result[key] = value;
       }
     }
     
     return result;
   };
   
   useEffect(() => {
     if (modelRef.current) {
       // Set all materials to be double-sided
       const materialsMap = {};
       
       modelRef.current.traverse((child) => {
         if (child.isMesh && child.material) {
           // Store original materials before modifying them
           if (Array.isArray(child.material)) {
             materialsMap[child.uuid] = child.material.map(mat => {
               const clone = mat.clone();
               // Store the original color in the material's userData
               clone.userData = {...clone.userData, originalColor: clone.color.clone()};
               return clone;
             });
           } else {
             const clone = child.material.clone();
             // Store the original color in the material's userData
             clone.userData = {...clone.userData, originalColor: clone.color.clone()};
             materialsMap[child.uuid] = clone;
           }
           
           // Handle both single material and material array cases
           if (Array.isArray(child.material)) {
             child.material = child.material.map(mat => {
               const clonedMat = mat.clone();
               clonedMat.side = THREE.DoubleSide;
               clonedMat.shadowSide = THREE.BackSide; // Improve shadow quality
               clonedMat.needsUpdate = true;
               return clonedMat;
             });
           } else {
             child.material = child.material.clone();
             child.material.side = THREE.DoubleSide;
             child.material.shadowSide = THREE.BackSide; // Improve shadow quality
             child.material.needsUpdate = true;
           }
           
           // Enable shadows with higher quality settings
           child.castShadow = true;
           child.receiveShadow = true;
           
           // Improve shadow map quality for this object
           if (child.geometry) {
             child.geometry.computeVertexNormals(); // Ensure normals are correct for lighting
           }
           
           // Make sure each mesh has a name
           if (!child.name) {
             child.name = `Part_${Math.random().toString(36).substr(2, 9)}`;
           }
           
           // Make clickable
           child.userData.selectable = true;
         }
       });
       
       // Store the original materials
       setOriginalGlbMaterials(materialsMap);
       console.log("Original materials stored:", materialsMap);
       console.log("All materials set to double-sided");
       
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
     
     // Deep search for IFC metadata in the object name or userData
     const extractIFCInformation = (obj) => {
       const ifcInfo = {
         name: obj.name,
         type: null,
         dimensions: null,
         properties: {}
       };
       
       // Check if name contains IFC type information
       const nameMatch = obj.name.match(/Ifc(\w+)/);
       if (nameMatch) {
         ifcInfo.type = nameMatch[0]; // Store the IFC type from name
       }
       
       // Look for dimensions in name (common format like 200x600)
       const dimensionMatch = obj.name.match(/(\d+)x(\d+)/);
       if (dimensionMatch) {
         ifcInfo.dimensions = {
           width: parseInt(dimensionMatch[1]),
           height: parseInt(dimensionMatch[2])
         };
       }
       
       // Check userData for properties
       if (obj.userData) {
         if (obj.userData.ifcData) ifcInfo.properties = obj.userData.ifcData;
         if (obj.userData.IFC) ifcInfo.properties = obj.userData.IFC;
         if (obj.userData.properties) ifcInfo.properties = obj.userData.properties;
       }
       
       return ifcInfo;
     };
     
     // Extract IFC info from clicked object
     const ifcInfo = extractIFCInformation(event.object);
     console.log("Extracted IFC information:", ifcInfo);

     // Recursively check parent objects for IFC data
     console.log("====== CHECKING PARENT HIERARCHY FOR IFC DATA ======");
     let parent = event.object.parent;
     let depth = 0;
     let fullHierarchyData = [];
     
     while (parent && depth < 5) {
       console.log(`Level ${depth} parent:`, parent.name);
       const parentIfcInfo = extractIFCInformation(parent);
       console.log(`Parent IFC Info: `, parentIfcInfo);
       fullHierarchyData.push(parentIfcInfo);
       parent = parent.parent;
       depth++;
     }

     // Search through property scene graph for IFC type data (like BeamType)
     console.log("====== SEARCHING THE ENTIRE SCENE FOR IFC BEAM TYPE ======");
     let ifcBeamTypeFound = false;
     ar15.scenes.forEach(scene => {
       scene.traverse(node => {
         if (node.name && (node.name.includes("BeamType") || node.name.includes("BR 200x600"))) {
           console.log("Found IFC Beam Type node:", node);
           ifcBeamTypeFound = true;
           if (node.userData) {
             console.log("IFC Beam Type userData:", inspectObject(node.userData));
           }
         }
       });
     });
     
     if (!ifcBeamTypeFound) {
       console.log("No explicit IFC BeamType found in scene traversal");
       
       // Try searching in raw parsed data
       console.log("Looking in raw GLB data");
       if (ar15.parser && ar15.parser.json) {
         const searchForBeamTypeInJson = (obj, path = "") => {
           if (typeof obj !== "object" || obj === null) return;
           
           // Check if this object has a name property containing BeamType
           if (obj.name && (obj.name.includes("BeamType") || obj.name.includes("BR 200x600"))) {
             console.log(`Found BeamType reference at path ${path}:`, obj);
           }
           
           // Recurse into object properties
           Object.keys(obj).forEach(key => {
             searchForBeamTypeInJson(obj[key], `${path}.${key}`);
           });
         };
         
         searchForBeamTypeInJson(ar15.parser.json, "parser.json");
       }
     }
     
     // Reset previous selection if any
     if (selectedObject) {
       if (Array.isArray(selectedObject.material)) {
         selectedObject.material.forEach(mat => {
           // Restore original color instead of using emissive
           if (mat.userData && mat.userData.originalColor) {
             mat.color.copy(mat.userData.originalColor);
           }
           mat.needsUpdate = true;
         });
       } else {
         // Restore original color instead of using emissive
         if (selectedObject.material.userData && selectedObject.material.userData.originalColor) {
           selectedObject.material.color.copy(selectedObject.material.userData.originalColor);
         }
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
     
     // Highlight selected object by changing its color (not emissive)
     if (Array.isArray(event.object.material)) {
       event.object.material.forEach(mat => {
         // Store original color if not already stored
         if (!mat.userData) mat.userData = {};
         if (!mat.userData.originalColor) {
           mat.userData.originalColor = mat.color.clone();
         }
         mat.color.set(HIGHLIGHT_COLOR);
         mat.needsUpdate = true;
       });
     } else {
       // Store original color if not already stored
       if (!event.object.material.userData) event.object.material.userData = {};
       if (!event.object.material.userData.originalColor) {
         event.object.material.userData.originalColor = event.object.material.color.clone();
       }
       event.object.material.color.set(HIGHLIGHT_COLOR);
       event.object.material.needsUpdate = true;
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

         {/* <Box /> */}
      </>
   )
}
export default AR15;
