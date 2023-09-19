import type { NextApiRequest, NextApiResponse } from "next"
import { addMemberByApiKey, getGroup } from "@/utils/bandadaApi"
import supabase from "@/utils/supabaseClient"
import { getRoot } from "@/utils/useSemaphore"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (typeof process.env.NEXT_PUBLIC_BANDADA_GROUP_API_KEY !== "string") {
    throw new Error(
      "Please, define NEXT_PUBLIC_BANDADA_GROUP_API_KEY in your .env.development.local or .env.production.local file"
    )
  }
  const apiKey = process.env.NEXT_PUBLIC_BANDADA_GROUP_API_KEY!
  const { groupId, commitment } = req.body

  try {
    await addMemberByApiKey(groupId, commitment, apiKey)
    const groupInfo = await getGroup(groupId)
    if (groupInfo) {
      const groupRoot = await getRoot(
        groupId,
        groupInfo.treeDepth,
        groupInfo.members
      )
      const { data, error } = await supabase
        .from("root_history")
        .insert([{ root: groupRoot.toString() }])

      if (error) {
        console.error(error)
        res.status(500).end()
      }

      res.status(200).end()
    }
  } catch (error) {
    console.error(error)
    res.status(500).end()
  }
}
