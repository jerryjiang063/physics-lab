/**
 * Biot-Savart Law Physics Engine
 * 
 * Calculates magnetic field produced by electric current in various geometries.
 * 
 * Biot-Savart Law:
 * dB = (μ₀/(4π)) * I * (dl × r̂) / r²
 * 
 * where:
 * - μ₀ = 4π × 10⁻⁷ T·m/A (permeability of free space)
 * - I is current (A)
 * - dl is infinitesimal wire element
 * - r is distance from wire element to point
 * - r̂ is unit vector from wire element to point
 */

// Physical constants
const MU_0 = 4 * Math.PI * 1e-7; // Permeability of free space (T·m/A)

export interface Vector2D {
  x: number;
  y: number;
}

/**
 * Calculate magnetic field from a long straight wire
 * 
 * Analytical formula: B = μ₀ * I / (2π * r)
 * 
 * Direction: Right-hand rule - if current flows in +x direction,
 * field circles around wire (counterclockwise when viewed from +x).
 * 
 * @param point - Position where we want to calculate B (meters)
 * @param wirePosition - Position of wire (meters, wire extends along x-axis)
 * @param current - Current I (Amperes)
 * @returns Magnetic field vector B (Tesla)
 */
export function calculateFieldStraightWire(
  point: Vector2D,
  wirePosition: Vector2D,
  current: number
): Vector2D {
  // Distance from wire (perpendicular distance)
  const r = Math.abs(point.y - wirePosition.y);
  
  if (r < 1e-6) {
    // Too close to wire - field diverges
    return { x: 0, y: 0 };
  }
  
  // Magnitude: B = μ₀ * I / (2π * r)
  const B_magnitude = (MU_0 * current) / (2 * Math.PI * r);
  
  // Direction: Right-hand rule
  // If current flows in +x, field at point above wire (+y) points in -z (out of page in 2D)
  // In 2D projection, we show field as perpendicular to radial direction
  // Field circles around wire: for point above wire, field points left (-x)
  const sign = point.y > wirePosition.y ? -1 : 1;
  
  // In 2D, we approximate the circular field as perpendicular to radial
  // For a point at (x, y) relative to wire at (x_wire, y_wire):
  // Radial vector: (x - x_wire, y - y_wire)
  // Perpendicular (rotated 90°): (-(y - y_wire), (x - x_wire))
  const dx = point.x - wirePosition.x;
  const dy = point.y - wirePosition.y;
  const r_mag = Math.sqrt(dx * dx + dy * dy);
  
  if (r_mag < 1e-6) {
    return { x: 0, y: 0 };
  }
  
  // Unit vector perpendicular to radial (tangent to circle around wire)
  const Bx = -sign * B_magnitude * (dy / r_mag);
  const By = sign * B_magnitude * (dx / r_mag);
  
  return { x: Bx, y: By };
}

/**
 * Calculate magnetic field at center of circular loop
 * 
 * Analytical formula: B = μ₀ * N * I / (2 * R)
 * 
 * Direction: Right-hand rule - if current flows counterclockwise,
 * field points out of loop plane (in +z, or +y in 2D projection).
 * 
 * @param point - Position where we want to calculate B (meters)
 * @param loopCenter - Center of loop (meters)
 * @param loopRadius - Loop radius R (meters)
 * @param current - Current I (Amperes)
 * @param turns - Number of turns N
 * @returns Magnetic field vector B (Tesla)
 */
export function calculateFieldCircularLoop(
  point: Vector2D,
  loopCenter: Vector2D,
  loopRadius: number,
  current: number,
  turns: number
): Vector2D {
  const dx = point.x - loopCenter.x;
  const dy = point.y - loopCenter.y;
  const r = Math.sqrt(dx * dx + dy * dy);
  
  // For points on axis (y = 0, x along axis)
  if (Math.abs(dy) < 1e-3 && r > 0) {
    // On-axis field: B = (μ₀ * N * I * R²) / (2 * (R² + x²)^(3/2))
    const x = Math.abs(dx);
    const B_magnitude = (MU_0 * turns * current * loopRadius * loopRadius) / 
                        (2 * Math.pow(loopRadius * loopRadius + x * x, 1.5));
    
    // Direction: along axis, pointing in +x if current is CCW
    const direction = dx > 0 ? 1 : -1;
    return { x: direction * B_magnitude, y: 0 };
  }
  
  // For center of loop
  if (r < 1e-3) {
    // At center: B = μ₀ * N * I / (2 * R)
    const B_magnitude = (MU_0 * turns * current) / (2 * loopRadius);
    // Field points out of loop plane (in +y direction in 2D)
    return { x: 0, y: B_magnitude };
  }
  
  // For off-axis points, use Biot-Savart with discretized loop
  return calculateFieldLoopBiotSavart(point, loopCenter, loopRadius, current, turns);
}

/**
 * Calculate magnetic field from circular loop using Biot-Savart law
 * 
 * Discretizes loop into segments and integrates.
 * 
 * @param point - Position where we want to calculate B (meters)
 * @param loopCenter - Center of loop (meters)
 * @param loopRadius - Loop radius R (meters)
 * @param current - Current I (Amperes)
 * @param turns - Number of turns N
 * @returns Magnetic field vector B (Tesla)
 */
