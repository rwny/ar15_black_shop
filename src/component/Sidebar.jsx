import React from 'react';

const Sidebar = ({ objectInfo, ifcData }) => {
  
  // เปิด ปิด function
  const showHierarchy = false;
  const showIFCData = false;

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>Object Information</h2>
      </div>
      <div className="sidebar-content">
        {objectInfo ? (
          <>
            <div className="info-item">
              <span className="info-label">Name:</span>
              <span className="info-value">{objectInfo.name}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Type:</span>
              <span className="info-value">{objectInfo.type}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Position:</span>
              <span className="info-value">({objectInfo.position.join(', ')})</span>
            </div>
            <div className="info-item">
              <span className="info-label">Dimensions:</span>
              <div className="dimensions-info">
                <div>Width: {typeof objectInfo.dimensions.width === 'number' ? objectInfo.dimensions.width.toFixed(2) : 'N/A'}</div>
                <div>Height: {typeof objectInfo.dimensions.height === 'number' ? objectInfo.dimensions.height.toFixed(2) : 'N/A'}</div>
                <div>Depth: {typeof objectInfo.dimensions.depth === 'number' ? objectInfo.dimensions.depth.toFixed(2) : 'N/A'}</div>
              </div>
            </div>

            {/* Enhanced IFC Data Hierarchy Display */}
            {objectInfo.hierarchy && showHierarchy && (
              <div className="info-item">
                <span className="info-label">Object Hierarchy:</span>

                <div className="hierarchy-tree">
                  {objectInfo.hierarchy.map((level, index) => (

                    <div key={index} className="hierarchy-level" style={{ marginLeft: `${index * 10}px` }}>
                      <div className="hierarchy-item">
                        <span className="hierarchy-name">{level.name || "Unnamed"}</span>
                        {level.type && <span className="hierarchy-type">({level.type})</span>}
                      </div>
                    </div>
                  ))}

                </div>
              </div>
            )}

            {/* Display IFC specific data if available */}
            {ifcData && showIFCData && (
              <div className="info-item">
                <span className="info-label">IFC Data:</span>
                <div className="ifc-properties">
                  {Object.entries(ifcData).map(([key, value]) => (
                    <div key={key} className="ifc-property">
                      <span className="ifc-key">{key}:</span>
                      <span className="ifc-value">
                        {typeof value === 'object' 
                          ? JSON.stringify(value, null, 2)
                          : String(value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <p>Click on a part to view details</p>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
