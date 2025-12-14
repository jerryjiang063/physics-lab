/**
 * Type definitions for the Faraday's Law Lab
 */

export interface Measurement {
  timestamp: number; // Time in seconds
  deltaT: number; // Time step used for calculation (s)
  magnetX: number; // Magnet x position (m)
  magnetY: number; // Magnet y position (m)
  velocityX: number; // Magnet velocity x (m/s)
  velocityY: number; // Magnet velocity y (m/s)
  speed: number; // Magnitude of velocity (m/s)
  turns: number; // Number of turns N
  radius: number; // Coil radius (m)
  angle: number; // Coil angle (rad)
  coilResistance: number; // Coil resistance (Ω)
  loadResistance: number; // Load resistance (Ω)
  totalResistance: number; // Total resistance (Ω)
  magneticFieldX: number; // B field x component (T)
  magneticFieldY: number; // B field y component (T)
  magneticFieldMag: number; // B field magnitude (T)
  flux: number; // Magnetic flux (Wb)
  fluxRate: number; // dΦ/dt (Wb/s)
  emf: number; // Induced EMF (V)
  current: number; // Induced current (A)
  direction: "CW" | "CCW"; // Current direction
  fluxChange: "increasing" | "decreasing" | "constant"; // Flux change direction
  lenzExplanation: string; // Textual explanation of Lenz's law
}

export type LabMode = "faraday" | "currentToField";

export interface MeasurementB {
  timestamp: number; // Time in seconds
  deltaT: number; // Time step used for calculation (s)
  voltage: number; // Voltage V (V)
  resistance: number; // Total resistance R_total (Ω)
  current: number; // Calculated current I = V / R_total (A)
  length: number; // Solenoid length L (m)
  turns: number; // Number of turns N
  turnDensity: number; // n = N/L (turns/m)
  radius: number; // Cylinder radius R (m)
  magneticField: number; // B field magnitude (T) along axis
  polarity: number; // +1 or -1 (current direction)
}

export interface LabState {
  // Lab mode
  labMode: LabMode;
  
  // Mode A (Faraday's Law) state
  magnetPosition: { x: number; y: number };
  magnetVelocity: { x: number; y: number };
  isDragging: boolean;
  coilTurns: number;
  coilRadius: number; // meters
  coilAngle: number; // radians
  coilResistance: number; // ohms
  coilPosition: { x: number; y: number };
  loadResistance: number; // ohms
  magnetDipoleMoment: number; // Magnetic dipole moment (A·m²)
  motionMode: "manual" | "constant" | "sinusoidal";
  motionSpeed: number; // m/s for constant, amplitude for sinusoidal
  motionFrequency: number; // Hz for sinusoidal
  fluxHistory: number[]; // History of flux values for smoothing and central difference
  fluxTimeHistory: number[]; // Corresponding timestamps
  fluxIntegrationSamples: number; // Number of samples for flux integration
  fluxSmoothingWindow: number; // Number of points for smoothing (0 = no smoothing)
  
  // Mode B (Current → Magnetic Field) state - Solenoid only
  voltage: number; // Voltage V (V)
  resistance: number; // Total resistance R_total (Ω)
  solenoidTurns: number; // Number of turns N
  solenoidLength: number; // Solenoid length L (m)
  solenoidRadius: number; // Cylinder radius R (m)
  polarity: number; // +1 or -1 (current direction, affects B direction)
  useEndEffects: boolean; // Toggle for finite solenoid end effects
  showAnswers: boolean; // Toggle to show/hide calculated I and B
  
  // Shared state
  time: number; // seconds (only advances when recording)
  isRecording: boolean;
  measurements: Measurement[];
  measurementsB: MeasurementB[];
  
  // UI state
  showFieldLines: boolean;
  graphTimeWindow: number; // Time window for graphs (seconds, 0 = all data)
}

