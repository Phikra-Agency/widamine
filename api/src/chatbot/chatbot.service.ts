import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const MODEL = 'llama-3.3-70b-versatile'

interface ToolCall {
  id: string
  type: 'function'
  function: { name: string; arguments: string }
}

@Injectable()
export class ChatbotService {
  constructor(private readonly prisma: PrismaService) {}

  async handleMessage(message: string, history?: { role: string; content: string }[]) {
    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) {
      return {
        reply:
          "Le centre Widamine est joignable par téléphone au **+212 (535) 624 696** ou par email à **info@widamineaestheticcenter.com**.\n\nNos horaires : du lundi au vendredi de 9h à 18h, le samedi de 9h à 13h.\n\n*L'assistant IA sera bientôt disponible.*",
        sources: [],
      }
    }

    const systemPrompt = `Tu es l'assistant du Widamine Center (dermato-esthétique, Fès, Maroc). Réponds en français, court et direct. Max 2-3 phrases sauf si on te demande des détails.

Le site web permet aux visiteurs de :
- Réserver un rendez-vous en ligne (popup de réservation)
- Contacter le centre via un formulaire (popup de contact)
- Consulter les services, l'équipe et les informations pratiques

Quand un client demande à réserver ou à contacter le centre, utilise l'outil trigger_popup avec le type approprié ('booking' pour réservation, 'contact' pour contact).`

    const tools = [
      {
        type: 'function' as const,
        function: {
          name: 'get_services',
          description: 'Liste tous les services proposés par catégorie (visage, corps, techniques)',
          parameters: { type: 'object', properties: {} },
        },
      },
      {
        type: 'function' as const,
        function: {
          name: 'get_service_details',
          description: 'Détails d\'un service spécifique par son slug',
          parameters: {
            type: 'object',
            properties: {
              slug: { type: 'string', description: 'Le slug du service (ex: facial-aesthetics, lip-aesthetics, epilation-laser)' },
            },
            required: ['slug'],
          },
        },
      },
      {
        type: 'function' as const,
        function: {
          name: 'get_team',
          description: 'Liste les membres de l\'équipe du Widamine Center',
          parameters: { type: 'object', properties: {} },
        },
      },
      {
        type: 'function' as const,
        function: {
          name: 'get_business_info',
          description: 'Coordonnées, horaires et adresse du centre',
          parameters: { type: 'object', properties: {} },
        },
      },
      {
        type: 'function' as const,
        function: {
          name: 'trigger_popup',
          description: 'Ouvre un popup de réservation ou de contact pour le client sur le site',
          parameters: {
            type: 'object',
            properties: {
              type: { type: 'string', enum: ['booking', 'contact'], description: "'booking' pour ouvrir le popup de réservation, 'contact' pour ouvrir le popup de contact" },
            },
            required: ['type'],
          },
        },
      },
    ]

    const messages = [
      { role: 'system', content: systemPrompt },
      ...(history || []),
      { role: 'user', content: message },
    ]

    const body = {
      model: MODEL,
      messages,
      tools,
      tool_choice: 'auto' as const,
    }

