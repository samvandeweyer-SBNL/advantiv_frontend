
export const AVAILABLE_CHANNELS = [
    'Facebook', 'LinkedIn', 'Youtube', 'X (Twitter)', 'TikTok', 
    'Pinterest', 'Instagram', 'Snapchat', 'Twitch', 'Reddit', 
    'DPG Media', 'Teads', 'Opt Out', 'Spotify', 'BNR', 'FD Mediagroep'
  ];
  
  export const DIGITAL_CHANNELS = [
    'Facebook', 'LinkedIn', 'Youtube', 'X (Twitter)', 'TikTok', 
    'Pinterest', 'Instagram', 'Snapchat', 'Twitch', 'Reddit', 
    'Teads', 'Spotify'
  ];
  
  export const TV_OFFLINE_CHANNELS = [
    'DPG Media', 'Opt Out', 'BNR', 'FD Mediagroep'
  ];
  
  export const CHANNEL_DEFAULTS: Record<string, { cpm: number; tv_factor: number }> = {
    'Facebook': { cpm: 2.85, tv_factor: 7 },
    'LinkedIn': { cpm: 9.00, tv_factor: 5 },
    'Youtube': { cpm: 4.24, tv_factor: 2 },
    'X (Twitter)': { cpm: 1.77, tv_factor: 9 },
    'TikTok': { cpm: 2.50, tv_factor: 5 },
    'Pinterest': { cpm: 3.39, tv_factor: 7 },
    'Instagram': { cpm: 2.85, tv_factor: 6 },
    'Snapchat': { cpm: 5.00, tv_factor: 6 },
    'Twitch': { cpm: 11.44, tv_factor: 7 },
    'Reddit': { cpm: 3.00, tv_factor: 7 },
    'DPG Media': { cpm: 5.00, tv_factor: 5 },
    'Teads': { cpm: 17.00, tv_factor: 2 },
    'Opt Out': { cpm: 20.00, tv_factor: 1 },
    'Spotify': { cpm: 3.20, tv_factor: 2 },
    'BNR': { cpm: 42.00, tv_factor: 2 },
    'FD Mediagroep': { cpm: 20.00, tv_factor: 1 }
  };
  
  export const GOAL_TYPES = ['Budget', 'Reach'];
  export const GENDERS = ['All', 'Men', 'Woman'];
  export const COUNTRIES = ['NL', 'BE', 'UK'];
  
  export const STATUS_STEPS = [
    { key: 'ANALYZING', label: 'Analyzing Target Audience' },
    { key: 'OPTIMIZING', label: 'Optimizing Channel Mix' },
    { key: 'SIMULATING', label: 'Running Scenario Simulations' },
    { key: 'FINALIZING', label: 'Finalizing Recommendations' }
  ];
  