import type { NextApiRequest, NextApiResponse } from "next"
import { addMemberByApiKey } from "@/utils/bandadaApi"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (typeof process.env.NEXT_PUBLIC_GROUP_API_KEY !== "string") {
    throw new Error(
      "Please, define NEXT_PUBLIC_GROUP_API_KEY in your .env.development.local or .env.production.local file"
    )
  }
  const apiKey = process.env.NEXT_PUBLIC_GROUP_API_KEY!
  const { groupId, commitment } = req.body

  try {
    await addMemberByApiKey(groupId, commitment, apiKey)
    res.status(200).end()
  } catch (error) {
    console.error(error)

    res.status(500).end()
  }
}
