export type WearableProvider = 'apple_health' | 'whoop' | 'garmin' | 'oura';

export interface WearableData {
  provider: WearableProvider;
  heartRateAvg: number;
  sleepScore: number;
  recoveryScore: number;
  caloriesBurned: number;
  lastSynced: string;
}

export class WearableIntegrationManager {
  /**
   * Simulates OAuth connection flow for a given wearable provider.
   */
  static async connectProvider(provider: WearableProvider): Promise<boolean> {
    console.log(`[WearableManager] Navigating to ${provider} OAuth...`);
    // Simulate network delay for OAuth
    await new Promise(resolve => setTimeout(resolve, 1500));
    return true; // Mock successful connection
  }

  /**
   * Disconnects a provider.
   */
  static async disconnectProvider(provider: WearableProvider): Promise<boolean> {
    console.log(`[WearableManager] Disconnecting ${provider}...`);
    return true;
  }

  /**
   * Fetches the latest health metrics from the connected provider.
   * In a real app, this hits the respective REST API.
   */
  static async fetchLatestData(provider: WearableProvider): Promise<WearableData> {
    // Simulated realistic mock data
    return {
      provider,
      heartRateAvg: Math.floor(Math.random() * (85 - 55 + 1) + 55),
      sleepScore: Math.floor(Math.random() * (100 - 60 + 1) + 60),
      recoveryScore: Math.floor(Math.random() * (100 - 40 + 1) + 40),
      caloriesBurned: Math.floor(Math.random() * (3500 - 1800 + 1) + 1800),
      lastSynced: new Date().toISOString()
    };
  }
}
