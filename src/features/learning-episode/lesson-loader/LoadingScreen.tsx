import Background from './Background';
import GlassCard from './GlassCard';
import './loading.css';

/**
 * LoadingScreen
 * -------------------------------------------------------------------------
 * Root of the loading sequence. Coin, Graph, and the fragment burst are all
 * driven by keyframe arrays expressed as fractions of the same
 * `LOOP_DURATION` (see types.ts) rather than independent timers, which is
 * what keeps "coin dissolves -> particles arrive -> line draws -> coin
 * reforms" reading as one continuous 2.5-3s loop instead of three separate
 * animations that happen to overlap.
 */
export default function LoadingScreen() {
  return (
    <main className="loading-root" role="status" aria-live="polite" aria-label="Preparing your lesson">
      <Background />
      <div className="relative z-10">
        <GlassCard />
      </div>
    </main>
  );
}
