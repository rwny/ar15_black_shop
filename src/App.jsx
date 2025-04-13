import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stage, ContactShadows } from "@react-three/drei";
import { useState } from "react";
import * as THREE from "three";
import "./styles.css";

import AR15 from "./component/AR15";
import Sidebar from "./component/Sidebar";

function App() {
  const [selectedObjectInfo, setSelectedObjectInfo] = useState(null);
  const [ifcData, setIfcData] = useState(null);

  const handleObjectClick = (objectInfo, ifc = null) => {
    setSelectedObjectInfo(objectInfo);
    setIfcData(ifc);
  };

  return (
    <div className="app-container">
      <div className="canvas-container">
        <Canvas 
         shadows 
         camera={{ position: [-25,10,25], fov: 50 }}
         gl={{ 
           antialias: true,
           shadowMap: true,
           shadowMapType: THREE.PCFSoftShadowMap
         }}
         >

          <color attach="background" args={["steelblue"]} />

          <ambientLight intensity={0.4} />
          
          <Stage 
            environment="city" 
            intensity={0.5} 
            adjustCamera={false}
            preset="rembrandt"
            // Disable Stage's built-in shadows to avoid conflicts
            // contactShadow={false}  
            // shadows={false}  
          >
            <AR15 onObjectClick={handleObjectClick} />
          </Stage>
          
          {/* Restore the contact shadows with better settings */}
          <ContactShadows 
            position={[0, -0.001, 0]}  // Just barely below the floor
            opacity={0.5}             
            scale={40} 
            blur={3}                 
            far={3}                  
            resolution={512}          // Higher resolution for better quality
            color="#000000"           // Pure black shadows
            frames={1}                // Static shadows (no animation)
          />
          
          {/* Check if there are any clipping planes being applied */}
          <OrbitControls 
            makeDefault
            minPolarAngle={Math.PI/10}
            maxPolarAngle={Math.PI*0.75}
            enableZoom={true}
            zoomSpeed={1.2}
            enablePan={true}
            panSpeed={1.0}
            rotateSpeed={0.8}
            dampingFactor={0.1}
            enableDamping={true}
            target={[0, 0, 0]} 
          />

        </Canvas>
      </div>
      <Sidebar objectInfo={selectedObjectInfo} ifcData={ifcData} />
    </div>
  );// Make sure to add this default export
};

// Make sure to add this default export
export default App;

