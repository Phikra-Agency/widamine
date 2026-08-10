import { Controller, Post, Body } from '@nestjs/common'
import { ChatbotService } from './chatbot.service'
import { ChatbotMessageDto } from './dto/chatbot-message.dto'

@Controller('chatbot')
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @Post('message')
  handleMessage(@Body() dto: ChatbotMessageDto) {
    return this.chatbotService.handleMessage(dto.message, dto.history).catch((err) => {
      console.error('[Chatbot] error:', err?.message)
      console.error('[Chatbot] stack:', err?.stack)
      return {
        reply:
          'Le centre Widamine est joignable par téléphone au **+212 (535) 624 696** ou par email à **info@widamineaestheticcenter.com**.',
        sources: [],
      }
    })
  }
}
