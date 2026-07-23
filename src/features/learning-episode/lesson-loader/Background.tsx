import Aurora from './Aurora';
import AmbientParticles from './Particles';

/**
 * Background
 * -------------------------------------------------------------------------
 * Composition wrapper for everything behind the GlassCard. Kept as its own
 * component (rather than inlined in LoadingScreen) so the environment layer
 * has a single, obvious place to extend later without touching the story
 * layer (Coin/Graph/GlassCard).
 */
export default function Background() {
  return (
    <>
      <Aurora />
      <AmbientParticles />
    </>
  );
}
