import type { NextApiRequest, NextApiResponse } from "next"
import { addMemberByApiKey, getGroup } from "@/utils/bandadaApi"
import supabase from "@/utils/supabaseClient"

/**
 * API endpoint to add a member using an API key.
 * @param req The request object.
 * @param res The response object.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Check if the admin API key is defined.
  if (typeof process.env.NEXT_PUBLIC_BANDADA_ADMIN_API_KEY !== "string") {
    throw new Error(
      "Please, define NEXT_PUBLIC_BANDADA_ADMIN_API_KEY in your .env.development.local or .env.production.local file"
    )
  }

  // Retrieve the admin API key.
  const apiKey = process.env.NEXT_PUBLIC_BANDADA_ADMIN_API_KEY!
  // Extract groupId and commitment from the request body.
  const { groupId, commitment } = req.body

  try {
    // Add a member using the API key.
    await addMemberByApiKey(groupId, commitment, apiKey)

    // Get the group details.
    const group = await getGroup(groupId)

    // If group exists, update root history in the backend.
    if (group) {
      const groupRoot = group.fingerprint
      const { error } = await supabase
        .from("root_history")
        .insert([{ root: groupRoot.toString() }])

      // Handle error if occurred during insertion.
      if (error) {
        console.error(error)
        res.status(500).end()
        return
      }

      // Return success status if no errors.
      res.status(200).end()
    }
  } catch (error) {
    // Handle any errors that occur during the process.
    console.error(error)
    res.status(500).end()
  }
}
