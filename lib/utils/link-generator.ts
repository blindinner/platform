import { supabaseAdmin } from '@/lib/supabase/admin'

export async function generateUniqueCode(): Promise<string> {
  const { data } = await supabaseAdmin.rpc('generate_unique_code')
  return data as string
}

export function buildShortLink(code: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL
  return `${baseUrl}/r/${code}`
}

export function buildCreativeUrl(code: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL
  return `${baseUrl}/creative/${code}`
}