    const res = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const errText = await res.text()
      throw new Error(`NVIDIA API error ${res.status}: ${errText}`)
    }

    const data = await res.json()
    const choice = data.choices?.[0]

    if (!choice) {
      return { reply: 'Désolé, je n\'ai pas pu traiter votre demande.', sources: [] }
    }

    let trigger: string | null = null
    if (choice.finish_reason === 'tool_calls' && choice.message?.tool_calls) {
      const popupCall = choice.message.tool_calls.find(
        (tc: ToolCall) => tc.function.name === 'trigger_popup',
      )
      if (popupCall) {
        const args = JSON.parse(popupCall.function.arguments)
        trigger = args.type || null
      }

      const toolResults = await Promise.all(
        choice.message.tool_calls.map((tc: ToolCall) => this.executeTool(tc)),
      )

      const followUpBody = {
        model: MODEL,
        messages: [
          ...messages,
          { role: 'assistant', content: null, tool_calls: choice.message.tool_calls },
          ...toolResults.map((r) => ({
            role: 'tool' as const,
            tool_call_id: r.id,
            content: JSON.stringify(r.result),
          })),
        ],
      }

      const res2 = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(followUpBody),
      })

      if (!res2.ok) {
        const errText = await res2.text()
        throw new Error(`NVIDIA API error ${res2.status}: ${errText}`)
      }

      const data2 = await res2.json()
      return {
        reply: data2.choices?.[0]?.message?.content || 'Désolé, je n\'ai pas pu traiter votre demande.',
        sources: toolResults.flatMap((r) => r.sources || []),
        trigger,
      }
    }

    return {
      reply: choice.message?.content || 'Désolé, je n\'ai pas pu traiter votre demande.',
      sources: [],
      trigger,
    }
  }

  private async executeTool(tc: ToolCall) {
    const { name, arguments: argsStr } = tc.function
    const args = JSON.parse(argsStr || '{}')

    switch (name) {
      case 'get_services':
        return await this.getServices(tc.id)
      case 'get_service_details':
        return await this.getServiceDetails(tc.id, args.slug)
      case 'get_team':
        return await this.getTeam(tc.id)
      case 'get_business_info':
        return this.getBusinessInfo(tc.id)
      case 'trigger_popup':
        return { id: tc.id, result: { triggered: args.type }, sources: [] }
      default:
        return { id: tc.id, result: 'Outil inconnu', sources: [] }
    }
  }

  private async getServices(toolId: string) {
    const motifs = await this.prisma.motif.findMany({
      where: { isActive: true },
      select: { name: true, slug: true, description: true, duration: true, color: true },
      orderBy: { name: 'asc' },
    })

    const byCategory: Record<string, typeof motifs> = {}
    const face = ['facial', 'lip', 'eye', 'eyebrow', 'visage', 'lèvre', 'sourcil']
    const corps = ['body', 'breast', 'butt', 'arm', 'liposuction', 'vaser', 'corps', 'sein', 'fesse', 'bras']
    const laser = ['laser', 'epilation', 'peeling']

    for (const m of motifs) {
      const kw = `${m.name} ${m.slug}`.toLowerCase()
      let cat = 'autres'
      if (face.some((k) => kw.includes(k))) cat = 'visage'
      else if (corps.some((k) => kw.includes(k))) cat = 'corps'
      else if (laser.some((k) => kw.includes(k))) cat = 'techniques'
      ;(byCategory[cat] = byCategory[cat] || []).push(m)
    }

    return {
      id: toolId,
      result: byCategory,
      sources: [] as string[],
    }
  }

  private async getServiceDetails(toolId: string, slug: string) {
    const motif = await this.prisma.motif.findUnique({
      where: { slug },
      select: {
        name: true,
        slug: true,
        description: true,
        duration: true,
        color: true,
        sessions: { select: { number: true, duration: true } },
        practitionerAssignments: {
          where: { isActive: true },
          select: { practitioner: { select: { name: true } } },
        },
      },
    })

    return {
      id: toolId,
      result: motif || { error: 'Service non trouvé' },
      sources: [] as string[],
    }
  }

  private async getTeam(toolId: string) {
    const practitioners = await this.prisma.user.findMany({
      where: { role: { in: ['DOCTOR', 'PRACTITIONER'] } },
      select: { name: true, role: true, email: true },
    })

    return {
      id: toolId,
      result: practitioners,
      sources: [] as string[],
    }
  }

  private getBusinessInfo(toolId: string) {
    return {
      id: toolId,
      result: {
        name: 'Widamine Aesthetic Center',
        address: 'Boulevard Slaoui, Bureaux Nour, 2ème étage, Fès',
        phone: '+212 (535) 624 696',
        email: 'info@widamineaestheticcenter.com',
        hours: 'Lundi - Vendredi : 9h00 - 18h00\nSamedi : 9h00 - 13h00\nDimanche : Fermé',
      },
      sources: [] as string[],
    }
  }
}
