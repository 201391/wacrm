import { redirect } from 'next/navigation'

export default async function StoreRedirectPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const qs = new URLSearchParams()
  for (const [key, val] of Object.entries(params)) {
    if (typeof val === 'string') qs.set(key, val)
    else if (Array.isArray(val)) val.forEach((v) => qs.append(key, v))
  }
  const query = qs.toString()
  redirect(query ? `/?${query}` : '/')
}
