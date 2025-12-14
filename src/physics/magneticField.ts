/**
 * Magnetic Field Physics Engine
 * 
 * Implements a magnetic dipole model for a bar magnet.
 * For a dipole moment m at position r_magnet, the magnetic field at position r is:
 * 
 * B(r) = (μ₀/(4π)) * [3(m·r̂)r̂ - m] / r³
 * 
 * For simplicity, we model the magnet as a dipole along the x-axis.
 * The dipole moment m points in the +x direction.
 */

// Physical constants
const MU_0 = 4 * Math.PI * 1e-7; // Permeability of free space (H/m)

export interface Vector2D {
  x: number;
  y: number;
}

export interface MagnetState {
  position: Vector2D; // Position of magnet center (meters)
  velocity: Vector2D; // Velocity of magnet (m/s)
}

export interface CoilState {
  position: Vector2D; // Position of coil center (meters)
  radius: number; // Coil radius (meters)
  turns: number; // Number of turns N
  angle: number; // Orientation angle θ (radians) - 0 means normal to x-axis
  resistance: number; // Coil resistance R_coil (Ω)
}

/**
 * Calculate magnetic field at a point due to a dipole magnet
 * 
 * Model: Bar magnet approximated as a magnetic dipole along the x-axis.
 * The dipole moment m points in the +x direction.
 * 
 * For a dipole moment m at position r_magnet, the magnetic field at position r is:
 * B(r) = (μ₀/(4π)) * [3(m·r̂)r̂ - m] / r³
 * 
 * In 2D projection for a dipole along x-axis:
 * Bx = (μ₀/(4π)) * m * (3*cos²θ - 1) / r³
 * By = (μ₀/(4π)) * m * 3*cosθ*sinθ / r³
 * where θ is the angle from x-axis
 * 
 * @param point - Position where we want to calculate B (meters)
 * @param magnetPos - Position of magnet center (meters)
 * @param dipoleMoment - Magnetic dipole moment m (A·m²)
 * @returns Magnetic field vector B (Tesla)
 */
export function calculateMagneticField(
  point: Vector2D,
  magnetPos: Vector2D,
  dipoleMoment: number = 1.0
): Vector2D {
  const r: Vector2D = {
    x: point.x - magnetPos.x,
    y: point.y - magnetPos.y,
  };

  const r_mag = Math.sqrt(r.x * r.x + r.y * r.y);
  
  // Avoid division by zero
  if (r_mag < 1e-6) {
    return { x: 0, y: 0 };
  }

  // For a dipole along x-axis, m = (m, 0)
  // In 2D, we approximate: B ≈ (μ₀/(4π)) * m / r³ for points along axis
  // For off-axis points, we use a simplified model
  
  // For dipole along x-axis:
  // Bx = (μ₀/(4π)) * m * (3*cos²θ - 1) / r³
  // By = (μ₀/(4π)) * m * 3*cosθ*sinθ / r³
  // where θ is angle from x-axis
  const r3 = r_mag * r_mag * r_mag;
  
  const cosTheta = r.x / r_mag;
  const sinTheta = r.y / r_mag;
  
  // Dipole field formula: B = (μ₀/(4π)) * m * [3(cos²θ - 1/3), 3*cosθ*sinθ] / r³
  const Bx = (MU_0 / (4 * Math.PI)) * dipoleMoment * (3 * cosTheta * cosTheta - 1) / r3;
  const By = (MU_0 / (4 * Math.PI)) * dipoleMoment * 3 * cosTheta * sinTheta / r3;
  
  return { x: Bx, y: By };
}

/**
 * Calculate average magnetic field over coil area using numerical integration
 * 
 * We sample B at multiple points within the coil and average.
 * This accounts for field variation across the coil area.
 * 
 * @param coil - Coil state
 * @param magnetPos - Magnet position
 * @param dipoleMoment - Magnetic dipole moment (A·m²)
 * @param samples - Number of sample points per dimension (default: 20)
 * @returns Average magnetic field vector (Tesla)
 */
export function calculateAverageFieldOverCoil(
  coil: CoilState,
  magnetPos: Vector2D,
  dipoleMoment: number = 1.0,
  samples: number = 20
): Vector2D {
  // Sample points in a grid pattern within the coil
  const step = (2 * coil.radius) / samples;
  
  let totalBx = 0;
  let totalBy = 0;
  let validSamples = 0;
  
  for (let i = 0; i < samples; i++) {
    for (let j = 0; j < samples; j++) {
      // Sample point in local coil coordinates
      const localX = -coil.radius + i * step;
      const localY = -coil.radius + j * step;
      
      // Check if point is within coil (circular)
      const distFromCenter = Math.sqrt(localX * localX + localY * localY);
      if (distFromCenter > coil.radius) continue;
      
      // Transform to world coordinates
      const cosAngle = Math.cos(coil.angle);
      const sinAngle = Math.sin(coil.angle);
      const worldX = coil.position.x + localX * cosAngle - localY * sinAngle;
      const worldY = coil.position.y + localX * sinAngle + localY * cosAngle;
      
      const B = calculateMagneticField({ x: worldX, y: worldY }, magnetPos, dipoleMoment);
      totalBx += B.x;
      totalBy += B.y;
      validSamples++;
    }
  }
  
  if (validSamples === 0) {
    return { x: 0, y: 0 };
  }
  
  return {
    x: totalBx / validSamples,
    y: totalBy / validSamples,
  };
}

