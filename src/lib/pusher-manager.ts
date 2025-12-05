/**
 * Pusher Connection Manager
 * Singleton pattern để tránh tạo nhiều connections
 * Quản lý subscriptions centralized
 */

import { pusherClient } from "./pusher";

type EventCallback = (data: any) => void;
type SubscriptionKey = `${string}:${string}`; // channel:event

class PusherManager {
  private static instance: PusherManager;
  private subscriptions = new Map<SubscriptionKey, Set<EventCallback>>();
  private channels = new Set<string>();

  private constructor() {
    // Private constructor for singleton
  }

  static getInstance(): PusherManager {
    if (!PusherManager.instance) {
      PusherManager.instance = new PusherManager();
    }
    return PusherManager.instance;
  }

  /**
   * Subscribe to a channel and event
   * Multiple callbacks can subscribe to the same event
   */
  subscribe(channel: string, event: string, callback: EventCallback): void {
    const key: SubscriptionKey = `${channel}:${event}`;

    // Get or create channel subscription
    let channelObj = pusherClient.channel(channel);

    // Subscribe to channel if not already subscribed
    if (!this.channels.has(channel)) {
      // pusherClient.subscribe(channel);
      channelObj = pusherClient.subscribe(channel);
      this.channels.add(channel);
    }

    // Add callback to subscriptions
    if (!this.subscriptions.has(key)) {
      this.subscriptions.set(key, new Set());

      // Bind event listener once
      // pusherClient.bind(event, (data: any) => {
      channelObj.bind(event, (data: any) => {
        const callbacks = this.subscriptions.get(key);
        if (callbacks) {
          callbacks.forEach((cb) => cb(data));
        }
      });
    }

    this.subscriptions.get(key)?.add(callback);
  }

  /**
   * Unsubscribe a specific callback from a channel and event
   */
  unsubscribe(channel: string, event: string, callback: EventCallback): void {
    const key: SubscriptionKey = `${channel}:${event}`;
    const callbacks = this.subscriptions.get(key);

    if (callbacks) {
      callbacks.delete(callback);

      // If no more callbacks for this event, unbind it
      if (callbacks.size === 0) {
        // pusherClient.unbind(event);
        const channelObj = pusherClient.channel(channel);
        if (channelObj) {
          channelObj.unbind(event);
        }
        this.subscriptions.delete(key);
      }
    }

    // Check if we should unsubscribe from the channel
    this.checkChannelUnsubscribe(channel);
  }

  /**
   * Unsubscribe all callbacks from a channel
   */
  unsubscribeChannel(channel: string): void {
    // Remove all subscriptions for this channel
    const keysToDelete: SubscriptionKey[] = [];

    const channelObj = pusherClient.channel(channel);

    this.subscriptions.forEach((_, key) => {
      if (key.startsWith(`${channel}:`)) {
        const event = key.split(":")[1];
        // pusherClient.unbind(event);
        if (channelObj) {
          channelObj.unbind(event);
        }
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach((key) => this.subscriptions.delete(key));

    // Unsubscribe from channel
    if (this.channels.has(channel)) {
      pusherClient.unsubscribe(channel);
      this.channels.delete(channel);
    }
  }

  /**
   * Check if channel should be unsubscribed
   * (no more active subscriptions for this channel)
   */
  private checkChannelUnsubscribe(channel: string): void {
    const hasActiveSubscriptions = Array.from(this.subscriptions.keys()).some(
      (key) => key.startsWith(`${channel}:`)
    );

    if (!hasActiveSubscriptions && this.channels.has(channel)) {
      pusherClient.unsubscribe(channel);
      this.channels.delete(channel);
    }
  }

  /**
   * Get active channels
   */
  getActiveChannels(): string[] {
    return Array.from(this.channels);
  }

  /**
   * Get active subscriptions count
   */
  getSubscriptionsCount(): number {
    return this.subscriptions.size;
  }

  /**
   * Clear all subscriptions and channels
   */
  clearAll(): void {
    // this.channels.forEach((channel) => {
    //   pusherClient.unsubscribe(channel);
    // });

    // this.subscriptions.forEach((_, key) => {
    //   const event = key.split(":")[1];
    //   pusherClient.unbind(event);
    // });
    // Unbind all events from their respective channels
    this.subscriptions.forEach((_, key) => {
      const [channel, event] = key.split(":");
      if (channel) {
        const channelObj = pusherClient.channel(channel);
        if (channelObj) {
          channelObj.unbind(event);
        }
      }
    });

    // Unsubscribe all channels
    this.channels.forEach((channel) => {
      pusherClient.unsubscribe(channel);
    });

    this.channels.clear();
    this.subscriptions.clear();
  }
}

// Export singleton instance
export const pusherManager = PusherManager.getInstance();
