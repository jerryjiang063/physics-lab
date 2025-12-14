import React from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';
import './About.css';

const About: React.FC = () => {
  return (
    <div className="about-page">
      <div className="about-container">
        <header className="about-header">
          <h1>About Physics Virtual Lab</h1>
          <Link to="/" style={{ color: 'white', textDecoration: 'none', fontSize: '14px' }}>
            ← Back to Lab
          </Link>
        </header>

        <div className="about-content">
          {/* Section A: What this website does */}
          <section className="about-section">
            <h2>What This Website Does</h2>
            <p>
              This is a <strong>Physics Virtual Lab</strong> designed for educational demonstration and verification 
              of electromagnetic phenomena. The lab provides interactive simulations for:
            </p>
            <ul>
              <li><strong>Mode A: Faraday's Law</strong> - Explore electromagnetic induction by moving a magnet near a coil</li>
              <li><strong>Mode B: Current → Magnetic Field</strong> - Investigate how electric current in a solenoid produces a magnetic field</li>
            </ul>
            <p>
              Students can adjust parameters, record measurements, visualize relationships, and export data for analysis.
            </p>
          </section>

          {/* Section B: Why data is trustworthy */}
          <section className="about-section">
            <h2>Why the Data is Trustworthy</h2>
            
            <h3>1. Based on Known Physical Laws</h3>
            <p>All calculations use established physics formulas:</p>
            
            <div className="formula-box">
              <h4>Solenoid (Mode B)</h4>
              <p><strong>B ≈ μ₀ × n × I</strong></p>
              <p>where μ₀ = 4π × 10⁻⁷ T·m/A (vacuum permeability)</p>
              <p><em>Applicable conditions:</em> Long solenoid, uniform winding, interior field is approximately uniform</p>
            </div>

            <div className="formula-box">
              <h4>Electromagnetic Induction (Mode A)</h4>
              <p><strong>ε = -N × dΦ/dt</strong></p>
              <p>where N = number of turns, Φ = magnetic flux</p>
              <p><em>Model assumptions:</em> Ideal coil, negligible resistance effects, ideal magnetic dipole approximation</p>
            </div>

            <h3>2. Explicit Model Assumptions</h3>
            <p>The simulations use simplified models with clearly stated boundaries:</p>
            <ul>
              <li><strong>Ideal DC power supply</strong> - Constant voltage, no internal resistance</li>
              <li><strong>Ideal conductors</strong> - Zero wire resistance (except where explicitly modeled)</li>
              <li><strong>Uniform winding</strong> - Wire thickness ignored, perfect geometric distribution</li>
              <li><strong>Temperature effects ignored</strong> - Resistance assumed constant (ideal resistor model)</li>
              <li><strong>End effects</strong> - Mode B includes an optional toggle for finite solenoid end effects</li>
            </ul>

            <h3>3. All Quantities Have Units and Can Be Verified</h3>
            <p>Every displayed value uses SI units and can be recalculated from user inputs:</p>
            
            <div className="verification-box">
              <h4>Mode B: Solenoid Lab</h4>
              <ul>
                <li><strong>User inputs:</strong> V (Volts), R_total (Ohms), L (meters), N (turns)</li>
                <li><strong>Calculated:</strong> I = V / R_total, n = N / L, B = μ₀ × n × I</li>
                <li><strong>All values visible:</strong> You can verify B using the displayed I and n</li>
              </ul>
            </div>

            <div className="verification-box">
              <h4>Mode A: Faraday's Law</h4>
              <ul>
                <li><strong>User inputs:</strong> Magnet position, coil geometry (N, R), resistance</li>
                <li><strong>Calculated:</strong> B (from dipole model), Φ (flux integration), dΦ/dt (numerical differentiation), ε = -N × dΦ/dt</li>
                <li><strong>Verifiable:</strong> All intermediate steps are shown in measurements panel</li>
              </ul>
            </div>

            <h3>4. Cross-Validation with Real Experiments</h3>
            <p>You can verify the simulations with physical measurements:</p>
            <ul>
              <li><strong>Current measurement:</strong> Use an ammeter to measure I, compare with calculated I = V / R</li>
              <li><strong>Geometry measurement:</strong> Measure L with a ruler, count N turns, calculate n = N / L</li>
              <li><strong>Magnetic field measurement:</strong> Use a Hall probe or smartphone magnetometer inside the solenoid</li>
              <li><strong>Note on real experiments:</strong> Physical measurements will have errors due to environmental factors</li>
            </ul>

            <h3>5. Sources of Discrepancy</h3>
            <p>Real experiments may differ from simulation values due to:</p>
            <ul>
              <li><strong>Environmental magnetic fields:</strong> Earth's magnetic field (~50 μT), nearby metal objects</li>
              <li><strong>Coil imperfections:</strong> Non-uniform winding, finite length effects, wire thickness</li>
              <li><strong>Electrical losses:</strong> Power supply internal resistance, wire resistance, heating effects</li>
              <li><strong>Sensor limitations:</strong> Hall probe accuracy, calibration, temperature drift</li>
            </ul>
            <p>
              <strong>Important:</strong> The simulation provides <em>ideal/approximate values</em> based on simplified models. 
              These are useful for understanding relationships and trends, but real-world measurements will include experimental errors.
            </p>
          </section>

          {/* Section C: Contact/Credits */}
          <section className="about-section">
            <h2>Credits</h2>
            <p>
              Built by <a href="https://spyccb.top" target="_blank" rel="noopener noreferrer" className="credit-link">Jerry Jiang</a>
            </p>
          </section>
        </div>

        <Footer />
      </div>
    </div>
  );
};

export default About;

