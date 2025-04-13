import * as THREE from "three";

/**
 * Creates a grid helper positioned on a floor/slab mesh
 * @param {THREE.Mesh} floorMesh - The floor/slab mesh to place grid on
 * @param {Object} options - Grid options
 * @returns {THREE.GridHelper} The created grid helper
 */
export const createFloorGrid = (floorMesh, options = {}) => {
  const {
    color = 0x708090,
    secondaryColor = 0x708090,
    size = 0,
    divisions = 10,
    offset = -0.01,
  } = options;
  
  // Compute bounding box if not already computed
  if (!floorMesh.geometry.boundingBox) {
    floorMesh.geometry.computeBoundingBox();
  }
  
  const bbox = floorMesh.geometry.boundingBox;
  // Calculate width and depth correctly
  const width = bbox.max.x - bbox.min.x;
  const depth = bbox.max.z - bbox.min.z;
  
  // Use provided size or calculate based on floor dimensions
  const gridSize = size > 0 ? size : Math.max(width, depth) + 10;
  
  // Create grid helper
  const grid = new THREE.GridHelper(
    gridSize,
    divisions,
    color,
    secondaryColor
  );
  
  // Position grid at floor center with slight y-offset to prevent z-fighting
  grid.position.x = (bbox.max.x + bbox.min.x) / 2;
  grid.position.z = (bbox.max.z + bbox.min.z) / 2;
  grid.position.y = offset;
  
  return grid;
};

/**
 * Adds grids to floor/slab objects in a model
 * @param {THREE.Object3D} model - The model to search for floors
 * @param {Object} options - Grid options
 * @returns {Array} Array of added grid helpers
 */
export const addGridsToFloors = (model, options = {}) => {
  const grids = [];
  
  if (!model) return grids;
  
  model.traverse((child) => {
    if (child.isMesh && 
       (child.name.includes('IfcSlab') || 
        child.name.toLowerCase().includes('floor'))) {
      const grid = createFloorGrid(child, options);
      model.add(grid);
      grids.push(grid);
    }
  });
  
  return grids;
};

export default {
  createFloorGrid,
  addGridsToFloors
};
