import type { NextApiRequest, NextApiResponse } from "next"
import { addMemberByApiKey, getGroup } from "@/utils/bandadaApi"
import supabase from "@/utils/supabaseClient"
import { getRoot } from "@/utils/useSemaphore"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { groupId, commitment } = req.body

  try {
    const group = await getGroup(groupId)
    if (group === null) {
      alert("Some error ocurred! Group not found!")
      return
    }

    const providerName = group.credentials.id.split("_")[0].toLowerCase()

    window.open(
      `${process.env.NEXT_PUBLIC_BANDADA_DASHBOARD_URL}/credentials?group=${groupId}&member=${commitment}&provider=${providerName}&redirect_uri=${process.env.NEXT_PUBLIC_APP_URL}/groups`
    )

    const groupRoot = await getRoot(groupId, group.treeDepth, group.members)

    const { error } = await supabase
      .from("root_history")
      .insert([{ root: groupRoot.toString() }])

    if (error) {
      console.error(error)
      res.status(500).end()
      return
    }

    res.status(200).end()
  } catch (error) {
    console.error(error)
    res.status(500).end()
  }
}
