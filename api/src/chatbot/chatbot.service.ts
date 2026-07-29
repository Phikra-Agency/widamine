import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'
import { ClinicInfoService } from '@/clinic-info/clinic-info.service'

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const MODEL = 'llama-3.3-70b-versatile'

interface ToolCall {
  id: string
  type: 'function'
  function: { name: string; arguments: string }
}

@Injectable()
export class ChatbotService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly clinicInfo: ClinicInfoService,
  ) {}

  async handleMessage(message: string, history?: { role: string; content: string }[]) {
    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) {
      return {
        reply:
          "Le centre Widamine est joignable par téléphone au **+212 (535) 624 696** ou par email à **info@widamineaestheticcenter.com**.\n\nNos horaires : du lundi au vendredi de 9h à 18h, le samedi de 9h à 13h.\n\n*L'assistant IA sera bientôt disponible.*",
        sources: [],
      }
    }

    const systemPrompt = `Tu es l'assistant virtuel du Widamine Center, un centre médical de dermato-esthétique, bodycontouring et lasers à Fès, Maroc. Tu es professionnel, chaleureux et serviable.

OBJECTIF : Aider les visiteurs à en savoir plus sur nos services, notre équipe, nos horaires, et faciliter la prise de rendez-vous.

RÈGLES DE CONVERSATION :
1. Réponds en français, de façon naturelle, claire et concise (2-4 phrases maximum sauf demande de détails)
2. Tu DOIS toujours demander le prénom et l'email du visiteur, mais de façon NATURELLE et PROGRESSIVE :
   - Si c'est un visiteur qui pose une question simple (horaires, localisation, services), réponds d'abord à sa question
   - Puis demande gentiment son prénom et email pour mieux l'accompagner
   - Exemple : "Avec plaisir ! Puis-je avoir votre prénom et email pour mieux vous accompagner ?"
3. Une fois le prénom ET l'email obtenus, utilise IMMÉDIATEMENT l'outil store_lead
4. Après avoir enregistré les coordonnées, tu peux répondre normalement aux questions

OUTILS DISPONIBLES (ne jamais mentionner leur nom dans tes réponses) :
- store_lead : enregistre prénom + email en base
- get_clinic_stats : statistiques des rendez-vous (nombre total, par statut, par service)
- get_services_info : liste tous les services avec praticiens disponibles
- get_practitioners_info : infos sur l'équipe et leurs disponibilités
- get_business_hours : coordonnées, horaires, adresse du centre
- trigger_popup : ouvre le formulaire de réservation (type='booking') ou contact (type='contact')

USAGE DES OUTILS :
- Utilise get_clinic_stats quand on te demande combien de rendez-vous, quels sont les services populaires, etc.
- Utilise get_services_info quand on demande la liste des traitements, qui fait quoi
- Utilise get_practitioners_info quand on demande qui travaille ici, qui est disponible
- Utilise get_business_hours pour adresse, téléphone, horaires
- IMPORTANT : Ne mentionne JAMAIS le nom des outils. Réponds comme si tu connaissais l'info naturellement.

EXEMPLES DE BONNES RÉPONSES :
User: "Quels sont vos horaires ?"
Assistant: "Nous sommes ouverts du lundi au vendredi de 9h à 18h, et le samedi de 9h à 13h. Dimanche fermé. Pour mieux vous aider, puis-je avoir votre prénom et email ?"

User: "Combien de rendez-vous cette semaine ?"
Assistant: "Cette semaine nous avons 23 rendez-vous dont 15 confirmés et 5 en attente. Puis-je avoir votre prénom et email pour mieux vous accompagner ?"

User: "Je veux prendre rendez-vous"
Assistant: "Avec plaisir ! Je vais ouvrir le formulaire de réservation pour vous. Avant cela, puis-je avoir votre prénom et email ?"

RÈGLES STRICTES :
- Ne dis JAMAIS "Je vais utiliser l'outil X" ou "L'API me dit que..."
- Sois humain et naturel
- Si tu ne sais pas, dis-le honnêtement et propose de contacter le centre
- Demande toujours le prénom et email, mais de façon fluide et naturelle`

    const tools = [
      {
        type: 'function' as const,
        function: {
          name: 'store_lead',
          description: 'Enregistre le prénom et l\'email du visiteur en base de données',
          parameters: {
            type: 'object',
            properties: {
              name: { type: 'string', description: 'Le prénom du visiteur' },
              email: { type: 'string', description: 'L\'email du visiteur' },
            },
            required: ['name', 'email'],
          },
        },
      },
      {
        type: 'function' as const,
        function: {
          name: 'get_clinic_stats',
          description: 'Récupère les statistiques des rendez-vous (total, par statut, par service) sur une période donnée',
          parameters: {
            type: 'object',
            properties: {
              period: {
                type: 'string',
                enum: ['today', 'week', 'month'],
                description: 'Période pour les stats : today, week (défaut), ou month',
              },
            },
          },
        },
      },
      {
        type: 'function' as const,
        function: {
          name: 'get_services_info',
          description: 'Liste tous les services disponibles avec leurs praticiens assignés',
          parameters: { type: 'object', properties: {} },
        },
      },
      {
        type: 'function' as const,
        function: {
          name: 'get_practitioners_info',
          description: 'Infos sur l\'équipe médicale et leurs disponibilités',
          parameters: { type: 'object', properties: {} },
        },
      },
      {
        type: 'function' as const,
        function: {
          name: 'get_business_hours',
          description: 'Coordonnées, horaires et adresse du Widamine Center',
          parameters: { type: 'object', properties: {} },
        },
      },
      {
        type: 'function' as const,
        function: {
          name: 'trigger_popup',
          description: 'Ouvre un popup de réservation ou de contact sur le site',
          parameters: {
            type: 'object',
            properties: {
              type: {
                type: 'string',
                enum: ['booking', 'contact'],
                description: "'booking' pour réserver, 'contact' pour contacter",
              },
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
      case 'store_lead':
        return await this.storeLead(tc.id, args.name, args.email)
      case 'get_clinic_stats':
        return await this.getClinicStats(tc.id, args.period)
      case 'get_services_info':
        return await this.getServicesInfo(tc.id)
      case 'get_practitioners_info':
        return await this.getPractitionersInfo(tc.id)
      case 'get_business_hours':
        return await this.getBusinessHours(tc.id)
      case 'trigger_popup':
        return { id: tc.id, result: { triggered: args.type }, sources: [] }
      default:
        return { id: tc.id, result: 'Outil inconnu', sources: [] }
    }
  }

  private async getClinicStats(toolId: string, period?: string) {
    const stats = await this.clinicInfo.getAppointmentStats(period)
    return {
      id: toolId,
      result: stats,
      sources: [] as string[],
    }
  }

  private async getServicesInfo(toolId: string) {
    const services = await this.clinicInfo.getAvailableServices()
    return {
      id: toolId,
      result: services,
      sources: [] as string[],
    }
  }

  private async getPractitionersInfo(toolId: string) {
    const servicesByPractitioner = await this.clinicInfo.getServicesByPractitioner()
    const availability = await this.clinicInfo.getPractitionersAvailability()

    return {
      id: toolId,
      result: {
        practitioners: servicesByPractitioner,
        availability,
      },
      sources: [] as string[],
    }
  }

  private async getBusinessHours(toolId: string) {
    const businessInfo = this.clinicInfo.getBusinessHours()
    return {
      id: toolId,
      result: businessInfo,
      sources: [] as string[],
    }
  }

  private async storeLead(toolId: string, name: string, email: string) {
    await this.prisma.chatLead.create({ data: { name, email } })
    return { id: toolId, result: { stored: true, name, email }, sources: [] }
  }
}
