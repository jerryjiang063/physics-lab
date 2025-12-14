# Quick Start Guide

## Running the Lab

1. **Install dependencies** (if not already done):
   ```bash
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm run dev
   ```

3. **Open your browser** to the URL shown (typically `http://localhost:5173`)

## Using the Lab

### Basic Operation

1. **Move the magnet**: Click and drag the red bar magnet in the visualization area
2. **Adjust coil parameters**: Use the sliders in the Controls panel to change:
   - Number of turns (N)
   - Coil radius (R)
   - Coil angle (θ)
   - Coil resistance (R_coil)
   - Load resistance (R_load)

3. **Motion modes**:
   - **Manual**: Drag the magnet with your mouse
   - **Constant Speed**: Magnet moves at constant velocity
   - **Sinusoidal**: Magnet oscillates back and forth

### Recording Data

1. **Start Recording**: Click the "Start Recording" button to begin logging measurements at 60 Hz
2. **Add Snapshot**: Click "Add Snapshot" to record a single measurement point
3. **Stop Recording**: Click "Stop Recording" to pause data collection

### Exporting Data

- **Export CSV**: Download all recorded measurements as a CSV file
- **Export JSON**: Download all recorded measurements as a JSON file

### Understanding the Measurements

- **Magnetic Field (B)**: Field strength at the coil center (Tesla)
- **Magnetic Flux (Φ)**: Total flux through the coil (Weber)
- **dΦ/dt**: Rate of change of flux (Weber/second)
- **Induced EMF (ε)**: Electromotive force = -N * dΦ/dt (Volts)
- **Induced Current (I)**: Current = ε / R_total (Amperes)
- **Direction**: Current direction (CW = clockwise, CCW = counterclockwise)

### Physics Verification

The lab implements Faraday's law correctly:
- Faster magnet motion → larger |dΦ/dt| → larger |ε|
- More turns (N) → larger |ε| (proportional to N)
- Higher resistance → smaller current (for same ε)
- Approaching vs. receding → ε changes sign (Lenz's law)

## Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

