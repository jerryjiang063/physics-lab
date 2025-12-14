import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { LabState, Measurement, MeasurementB } from './types';
import { getCurrentSnapshot } from './physics/measurement';
import { getCurrentSnapshotB } from './physics/measurementB';
import Visualization from './components/Visualization';
import Controls from './components/Controls';
import Measurements from './components/Measurements';
import Charts from './components/Charts';
import DataTable from './components/DataTable';
import Footer from './components/Footer';
import { exportToCSV, exportToJSON, exportToCSVB, exportToJSONB, downloadFile } from './utils/export';
import './App.css';

const INITIAL_STATE: LabState = {
  labMode: 'faraday',
  // Mode A (Faraday's Law) state
  magnetPosition: { x: -1, y: 0 },
  magnetVelocity: { x: 0, y: 0 },
  isDragging: false,
  magnetDipoleMoment: 1.0, // A·m² (magnetic dipole moment)
  coilTurns: 10,
  coilRadius: 0.1, // 10 cm
  coilAngle: 0,
  coilResistance: 5, // ohms
  coilPosition: { x: 0, y: 0 },
  loadResistance: 0,
  motionMode: 'manual',
  motionSpeed: 1,
  motionFrequency: 1,
  fluxHistory: [],
  fluxTimeHistory: [],
  fluxIntegrationSamples: 20, // Number of samples for flux integration
  fluxSmoothingWindow: 5, // Number of points for smoothing
  // Mode B (Current → Magnetic Field) state - Solenoid only
  voltage: 5.0, // Voltage V (V)
  resistance: 5.0, // Total resistance R_total (Ω)
  solenoidTurns: 100, // Number of turns N
  solenoidLength: 0.5, // Solenoid length L (m)
  solenoidRadius: 0.05, // Cylinder radius R (m)
  polarity: 1, // +1 or -1 (current direction)
  useEndEffects: false, // Use ideal solenoid formula
  showAnswers: false, // Toggle to show/hide calculated I and B
  // Shared state
  time: 0, // seconds (only advances when recording)
  isRecording: false,
  measurements: [],
  measurementsB: [],
  // UI state
  showFieldLines: false,
  graphTimeWindow: 0, // 0 = show all data
};

