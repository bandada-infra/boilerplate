import type { NextApiRequest, NextApiResponse } from "next"
import { verifyProof } from "@semaphore-protocol/proof"
import supabase from "@/utils/supabaseClient"
import { getGroup } from "@/utils/bandadaApi"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  let errorLog = ""
  if (typeof process.env.NEXT_PUBLIC_BANDADA_GROUP_ID !== "string") {
    throw new Error(
      "Please, define NEXT_PUBLIC_BANDADA_GROUP_ID in your .env.development.local or .env.production.local file"
    )
  }
  const groupId = process.env.NEXT_PUBLIC_BANDADA_GROUP_ID!

  const { feedback, merkleTreeRoot, nullifierHash, proof } = req.body

  try {
    const group = await getGroup(groupId)

    if (group) {
      const merkleTreeDepth = group.treeDepth

      const { data: currentMerkleRoot, error: errorRootHistory } =
        await supabase
          .from("root_history")
          .select()
          .order("created_at", { ascending: false })
          .limit(1)

      if (errorRootHistory) {
        console.log(errorRootHistory)
        res.status(500).end()
        return
      }

      if (currentMerkleRoot) {
        if (merkleTreeRoot !== currentMerkleRoot[0].root) {
          // compare merkle tree roots
          const { data: dataMerkleTreeRoot, error: errorMerkleTreeRoot } =
            await supabase
              .from("root_history")
              .select()
              .eq("root", merkleTreeRoot)

          if (errorMerkleTreeRoot) {
            console.log(errorMerkleTreeRoot)
            res.status(500).end()
            return
          }

          if (dataMerkleTreeRoot?.length === 0) {
            errorLog = "Merkle Root is not part of the group"
            console.log(errorLog)
            res.status(500).send(errorLog)
            return
          }

          if (dataMerkleTreeRoot) {
            console.log("dataMerkleTreeRoot", dataMerkleTreeRoot)

            const merkleTreeRootDuration = group.fingerprintDuration

            if (
              dataMerkleTreeRoot &&
              Date.now() >
                Date.parse(dataMerkleTreeRoot[0].created_at) +
                  merkleTreeRootDuration
            ) {
              errorLog = "Merkle Tree Root is expired"
              console.log(errorLog)
              res.status(500).send(errorLog)
              return
            }
          }
        }

        const { data: nullifier, error: errorNullifierHash } = await supabase
          .from("nullifier_hash")
          .select("nullifier")
          .eq("nullifier", nullifierHash)

        if (errorNullifierHash) {
          console.log(errorNullifierHash)
          res.status(500).end()
          return
        }

        if (nullifier.length > 0) {
          errorLog = "You are using the same nullifier twice"
          console.log(errorLog)
          res.status(500).send(errorLog)
          return
        }

        const isVerified = await verifyProof(
          {
            merkleTreeRoot,
            nullifierHash,
            externalNullifier: groupId,
            signal: feedback,
            proof
          },
          merkleTreeDepth
        )

        if (isVerified) {
          const { data, error } = await supabase
            .from("feedback")
            .insert([{ signal: feedback }])
            .select()
            .order("created_at", { ascending: false })

          if (error) {
            console.error(error)
            res.status(500).end()
            return
          }

          const { error: errorNullifier } = await supabase
            .from("nullifier_hash")
            .insert([{ nullifier: nullifierHash }])

          if (errorNullifier) {
            console.error(error)
            res.status(500).end()
            return
          }

          const { error: errorInsertNullifier } = await supabase
            .from("nullifier_hash")
            .insert([{ nullifier: nullifierHash }])

          if (errorInsertNullifier) {
            console.error(errorInsertNullifier)
            res.status(500).end()
            return
          }

          if (data) {
            res.status(200).json({ data })
            return
          }
        } else {
          const errorLog = "The proof was not verified successfully"
          console.error(errorLog)
          res.status(500).send(errorLog)
          return
        }
      }
    } else {
      errorLog = "This group does not exist"
      console.error(errorLog)
      res.status(500).send(errorLog)
      return
    }
  } catch (error) {
    console.error(error)
    res.status(500).end()
    return
  }
}
