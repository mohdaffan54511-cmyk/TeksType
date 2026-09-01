import React, { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';

// Chart.js ke modules register karein
Chart.register(...registerables);

export function ChartJs({ type = 'line', data, options }) {
  const canvasRef = useRef(null);
  const chartInstanceRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Purana chart destroy karein taaki overlap na ho
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    // Naya chart instance banayein
    chartInstanceRef.current = new Chart(canvas, {
      type: type,
      data: data,
      options: options,
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [data, options, type]);

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />;
}