function App() {
  const [labState, setLabState] = useState<LabState>(INITIAL_STATE);
  const [currentMeasurement, setCurrentMeasurement] = useState<Measurement | null>(null);
  const [currentMeasurementB, setCurrentMeasurementB] = useState<MeasurementB | null>(null);
  const previousPositionRef = useRef<{ x: number; y: number }>({ x: -1, y: 0 });
  const animationFrameRef = useRef<number>();
  const lastTimeRef = useRef<number>(Date.now());

  // Update physics calculations
  const updatePhysics = () => {
    const now = Date.now();
    const dt = (now - lastTimeRef.current) / 1000; // Convert to seconds
    lastTimeRef.current = now;

    if (dt > 0.1) return; // Skip if too much time passed (tab was inactive)

    setLabState((prev) => {
      let newState = { ...prev };

      if (prev.labMode === 'faraday') {
        // Mode A: Faraday's Law
        // Update motion based on mode
        if (prev.motionMode === 'constant' && !prev.isDragging) {
          newState.magnetVelocity = { x: prev.motionSpeed, y: 0 };
          newState.magnetPosition = {
            x: prev.magnetPosition.x + prev.magnetVelocity.x * dt,
            y: prev.magnetPosition.y + prev.magnetVelocity.y * dt,
          };
        } else if (prev.motionMode === 'sinusoidal' && !prev.isDragging) {
          const amplitude = prev.motionSpeed;
          const frequency = prev.motionFrequency;
          const newX = amplitude * Math.sin(2 * Math.PI * frequency * prev.time);
          newState.magnetVelocity = {
            x: 2 * Math.PI * frequency * amplitude * Math.cos(2 * Math.PI * frequency * prev.time),
            y: 0,
          };
          newState.magnetPosition = { x: newX, y: 0 };
        } else if (prev.motionMode === 'manual') {
          // Calculate velocity from position change
          const dx = prev.magnetPosition.x - previousPositionRef.current.x;
          const dy = prev.magnetPosition.y - previousPositionRef.current.y;
          if (dt > 0) {
            newState.magnetVelocity = { x: dx / dt, y: dy / dt };
          }
        }

        previousPositionRef.current = { ...newState.magnetPosition };

        // Update time ONLY when recording (bug fix)
        if (prev.isRecording) {
          newState.time += dt;
        }

        // SINGLE SOURCE OF TRUTH: Get measurement from centralized function
        const measurement = getCurrentSnapshot(newState, dt);

        // Update flux history for next calculation (keep last 20 points)
        newState.fluxHistory = [...prev.fluxHistory, measurement.flux].slice(-20);
        newState.fluxTimeHistory = [...prev.fluxTimeHistory, newState.time].slice(-20);

        setCurrentMeasurement(measurement);
        setCurrentMeasurementB(null);

        // Record measurements if recording
        if (prev.isRecording) {
          const samplingRate = 60; // Hz
          const sampleInterval = 1 / samplingRate;
          const lastTimestamp = prev.measurements[prev.measurements.length - 1]?.timestamp || 0;
          if (newState.time - lastTimestamp >= sampleInterval) {
            newState.measurements = [...prev.measurements, measurement];
          }
        }
      } else {
        // Mode B: Current → Magnetic Field
        // Update time ONLY when recording (bug fix)
        if (prev.isRecording) {
          newState.time += dt;
        }

        // SINGLE SOURCE OF TRUTH: Get measurement from centralized function
        const measurementB = getCurrentSnapshotB(newState, dt);

        setCurrentMeasurementB(measurementB);
        setCurrentMeasurement(null);

        // Record measurements if recording
        if (prev.isRecording) {
          const samplingRate = 60; // Hz
          const sampleInterval = 1 / samplingRate;
          const lastTimestamp = prev.measurementsB[prev.measurementsB.length - 1]?.timestamp || 0;
          if (newState.time - lastTimestamp >= sampleInterval) {
            newState.measurementsB = [...prev.measurementsB, measurementB];
          }
        }
      }

      return newState;
    });
  };

  // Animation loop
  useEffect(() => {
    const animate = () => {
      updatePhysics();
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const handleMagnetDrag = (x: number, y: number) => {
    setLabState((prev) => ({
      ...prev,
      magnetPosition: { x, y },
      isDragging: true,
    }));
  };

  const handleMagnetDragStart = () => {
    setLabState((prev) => ({ ...prev, isDragging: true }));
  };

  const handleMagnetDragEnd = () => {
    setLabState((prev) => ({ ...prev, isDragging: false }));
  };

  const handleUpdateCoil = (updates: Partial<LabState>) => {
    setLabState((prev) => ({ ...prev, ...updates }));
  };

  const handleUpdateMotion = (updates: Partial<LabState>) => {
    setLabState((prev) => ({ ...prev, ...updates }));
  };

  const handleStartRecording = () => {
    setLabState((prev) => ({
      ...prev,
      isRecording: true,
      measurements: prev.labMode === 'faraday' ? [] : prev.measurements,
      measurementsB: prev.labMode === 'currentToField' ? [] : prev.measurementsB,
      time: 0,
      fluxHistory: [],
      fluxTimeHistory: [],
    }));
    lastTimeRef.current = Date.now();
  };

  const handleStopRecording = () => {
    setLabState((prev) => ({ ...prev, isRecording: false }));
  };

  const handleAddSnapshot = () => {
    if (labState.labMode === 'faraday' && currentMeasurement) {
      setLabState((prev) => ({
        ...prev,
        measurements: [...prev.measurements, currentMeasurement],
      }));
    } else if (labState.labMode === 'currentToField' && currentMeasurementB) {
      setLabState((prev) => ({
        ...prev,
        measurementsB: [...prev.measurementsB, currentMeasurementB],
      }));
    }
  };

  const handleClearData = () => {
    setLabState((prev) => ({
      ...prev,
      measurements: prev.labMode === 'faraday' ? [] : prev.measurements,
      measurementsB: prev.labMode === 'currentToField' ? [] : prev.measurementsB,
    }));
  };

  const handleExportCSV = () => {
    if (labState.labMode === 'faraday') {
      const csv = exportToCSV(labState.measurements);
      downloadFile(csv, 'faraday-lab-data.csv', 'text/csv');
    } else {
      const csv = exportToCSVB(labState.measurementsB);
      downloadFile(csv, 'current-field-lab-data.csv', 'text/csv');
    }
  };

  const handleExportJSON = () => {
    if (labState.labMode === 'faraday') {
      const json = exportToJSON(labState.measurements);
      downloadFile(json, 'faraday-lab-data.json', 'application/json');
    } else {
      const json = exportToJSONB(labState.measurementsB);
      downloadFile(json, 'current-field-lab-data.json', 'application/json');
    }
  };

  const handleModeChange = (mode: 'faraday' | 'currentToField') => {
    setLabState((prev) => ({
      ...prev,
      labMode: mode,
      time: 0,
      isRecording: false,
    }));
  };

  return (
    <div className="app">
      <header className="app-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <div style={{ flex: 1 }}></div>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <h1>Physics Virtual Lab</h1>
            <p>Explore electromagnetic phenomena through interactive experimentation</p>
          </div>
          <div style={{ flex: 1, textAlign: 'right' }}>
            <Link 
              to="/about" 
              style={{ 
                color: 'white', 
                textDecoration: 'none',
                fontSize: '14px',
                padding: '8px 16px',
                background: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '4px',
                transition: 'background 0.2s',
                display: 'inline-block'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
              }}
            >
              About
            </Link>
          </div>
        </div>
        <div style={{ marginTop: '15px' }}>
          <label style={{ marginRight: '10px', fontSize: '14px' }}>Lab Mode:</label>
          <select
            value={labState.labMode}
            onChange={(e) => handleModeChange(e.target.value as 'faraday' | 'currentToField')}
            style={{ padding: '8px 12px', fontSize: '14px', borderRadius: '4px', border: '1px solid #fff' }}
          >
            <option value="faraday">Mode A: Faraday's Law</option>
            <option value="currentToField">Mode B: Current → Magnetic Field</option>
          </select>
        </div>
      </header>

      <div className="app-content">
        <div className="left-panel">
          <div className="panel-section">
            <h2>Visualization</h2>
            <Visualization
              labState={labState}
              currentMeasurement={currentMeasurement}
              currentMeasurementB={currentMeasurementB}
              onMagnetDrag={handleMagnetDrag}
              onMagnetDragStart={handleMagnetDragStart}
              onMagnetDragEnd={handleMagnetDragEnd}
              onProbeDrag={(z, _y) => setLabState(prev => ({ ...prev, probeZ: z, isDraggingProbe: true }))}
              onProbeDragStart={() => setLabState(prev => ({ ...prev, isDraggingProbe: true }))}
              onProbeDragEnd={() => setLabState(prev => ({ ...prev, isDraggingProbe: false }))}
            />
          </div>

          <div className="panel-section">
            <h2>Controls</h2>
            <Controls
              labState={labState}
              onUpdateCoil={handleUpdateCoil}
              onUpdateMotion={handleUpdateMotion}
            />
          </div>
        </div>

        <div className="right-panel">
          <div className="panel-section">
            <h2>Measurements</h2>
            <Measurements 
              measurement={currentMeasurement} 
              measurementB={currentMeasurementB}
              labMode={labState.labMode}
              showAnswers={labState.showAnswers}
            />
          </div>

          <div className="panel-section">
            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', flexWrap: 'wrap' }}>
              <button
                onClick={labState.isRecording ? handleStopRecording : handleStartRecording}
                style={{
                  padding: '10px 20px',
                  background: labState.isRecording ? '#f44336' : '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                }}
              >
                {labState.isRecording ? '⏹ Stop Recording' : '▶ Start Recording'}
              </button>
              <button
                onClick={handleAddSnapshot}
                style={{
                  padding: '10px 20px',
                  background: '#2196F3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                📸 Add Snapshot
              </button>
              {((labState.labMode === 'faraday' && labState.measurements.length > 0) ||
                (labState.labMode === 'currentToField' && labState.measurementsB.length > 0)) && (
                <>
                  <button
                    onClick={handleExportCSV}
                    style={{
                      padding: '10px 20px',
                      background: '#FF9800',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    📥 Export CSV
                  </button>
                  <button
                    onClick={handleExportJSON}
                    style={{
                      padding: '10px 20px',
                      background: '#9C27B0',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    📥 Export JSON
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="panel-section">
            <Charts 
              measurements={labState.measurements} 
              measurementsB={labState.measurementsB}
              labMode={labState.labMode}
              timeWindow={labState.graphTimeWindow}
              onTimeWindowChange={(window) => setLabState(prev => ({ ...prev, graphTimeWindow: window }))}
            />
          </div>

          <div className="panel-section">
            <DataTable
              measurements={labState.measurements}
              measurementsB={labState.measurementsB}
              labMode={labState.labMode}
              onClear={handleClearData}
            />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default App;

