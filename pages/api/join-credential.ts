import type { NextApiRequest, NextApiResponse } from "next"
import supabase from "@/utils/supabaseClient"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { root } = req.body

  try {
    const { error } = await supabase.from("root_history").insert([{ root }])

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
