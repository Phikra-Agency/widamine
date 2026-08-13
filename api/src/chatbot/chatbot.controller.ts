import { Controller, Post, Body } from '@nestjs/common'
import { ChatbotService } from './chatbot.service'
import { ChatbotMessageDto } from './dto/chatbot-message.dto'

@Controller('chatbot')
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @Post('message')
  handleMessage(@Body() dto: ChatbotMessageDto) {
    return this.chatbotService.handleMessage(dto.message, dto.history).catch((err) => {
      console.error('[Chatbot Controller] ❌ Error:', err?.message)
      console.error('[Chatbot Controller] Stack:', err?.stack)
      
      // Return user-friendly fallback message
      return {
        reply:
          'Le centre Widamine est joignable par téléphone au **+212 (535) 624 696** ou par email à **info@widamineaestheticcenter.com**.\n\n*L\'assistant IA rencontre actuellement un problème technique.*',
        sources: [],
      }
    })
  }
}
