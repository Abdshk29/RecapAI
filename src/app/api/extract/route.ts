import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import OpenAI from 'openai'

export async function POST(request: Request) {
  try {
    // 1. Verify user session
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized session' }, { status: 401 })
    }

    // 2. Parse request body
    const body = await request.json()
    const { meetingId } = body

    if (!meetingId) {
      return NextResponse.json({ error: 'Missing meetingId parameter' }, { status: 400 })
    }

    // 3. Fetch meeting (RLS will automatically restrict access to owner)
    const { data: meeting, error: fetchError } = await supabase
      .from('meetings')
      .select('*')
      .eq('id', meetingId)
      .single()

    if (fetchError || !meeting) {
      console.warn('Error fetching meeting:', fetchError)
      return NextResponse.json({ error: 'Meeting not found or access denied' }, { status: 404 })
    }

    // 4. Initialize OpenAI Client
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey || apiKey.startsWith('your-openai-api-key')) {
      return NextResponse.json({ 
        error: 'OpenAI API key is not configured. Please set the OPENAI_API_KEY environment variable.' 
      }, { status: 500 })
    }

    const openai = new OpenAI({ apiKey })

    // 5. Query OpenAI API
    const systemPrompt = `You are a highly efficient assistant that extracts action items from meeting transcripts.
Your task is to analyze the meeting transcript and return a clean, structured JSON object with a list of action items.
You must output a JSON object strictly following this structure:
{
  "action_items": [
    {
      "task": "A clear, actionable description of the task (be specific, e.g. 'Update database schema for Auth' instead of 'fix database')",
      "owner": "The specific name of the person responsible for the task. If multiple people are mentioned, split them or assign to the primary owner. If no owner is mentioned or it is a team effort, use 'Team' or 'Anyone'.",
      "due_date": "The due date in YYYY-MM-DD format. Infer this based on the transcript's context if a deadline is mentioned. If no deadline can be inferred, set this field to null. Never guess dates out of context.",
      "priority": "A string containing either 'low', 'medium', or 'high'. Determine this based on how urgent or critical the task is described in the conversation."
    }
  ]
}

CRITICAL RULES:
- You must output ONLY a valid JSON object.
- Do NOT wrap your response in markdown code fences.
- Do NOT include any introduction, explanations, or comments.
- Parse defensively. If the transcript contains no action items, return { "action_items": [] }.`

    const userPrompt = `Meeting Title: ${meeting.title}
Meeting Date (Reference): ${new Date(meeting.created_at).toISOString().split('T')[0]}

Transcript:
${meeting.raw_transcript}`

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Extremely fast and cost-effective
      response_format: { type: 'json_object' },
      temperature: 0.1,
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: userPrompt
        }
      ]
    })

    const responseText = response.choices[0]?.message?.content || ''

    if (!responseText) {
      throw new Error('OpenAI returned an empty response.')
    }

    // 6. Defensive parsing
    let cleanJson = responseText.trim()

    // Strip markdown code fences if OpenAI included them despite json_object mode
    if (cleanJson.startsWith('```')) {
      const startIdx = Math.min(
        cleanJson.indexOf('['),
        cleanJson.indexOf('{')
      )
      const endIdx = Math.max(
        cleanJson.lastIndexOf(']'),
        cleanJson.lastIndexOf('}')
      )
      if (startIdx !== -1 && endIdx !== -1) {
        cleanJson = cleanJson.substring(startIdx, endIdx + 1)
      }
    }

    let parsedData: any = null
    try {
      parsedData = JSON.parse(cleanJson)
    } catch (parseError) {
      console.warn('Failed to parse JSON response from OpenAI. Raw text was:', responseText)
      return NextResponse.json({ 
        error: 'Failed to parse structured action items from AI response. Please try again.',
        raw: responseText 
      }, { status: 502 })
    }

    // Handle both root object with key and root array formats
    let parsedItems: any[] = []
    if (parsedData && typeof parsedData === 'object') {
      if (Array.isArray(parsedData)) {
        parsedItems = parsedData
      } else if (Array.isArray(parsedData.action_items)) {
        parsedItems = parsedData.action_items
      }
    }

    // 7. Insert items into database
    if (parsedItems.length > 0) {
      const actionItemsToInsert = parsedItems.map((item: any) => {
        // Validate priority
        let priority = 'medium'
        if (item.priority && ['low', 'medium', 'high'].includes(item.priority.toLowerCase())) {
          priority = item.priority.toLowerCase()
        }

        // Validate due_date is YYYY-MM-DD
        let dueDate = null
        if (item.due_date && /^\d{4}-\d{2}-\d{2}$/.test(item.due_date)) {
          dueDate = item.due_date
        }

        return {
          meeting_id: meeting.id,
          task: item.task ? String(item.task).trim() : 'Unnamed Task',
          owner: item.owner ? String(item.owner).trim() : 'Anyone',
          due_date: dueDate,
          priority: priority,
          status: 'open'
        }
      })

      const { error: insertError } = await supabase
        .from('action_items')
        .insert(actionItemsToInsert)

      if (insertError) {
        console.warn('Error inserting action items:', insertError)
        return NextResponse.json({ error: 'Failed to insert action items into database' }, { status: 500 })
      }
    }

    return NextResponse.json({
      success: true,
      extractedCount: parsedItems.length
    })

  } catch (error: any) {
    console.warn('Unexpected error in /api/extract:', error)
    return NextResponse.json({ error: error.message || 'An unexpected error occurred.' }, { status: 500 })
  }
}
