
/**
 * Configuration for Adaptive Network Profiles.
 * Defines how aggressively we strip data based on client constraints.
 */

export enum ConnectionType {
    WIFI_DESKTOP = 0,
    WIFI_MOBILE = 1,
    DATA_4G = 2,
    DATA_3G = 3
}

export interface NetProfile {
    tickRate: number;      // Server Tick Rate (Hz)
    sendRateNear: number;  // How often to send updates for NEAR entities (ticks to skip)
    sendRateFar: number;   // How often to send updates for FAR entities
    farDistanceSq: number; // Distance squared to consider "Far"
    positionPrecision: number; // Decimal places for positions
    deltaCompression: boolean; // If true, only send changed fields
}

export const NET_PROFILES: Record<ConnectionType, NetProfile> = {
    // Desktop: Maximum Fidelity
    [ConnectionType.WIFI_DESKTOP]: {
        tickRate: 20,
        sendRateNear: 1, // Every tick (20Hz)
        sendRateFar: 2,  // Every 2nd tick (10Hz)
        farDistanceSq: 30 * 30,
        positionPrecision: 2, // High precision
        deltaCompression: true
    },

    // Mobile High: Good connection but save battery
    [ConnectionType.WIFI_MOBILE]: {
        tickRate: 20,
        sendRateNear: 1, // 20Hz
        sendRateFar: 4,  // 5Hz (Save bandwidth on background)
        farDistanceSq: 20 * 20,
        positionPrecision: 1, // 0.1 precision (Good enough for small screens)
        deltaCompression: true
    },

    // 4G: Bandwidth constrained
    [ConnectionType.DATA_4G]: {
        tickRate: 20,
        sendRateNear: 2, // 10Hz (Playable)
        sendRateFar: 10, // 2Hz (Background slideshow)
        farDistanceSq: 15 * 15,
        positionPrecision: 1,
        deltaCompression: true
    },

    // 3G: Bare minimum
    [ConnectionType.DATA_3G]: {
        tickRate: 20,
        sendRateNear: 4, // 5Hz
        sendRateFar: 20, // 1Hz
        farDistanceSq: 12 * 12,
        positionPrecision: 0, // Integers only
        deltaCompression: true
    }
};
