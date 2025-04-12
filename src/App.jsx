import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stage } from "@react-three/drei";
import AR15 from "./component/AR15";
import Sidebar from "./component/Sidebar";
import { useState } from "react";
import "./styles.css";

function App() {
  const [selectedObjectInfo, setSelectedObjectInfo] = useState(null);

  const handleObjectClick = (objectInfo) => {
    setSelectedObjectInfo(objectInfo);
  };

  return (
    <div className="app-container">
      <div className="canvas-container">
        <Canvas shadows camera={{ position: [-25,10,25], fov: 50 }}>
          <color attach="background" args={["#f5f5f5"]} />
          <Stage environment="city" intensity={0.5} adjustCamera={false}>
            <AR15 onObjectClick={handleObjectClick} />
          </Stage>
          <OrbitControls makeDefault />
        </Canvas>
      </div>
      <Sidebar objectInfo={selectedObjectInfo} />
    </div>
  );
}

export default App;
