import { useState, useMemo, useRef, useEffect } from 'react'
import './App.css'


const BRANDS = [
  { 
    name: 'Sony', 
    model: 'α7R V', 
    color: '#0071e3', 
    format: '4K 60P',
    lenses: [
      { name: '12-24mm f/2.8 GM', min: 12, max: 24, type: 'Ultra Wide Zoom' },
      { name: '24-70mm f/2.8 GM II', min: 24, max: 70, type: 'Standard Zoom' },
      { name: '50mm f/1.2 GM', min: 50, max: 50, type: 'Prime' },
      { name: '70-200mm f/2.8 GM OSS II', min: 70, max: 200, type: 'Telephoto Zoom' },
    ]
  },
  { 
    name: 'Canon', 
    model: 'EOS R5 MK II', 
    color: '#ff3b30', 
    format: '8K RAW',
    lenses: [
      { name: 'RF 12-24mm f/4L', min: 12, max: 24, type: 'Ultra Wide' },
      { name: 'RF 24-70mm f/2.8L', min: 24, max: 70, type: 'Standard Zoom' },
      { name: 'RF 85mm f/1.2L', min: 85, max: 85, type: 'Portrait Prime' },
      { name: 'RF 100-500mm f/4.5-7.1L', min: 100, max: 500, type: 'Super Tele' },
    ]
  },
  { 
    name: 'Nikon', 
    model: 'Z9', 
    color: '#f3ce2e', 
    format: 'ProRes 422',
    lenses: [
      { name: 'Z 12-24mm f/2.8 S', min: 12, max: 24, type: 'Ultra Wide' },
      { name: 'Z 24-120mm f/4 S', min: 24, max: 120, type: 'All-around' },
      { name: 'Z 50mm f/1.2 S', min: 50, max: 50, type: 'Prime' },
      { name: 'Z 70-200mm f/2.8 VR S', min: 70, max: 200, type: 'Telephoto' },
    ]
  },
  { 
    name: 'Sigma', 
    model: 'FP L', 
    color: '#ffffff', 
    format: 'Cinema DNG',
    lenses: [
      { name: '12-24mm f/4 DG HSM Art', min: 12, max: 24, type: 'Art Wide' },
      { name: '24-70mm f/2.8 DG DN Art', min: 24, max: 70, type: 'Art Standard' },
      { name: '35mm f/1.2 DG DN Art', min: 35, max: 35, type: 'Art Prime' },
      { name: '150-600mm f/5-6.3 Sport', min: 150, max: 600, type: 'Sport Tele' },
    ]
  },
];

function App() {
  const [selectedBrand, setSelectedBrand] = useState(BRANDS[1]); // Default Canon
  const [selectedLens, setSelectedLens] = useState(selectedBrand.lenses[1]); // Default 24-70
  const [focalLength, setFocalLength] = useState(35);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showGrid, setShowGrid] = useState(true);
  const [exposure, setExposure] = useState(100);
  const [backgroundImage, setBackgroundImage] = useState('/scene.png');
  const fileInputRef = useRef(null);
  
  const baseFocalLength = 8; 
  const containerRef = useRef(null);

  const currentScale = useMemo(() => {
    return focalLength / baseFocalLength;
  }, [focalLength]);

  // Sync lens with brand
  useEffect(() => {
    const firstLens = selectedBrand.lenses[0];
    setSelectedLens(firstLens);
    setFocalLength(firstLens.min);
  }, [selectedBrand]);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - offset.x,
      y: e.clientY - offset.y
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e) => {
      e.preventDefault();
      const zoomStep = 1;
      const delta = e.deltaY > 0 ? -zoomStep : zoomStep;
      
      setFocalLength(prev => {
        const next = prev + delta;
        return Math.min(Math.max(next, 8), 600); 
      });
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [selectedLens]);

  const resetView = () => {
    setFocalLength(8);
    setOffset({ x: 0, y: 0 });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setBackgroundImage(url);
      resetView(); // Reset zoom/pan for new image
    }
  };

  return (
    <div className="app-container" onMouseUp={handleMouseUp}>
      <header className="app-header">
        <div className="header-content">
          <img src="/logo.png" alt="Lens Simulator Logo" className="app-logo" />
          <div className="title-group">
            <h1 className="app-title">Lens Simulator</h1>
            <span className="by-line">by Christian Frank</span>
          </div>
        </div>
      </header>

      <div className="top-panels">
        <div className="brand-selector">
          <span className="panel-label">BODY</span>
          <div className="brand-group">
            {BRANDS.map(brand => (
              <button 
                key={brand.name}
                className={`brand-btn ${selectedBrand.name === brand.name ? 'active' : ''}`}
                onClick={() => setSelectedBrand(brand)}
              >
                {brand.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div 
        className="viewport-container"
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        <div className="camera-view">
          <img 
            src={backgroundImage} 
            alt="Camera Scene" 
            className="scene-image"
            style={{ 
              transform: `translate(${offset.x}px, ${offset.y}px) scale(${currentScale})`,
              filter: `brightness(${exposure}%)`,
              transition: isDragging ? 'none' : 'transform 0.4s cubic-bezier(0.2, 0, 0.2, 1), filter 0.2s ease'
            }}
            draggable="false"
          />
        </div>

        {showGrid && (
          <div className="grid-overlay">
            <div className="grid-line v1"></div>
            <div className="grid-line v2"></div>
            <div className="grid-line h1"></div>
            <div className="grid-line h2"></div>
          </div>
        )}

        <div className="overlay">
          <div className="viewfinder-center">
             <div className="focus-box" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>
                <div className="corner-marks" style={{ borderColor: selectedBrand.color }}></div>
             </div>
          </div>
        </div>
      </div>

      <div className="controls-panel">
        <div className="controls-layout">
          <div className="focal-info-display">
            <span className="focal-label-small">Current Focal Length</span>
            <div className="focal-value-compact">
              <span className="focal-num">{focalLength}</span>
              <span className="focal-unit">mm</span>
            </div>
          </div>

          <div className="slider-section">
            <div className="slider-container">
              <input 
                type="range" 
                min="8" 
                max="600" 
                value={focalLength} 
                onChange={(e) => setFocalLength(parseInt(e.target.value))}
                className="focal-slider"
              />
            </div>
            <div className="slider-ticks">
              <span>8mm</span>
              <span>600mm</span>
            </div>
          </div>

          <div className="slider-section exposure-section">
            <div className="slider-container">
              <input 
                type="range" 
                min="0" 
                max="200" 
                value={exposure} 
                onChange={(e) => setExposure(parseInt(e.target.value))}
                className="focal-slider exposure-slider"
              />
            </div>
            <div className="slider-ticks">
              <span>- EV</span>
              <span>Exposure</span>
              <span>+ EV</span>
            </div>
          </div>

          <div className="view-controls-group">
            <div className="control-item">
              <button 
                className={`icon-btn-small ${showGrid ? 'active' : ''}`}
                onClick={() => setShowGrid(!showGrid)}
              >
                G
              </button>
              <span className="control-label">Grid</span>
            </div>

            <div className="control-item">
              <button 
                className="icon-btn-small"
                onClick={resetView}
              >
                ⛶
              </button>
              <span className="control-label">Fit Image</span>
            </div>

            <div className="control-item">
              <input 
                type="file" 
                ref={fileInputRef} 
                style={{ display: 'none' }} 
                accept="image/*"
                onChange={handleImageUpload}
              />
              <button 
                className="icon-btn-small"
                onClick={() => fileInputRef.current.click()}
              >
                ↑
              </button>
              <span className="control-label">Upload</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