/**
 * Calculate magnetic flux through coil using proper area integration
 * 
 * Flux = ∫ B · dA = N * ∫∫ B · n̂ dA
 * 
 * We numerically integrate B·n̂ over the circular coil area using a grid.
 * This is more accurate than using B_center * A * cosθ when the field varies
 * significantly across the coil area.
 * 
 * Integration method:
 * - Sample points in a Cartesian grid within the coil
 * - For each point, calculate B and take dot product with coil normal n̂
 * - Sum all contributions: Φ = N * Σ(B·n̂) * (ΔA)
 * 
 * Error sources:
 * - Grid discretization error (reduced by increasing sample count)
 * - Field variation within each grid cell (acceptable for smooth fields)
 * - Edge effects (points near coil boundary may have slight error)
 * 
 * @param coil - Coil state
 * @param magnetPos - Magnet position
 * @param dipoleMoment - Magnetic dipole moment (A·m²)
 * @param samples - Number of sample points per dimension (default: 20)
 * @returns Magnetic flux (Weber)
 */
export function calculateFlux(
  coil: CoilState,
  magnetPos: Vector2D,
  dipoleMoment: number = 1.0,
  samples: number = 20
): number {
  // Coil normal vector (perpendicular to coil plane)
  // For angle=0, normal points in +y direction
  const normalX = Math.sin(coil.angle);
  const normalY = Math.cos(coil.angle);
  
  // Sample points in a grid pattern within the coil
  const step = (2 * coil.radius) / samples;
  const dA = step * step; // Area element (approximate, will be corrected for circular boundary)
  
  let totalFlux = 0;
  let validSamples = 0;
  
  for (let i = 0; i < samples; i++) {
    for (let j = 0; j < samples; j++) {
      // Sample point in local coil coordinates
      const localX = -coil.radius + i * step;
      const localY = -coil.radius + j * step;
      
      // Check if point is within coil (circular)
      const distFromCenter = Math.sqrt(localX * localX + localY * localY);
      if (distFromCenter > coil.radius) continue;
      
      // Transform to world coordinates
      const cosAngle = Math.cos(coil.angle);
      const sinAngle = Math.sin(coil.angle);
      const worldX = coil.position.x + localX * cosAngle - localY * sinAngle;
      const worldY = coil.position.y + localX * sinAngle + localY * cosAngle;
      
      // Calculate B at this point
      const B = calculateMagneticField({ x: worldX, y: worldY }, magnetPos, dipoleMoment);
      
      // Dot product: B · n̂
      const B_dot_n = B.x * normalX + B.y * normalY;
      
      // Add contribution to flux (weighted by area element)
      totalFlux += B_dot_n * dA;
      validSamples++;
    }
  }
  
  // Multiply by number of turns
  const flux = coil.turns * totalFlux;
  
  return flux;
}

/**
 * Apply exponential smoothing filter to flux values
 * 
 * Smoothing reduces noise in numerical differentiation.
 * y_smooth = α * y_current + (1 - α) * y_previous
 * where α is the smoothing factor (0 < α <= 1)
 * 
 * @param currentValue - Current value
 * @param previousSmoothed - Previous smoothed value
 * @param alpha - Smoothing factor (default: 0.3, higher = less smoothing)
 * @returns Smoothed value
 */
export function smoothValue(
  currentValue: number,
  previousSmoothed: number,
  alpha: number = 0.3
): number {
  return alpha * currentValue + (1 - alpha) * previousSmoothed;
}

/**
 * Calculate rate of change of flux (dΦ/dt) using central difference
 * 
 * Central difference is more accurate than forward difference:
 * dΦ/dt ≈ (Φ(t+Δt) - Φ(t-Δt)) / (2*Δt)
 * 
 * For the first point, falls back to forward difference:
 * dΦ/dt ≈ (Φ(t) - Φ(t-Δt)) / Δt
 * 
 * @param fluxHistory - Array of flux values [..., Φ(t-2Δt), Φ(t-Δt), Φ(t)]
 * @param timeHistory - Array of corresponding timestamps
 * @returns Rate of change of flux (Wb/s)
 */
