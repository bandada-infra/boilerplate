import type { NextApiRequest, NextApiResponse } from "next"
import { addMemberByApiKey } from "@/utils/bandadaApi"
import { verifyProof } from "@semaphore-protocol/proof"

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

  if (typeof process.env.NEXT_PUBLIC_GROUP_ID !== "string") {
    throw new Error(
      "Please, define NEXT_PUBLIC_GROUP_API_KEY in your .env.development.local or .env.production.local file"
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
    console.log(isVerified)
    res.status(200).end()
  } catch (error) {
    console.error(error)

    res.status(500).end()
  }
}
