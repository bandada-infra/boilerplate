import type { NextApiRequest, NextApiResponse } from "next"
import { verifyProof } from "@semaphore-protocol/proof"
import supabase from "@/utils/supabaseClient"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (typeof process.env.NEXT_PUBLIC_GROUP_ID !== "string") {
    throw new Error(
      "Please, define NEXT_PUBLIC_GROUP_ID in your .env.development.local or .env.production.local file"
    )
  }
  const groupId = process.env.NEXT_PUBLIC_GROUP_ID!

  const { feedback, merkleTreeRoot, nullifierHash, proof } = req.body

  try {
    const isVerified = await verifyProof(
      {
        merkleTreeRoot,
        nullifierHash,
        externalNullifier: groupId,
        signal: feedback,
        proof
      },
      16
    )

    if (isVerified) {
      const { data, error } = await supabase
        .from("feedback")
        .insert([{ signal: feedback }])
        .select()

      if (error) {
        console.error(error)
        res.status(500).end()
      }

      if (data) res.status(200).json({ data })
    } else {
      console.error("The proof was not verified successfully")
      res.status(500).end()
    }
  } catch (error) {
    console.error(error)
    res.status(500).end()
  }
}
