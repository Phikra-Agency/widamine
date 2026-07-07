import { IsString, IsOptional, IsArray } from 'class-validator'

class HistoryMessage {
  @IsString()
  role: string

  @IsString()
  content: string
}

export class ChatbotMessageDto {
  @IsString()
  message: string

  @IsOptional()
  @IsArray()
  history?: HistoryMessage[]
}
