
export interface ChannelConfig {
    fixed_budget?: number;
    always_include: boolean;
    cpm?: number;
    tv_factor?: number;
    scale_factor?: number;
    frequency_capping: boolean;
  }
  
  export interface CampaignInputs {
    total_budget: number | '';
    goal_type: string;
    campaign_start_date: string;
    campaign_end_date: string;
    campaign_duration: number;
    country: string;
    age_min: number | '';
    age_max: number | '';
    minimal_contact_frequency: number;
    channel_selection: string[]; // List of selected channel names
    channel_settings: Record<string, ChannelConfig>; // Detailed settings per channel
    max_channels: number;
    target_reach: number | '';
    gender: string;
    customer_name: string;
    campaign_name: string;
  }
  
  export interface ChannelData {
    run_id: string;
    customer_name: string;
    campaign_name: string;
    goal_type: string;
    run_ts: string;
    channel: string;
    media_budget: number;
    budget_share_pct: number;
    cpm: number;
    tv_factor: number;
    tv_reach_num: number;
    tv_reach_pct: number;
    digital_impressions: number;
    digital_reach_num: number;
    digital_reach_pct: number;
    contact_freq: number;
    budget: number;
    reach: number;
    roi: number;
  }
  
  export interface AgeBucketData {
    bucket: string;
    reach: number;
    budget: number;
    total_users: number; // For static audience analysis
  }
  
  export interface ChannelCurvePoint {
    budget: number;
    reach: number;
  }
  
  export interface OverlapIntersection {
    channels: string[];
    overlap_pct: number;
    size: number;
  }
  
  export interface UserActivityData {
    label: string;
    dau: number;
    mau: number;
  }
  
  export interface OptimizationResult {
    summary: string;
    channels: ChannelData[];
    reachOverTime: { iteration: number; reach: number; budget: number }[];
    // Optimization Charts
    candidateComparison: { step: number; budget: number; [key: string]: number }[];
    channelCurves: { [channel: string]: ChannelCurvePoint[] };
    overlapData: { step: number; budget: number; netReach: number; overlap: number; grossReach: number }[];
    // Shared/Static Charts
    ageDemographics: AgeBucketData[];
    // Static Audience Insights
    userActivity: UserActivityData[];
    intersections: OverlapIntersection[];
    totalProjectedReach: number;
    usersLostToOverlap: number;
    targetPopulation: number;
  }
  
  export enum RunStatus {
    IDLE = 'IDLE',
    ANALYZING = 'ANALYZING',
    OPTIMIZING = 'OPTIMIZING',
    SIMULATING = 'SIMULATING',
    FINALIZING = 'FINALIZING',
    COMPLETED = 'COMPLETED'
  }
  