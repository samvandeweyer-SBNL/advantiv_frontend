
import { GoogleGenAI, Type } from "@google/genai";
import { CampaignInputs, ChannelData, AgeBucketData, ChannelCurvePoint } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export async function generateCampaignInsights(inputs: CampaignInputs) {
  const channelDetails = inputs.channel_selection.map(name => {
    const config = inputs.channel_settings[name] || { always_include: false, frequency_capping: false };
    return `${name} (Always include: ${config.always_include}, Freq Capping: ${config.frequency_capping}${config.fixed_budget ? `, Fixed budget: €${config.fixed_budget}` : ''}${config.cpm ? `, CPM: €${config.cpm}` : ''}${config.tv_factor ? `, TV Factor: ${config.tv_factor}` : ''}${config.scale_factor ? `, Scale Factor: ${config.scale_factor}` : ''})`;
  }).join(', ');

  const prompt = `
    Based on the following marketing campaign parameters, provide a professional executive summary of the best outcome and strategy:
    Customer: ${inputs.customer_name || 'N/A'}
    Campaign: ${inputs.campaign_name || 'N/A'}
    Total Budget: €${inputs.total_budget || 0}
    Goal: ${inputs.goal_type}
    Target Reach: ${inputs.target_reach || 0}
    Channels with constraints: ${channelDetails}
    Demographics: ${inputs.age_min || 'Any'}-${inputs.age_max || 'Any'} years, Gender: ${inputs.gender}
    Location: ${inputs.country}
    Duration: ${inputs.campaign_duration} weeks

    The optimization engine must respect the fixed budgets, CPMs, TV factors, Scale Factors, and per-channel Frequency Capping settings provided.
    Include a brief breakdown of the best channel combinations and why this strategy will succeed.
    Keep it concise but data-driven.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        temperature: 0.7,
        topP: 0.95,
      },
    });
    return response.text || "Unable to generate insights at this time.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error generating AI insights. Please check your inputs and try again.";
  }
}

export function generateMockResults(inputs: CampaignInputs) {
  const run_id = crypto.randomUUID();
  const run_ts = new Date().toISOString().replace('T', ' ').substring(0, 23) + ' UTC';
  const budget = typeof inputs.total_budget === 'string' ? 0 : inputs.total_budget;
  const reach = typeof inputs.target_reach === 'string' ? 0 : inputs.target_reach;
  const channelsCount = inputs.channel_selection.length;

  // 1. Generate Channels
  const channels: ChannelData[] = inputs.channel_selection.map(name => {
    const config = inputs.channel_settings[name] || { always_include: false, frequency_capping: false };
    const share = (1 / Math.max(1, channelsCount)) * 100;
    const chBudget = config.fixed_budget || Math.round(budget * (share / 100));
    const digitalReachNum = Math.round(reach * (0.2 + Math.random() * 0.4));
    
    return {
      run_id, customer_name: inputs.customer_name, campaign_name: inputs.campaign_name,
      goal_type: inputs.goal_type, run_ts, channel: name, media_budget: chBudget,
      budget_share_pct: share, 
      cpm: config.cpm || (5 + Math.random() * 5), 
      tv_factor: config.tv_factor || 0,
      tv_reach_num: 0, tv_reach_pct: 0, digital_impressions: chBudget * 100,
      digital_reach_num: digitalReachNum, digital_reach_pct: (digitalReachNum / Math.max(1, reach)) * 100,
      contact_freq: 2.5 + Math.random(), budget: chBudget, reach: digitalReachNum, roi: 2 + Math.random() * 3
    };
  });

  // 2. Candidate Comparison (Lines for multiple strategies)
  const candidateComparison = Array.from({ length: 10 }, (_, i) => ({
    step: i + 1,
    budget: (budget / 10) * (i + 1),
    'Strategy A (Default)': Math.round(reach * (i + 1) / 10 * (0.9 + Math.random() * 0.1)),
    'Strategy B (Max Reach)': Math.round(reach * (i + 1) / 10 * (1.1 + Math.random() * 0.1)),
    'Strategy C (Cost Efficient)': Math.round(reach * (i + 1) / 10 * (0.8 + Math.random() * 0.05)),
  }));

  // 3. Channel Curves (Reach vs Budget)
  const channelCurves: { [channel: string]: ChannelCurvePoint[] } = {};
  inputs.channel_selection.forEach(ch => {
    channelCurves[ch] = Array.from({ length: 10 }, (_, i) => {
      const stepBudget = (budget / 10) * (i + 1);
      const efficiency = 0.5 + Math.random();
      return {
        budget: stepBudget,
        reach: Math.round(efficiency * 100000 * Math.log(stepBudget / 100 + 1))
      };
    });
  });

  // 4. Age Demographics
  const ageBuckets = ['15-19', '20-24', '25-29', '30-34', '35-39', '40-44', '45-49', '50-54', '55-59', '60-64'];
  const ageDemographics: AgeBucketData[] = ageBuckets.map(bucket => ({
    bucket,
    reach: Math.round(reach * (0.05 + Math.random() * 0.1)),
    budget: Math.round(budget * (0.05 + Math.random() * 0.1))
  }));

  // 5. Overlap Analysis
  const overlapData = Array.from({ length: 10 }, (_, i) => {
    const gross = Math.round(reach * (i + 1) / 10);
    const overlap = Math.round(gross * 0.15 * (i / 10)); 
    return {
      step: i + 1,
      budget: (budget / 10) * (i + 1),
      grossReach: gross,
      netReach: gross - overlap,
      overlap: overlap
    };
  });

  const totalProjectedReach = Math.round(reach * 1.05);
  const targetPopulation = Math.round(totalProjectedReach * 1.65); 

  return {
    summary: "", 
    channels,
    reachOverTime: overlapData.map(d => ({ iteration: d.step, reach: d.netReach, budget: d.budget })),
    candidateComparison,
    channelCurves,
    ageDemographics,
    overlapData,
    totalProjectedReach,
    usersLostToOverlap: Math.round(reach * 0.12),
    targetPopulation
  };
}