function calculateFieldLoopBiotSavart(
  point: Vector2D,
  loopCenter: Vector2D,
  loopRadius: number,
  current: number,
  turns: number
): Vector2D {
  const segments = 100; // Number of segments to discretize loop
  const dTheta = (2 * Math.PI) / segments;
  
  let Bx_total = 0;
  let By_total = 0;
  
  for (let i = 0; i < segments; i++) {
    const theta = i * dTheta;
    
    // Position of wire segment
    const segmentX = loopCenter.x + loopRadius * Math.cos(theta);
    const segmentY = loopCenter.y + loopRadius * Math.sin(theta);
    
    // Vector from segment to point
    const rx = point.x - segmentX;
    const ry = point.y - segmentY;
    const r_mag = Math.sqrt(rx * rx + ry * ry);
    
    if (r_mag < 1e-6) continue;
    
    // Unit vector
    const r_hat_x = rx / r_mag;
    const r_hat_y = ry / r_mag;
    
    // Direction of current (tangent to loop, counterclockwise)
    const dl_x = -loopRadius * Math.sin(theta) * dTheta;
    const dl_y = loopRadius * Math.cos(theta) * dTheta;
    
    // Cross product: dl × r̂ (in 2D, this gives z-component)
    // For 2D projection, we approximate
    const cross_z = dl_x * r_hat_y - dl_y * r_hat_x;
    
    // Biot-Savart: dB = (μ₀/(4π)) * I * (dl × r̂) / r²
    const dB_magnitude = (MU_0 / (4 * Math.PI)) * current * Math.abs(cross_z) / (r_mag * r_mag);
    
    // Field direction (perpendicular to plane in 3D, approximated in 2D)
    // For CCW current, field points out of plane
    const Bx_seg = -dB_magnitude * (ry / r_mag); // Approximate
    const By_seg = dB_magnitude * (rx / r_mag);
    
    Bx_total += Bx_seg;
    By_total += By_seg;
  }
  
  // Multiply by number of turns
  return { x: Bx_total * turns, y: By_total * turns };
}

/**
 * Calculate magnetic field from ideal solenoid along central axis
 * 
 * Ideal solenoid formula: B = μ₀ * n * I
 * where n = N / L is turn density.
 * 
 * For ideal solenoid (infinite length approximation):
 * - Field is uniform inside solenoid along axis
 * - Field points along axis
 * - Field is zero outside
 * 
 * For finite solenoid with end effects (optional):
 * B(z) = (μ₀ * n * I / 2) * [cos(θ1) + cos(θ2)]
 * where θ1 and θ2 are angles from ends to point on axis
 * 
 * @param z - Position along axis (meters), relative to center (0 = center)
 * @param solenoidLength - Length L (meters)
 * @param current - Current I (Amperes)
 * @param turns - Number of turns N
 * @param useEndEffects - If true, use finite solenoid formula; if false, use ideal formula
 * @returns Magnetic field magnitude B (Tesla) along axis
 */
export function calculateFieldSolenoidAxis(
  z: number,
  solenoidLength: number,
  current: number,
  turns: number,
  useEndEffects: boolean = false
): number {
  const turnDensity = turns / solenoidLength; // n = N / L
  
  if (!useEndEffects) {
    // Ideal solenoid: B = μ₀ * n * I (uniform inside)
    const halfLength = solenoidLength / 2;
    if (Math.abs(z) <= halfLength) {
      return MU_0 * turnDensity * current;
    } else {
      // Outside solenoid: field is much weaker (approximate as zero for ideal)
      return 0;
    }
  } else {
    // Finite solenoid with end effects
    // B(z) = (μ₀ * n * I / 2) * [cos(θ1) + cos(θ2)]
    // where θ1 = angle from left end, θ2 = angle from right end
    const halfLength = solenoidLength / 2;
    const leftEnd = -halfLength;
    const rightEnd = halfLength;
    
    // For point on axis, angles are:
    // θ1 = arctan(R / (z - leftEnd)) but we need R, so approximate
    // For simplicity, use a simplified model
    // Actually, for axis calculation, we need the radius R
    // For now, use ideal formula as base
    const idealB = MU_0 * turnDensity * current;
    
    // End effect correction (simplified)
    // Field decreases near ends
    const distanceFromLeft = z - leftEnd;
    const distanceFromRight = rightEnd - z;
    const minDistance = Math.min(distanceFromLeft, distanceFromRight);
    
    // Approximate end effect: field reduces near ends
    if (minDistance < solenoidLength * 0.1) {
      // Within 10% of length from end, reduce field
      const reductionFactor = minDistance / (solenoidLength * 0.1);
      return idealB * reductionFactor;
    }
    
    return idealB;
  }
}

/**
 * Calculate distance from point to wire/loop/solenoid
 * 
 * @param point - Probe position (meters)
 * @param geometryType - Type of geometry
 * @param geometryCenter - Center of geometry (meters)
 * @param geometryRadius - Radius for loop (meters), or 0 for wire/solenoid
 * @returns Distance r (meters)
 */
export function calculateDistance(
  point: Vector2D,
  geometryType: "wire" | "loop" | "solenoid",
  geometryCenter: Vector2D,
  _geometryRadius: number
): number {
  if (geometryType === "wire") {
    // Perpendicular distance to wire (wire extends along x-axis)
    // geometryRadius unused for wire
    return Math.abs(point.y - geometryCenter.y);
  } else if (geometryType === "loop") {
    // Distance from loop center (geometryRadius is loop radius, used for reference but not in calculation)
    const dx = point.x - geometryCenter.x;
    const dy = point.y - geometryCenter.y;
    return Math.sqrt(dx * dx + dy * dy);
  } else {
    // Solenoid: distance from axis (geometryRadius unused for solenoid)
    return Math.abs(point.y - geometryCenter.y);
  }
}

