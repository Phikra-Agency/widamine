import { Injectable, OnModuleInit, Logger, OnModuleDestroy } from "@nestjs/common";
import { create, Client, Message } from "@open-wa/wa-automate";

@Injectable()
export class WhatsAppService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(WhatsAppService.name);
  private client: Client | null = null;
  private isInitializing = false;
  private initPromise: Promise<void> | null = null;

  async onModuleInit() {
    const enabled = process.env.WHATSAPP_ENABLED === 'true';
    
    if (!enabled) {
      this.logger.warn(`⚠️  WhatsApp is DISABLED (WHATSAPP_ENABLED != 'true')`);
      this.logger.warn(`   💡 Set WHATSAPP_ENABLED=true in .env to enable WhatsApp`);
      return;
    }

    // Don't block startup - initialize in background
    this.initPromise = this.initialize();
  }

  private async initialize() {
    if (this.isInitializing || this.client) return;
    this.isInitializing = true;

    try {
      this.logger.log(`🔄 Initializing WhatsApp client (OpenWA)...`);
      this.logger.log(`   💡 QR code will appear - scan it with WhatsApp mobile`);
      
      this.client = await create({
        sessionId: "widamine-session",
        headless: true,
        qrTimeout: 0, // Never timeout waiting for QR scan
        authTimeout: 0,
        blockCrashLogs: true,
        disableSpins: true,
        logConsole: false,
        popup: false,
      } as any);

      this.logger.log(`✅ WhatsApp client initialized and ready!`);
      this.logger.log(`   📱 Connected phone: ${await this.client.getHostNumber()}`);
      
    } catch (error: any) {
      this.logger.error(`❌ Failed to initialize WhatsApp: ${error.message}`);
      this.client = null;
    } finally {
      this.isInitializing = false;
    }
  }

  async onModuleDestroy() {
    if (this.client) {
      this.logger.log(`🔌 Disconnecting WhatsApp client...`);
      await this.client.kill();
      this.client = null;
    }
  }

  private async ensureClient(): Promise<Client | null> {
    // Wait for init if it's in progress
    if (this.initPromise) {
      await this.initPromise;
    }
    
    if (!this.client) {
      this.logger.warn(`WhatsApp client not available`);
      return null;
    }

    return this.client;
  }

  /**
   * Format phone number to WhatsApp format
   * Input: +212535624696 or 0535624696
   * Output: 212535624696@c.us
   */
  private formatPhoneNumber(phone: string): string {
    // Remove all non-digits
    let cleaned = phone.replace(/\D/g, '');
    
    // If starts with 0, assume it's Moroccan and add 212
    if (cleaned.startsWith('0')) {
      cleaned = '212' + cleaned.substring(1);
    }
    
    // If starts with +, remove it
    if (phone.startsWith('+')) {
      // Already has country code
    }
    
    // Add @c.us suffix for WhatsApp
    return `${cleaned}@c.us`;
  }

  /**
   * Send a WhatsApp message
   * @param phone Phone number (any format: +212XXX, 0XXX, 212XXX)
   * @param message Message content
   * @returns Success status and message ID if sent
   */
  async sendMessage(phone: string, message: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const client = await this.ensureClient();
    
    if (!client) {
      this.logger.log(`📱 [DRY RUN] WhatsApp to ${phone}: ${message.substring(0, 50)}...`);
      return { success: false, error: 'WhatsApp client not initialized' };
    }

    try {
      const chatId = this.formatPhoneNumber(phone);
      this.logger.log(`📱 Sending WhatsApp to ${chatId}: ${message.substring(0, 50)}...`);
      
      const result: any = await client.sendText(chatId as any, message);
      
      this.logger.log(`✅ WhatsApp sent successfully — id: ${result}`);
      return { success: true, messageId: String(result) };
      
    } catch (error: any) {
      this.logger.error(`❌ Failed to send WhatsApp to ${phone}: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * Check if WhatsApp is connected and ready
   */
  async isReady(): Promise<boolean> {
    const client = await this.ensureClient();
    if (!client) return false;
    
    try {
      const state = await client.getConnectionState();
      return state === 'CONNECTED';
    } catch {
      return false;
    }
  }

  /**
   * Get connected phone number
   */
  async getConnectedNumber(): Promise<string | null> {
    const client = await this.ensureClient();
    if (!client) return null;
    
    try {
      return await client.getHostNumber();
    } catch {
      return null;
    }
  }
}
