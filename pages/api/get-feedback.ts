import type { NextApiRequest, NextApiResponse } from "next"
import supabase from "@/utils/supabaseClient"

/**
 * API endpoint to fetch feedback data.
 * @param req The request object.
 * @param res The response object.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Fetch feedback data from the database.
  const { data, error } = await supabase
    .from("feedback")
    .select()
    .order("created_at", { ascending: false })

  // Return feedback data if available.
  if (data) {
    res.status(200).json(data)
  }

  // Handle error if occurred.
  if (error) {
    console.log(error)
    res.status(500).end()
  }
}
