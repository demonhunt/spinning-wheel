import { useMemo, useState } from 'react';
import './App.css';
import SpinningWheel from './SpinningWheel';
import PlayerForm from './PlayerForm';
import { WheelOptionConfig } from './types';
import { resolveChances } from './wheelUtils';
import wheelOptionsConfig from './wheel-options.json';

function App() {
  const [player, setPlayer] = useState<{ email: string; phone: string } | null>(null);

  const { options, error } = useMemo(() => {
    try {
      return {
        options: resolveChances(wheelOptionsConfig as WheelOptionConfig[]),
        error: null,
      };
    } catch (err) {
      return {
        options: [],
        error: err instanceof Error ? err.message : 'Failed to load wheel options.',
      };
    }
  }, []);

  const handleFinish = () => {
    // Reset player to go back to login form
    setPlayer(null);
  };

  if (error) return <div className="App"><p>{error}</p></div>;
  if (options.length === 0) return <div className="App"><p>Loading...</p></div>;

  return (
    <div className="App">
      <h1>🎡 Spinning Wheel</h1>
      {player ? (
        <SpinningWheel 
          options={options} 
          playerInfo={player} 
          onFinish={handleFinish} 
        />
      ) : (
        <PlayerForm onSubmit={setPlayer} />
      )}
    </div>
  );
}

export default App;
