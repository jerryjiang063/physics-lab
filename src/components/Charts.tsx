import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Measurement, MeasurementB, LabMode } from '../types';

interface ChartsProps {
  measurements: Measurement[];
  measurementsB: MeasurementB[];
  labMode: LabMode;
  timeWindow: number; // Time window in seconds (0 = all data)
  onTimeWindowChange: (window: number) => void;
}

const Charts: React.FC<ChartsProps> = ({ measurements, measurementsB, labMode, timeWindow, onTimeWindowChange }) => {
  if (labMode === 'currentToField') {
    // Mode B: Current → Magnetic Field
    let filteredMeasurements = measurementsB;
    if (timeWindow > 0 && measurementsB.length > 0) {
      const latestTime = measurementsB[measurementsB.length - 1].timestamp;
      const cutoffTime = latestTime - timeWindow;
      filteredMeasurements = measurementsB.filter(m => m.timestamp >= cutoffTime);
    }

    const chartData = filteredMeasurements.slice(-2000).map(m => ({
      time: Number(m.timestamp.toFixed(2)),
      voltage: m.voltage,
      resistance: m.resistance,
      current: m.current,
      B: m.magneticField,
      n: m.turnDensity,
    }));

    const formatTime = (value: number) => value.toFixed(2);
    const customTooltip = ({ active, payload, label }: any) => {
      if (active && payload && payload.length) {
        return (
          <div style={{ background: 'white', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}>
            <p style={{ margin: 0, fontWeight: 'bold' }}>Time: {label.toFixed(2)} s</p>
            {payload.map((entry: any, index: number) => (
              <p key={index} style={{ margin: '4px 0', color: entry.color }}>
                {entry.name}: {entry.value.toFixed(6)} {entry.dataKey === 'B' || entry.dataKey.startsWith('B') ? 'T' : entry.dataKey === 'current' ? 'A' : entry.dataKey === 'n' ? 'turns/m' : 'm'}
              </p>
            ))}
          </div>
        );
      }
      return null;
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ marginTop: 0 }}>Graphs</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label style={{ fontSize: '12px' }}>Time Window:</label>
            <select
              value={timeWindow}
              onChange={(e) => onTimeWindowChange(parseFloat(e.target.value))}
              style={{ padding: '4px 8px', fontSize: '12px' }}
            >
              <option value="0">All Data</option>
              <option value="5">Last 5 s</option>
              <option value="10">Last 10 s</option>
              <option value="20">Last 20 s</option>
              <option value="30">Last 30 s</option>
            </select>
          </div>
        </div>

        <div>
          <h4 style={{ marginTop: 0, marginBottom: '10px' }}>Magnetic Field B vs Time</h4>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" label={{ value: 'Time (s)', position: 'insideBottom', offset: -5 }} tickFormatter={formatTime} />
              <YAxis label={{ value: 'B (T)', angle: -90, position: 'insideLeft' }} />
              <Tooltip content={customTooltip} />
              <Legend />
              <Line type="monotone" dataKey="B" name="B (T)" stroke="#4CAF50" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div>
          <h4 style={{ marginTop: 0, marginBottom: '10px' }}>Current I vs Time</h4>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" label={{ value: 'Time (s)', position: 'insideBottom', offset: -5 }} tickFormatter={formatTime} />
              <YAxis label={{ value: 'I (A)', angle: -90, position: 'insideLeft' }} />
              <Tooltip content={customTooltip} />
              <Legend />
              <Line type="monotone" dataKey="current" name="I (A)" stroke="#2196F3" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div>
          <h4 style={{ marginTop: 0, marginBottom: '10px' }}>Voltage V vs Time</h4>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" label={{ value: 'Time (s)', position: 'insideBottom', offset: -5 }} tickFormatter={formatTime} />
              <YAxis label={{ value: 'V (V)', angle: -90, position: 'insideLeft' }} />
              <Tooltip content={customTooltip} />
              <Legend />
              <Line type="monotone" dataKey="voltage" name="V (V)" stroke="#FF9800" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div>
          <h4 style={{ marginTop: 0, marginBottom: '10px' }}>Turn Density n vs Time</h4>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" label={{ value: 'Time (s)', position: 'insideBottom', offset: -5 }} tickFormatter={formatTime} />
              <YAxis label={{ value: 'n (turns/m)', angle: -90, position: 'insideLeft' }} />
              <Tooltip content={customTooltip} />
              <Legend />
              <Line type="monotone" dataKey="n" name="n (turns/m)" stroke="#9C27B0" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  // Mode A: Faraday's Law
  // Filter data by time window if specified
  let filteredMeasurements = measurements;
  if (timeWindow > 0 && measurements.length > 0) {
    const latestTime = measurements[measurements.length - 1].timestamp;
    const cutoffTime = latestTime - timeWindow;
    filteredMeasurements = measurements.filter(m => m.timestamp >= cutoffTime);
  }

  // Prepare data for charts (limit to last 2000 points for performance)
  const chartData = filteredMeasurements.slice(-2000).map(m => ({
    time: Number(m.timestamp.toFixed(2)), // Format to 2 decimal places
    flux: m.flux,
    emf: m.emf,
    current: m.current,
  }));

  // Custom formatter for time axis
  const formatTime = (value: number) => value.toFixed(2);

  // Custom tooltip formatter
  const customTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: 'white', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}>
          <p style={{ margin: 0, fontWeight: 'bold' }}>Time: {label.toFixed(2)} s</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ margin: '4px 0', color: entry.color }}>
              {entry.name}: {entry.value.toFixed(6)} {entry.dataKey === 'flux' ? 'Wb' : entry.dataKey === 'emf' ? 'V' : 'A'}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ marginTop: 0 }}>Graphs</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label style={{ fontSize: '12px' }}>Time Window:</label>
          <select
            value={timeWindow}
            onChange={(e) => onTimeWindowChange(parseFloat(e.target.value))}
            style={{ padding: '4px 8px', fontSize: '12px' }}
          >
            <option value="0">All Data</option>
            <option value="5">Last 5 s</option>
            <option value="10">Last 10 s</option>
            <option value="20">Last 20 s</option>
            <option value="30">Last 30 s</option>
          </select>
        </div>
      </div>

      <div>
        <h4 style={{ marginTop: 0, marginBottom: '10px' }}>Magnetic Flux vs Time</h4>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="time" 
              label={{ value: 'Time (s)', position: 'insideBottom', offset: -5 }}
              tickFormatter={formatTime}
            />
            <YAxis label={{ value: 'Flux (Wb)', angle: -90, position: 'insideLeft' }} />
            <Tooltip content={customTooltip} />
            <Legend />
            <Line type="monotone" dataKey="flux" name="Flux (Wb)" stroke="#2196F3" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div>
        <h4 style={{ marginTop: 0, marginBottom: '10px' }}>Induced EMF vs Time</h4>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="time" 
              label={{ value: 'Time (s)', position: 'insideBottom', offset: -5 }}
              tickFormatter={formatTime}
            />
            <YAxis label={{ value: 'EMF (V)', angle: -90, position: 'insideLeft' }} />
            <Tooltip content={customTooltip} />
            <Legend />
            <Line type="monotone" dataKey="emf" name="EMF (V)" stroke="#4CAF50" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div>
        <h4 style={{ marginTop: 0, marginBottom: '10px' }}>Induced Current vs Time</h4>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="time" 
              label={{ value: 'Time (s)', position: 'insideBottom', offset: -5 }}
              tickFormatter={formatTime}
            />
            <YAxis label={{ value: 'Current (A)', angle: -90, position: 'insideLeft' }} />
            <Tooltip content={customTooltip} />
            <Legend />
            <Line type="monotone" dataKey="current" name="Current (A)" stroke="#FF9800" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Charts;

