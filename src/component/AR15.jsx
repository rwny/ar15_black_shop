function AR15() {
   return(
      <>
         <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]} scale={1}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="blue" />
         </mesh>
         <mesh>
            <torusKnotGeometry/>
            <meshStandardMaterial color="orange" />
         </mesh>
      </>

   )
}

export default AR15;