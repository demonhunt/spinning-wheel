import { useEffect, useState } from 'react';
import './App.css';
import SpinningWheel from './SpinningWheel';
import PlayerForm from './PlayerForm';
import { WheelOption, WheelOptionConfig } from './types';
import { resolveChances } from './wheelUtils';

function App() {
  const [options, setOptions] = useState<WheelOption[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [player, setPlayer] = useState<{ email: string; phone: string } | null>(null);

  useEffect(() => {
    fetch('/wheel-options.json')
      .then((res) => res.json())
      .then((configs: WheelOptionConfig[]) => {
        setOptions(resolveChances(configs));
      })
      .catch((err) => setError(err.message || 'Failed to load wheel options.'));
  }, []);

  if (error) return <div className="App"><p>{error}</p></div>;
  if (options.length === 0) return <div className="App"><p>Loading...</p></div>;

  return (
    <div className="App">
      <h1>🎡 Spinning Wheel</h1>
      {!player ? (
        <SpinningWheel options={options} />
      ) : (
        <PlayerForm onSubmit={setPlayer} />
      )}
    </div>
  );
}

export default App;
