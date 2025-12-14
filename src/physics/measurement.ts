/**
 * Single Source of Truth for Measurements
 * 
 * This module provides a single function that calculates all measurement values
 * from the current lab state. All UI components, recording, and export use this
 * function to ensure data consistency.
 */

import { LabState, Measurement } from '../types';
import {
  calculateFlux,
  calculateFluxRateCentral,
  calculateEMF,
  calculateCurrent,
  getCurrentDirectionAndExplanation,
  calculateAverageFieldOverCoil,
  smoothValue,
} from './magneticField';

/**
 * Calculate a complete measurement snapshot from current lab state
 * 
 * This is the SINGLE SOURCE OF TRUTH for all measurement values.
 * All components (UI, graphs, table, export) should use this function
 * to ensure data consistency.
 * 
 * @param labState - Current lab state
 * @param dt - Time step since last update (seconds)
 * @returns Complete measurement object
 */
export function getCurrentSnapshot(labState: LabState, dt: number): Measurement {
  // Calculate flux using proper area integration
  const flux = calculateFlux(
    {
      position: labState.coilPosition,
      radius: labState.coilRadius,
      turns: labState.coilTurns,
      angle: labState.coilAngle,
      resistance: labState.coilResistance,
    },
    labState.magnetPosition,
    labState.magnetDipoleMoment,
    labState.fluxIntegrationSamples
  );

  // Apply smoothing if enabled
  let smoothedFlux = flux;
  if (labState.fluxSmoothingWindow > 0 && labState.fluxHistory.length > 0) {
    const lastSmoothed = labState.fluxHistory[labState.fluxHistory.length - 1];
    smoothedFlux = smoothValue(flux, lastSmoothed, 0.3);
  }

  // Use existing flux history for central difference calculation
  // (history is updated in App.tsx after this function returns)
  const fluxHistoryForCalc = labState.fluxHistory.length > 0
    ? [...labState.fluxHistory, smoothedFlux]
    : [smoothedFlux];
  const timeHistoryForCalc = labState.fluxTimeHistory.length > 0
    ? [...labState.fluxTimeHistory, labState.time]
    : [labState.time];

  // Calculate flux rate using central difference
  const fluxRate = calculateFluxRateCentral(fluxHistoryForCalc, timeHistoryForCalc);

  // Calculate EMF using Faraday's law: ε = -N * dΦ/dt
  const emf = calculateEMF(fluxRate, labState.coilTurns);

  // Calculate total resistance
  const totalResistance = labState.coilResistance + labState.loadResistance;

  // Calculate current: I = ε / R_total
  const current = calculateCurrent(emf, totalResistance);

  // Get current direction and Lenz's law explanation
  const { direction, fluxChange, explanation } = getCurrentDirectionAndExplanation(fluxRate, emf);

  // Calculate magnetic field at coil center (for display)
  const B_avg = calculateAverageFieldOverCoil(
    {
      position: labState.coilPosition,
      radius: labState.coilRadius,
      turns: labState.coilTurns,
      angle: labState.coilAngle,
      resistance: labState.coilResistance,
    },
    labState.magnetPosition,
    labState.magnetDipoleMoment,
    labState.fluxIntegrationSamples
  );

  // Calculate speed
  const speed = Math.sqrt(
    labState.magnetVelocity.x ** 2 + labState.magnetVelocity.y ** 2
  );

  // Create complete measurement
  const measurement: Measurement = {
    timestamp: labState.time,
    deltaT: dt,
    magnetX: labState.magnetPosition.x,
    magnetY: labState.magnetPosition.y,
    velocityX: labState.magnetVelocity.x,
    velocityY: labState.magnetVelocity.y,
    speed,
    turns: labState.coilTurns,
    radius: labState.coilRadius,
    angle: labState.coilAngle,
    coilResistance: labState.coilResistance,
    loadResistance: labState.loadResistance,
    totalResistance,
    magneticFieldX: B_avg.x,
    magneticFieldY: B_avg.y,
    magneticFieldMag: Math.sqrt(B_avg.x ** 2 + B_avg.y ** 2),
    flux: smoothedFlux, // Use smoothed flux for consistency
    fluxRate,
    emf,
    current,
    direction,
    fluxChange,
    lenzExplanation: explanation,
  };

  return measurement;
}

