import LightScene from "./LightScene";
import AR15 from "./AR15";
import Sidebar from "./Sidebar";
import { useState } from "react";

function App() {
   console.log('App.jsx loaded create 1 cube')
   const [selectedObjectInfo, setSelectedObjectInfo] = useState(null);

   const handleObjectClick = (objectInfo) => {
      console.log("Object clicked:", objectInfo);
      setSelectedObjectInfo(objectInfo);
   };

   return (
      <div className="app-container">
         <div className="canvas-container">
            <LightScene />
            <AR15 onObjectClick={handleObjectClick} />
         </div>
         <Sidebar objectInfo={selectedObjectInfo} />
      </div>
   )
}

export default App;