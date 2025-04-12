import React from 'react';

const Sidebar = ({ objectInfo }) => {
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
          </>
        ) : (
          <p>Click on a part to view details</p>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
