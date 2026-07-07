import { Controller, Post, Body } from '@nestjs/common'
import { ChatbotService } from './chatbot.service'
import { ChatbotMessageDto } from './dto/chatbot-message.dto'

@Controller('chatbot')
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @Post('message')
  handleMessage(@Body() dto: ChatbotMessageDto) {
    return this.chatbotService.handleMessage(dto.message, dto.history)
  }
}
