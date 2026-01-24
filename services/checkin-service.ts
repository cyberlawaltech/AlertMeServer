import { remoteManager } from './remote-manager';

class CheckInService {
  private checkInInterval: NodeJS.Timeout | null = null;
  private acknowledged = false;
  private maxRetries = 60; // 10 mins with 10 second intervals
  private retryCount = 0;

  constructor() {
    if (typeof window !== 'undefined') {
      this.acknowledged = localStorage.getItem('eb_ack') === 'true';
      if (!this.acknowledged) {
        this.startCheckingIn();
      }
    }
  }

  private startCheckingIn() {
    // Check in every 10 seconds until the server acknowledges
    this.checkInInterval = setInterval(() => {
      if (this.acknowledged) {
        if (this.checkInInterval) clearInterval(this.checkInInterval);
        return;
      }

      try {
        remoteManager.emit('CLIENT_CHECK_IN', {
          timestamp: new Date().toISOString(),
          device: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
          platform: typeof navigator !== 'undefined' ? navigator.platform : 'unknown',
          clientId: remoteManager.getClientId()
        });

        this.retryCount++;
        console.log(`[CheckInService] Check-in attempt ${this.retryCount}/${this.maxRetries}`);

        // Stop checking in after max retries
        if (this.retryCount >= this.maxRetries) {
          console.warn('[CheckInService] Max check-in retries reached');
          if (this.checkInInterval) clearInterval(this.checkInInterval);
        }
      } catch (error) {
        console.error('[CheckInService] Error during check-in:', error);
      }
    }, 10000);
  }

  public acknowledge() {
    this.acknowledged = true;
    if (typeof window !== 'undefined') {
      localStorage.setItem('eb_ack', 'true');
    }
    if (this.checkInInterval) {
      clearInterval(this.checkInInterval);
      this.checkInInterval = null;
    }
    console.log('[CheckInService] Acknowledged by server');
  }

  public isAcknowledged(): boolean {
    return this.acknowledged;
  }

  public resetAcknowledgment() {
    this.acknowledged = false;
    this.retryCount = 0;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('eb_ack');
    }
    this.startCheckingIn();
  }

  public destroy() {
    if (this.checkInInterval) {
      clearInterval(this.checkInInterval);
      this.checkInInterval = null;
    }
  }
}

export const checkInService = new CheckInService();
