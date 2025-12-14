import React from 'react';
import { LabState } from '../types';

interface ControlsProps {
  labState: LabState;
  onUpdateCoil: (updates: Partial<LabState>) => void;
  onUpdateMotion: (updates: Partial<LabState>) => void;
}

const Controls: React.FC<ControlsProps> = ({ labState, onUpdateCoil, onUpdateMotion }) => {
  if (labState.labMode === 'currentToField') {
    // Mode B: Current → Magnetic Field (Solenoid)
    const turnDensity = labState.solenoidLength > 0 
      ? labState.solenoidTurns / labState.solenoidLength 
      : 0;

    const calculatedCurrent = labState.resistance > 0 ? labState.voltage / labState.resistance : 0;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h3 style={{ marginTop: 0, marginBottom: 0 }}>Electrical Parameters</h3>
            <button
              onClick={() => onUpdateCoil({ showAnswers: !labState.showAnswers })}
              style={{
                padding: '6px 12px',
                background: labState.showAnswers ? '#4CAF50' : '#e0e0e0',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12px',
              }}
              title={labState.showAnswers ? 'Hide Answers' : 'Show Answers'}
            >
              {labState.showAnswers ? '👁️' : '👁️‍🗨️'} {labState.showAnswers ? 'Hide Answers' : 'Show Answers'}
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px' }}>
                Voltage (V): {labState.voltage.toFixed(2)} V
              </label>
              <input
                type="range"
                min="0.1"
                max="20"
                step="0.1"
                value={labState.voltage}
                onChange={(e) => onUpdateCoil({ voltage: parseFloat(e.target.value) })}
                style={{ width: '100%' }}
              />
              <input
                type="number"
                min="0.1"
                max="20"
                step="0.1"
                value={labState.voltage}
                onChange={(e) => onUpdateCoil({ voltage: parseFloat(e.target.value) || 0 })}
                style={{ width: '100%', marginTop: '5px', padding: '4px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px' }}>
                Total Resistance (R_total): {labState.resistance.toFixed(2)} Ω
              </label>
              <input
                type="range"
                min="0.1"
                max="20"
                step="0.1"
                value={labState.resistance}
                onChange={(e) => onUpdateCoil({ resistance: parseFloat(e.target.value) })}
                style={{ width: '100%' }}
              />
              <input
                type="number"
                min="0.1"
                max="20"
                step="0.1"
                value={labState.resistance}
                onChange={(e) => onUpdateCoil({ resistance: parseFloat(e.target.value) || 0 })}
                style={{ width: '100%', marginTop: '5px', padding: '4px' }}
              />
            </div>
            {labState.showAnswers && (
              <div style={{ padding: '10px', background: '#e8f5e9', borderRadius: '4px', fontSize: '13px' }}>
                <div style={{ marginBottom: '5px' }}><strong>Calculated Current:</strong></div>
                <div>I = V / R_total = {labState.voltage.toFixed(2)} / {labState.resistance.toFixed(2)} = <strong>{calculatedCurrent.toFixed(3)} A</strong></div>
              </div>
            )}
            {!labState.showAnswers && (
              <div style={{ padding: '10px', background: '#f5f5f5', borderRadius: '4px', fontSize: '13px', color: '#999' }}>
                <div>Calculated current: <span style={{ letterSpacing: '3px' }}>•••••</span> A</div>
              </div>
            )}
          </div>
        </div>

        <div>
          <h3 style={{ marginTop: 0, marginBottom: '10px' }}>Solenoid Geometry</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px' }}>
                Number of Turns (N): {labState.solenoidTurns}
              </label>
              <input
                type="range"
                min="10"
                max="1000"
                step="10"
                value={labState.solenoidTurns}
                onChange={(e) => onUpdateCoil({ solenoidTurns: parseInt(e.target.value) })}
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px' }}>
                Length (L): {labState.solenoidLength.toFixed(3)} m
              </label>
              <input
                type="range"
                min="0.1"
                max="2"
                step="0.01"
                value={labState.solenoidLength}
                onChange={(e) => onUpdateCoil({ solenoidLength: parseFloat(e.target.value) })}
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px' }}>
                Cylinder Radius (R): {labState.solenoidRadius.toFixed(3)} m
              </label>
              <input
                type="range"
                min="0.01"
                max="0.2"
                step="0.01"
                value={labState.solenoidRadius}
                onChange={(e) => onUpdateCoil({ solenoidRadius: parseFloat(e.target.value) })}
                style={{ width: '100%' }}
              />
            </div>
            <div style={{ padding: '10px', background: '#e3f2fd', borderRadius: '4px', fontSize: '13px' }}>
              <div style={{ marginBottom: '5px' }}><strong>Computed Values:</strong></div>
              <div>Length L = {labState.solenoidLength.toFixed(3)} m</div>
              <div>Turns N = {labState.solenoidTurns}</div>
              <div><strong>Turn Density n = N/L = {turnDensity.toFixed(1)} turns/m</strong></div>
            </div>
          </div>
        </div>

        <div>
          <h3 style={{ marginTop: 0, marginBottom: '10px' }}>Polarity & Direction</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={() => onUpdateCoil({ polarity: -labState.polarity })}
                  style={{
                    padding: '8px 16px',
                    background: '#2196F3',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px',
                  }}
                >
                  {labState.polarity > 0 ? '→' : '←'} Reverse Polarity
                </button>
              </label>
              <div style={{ fontSize: '11px', color: '#666', marginTop: '5px' }}>
                Direction follows right-hand rule (thumb = B direction along axis)
              </div>
              {labState.polarity > 0 ? (
                <div style={{ fontSize: '11px', color: '#666', marginTop: '3px' }}>
                  Current: + → (B points right along axis)
                </div>
              ) : (
                <div style={{ fontSize: '11px', color: '#666', marginTop: '3px' }}>
                  Current: ← - (B points left along axis)
                </div>
              )}
            </div>
          </div>
        </div>

        <div>
          <h3 style={{ marginTop: 0, marginBottom: '10px' }}>Theory</h3>
          <div style={{ padding: '10px', background: '#fff3e0', borderRadius: '4px', fontSize: '12px', lineHeight: '1.6' }}>
            <div><strong>I = V / R_total</strong></div>
            <div><strong>n = N / L</strong></div>
            <div><strong>B = μ₀ × n × I</strong></div>
            <div style={{ marginTop: '5px', color: '#666' }}>where μ₀ = 4π × 10⁻⁷ T·m/A</div>
          </div>
        </div>
      </div>
    );
  }

  // Mode A: Faraday's Law
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h3 style={{ marginTop: 0, marginBottom: '10px' }}>Magnet Parameters</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>
              Magnet Strength (m): {labState.magnetDipoleMoment.toFixed(2)} A·m²
            </label>
            <input
              type="range"
              min="0.1"
              max="10"
              step="0.1"
              value={labState.magnetDipoleMoment}
              onChange={(e) => onUpdateCoil({ magnetDipoleMoment: parseFloat(e.target.value) })}
              style={{ width: '100%' }}
            />
            <div style={{ fontSize: '11px', color: '#666', marginTop: '3px' }}>
              Bar magnet approximated as magnetic dipole along x-axis
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 style={{ marginTop: 0, marginBottom: '10px' }}>Coil Parameters</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>
              Number of Turns (N): {labState.coilTurns}
            </label>
            <input
              type="range"
              min="1"
              max="100"
              value={labState.coilTurns}
              onChange={(e) => onUpdateCoil({ coilTurns: parseInt(e.target.value) })}
              style={{ width: '100%' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>
              Coil Radius (R): {labState.coilRadius.toFixed(3)} m
            </label>
            <input
              type="range"
              min="0.01"
              max="0.5"
              step="0.01"
              value={labState.coilRadius}
              onChange={(e) => onUpdateCoil({ coilRadius: parseFloat(e.target.value) })}
              style={{ width: '100%' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>
              Coil Angle (θ): {(labState.coilAngle * 180 / Math.PI).toFixed(1)}°
            </label>
            <input
              type="range"
              min="0"
              max={2 * Math.PI}
              step="0.1"
              value={labState.coilAngle}
              onChange={(e) => onUpdateCoil({ coilAngle: parseFloat(e.target.value) })}
              style={{ width: '100%' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>
              Coil Resistance (R_coil): {labState.coilResistance.toFixed(2)} Ω
            </label>
            <input
              type="range"
              min="0.1"
              max="100"
              step="0.1"
              value={labState.coilResistance}
              onChange={(e) => onUpdateCoil({ coilResistance: parseFloat(e.target.value) })}
              style={{ width: '100%' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>
              Load Resistance (R_load): {labState.loadResistance.toFixed(2)} Ω
            </label>
            <input
              type="range"
              min="0"
              max="100"
              step="0.1"
              value={labState.loadResistance}
              onChange={(e) => onUpdateCoil({ loadResistance: parseFloat(e.target.value) })}
              style={{ width: '100%' }}
            />
          </div>
        </div>
      </div>

      <div>
        <h3 style={{ marginTop: 0, marginBottom: '10px' }}>Motion Control</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>Motion Mode:</label>
            <select
              value={labState.motionMode}
              onChange={(e) => onUpdateMotion({ motionMode: e.target.value as any })}
              style={{ width: '100%', padding: '5px' }}
            >
              <option value="manual">Manual (Drag)</option>
              <option value="constant">Constant Speed</option>
              <option value="sinusoidal">Sinusoidal</option>
            </select>
          </div>
          {labState.motionMode === 'constant' && (
            <div>
              <label style={{ display: 'block', marginBottom: '5px' }}>
                Speed: {labState.motionSpeed.toFixed(2)} m/s
              </label>
              <input
                type="range"
                min="0.1"
                max="5"
                step="0.1"
                value={labState.motionSpeed}
                onChange={(e) => onUpdateMotion({ motionSpeed: parseFloat(e.target.value) })}
                style={{ width: '100%' }}
              />
            </div>
          )}
          {labState.motionMode === 'sinusoidal' && (
            <>
              <div>
                <label style={{ display: 'block', marginBottom: '5px' }}>
                  Amplitude: {labState.motionSpeed.toFixed(2)} m
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="2"
                  step="0.1"
                  value={labState.motionSpeed}
                  onChange={(e) => onUpdateMotion({ motionSpeed: parseFloat(e.target.value) })}
                  style={{ width: '100%' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px' }}>
                  Frequency: {labState.motionFrequency.toFixed(2)} Hz
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="5"
                  step="0.1"
                  value={labState.motionFrequency}
                  onChange={(e) => onUpdateMotion({ motionFrequency: parseFloat(e.target.value) })}
                  style={{ width: '100%' }}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Controls;

