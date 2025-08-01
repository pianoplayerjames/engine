import Stats from 'stats.js'

// Stats.js management utility
class StatsManager {
  constructor() {
    this.stats = null;
    this.isEnabled = false;
    this.isInitialized = false;
  }

  init() {
    if (this.isInitialized) return;
    
    console.log('StatsManager: Initializing...');
    
    // Check if Stats is available globally
    if (typeof window !== 'undefined' && Stats) {
      try {
        this.stats = new Stats();
        this.stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
        
        // Style the stats panel
        this.stats.dom.style.position = 'fixed';
        this.stats.dom.style.top = '0px';
        this.stats.dom.style.left = '0px';
        this.stats.dom.style.zIndex = '10000';
        
        this.isInitialized = true;
        console.log('StatsManager: Stats.js initialized successfully');
        
        // Store reference globally for access
        window.statsManager = this;
        
      } catch (error) {
        console.error('StatsManager: Failed to initialize Stats.js:', error);
      }
    } else {
      console.warn('StatsManager: Stats.js not found on window object');
    }
  }

  enable() {
    console.log('StatsManager: Enabling stats...');
    
    if (!this.isInitialized) {
      this.init();
    }
    
    if (this.stats && !this.isEnabled) {
      try {
        // Add to DOM if not already there
        if (!document.body.contains(this.stats.dom)) {
          document.body.appendChild(this.stats.dom);
          console.log('StatsManager: Added stats DOM to body');
        }
        
        // Make sure it's visible
        this.stats.dom.style.display = 'block';
        this.isEnabled = true;
        
        console.log('StatsManager: Stats enabled successfully');
        return true;
      } catch (error) {
        console.error('StatsManager: Failed to enable stats:', error);
        return false;
      }
    }
    
    return false;
  }

  disable() {
    console.log('StatsManager: Disabling stats...');
    
    if (this.stats && this.isEnabled) {
      try {
        // Hide the stats panel
        this.stats.dom.style.display = 'none';
        
        // Optionally remove from DOM completely
        if (document.body.contains(this.stats.dom)) {
          document.body.removeChild(this.stats.dom);
          console.log('StatsManager: Removed stats DOM from body');
        }
        
        this.isEnabled = false;
        console.log('StatsManager: Stats disabled successfully');
        return true;
      } catch (error) {
        console.error('StatsManager: Failed to disable stats:', error);
        return false;
      }
    }
    
    return false;
  }

  toggle(enabled) {
    console.log('StatsManager: Toggling stats to:', enabled);
    
    if (enabled) {
      return this.enable();
    } else {
      return this.disable();
    }
  }

  // Call this in your render loop
  update() {
    if (this.stats && this.isEnabled) {
      this.stats.update();
    }
  }

  getStats() {
    return this.stats;
  }

  isStatsEnabled() {
    return this.isEnabled;
  }
}

// Create singleton instance
const statsManager = new StatsManager();

// Auto-initialize when loaded
if (typeof window !== 'undefined') {
  // Try to initialize immediately
  statsManager.init();
  
  // Also try after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      statsManager.init();
    });
  }
}

export default statsManager;