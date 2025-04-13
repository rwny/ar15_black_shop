import * as THREE from "three";
//01
/**
 * Deeply inspects an object and converts it to a serializable format,
 * handling THREE.js objects and preventing circular references
 * 
 * @param {Object} obj - The object to inspect
 * @param {number} depth - Current recursion depth
 * @param {number} maxDepth - Maximum recursion depth
 * @returns {Object} A simplified, serializable representation of the object
 */
export const inspectObject = (obj, depth = 0, maxDepth = 3) => {
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

/**
 * Extract IFC information from an object
 * 
 * @param {Object} obj - The object to extract IFC info from
 * @returns {Object} Extracted IFC information
 */
export const extractIFCInformation = (obj) => {
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

export default {
  inspectObject,
  extractIFCInformation
};
