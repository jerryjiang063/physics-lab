# Faraday's Law Virtual Lab

A web-based virtual laboratory for exploring electromagnetic induction and Faraday's law.

## Features

- Interactive magnet and coil setup
- Real-time calculation of magnetic flux, induced EMF, and current
- Visual representation of magnetic fields and current direction
- Data recording and export (CSV/JSON)
- Real-time graphs of flux and EMF over time

## Physics

The lab implements:
- **Faraday's Law**: ε = -N dΦ/dt
- **Magnetic Flux**: Φ = ∫ B · dA
- **Lenz's Law**: Current direction opposes flux change
- **Magnetic Dipole Model**: Bar magnet approximated as dipole

## Getting Started

```bash
npm install
npm run dev
```

## Tech Stack

- React + TypeScript
- Vite
- Recharts for data visualization
- Canvas for 2D visualization

