import { useState, useMemo, useRef, useEffect } from 'react'
import './App.css'

const PRESET_LENSES = [
  { mm: 14, label: 'Ultra Wide' },
  { mm: 24, label: 'Wide' },
  { mm: 35, label: 'Standard' },
  { mm: 50, label: 'Prime' },
  { mm: 85, label: 'Portrait' },
  { mm: 200, label: 'Tele' },
];

const BRANDS = [
  { 
    name: 'Sony', 
    model: 'α7R V', 
    color: '#0071e3', 
    format: '4K 60P',
    lenses: [
      { name: '16-35mm f/2.8 GM II', min: 16, max: 35, type: 'Wide Zoom' },
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
      { name: 'RF 15-35mm f/2.8L', min: 15, max: 35, type: 'Wide Zoom' },
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
      { name: 'Z 14-24mm f/2.8 S', min: 14, max: 24, type: 'Ultra Wide' },
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
      { name: '14-24mm f/2.8 DG DN Art', min: 14, max: 24, type: 'Art Wide' },
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
  
  const baseFocalLength = 12; 
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
        return Math.min(Math.max(next, selectedLens.min), selectedLens.max);
      });
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [selectedLens]);

  const selectLens = (lens) => {
    setSelectedLens(lens);
    setFocalLength(lens.min);
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

        <div className="lens-selector-panel">
          <span className="panel-label">LENS</span>
          <div className="lens-group">
            {selectedBrand.lenses.map(lens => (
              <button 
                key={selectedBrand.name + lens.name}
                className={`lens-item-btn ${selectedLens.name === lens.name ? 'active' : ''}`}
                onClick={() => selectLens(lens)}
              >
                {lens.name}
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
            src="/scene.png" 
            alt="Camera Scene" 
            className="scene-image"
            style={{ 
              transform: `translate(${offset.x}px, ${offset.y}px) scale(${currentScale})`,
              transition: isDragging ? 'none' : 'transform 0.4s cubic-bezier(0.2, 0, 0.2, 1)'
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

          <div className="info-bottom">
            <div className="stats-row">
              <div className="stat-item">
                <span className="label">F</span>
                <span className="value">1.4</span>
              </div>
              <div className="stat-item">
                <span className="label">ISO</span>
                <span className="value">100</span>
              </div>
              <div className="stat-item">
                <span className="label">EXP</span>
                <span className="value">-0.3</span>
              </div>
            </div>
            <div className="main-display">
              <div className="mm-info">
                <span className="type-label">{selectedLens.type}</span>
                <span className="lens-full-name">{selectedLens.name}</span>
                <div className="val-group">
                  <span className="focal-val">{focalLength}</span>
                  <span className="unit">mm</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="side-controls">
         <button 
           className={`icon-btn ${showGrid ? 'active' : ''}`}
           onClick={() => setShowGrid(!showGrid)}
           title="Toggle Grid"
         >
           G
         </button>
      </div>

      <div className="controls-panel">
        <div className="slider-section">
          <div className="slider-container">
            <input 
              type="range" 
              min={selectedLens.min} 
              max={selectedLens.max} 
              value={focalLength} 
              onChange={(e) => setFocalLength(parseInt(e.target.value))}
              className="focal-slider"
              disabled={selectedLens.min === selectedLens.max}
            />
          </div>
          <div className="slider-ticks">
            <span>{selectedLens.min}mm</span>
            <span>{selectedLens.max}mm</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
