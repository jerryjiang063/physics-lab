import React from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';

const About: React.FC = () => {
  const styles = {
    aboutPage: {
      minHeight: '100vh',
      background: '#f5f5f5',
    },
    aboutContainer: {
      maxWidth: '900px',
      margin: '0 auto',
      padding: '20px',
    },
    aboutHeader: {
      textAlign: 'center' as const,
      marginBottom: '30px',
      padding: '20px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      borderRadius: '8px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      position: 'relative' as const,
    },
    aboutHeaderH1: {
      fontSize: '2.5em',
      marginBottom: '10px',
    },
    aboutHeaderLink: {
      position: 'absolute' as const,
      top: '20px',
      left: '20px',
      padding: '8px 16px',
      background: 'rgba(255, 255, 255, 0.2)',
      borderRadius: '4px',
      transition: 'background 0.2s',
      color: 'white',
      textDecoration: 'none',
      fontSize: '14px',
    },
    aboutContent: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '30px',
    },
    aboutSection: {
      background: 'white',
      padding: '25px',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    },
    aboutSectionH2: {
      marginTop: 0,
      marginBottom: '15px',
      color: '#333',
      borderBottom: '2px solid #667eea',
      paddingBottom: '10px',
      fontSize: '1.8em',
    },
    aboutSectionH3: {
      marginTop: '20px',
      marginBottom: '10px',
      color: '#555',
      fontSize: '1.3em',
    },
    aboutSectionH4: {
      marginTop: '15px',
      marginBottom: '8px',
      color: '#666',
      fontSize: '1.1em',
    },
    aboutSectionP: {
      lineHeight: 1.6,
      marginBottom: '12px',
      color: '#444',
    },
    aboutSectionUl: {
      marginLeft: '20px',
      marginBottom: '15px',
      lineHeight: 1.8,
      color: '#444',
    },
    aboutSectionLi: {
      marginBottom: '8px',
    },
    formulaBox: {
      background: '#f8f9fa',
      borderLeft: '4px solid #667eea',
      padding: '15px',
      margin: '15px 0',
      borderRadius: '4px',
    },
    formulaBoxH4: {
      marginTop: 0,
      color: '#667eea',
    },
    formulaBoxP: {
      marginBottom: '8px',
    },
    formulaBoxStrong: {
      fontSize: '1.1em',
      color: '#333',
      fontFamily: "'Courier New', monospace",
    },
    creditLink: {
      color: '#667eea',
      textDecoration: 'none',
      transition: 'all 0.2s',
    },
  };

  return (
    <div style={styles.aboutPage}>
      <div style={styles.aboutContainer}>
        <header style={styles.aboutHeader}>
          <h1 style={styles.aboutHeaderH1}>About Physics Virtual Lab</h1>
          <Link to="/" style={styles.aboutHeaderLink}>
            ← Back to Lab
          </Link>
        </header>

        <div style={styles.aboutContent}>
          {/* Section A: What this website does */}
          <section style={styles.aboutSection}>
            <h2 style={styles.aboutSectionH2}>What This Website Does</h2>
            <p style={styles.aboutSectionP}>
              This is a <strong>Physics Virtual Lab</strong> designed for educational demonstration and verification 
              of electromagnetic phenomena. The lab provides interactive simulations for:
            </p>
            <ul style={styles.aboutSectionUl}>
              <li style={styles.aboutSectionLi}><strong>Mode A: Faraday's Law</strong> - Explore electromagnetic induction by moving a magnet near a coil</li>
              <li style={styles.aboutSectionLi}><strong>Mode B: Current → Magnetic Field</strong> - Investigate how electric current in a solenoid produces a magnetic field</li>
            </ul>
            <p style={styles.aboutSectionP}>
              Students can adjust parameters, record measurements, visualize relationships, and export data for analysis.
            </p>
          </section>

          {/* Section B: Why data is trustworthy */}
          <section style={styles.aboutSection}>
            <h2 style={styles.aboutSectionH2}>Why the Data is Trustworthy</h2>
            
            <h3 style={styles.aboutSectionH3}>1. Based on Known Physical Laws</h3>
            <p style={styles.aboutSectionP}>All calculations use established physics formulas:</p>
            
            <div style={styles.formulaBox}>
              <h4 style={styles.formulaBoxH4}>Solenoid (Mode B)</h4>
              <p style={styles.formulaBoxP}><strong style={styles.formulaBoxStrong}>B ≈ μ₀ × n × I</strong></p>
              <p style={styles.formulaBoxP}>where μ₀ = 4π × 10⁻⁷ T·m/A (vacuum permeability)</p>
              <p style={styles.formulaBoxP}><em>Applicable conditions:</em> Long solenoid, uniform winding, interior field is approximately uniform</p>
            </div>

            <div style={styles.formulaBox}>
              <h4 style={styles.formulaBoxH4}>Electromagnetic Induction (Mode A)</h4>
              <p style={styles.formulaBoxP}><strong style={styles.formulaBoxStrong}>ε = -N × dΦ/dt</strong></p>
              <p style={styles.formulaBoxP}>where N = number of turns, Φ = magnetic flux</p>
              <p style={styles.formulaBoxP}><em>Model assumptions:</em> Ideal coil, negligible resistance effects, ideal magnetic dipole approximation</p>
            </div>

            <h3 style={styles.aboutSectionH3}>2. Explicit Model Assumptions</h3>
            <p style={styles.aboutSectionP}>The simulations use simplified models with clearly stated boundaries:</p>
            <ul style={styles.aboutSectionUl}>
              <li style={styles.aboutSectionLi}><strong>Ideal DC power supply</strong> - Constant voltage, no internal resistance</li>
              <li style={styles.aboutSectionLi}><strong>Ideal conductors</strong> - Zero wire resistance (except where explicitly modeled)</li>
              <li style={styles.aboutSectionLi}><strong>Uniform winding</strong> - Wire thickness ignored, perfect geometric distribution</li>
              <li style={styles.aboutSectionLi}><strong>Temperature effects ignored</strong> - Resistance assumed constant (ideal resistor model)</li>
              <li style={styles.aboutSectionLi}><strong>End effects</strong> - Mode B includes an optional toggle for finite solenoid end effects</li>
            </ul>

            <h3 style={styles.aboutSectionH3}>3. All Quantities Have Units and Can Be Verified</h3>
            <p style={styles.aboutSectionP}>Every displayed value uses SI units and can be recalculated from user inputs:</p>
            
            <div style={styles.formulaBox}>
              <h4 style={styles.formulaBoxH4}>Mode B: Solenoid Lab</h4>
              <ul style={styles.aboutSectionUl}>
                <li style={styles.aboutSectionLi}><strong>User inputs:</strong> V (Volts), R_total (Ohms), L (meters), N (turns)</li>
                <li style={styles.aboutSectionLi}><strong>Calculated:</strong> I = V / R_total, n = N / L, B = μ₀ × n × I</li>
                <li style={styles.aboutSectionLi}><strong>All values visible:</strong> You can verify B using the displayed I and n</li>
              </ul>
            </div>

            <div style={styles.formulaBox}>
              <h4 style={styles.formulaBoxH4}>Mode A: Faraday's Law</h4>
              <ul style={styles.aboutSectionUl}>
                <li style={styles.aboutSectionLi}><strong>User inputs:</strong> Magnet position, coil geometry (N, R), resistance</li>
                <li style={styles.aboutSectionLi}><strong>Calculated:</strong> B (from dipole model), Φ (flux integration), dΦ/dt (numerical differentiation), ε = -N × dΦ/dt</li>
                <li style={styles.aboutSectionLi}><strong>Verifiable:</strong> All intermediate steps are shown in measurements panel</li>
              </ul>
            </div>

            <h3 style={styles.aboutSectionH3}>4. Cross-Validation with Real Experiments</h3>
            <p style={styles.aboutSectionP}>You can verify the simulations with physical measurements:</p>
            <ul style={styles.aboutSectionUl}>
              <li style={styles.aboutSectionLi}><strong>Current measurement:</strong> Use an ammeter to measure I, compare with calculated I = V / R</li>
              <li style={styles.aboutSectionLi}><strong>Geometry measurement:</strong> Measure L with a ruler, count N turns, calculate n = N / L</li>
              <li style={styles.aboutSectionLi}><strong>Magnetic field measurement:</strong> Use a Hall probe or smartphone magnetometer inside the solenoid</li>
              <li style={styles.aboutSectionLi}><strong>Note on real experiments:</strong> Physical measurements will have errors due to environmental factors</li>
            </ul>

            <h3 style={styles.aboutSectionH3}>5. Sources of Discrepancy</h3>
            <p style={styles.aboutSectionP}>Real experiments may differ from simulation values due to:</p>
            <ul style={styles.aboutSectionUl}>
              <li style={styles.aboutSectionLi}><strong>Environmental magnetic fields:</strong> Earth's magnetic field (~50 μT), nearby metal objects</li>
              <li style={styles.aboutSectionLi}><strong>Coil imperfections:</strong> Non-uniform winding, finite length effects, wire thickness</li>
              <li style={styles.aboutSectionLi}><strong>Electrical losses:</strong> Power supply internal resistance, wire resistance, heating effects</li>
              <li style={styles.aboutSectionLi}><strong>Sensor limitations:</strong> Hall probe accuracy, calibration, temperature drift</li>
            </ul>
            <p style={styles.aboutSectionP}>
              <strong>Important:</strong> The simulation provides <em>ideal/approximate values</em> based on simplified models. 
              These are useful for understanding relationships and trends, but real-world measurements will include experimental errors.
            </p>
          </section>

          {/* Section C: Contact/Credits */}
          <section style={styles.aboutSection}>
            <h2 style={styles.aboutSectionH2}>Credits</h2>
            <p style={styles.aboutSectionP}>
              Built by <a href="https://spyccb.top" target="_blank" rel="noopener noreferrer" style={styles.creditLink}>Jerry Jiang</a>
            </p>
          </section>
        </div>

        <Footer />
      </div>
    </div>
  );
};

export default About;