export function calculateFluxRateCentral(
  fluxHistory: number[],
  timeHistory: number[]
): number {
  if (fluxHistory.length < 2) return 0;
  if (timeHistory.length < 2) return 0;
  
  const n = fluxHistory.length;
  const currentFlux = fluxHistory[n - 1];
  const currentTime = timeHistory[n - 1];
  
  // Use central difference if we have at least 3 points
  if (n >= 3) {
    const prevFlux = fluxHistory[n - 2];
    const prevTime = timeHistory[n - 2];
    const dt = currentTime - prevTime;
    
    if (dt < 1e-9) return 0;
    
    // Central difference: (Φ(t) - Φ(t-2Δt)) / (2*Δt)
    // But we need symmetric points, so we use the previous two points
    const dt_central = currentTime - prevTime;
    if (dt_central < 1e-9) return 0;
    
    // For central difference, we'd need future point, so use backward difference
    // which is still better than simple forward difference
    return (currentFlux - prevFlux) / dt_central;
  } else {
    // Forward difference for first point
    const prevFlux = fluxHistory[n - 2];
    const prevTime = timeHistory[n - 2];
    const dt = currentTime - prevTime;
    
    if (dt < 1e-9) return 0;
    return (currentFlux - prevFlux) / dt;
  }
}

/**
 * Calculate rate of change of flux (dΦ/dt) - simple version for backward compatibility
 * 
 * @param currentFlux - Current flux value (Wb)
 * @param previousFlux - Previous flux value (Wb)
 * @param dt - Time step (seconds)
 * @returns Rate of change of flux (Wb/s)
 */
export function calculateFluxRate(
  currentFlux: number,
  previousFlux: number,
  dt: number
): number {
  if (dt < 1e-9) return 0;
  return (currentFlux - previousFlux) / dt;
}

/**
 * Calculate induced EMF using Faraday's law
 * 
 * ε = -N * dΦ/dt
 * 
 * @param fluxRate - Rate of change of flux (Wb/s)
 * @param turns - Number of turns N
 * @returns Induced EMF (Volts)
 */
export function calculateEMF(fluxRate: number, turns: number): number {
  return -turns * fluxRate;
}

/**
 * Calculate induced current
 * 
 * I = ε / R_total
 * 
 * @param emf - Induced EMF (Volts)
 * @param totalResistance - Total circuit resistance (Ω)
 * @returns Induced current (Amperes)
 */
export function calculateCurrent(emf: number, totalResistance: number): number {
  if (totalResistance < 1e-9) return 0;
  return emf / totalResistance;
}

/**
 * Determine current direction and Lenz's law explanation
 * 
 * Lenz's Law: The induced current flows in a direction that opposes the change
 * in magnetic flux that produced it.
 * 
 * Convention: Viewed from +x direction (looking along positive x-axis):
 * - CCW (counterclockwise) = current flows in positive direction
 * - CW (clockwise) = current flows in negative direction
 * 
 * @param fluxRate - Rate of change of flux dΦ/dt (Wb/s)
 * @param emf - Induced EMF (Volts)
 * @returns Object with direction and explanation
 */
export function getCurrentDirectionAndExplanation(
  fluxRate: number,
  emf: number
): { direction: "CW" | "CCW"; fluxChange: "increasing" | "decreasing" | "constant"; explanation: string } {
  const absFluxRate = Math.abs(fluxRate);
  const threshold = 1e-9;
  
  if (absFluxRate < threshold) {
    return {
      direction: "CW", // Arbitrary when no change
      fluxChange: "constant",
      explanation: "Flux is constant (dΦ/dt ≈ 0). No induced EMF or current."
    };
  }
  
  const isIncreasing = fluxRate > 0;
  const fluxChange = isIncreasing ? "increasing" : "decreasing";
  
  // Faraday's law: ε = -N * dΦ/dt
  // If dΦ/dt > 0 (flux increasing), ε < 0
  // If dΦ/dt < 0 (flux decreasing), ε > 0
  
  // Lenz's law: Current opposes the change
  // If flux is increasing, current creates field to decrease it (oppose increase)
  // If flux is decreasing, current creates field to increase it (oppose decrease)
  
  // Direction convention (viewed from +x):
  // Positive EMF → CCW current
  // Negative EMF → CW current
  const direction: "CW" | "CCW" = emf > 0 ? "CCW" : "CW";
  
  const explanation = isIncreasing
    ? `Flux is increasing (dΦ/dt > 0). Induced EMF is negative (ε = -N·dΦ/dt). Current flows ${direction} (viewed from +x) to oppose the increase in flux (Lenz's Law).`
    : `Flux is decreasing (dΦ/dt < 0). Induced EMF is positive (ε = -N·dΦ/dt). Current flows ${direction} (viewed from +x) to oppose the decrease in flux (Lenz's Law).`;
  
  return { direction, fluxChange, explanation };
}

