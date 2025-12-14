/**
 * Single Source of Truth for Mode B Measurements (Solenoid)
 * 
 * Calculates magnetic field measurements from voltage, resistance, and solenoid geometry.
 * Uses ideal solenoid formula: B = μ₀ * n * I
 * where I = V / R_total
 */

import { LabState, MeasurementB } from '../types';
import { calculateFieldSolenoidAxis } from './biotSavart';

/**
 * Calculate a complete measurement snapshot for Mode B (Current → Magnetic Field - Solenoid)
 * 
 * @param labState - Current lab state
 * @param _dt - Time step since last update (seconds) - not used for steady-state DC measurements
 * @returns Complete measurement object
 */
export function getCurrentSnapshotB(labState: LabState, _dt: number): MeasurementB {
  const { voltage, resistance, solenoidTurns, solenoidLength, solenoidRadius, polarity } = labState;
  
  // Calculate current: I = V / R_total
  const current = resistance > 0 ? voltage / resistance : 0;
  
  // Calculate turn density: n = N / L
  const turnDensity = solenoidLength > 0 ? solenoidTurns / solenoidLength : 0;
  
  // Calculate magnetic field along axis using ideal solenoid formula
  // B = μ₀ * n * I (along axis, uniform inside)
  // Apply polarity to determine direction
  const B_magnitude = calculateFieldSolenoidAxis(
    0, // Center of solenoid (axis position)
    solenoidLength,
    Math.abs(current), // Use absolute current for magnitude
    solenoidTurns,
    labState.useEndEffects
  );
  
  // Apply polarity (direction)
  const magneticField = B_magnitude * polarity;
  
  // Create measurement
  // Note: deltaT is set to 0 for Mode B (steady-state DC, no time step needed)
  const measurement: MeasurementB = {
    timestamp: labState.time,
    deltaT: 0, // Not applicable for steady-state DC measurements
    voltage,
    resistance,
    current,
    length: solenoidLength,
    turns: solenoidTurns,
    turnDensity,
    radius: solenoidRadius,
    magneticField,
    polarity,
  };
  
  return measurement;
}

