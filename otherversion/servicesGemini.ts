
import { GoogleGenAI, Type } from "@google/genai";
import { CampaignInputs, ChannelData, AgeBucketData, ChannelCurvePoint, UserActivityData, OverlapIntersection } from "../types";

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

    Include a brief breakdown of why the selected channel mix is optimal.
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
    return "Error generating AI insights.";
  }
}

export function generateMockResults(inputs: CampaignInputs) {
  const run_id = crypto.randomUUID();
  const run_ts = new Date().toISOString().replace('T', ' ').substring(0, 23) + ' UTC';
  const budget = typeof inputs.total_budget === 'string' ? 0 : inputs.total_budget;
  const reach = typeof inputs.target_reach === 'string' ? 0 : inputs.target_reach;
  const channelsCount = inputs.channel_selection.length;

  const totalPop = 5000000;

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
      digital_reach_num: digitalReachNum, digital_reach_pct: (digitalReachNum / totalPop) * 100,
      contact_freq: 2.5 + Math.random(), budget: chBudget, reach: digitalReachNum, roi: 2 + Math.random() * 3
    };
  });

  // 2. Candidate Comparison
  const candidateComparison = Array.from({ length: 10 }, (_, i) => ({
    step: i + 1,
    budget: (budget / 10) * (i + 1),
    'Strategy A (Default)': Math.round(reach * (i + 1) / 10 * (0.9 + Math.random() * 0.1)),
    'Strategy B (Max Reach)': Math.round(reach * (i + 1) / 10 * (1.1 + Math.random() * 0.1)),
    'Strategy C (Cost Efficient)': Math.round(reach * (i + 1) / 10 * (0.8 + Math.random() * 0.05)),
  }));

  // 3. Channel Curves
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
    budget: Math.round(budget * (0.05 + Math.random() * 0.1)),
    total_users: Math.round(totalPop * (0.08 + Math.random() * 0.04))
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

  // 6. User Activity (Static DAU/MAU)
  const userActivity: UserActivityData[] = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return {
      label: date.toLocaleDateString(undefined, { weekday: 'short' }),
      dau: Math.round(totalPop * 0.15 * (0.8 + Math.random() * 0.4)),
      mau: Math.round(totalPop * 0.45 * (0.9 + Math.random() * 0.2))
    };
  });

  // 7. Intersections (UpSet Plot Data)
  const intersections: OverlapIntersection[] = [];
  const activeChannels = inputs.channel_selection.slice(0, 4);
  // Singletons
  activeChannels.forEach(ch => intersections.push({ channels: [ch], overlap_pct: 100, size: Math.round(totalPop * 0.1) }));
  // Pairs
  if (activeChannels.length >= 2) {
    intersections.push({ channels: [activeChannels[0], activeChannels[1]], overlap_pct: 22, size: Math.round(totalPop * 0.04) });
  }
  if (activeChannels.length >= 3) {
    intersections.push({ channels: [activeChannels[0], activeChannels[2]], overlap_pct: 15, size: Math.round(totalPop * 0.02) });
    intersections.push({ channels: [activeChannels[0], activeChannels[1], activeChannels[2]], overlap_pct: 8, size: Math.round(totalPop * 0.01) });
  }

  return {
    summary: "",
    channels,
    reachOverTime: overlapData.map(d => ({ iteration: d.step, reach: d.netReach, budget: d.budget })),
    candidateComparison,
    channelCurves,
    ageDemographics,
    overlapData,
    userActivity,
    intersections,
    totalProjectedReach: Math.round(reach * 1.05),
    usersLostToOverlap: Math.round(reach * 0.12),
    targetPopulation: totalPop
  };
}
