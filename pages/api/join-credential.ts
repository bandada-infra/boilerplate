import type { NextApiRequest, NextApiResponse } from "next"
import supabase from "@/utils/supabaseClient"

/**
 * API endpoint to handle joining a credential group.
 * @param req The request object.
 * @param res The response object.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Extract groupRoot from the request body.
  const { groupRoot } = req.body

  try {
    // Insert groupRoot into root_history table.
    const { error } = await supabase
      .from("root_history")
      .insert([{ root: groupRoot }])

    // Handle error if occurred during insertion.
    if (error) {
      console.error(error)
      res.status(500).end()
      return
    }

    // Return success status if no errors.
    res.status(200).end()
  } catch (error) {
    // Handle any errors that occur during the process.
    console.error(error)
    res.status(500).end()
  }
}
