import React, { useRef, useEffect, useState, useLayoutEffect } from 'react';
import { LabState, Measurement, MeasurementB } from '../types';

interface VisualizationProps {
  labState: LabState;
  currentMeasurement: Measurement | null;
  currentMeasurementB: MeasurementB | null;
  onMagnetDrag: (x: number, y: number) => void;
  onMagnetDragStart: () => void;
  onMagnetDragEnd: () => void;
  onProbeDrag?: (x: number, y: number) => void;
  onProbeDragStart?: () => void;
  onProbeDragEnd?: () => void;
}

const Visualization: React.FC<VisualizationProps> = ({
  labState,
  currentMeasurement,
  currentMeasurementB,
  onMagnetDrag,
  onMagnetDragStart,
  onMagnetDragEnd,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // --- Camera State (Map-like interaction) ---
  // x, y represent the world coordinate acting as the center of the viewport
  const cameraRef = useRef({ x: 0, y: 0, zoom: 1 });
  const [forceRender, setForceRender] = useState(0); // Trigger re-render for SVG

  // Interaction State
  const isDraggingRef = useRef(false); // For Panning the camera
  const lastMousePosRef = useRef({ x: 0, y: 0 });
  const isMagnetDraggingRef = useRef(false); // For Mode A Magnet dragging

  // Constants
  const width = 800;
  const height = 500;
  const baseScale = 100; // 1 meter = 100 pixels at zoom 1

  // --- Coordinate Transforms ---

  // World (meters) -> Screen (pixels)
  const worldToScreen = (wx: number, wy: number) => {
    const scale = baseScale * cameraRef.current.zoom;
    // Center of screen is (width/2, height/2)
    // Camera center is (camera.x, camera.y)
    return {
      x: (wx - cameraRef.current.x) * scale + width / 2,
      y: height / 2 - (wy - cameraRef.current.y) * scale, // Flip Y for standard Cartesian
    };
  };

  // Screen (pixels) -> World (meters)
  const screenToWorld = (sx: number, sy: number) => {
    const scale = baseScale * cameraRef.current.zoom;
    return {
      x: (sx - width / 2) / scale + cameraRef.current.x,
      y: (height / 2 - sy) / scale + cameraRef.current.y, // Flip Y
    };
  };

  // --- Interaction Handlers (Native Listeners for Non-Passive Wheel) ---

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      // 1. Prevent Page Scroll explicitly
      e.preventDefault();
      e.stopPropagation();

      const rect = container.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // 2. Zoom Logic: Focus on mouse pointer
      const worldBefore = screenToWorld(mouseX, mouseY);

      const zoomSensitivity = 0.001;
      const delta = -e.deltaY * zoomSensitivity;
      const zoomFactor = Math.pow(2, delta);
      
      // Clamp zoom
      const newZoom = Math.max(0.2, Math.min(10, cameraRef.current.zoom * zoomFactor));
      cameraRef.current.zoom = newZoom;

      const worldAfter = screenToWorld(mouseX, mouseY);

      // 3. Compensate camera position to keep mouse fixed on world point
      cameraRef.current.x += (worldBefore.x - worldAfter.x);
      cameraRef.current.y += (worldBefore.y - worldAfter.y);

      setForceRender(prev => prev + 1);
    };

    // Use { passive: false } is crucial to prevent default scrolling
    container.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, []); // Run once on mount

  // Mouse Handlers for Panning & Dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    const rect = containerRef.current!.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    lastMousePosRef.current = { x: mx, y: my };

    // Mode A: Check if hitting magnet
    if (labState.labMode === 'faraday') {
      const magScreen = worldToScreen(labState.magnetPosition.x, labState.magnetPosition.y);
      const dist = Math.hypot(magScreen.x - mx, magScreen.y - my);
      if (dist < 40) {
        isMagnetDraggingRef.current = true;
        onMagnetDragStart();
        return;
      }
    }

    // Default: Start Camera Pan
    isDraggingRef.current = true;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = containerRef.current!.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    if (isMagnetDraggingRef.current) {
      const worldPos = screenToWorld(mx, my);
      onMagnetDrag(worldPos.x, worldPos.y);
    } else if (isDraggingRef.current) {
      // Panning Camera
      const dx = (mx - lastMousePosRef.current.x);
      const dy = (my - lastMousePosRef.current.y);
      
      const scale = baseScale * cameraRef.current.zoom;
      cameraRef.current.x -= dx / scale;
      cameraRef.current.y += dy / scale; // Note the sign due to Y-flip
      
      lastMousePosRef.current = { x: mx, y: my };
      setForceRender(prev => prev + 1);
    }
    
    lastMousePosRef.current = { x: mx, y: my };
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
    if (isMagnetDraggingRef.current) {
      isMagnetDraggingRef.current = false;
      onMagnetDragEnd();
    }
  };

  // --- Renderers ---

  // Mode B: Solenoid SVG Renderer
  const renderSolenoidMode = () => {
    const { solenoidLength: L, solenoidRadius: R, solenoidTurns: N, polarity } = labState;
    const B = currentMeasurementB ? currentMeasurementB.magneticField : 0;
    
    // Derived visuals
    const pixelScale = baseScale * cameraRef.current.zoom;
    const widthPx = L * pixelScale;
    const heightPx = 2 * R * pixelScale;
    
    // Top-left of the solenoid rect in SVG space
    const centerScreen = worldToScreen(0, 0);
    const xStart = centerScreen.x - widthPx / 2;
    const yStart = centerScreen.y - heightPx / 2;

    // Visual windings sampling
    // We don't want to draw 5000 lines if N=5000. Clamp visually between 10 and 50.
    const visualTurns = Math.max(10, Math.min(50, Math.floor(N / 5))); 
    const spacing = widthPx / visualTurns;

    // Polarity logic (1 or -1)
    // If polarity > 0: Current comes out top, goes in bottom? Or flows Left->Right?
    // Let's assume standard right-hand rule convention for this lab:
    // Polarity +1: B points +X (Right). Current flows "Up" on front face (Bottom -> Top).
    // Polarity -1: B points -X (Left). Current flows "Down" on front face.
    const isPositive = polarity > 0; 
    
    // Magnetic Field Lines inside
    // Density proportional to B. 
    // Mag range usually roughly 1mT to 10mT in these labs. Map to 0-10 lines.
    const bStrength = Math.abs(B);
    const maxLines = 10;
    // Simple linear mapping for demo: 1mT gives 1 line roughly
    const lineCount = Math.min(maxLines, Math.floor(bStrength * 2000)); // Adjust multiplier based on your physics engine units

    const fieldLines: JSX.Element[] = [];
    for (let i = 0; i < lineCount; i++) {
      // Distribute evenly along Y axis (-R to +R)
      const offsetRatio = (i + 1) / (lineCount + 1); 
      const yOffset = -R + offsetRatio * (2 * R);
      
      const pStart = worldToScreen(-L/2 - 0.1, yOffset); // Extend slightly out
      const pEnd = worldToScreen(L/2 + 0.1, yOffset);

      // Determine arrow direction based on Polarity
      // If Positive, B is Left->Right
      const x1 = isPositive ? pStart.x : pEnd.x;
      const x2 = isPositive ? pEnd.x : pStart.x;

      fieldLines.push(
        <g key={`field-${i}`}>
          <line 
            x1={x1} y1={pStart.y} 
            x2={x2} y2={pEnd.y} 
            stroke="#4CAF50" 
            strokeWidth={2} 
            opacity={0.6}
            markerEnd="url(#arrowHeadField)"
          />
        </g>
      );
    }

    // External Magnetic Field Lines (outside solenoid) - Closed loops
    // Count: 4-8 lines total
    const externalLineCount = Math.max(4, Math.min(8, Math.floor(lineCount / 2)));
    const externalFieldLines: JSX.Element[] = [];
    
    // Determine N and S pole positions in world coordinates
    const nPoleX = isPositive ? L/2 : -L/2;
    const sPoleX = isPositive ? -L/2 : L/2;
    
    // Arc distance from solenoid body (larger for more pronounced curves)
    const arcDistance = R * 1.5; // 1.5x radius for visible arcs
    
    // Upper external field lines (above solenoid)
    const upperLines = Math.ceil(externalLineCount / 2);
    for (let i = 0; i < upperLines; i++) {
      // Distribute lines above the solenoid
      const spacing = (R * 0.4) / (upperLines + 1);
      const yOffset = R + spacing * (i + 1);
      
      // Start from N pole, end at S pole
      const nStart = worldToScreen(nPoleX, yOffset);
      const sEnd = worldToScreen(sPoleX, yOffset);
      
      // Control points for large arc above solenoid
      // First control point: extends outward and upward from N pole
      const cp1x = nStart.x + (isPositive ? arcDistance * 0.6 : -arcDistance * 0.6);
      const cp1y = nStart.y - arcDistance * (1.2 + i * 0.3); // Upward curve
      
      // Second control point: extends outward and upward from S pole
      const cp2x = sEnd.x + (isPositive ? -arcDistance * 0.6 : arcDistance * 0.6);
      const cp2y = sEnd.y - arcDistance * (1.2 + i * 0.3); // Upward curve
      
      // Arrow position: at 60-75% along the path (not aligned, varies per line)
      const arrowT = 0.6 + (i * 0.03); // Vary arrow position per line
      
      // Calculate arrow position on the Bézier curve
      // Cubic Bézier: B(t) = (1-t)³P₀ + 3(1-t)²tP₁ + 3(1-t)t²P₂ + t³P₃
      const t = arrowT;
      const mt = 1 - t;
      const arrowX = mt*mt*mt * nStart.x + 3*mt*mt*t * cp1x + 3*mt*t*t * cp2x + t*t*t * sEnd.x;
      const arrowY = mt*mt*mt * nStart.y + 3*mt*mt*t * cp1y + 3*mt*t*t * cp2y + t*t*t * sEnd.y;
      
      // Calculate tangent direction for arrow orientation
      const tPrev = arrowT - 0.01;
      const mtPrev = 1 - tPrev;
      const arrowXPrev = mtPrev*mtPrev*mtPrev * nStart.x + 3*mtPrev*mtPrev*tPrev * cp1x + 3*mtPrev*tPrev*tPrev * cp2x + tPrev*tPrev*tPrev * sEnd.x;
      const arrowYPrev = mtPrev*mtPrev*mtPrev * nStart.y + 3*mtPrev*mtPrev*tPrev * cp1y + 3*mtPrev*tPrev*tPrev * cp2y + tPrev*tPrev*tPrev * sEnd.y;
      const dx = arrowX - arrowXPrev;
      const dy = arrowY - arrowYPrev;
      const arrowAngle = Math.atan2(dy, dx) * 180 / Math.PI;
      
      externalFieldLines.push(
        <g key={`external-upper-${i}`}>
          <path
            d={`M ${nStart.x} ${nStart.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${sEnd.x} ${sEnd.y}`}
            fill="none"
            stroke="#81D4FA"
            strokeWidth={1.5}
            opacity={0.5}
          />
          {/* Single arrow marker at varying position along the curve */}
          <g transform={`translate(${arrowX}, ${arrowY}) rotate(${arrowAngle})`}>
            <path
              d="M 0 0 L -8 0"
              fill="none"
              stroke="#81D4FA"
              strokeWidth={1.5}
              opacity={0.5}
              markerEnd="url(#arrowHeadExternal)"
            />
          </g>
        </g>
      );
    }
    
    // Lower external field lines (below solenoid)
    const lowerLines = externalLineCount - upperLines;
    for (let i = 0; i < lowerLines; i++) {
      // Distribute lines below the solenoid
      const spacing = (R * 0.4) / (lowerLines + 1);
      const yOffset = -R - spacing * (i + 1);
      
      // Start from N pole, end at S pole
      const nStart = worldToScreen(nPoleX, yOffset);
      const sEnd = worldToScreen(sPoleX, yOffset);
      
      // Control points for large arc below solenoid
      // First control point: extends outward and downward from N pole
      const cp1x = nStart.x + (isPositive ? arcDistance * 0.6 : -arcDistance * 0.6);
      const cp1y = nStart.y + arcDistance * (1.2 + i * 0.3); // Downward curve
      
      // Second control point: extends outward and downward from S pole
      const cp2x = sEnd.x + (isPositive ? -arcDistance * 0.6 : arcDistance * 0.6);
      const cp2y = sEnd.y + arcDistance * (1.2 + i * 0.3); // Downward curve
      
      // Arrow position: at 60-75% along the path (not aligned, varies per line)
      const arrowT = 0.6 + (i * 0.03); // Vary arrow position per line
      
      // Calculate arrow position on the Bézier curve
      const t = arrowT;
      const mt = 1 - t;
      const arrowX = mt*mt*mt * nStart.x + 3*mt*mt*t * cp1x + 3*mt*t*t * cp2x + t*t*t * sEnd.x;
      const arrowY = mt*mt*mt * nStart.y + 3*mt*mt*t * cp1y + 3*mt*t*t * cp2y + t*t*t * sEnd.y;
      
      // Calculate tangent direction for arrow orientation
      const tPrev = arrowT - 0.01;
      const mtPrev = 1 - tPrev;
      const arrowXPrev = mtPrev*mtPrev*mtPrev * nStart.x + 3*mtPrev*mtPrev*tPrev * cp1x + 3*mtPrev*tPrev*tPrev * cp2x + tPrev*tPrev*tPrev * sEnd.x;
      const arrowYPrev = mtPrev*mtPrev*mtPrev * nStart.y + 3*mtPrev*mtPrev*tPrev * cp1y + 3*mtPrev*tPrev*tPrev * cp2y + tPrev*tPrev*tPrev * sEnd.y;
      const dx = arrowX - arrowXPrev;
      const dy = arrowY - arrowYPrev;
      const arrowAngle = Math.atan2(dy, dx) * 180 / Math.PI;
      
      externalFieldLines.push(
        <g key={`external-lower-${i}`}>
          <path
            d={`M ${nStart.x} ${nStart.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${sEnd.x} ${sEnd.y}`}
            fill="none"
            stroke="#81D4FA"
            strokeWidth={1.5}
            opacity={0.5}
          />
          {/* Single arrow marker at varying position along the curve */}
          <g transform={`translate(${arrowX}, ${arrowY}) rotate(${arrowAngle})`}>
            <path
              d="M 0 0 L -8 0"
              fill="none"
              stroke="#81D4FA"
              strokeWidth={1.5}
              opacity={0.5}
              markerEnd="url(#arrowHeadExternal)"
            />
          </g>
        </g>
      );
    }

    // Winding Paths
    const backWindings: JSX.Element[] = [];
    const frontWindings: JSX.Element[] = [];
    
    for (let i = 0; i < visualTurns; i++) {
      const turnX = xStart + i * spacing;
      
      // Back wire (Dashed, goes Top -> Bottom-Right visually for helix)
      // Actually, standard helix side view:
      // Front: /  Back: \ (or vice versa depending on handedness)
      // Let's use simple diagonal lines.
      
      backWindings.push(
        <line
          key={`b-${i}`}
          x1={turnX + spacing} y1={yStart} // Top Right
          x2={turnX} y2={yStart + heightPx} // Bottom Left
          stroke="#1565C0"
          strokeWidth={2}
          strokeDasharray="4,2"
          opacity={0.5}
        />
      );

      // Front wire (Solid)
      frontWindings.push(
        <line
          key={`f-${i}`}
          x1={turnX} y1={yStart} // Top Left
          x2={turnX + spacing} y2={yStart + heightPx} // Bottom Right
          stroke="#1E88E5"
          strokeWidth={2.5}
        />
      );

      // Current Arrows on front wires (Sampled, don't draw on every single one)
      if (i % 3 === 1) {
        // Arrow Center
        const cx = turnX + spacing / 2;
        const cy = yStart + heightPx / 2;
        // Direction vector of the wire
        const dx = spacing;
        const dy = heightPx;
        const angle = Math.atan2(dy, dx) * (180 / Math.PI); // Angle of the wire line
        
        // If isPositive (B Right), Right Hand Rule -> Current wraps "Down" on front face? 
        // Fingers down -> Thumb right. Yes.
        // So arrow points Down-Right.
        // If Negative, arrow points Up-Left.
        
        const arrowRot = isPositive ? angle : angle + 180;
        
        frontWindings.push(
          <path
            key={`a-${i}`}
            d="M -5 -3 L 0 0 L -5 3" // Simple arrow head
            fill="none"
            stroke="#FFEB3B"
            strokeWidth={2}
            transform={`translate(${cx}, ${cy}) rotate(${arrowRot})`}
          />
        );
      }
    }

    // Ruler
    const rulerY = yStart + heightPx + 25;
    const rulerL = worldToScreen(-L/2, 0);
    const rulerR = worldToScreen(L/2, 0);

    return (
      <svg width={width} height={height} style={{ display: 'block', userSelect: 'none' }}>
        <defs>
          <marker id="arrowHeadField" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 L1,3 Z" fill="#4CAF50" />
          </marker>
          <marker id="arrowHeadExternal" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 L1,3 Z" fill="#81D4FA" />
          </marker>
        </defs>

        {/* 1. Back Windings */}
        {backWindings}

        {/* 2. Insulating Cylinder (Background) */}
        <rect 
          x={xStart} 
          y={yStart} 
          width={widthPx} 
          height={heightPx} 
          fill="#9E9E9E" 
          fillOpacity={0.2} 
          stroke="none"
        />

        {/* 3. External Magnetic Field Lines (outside solenoid) */}
        {externalFieldLines}

        {/* 4. Internal Magnetic Field Lines */}
        {fieldLines}

        {/* 5. Front Windings & Current Arrows */}
        {frontWindings}

        {/* 6. Cylinder Outline */}
        <rect 
          x={xStart} 
          y={yStart} 
          width={widthPx} 
          height={heightPx} 
          fill="none" 
          stroke="#666" 
          strokeWidth={2}
        />

        {/* 7. Pole Labels */}
        <text 
          x={isPositive ? rulerR.x + 10 : rulerL.x - 20} 
          y={yStart + heightPx / 2 + 8} 
          fill="#F44336" fontWeight="bold" fontSize="20"
        >
          N
        </text>
        <text 
          x={isPositive ? rulerL.x - 20 : rulerR.x + 10} 
          y={yStart + heightPx / 2 + 8} 
          fill="#2196F3" fontWeight="bold" fontSize="20"
        >
          S
        </text>

        {/* 8. Ruler */}
        <line x1={rulerL.x} y1={rulerY} x2={rulerR.x} y2={rulerY} stroke="#333" strokeWidth={1} />
        <line x1={rulerL.x} y1={rulerY-5} x2={rulerL.x} y2={rulerY+5} stroke="#333" strokeWidth={1} />
        <line x1={rulerR.x} y1={rulerY-5} x2={rulerR.x} y2={rulerY+5} stroke="#333" strokeWidth={1} />
        <text x={(rulerL.x + rulerR.x)/2} y={rulerY + 15} textAnchor="middle" fontSize="12" fill="#333">
          L = {L.toFixed(2)} m
        </text>

        {/* HUD Info */}
        <text x="10" y="20" fontSize="14" fill="#333" fontWeight="bold">
           Turns (N): {N} | Current (I): {currentMeasurementB?.current.toFixed(2) || 0} A
        </text>
      </svg>
    );
  };

  // Mode A: Canvas Renderer (Faraday's Law)
  // We keep the logic but use the shared camera system
  useEffect(() => {
    if (labState.labMode !== 'faraday') return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear
    ctx.clearRect(0, 0, width, height);
    
    // Grid (Optional, makes movement clearer)
    ctx.strokeStyle = '#eee';
    ctx.lineWidth = 1;
    ctx.beginPath();
    // Simplified Grid drawing based on camera
    const scale = baseScale * cameraRef.current.zoom;
    const leftW = screenToWorld(0, 0).x;
    const rightW = screenToWorld(width, 0).x;
    for (let i = Math.floor(leftW); i <= Math.ceil(rightW); i++) {
        const sx = worldToScreen(i, 0).x;
        ctx.moveTo(sx, 0); ctx.lineTo(sx, height);
    }
    ctx.stroke();

    // 1. Draw Coil
    const coilCenter = worldToScreen(labState.coilPosition.x, labState.coilPosition.y);
    const coilRPx = Math.max(0.5, Math.abs(labState.coilRadius * scale));
    
    ctx.save();
    ctx.translate(coilCenter.x, coilCenter.y);
    // Draw Coil Circles
    ctx.strokeStyle = '#1976D2';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, coilRPx, 0, 2 * Math.PI);
    ctx.stroke();
    
    // Visual turns
    for(let i=0; i<Math.min(labState.coilTurns, 10); i++) {
        const r = coilRPx - i*2;
        if (r <= 0.5) break;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, 2*Math.PI);
        ctx.stroke();
    }
    
    // Light bulb / Current Indicator
    if (currentMeasurement) {
        const intensity = Math.min(1, Math.abs(currentMeasurement.current) * 100);
        ctx.fillStyle = `rgba(255, 235, 59, ${intensity})`;
        ctx.shadowBlur = intensity * 20;
        ctx.shadowColor = '#FFEB3B';
        ctx.fill(); // Fill the coil center with light
        ctx.shadowBlur = 0;
    }
    ctx.restore();

    // 2. Draw Magnet
    const magCenter = worldToScreen(labState.magnetPosition.x, labState.magnetPosition.y);
    const magW = 60 * cameraRef.current.zoom; // Visual size
    const magH = 30 * cameraRef.current.zoom;

    ctx.save();
    ctx.translate(magCenter.x, magCenter.y);
    // Rotate if needed, currently horizontal
    // N Pole
    ctx.fillStyle = '#F44336';
    ctx.fillRect(-magW/2, -magH/2, magW/2, magH);
    ctx.fillStyle = 'white';
    ctx.font = `bold ${14 * cameraRef.current.zoom}px Arial`;
    ctx.textAlign = 'center'; 
    ctx.textBaseline = 'middle';
    ctx.fillText('N', -magW/4, 0);

    // S Pole
    ctx.fillStyle = '#2196F3';
    ctx.fillRect(0, -magH/2, magW/2, magH);
    ctx.fillStyle = 'white';
    ctx.fillText('S', magW/4, 0);
    ctx.restore();

  }, [labState, currentMeasurement, forceRender]); // Re-render when camera or state changes


  return (
    <div 
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{ 
        width: width, 
        height: height, 
        border: '1px solid #ddd', 
        borderRadius: '8px',
        backgroundColor: '#f9f9f9',
        overflow: 'hidden',
        cursor: isDraggingRef.current ? 'grabbing' : 'grab',
        position: 'relative'
      }}
    >
      {labState.labMode === 'currentToField' ? (
        renderSolenoidMode()
      ) : (
        <canvas 
          ref={canvasRef}
          width={width} 
          height={height}
          style={{ display: 'block' }}
        />
      )}
      
      {/* Overlay Instructions */}
      <div style={{
        position: 'absolute',
        bottom: 10,
        left: 10,
        backgroundColor: 'rgba(255,255,255,0.8)',
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '12px',
        color: '#666',
        pointerEvents: 'none'
      }}>
        Scroll to Zoom • Drag to Pan • 
        {labState.labMode === 'currentToField' ? ' 2D Schematics' : ' Move Magnet'}
      </div>
    </div>
  );
};

export default Visualization;