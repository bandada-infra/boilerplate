import type { NextApiRequest, NextApiResponse } from "next"
import { verifyProof } from "@semaphore-protocol/proof"
import supabase from "@/utils/supabaseClient"
import { getGroup } from "@/utils/bandadaApi"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  let errorLog = ""

  // Check if the environment variable for group ID is defined.
  if (typeof process.env.NEXT_PUBLIC_BANDADA_GROUP_ID !== "string") {
    throw new Error(
      "Please, define NEXT_PUBLIC_BANDADA_GROUP_ID in your .env.development.local or .env.production.local file"
    )
  }

  // Retrieve the group ID from the environment variables.
  const groupId = process.env.NEXT_PUBLIC_BANDADA_GROUP_ID!

  // Extract feedback, merkleTreeRoot, nullifierHash, and proof from the request body.
  const { feedback, merkleTreeRoot, nullifierHash, proof } = req.body

  try {
    // Get the group details based on the group ID.
    const group = await getGroup(groupId)

    // Check if the group exists
    if (!group) {
      errorLog = "This group does not exist"
      console.error(errorLog)
      res.status(500).send(errorLog)
      return
    }

    // Retrieve the merkle tree depth of the group
    const merkleTreeDepth = group.treeDepth

    // Fetch the current merkle root from the database
    const { data: currentMerkleRoot, error: errorRootHistory } = await supabase
      .from("root_history")
      .select()
      .order("created_at", { ascending: false })
      .limit(1)

    // Handle error if occurred during fetching current merkle root
    if (errorRootHistory) {
      console.log(errorRootHistory)
      res.status(500).end()
      return
    }

    // Check if current merkle root exists.
    if (!currentMerkleRoot) {
      errorLog = "Wrong currentMerkleRoot"
      console.error(errorLog)
      res.status(500).send(errorLog)
      return
    }

    // Compare merkle tree roots.
    if (merkleTreeRoot !== currentMerkleRoot[0].root) {
      // Compare merkle tree roots and validate duration.
      const { data: dataMerkleTreeRoot, error: errorMerkleTreeRoot } =
        await supabase.from("root_history").select().eq("root", merkleTreeRoot)

      if (errorMerkleTreeRoot) {
        console.log(errorMerkleTreeRoot)
        res.status(500).end()
        return
      }

      // Fetch nullifier from the database.
      if (!dataMerkleTreeRoot) {
        errorLog = "Wrong dataMerkleTreeRoot"
        console.error(errorLog)
        res.status(500).send(errorLog)
        return
      }

      if (dataMerkleTreeRoot.length === 0) {
        errorLog = "Merkle Root is not part of the group"
        console.log(errorLog)
        res.status(500).send(errorLog)
        return
      }

      console.log("dataMerkleTreeRoot", dataMerkleTreeRoot)

      const merkleTreeRootDuration = group.fingerprintDuration

      if (
        dataMerkleTreeRoot &&
        Date.now() >
          Date.parse(dataMerkleTreeRoot[0].created_at) + merkleTreeRootDuration
      ) {
        errorLog = "Merkle Tree Root is expired"
        console.log(errorLog)
        res.status(500).send(errorLog)
        return
      }
    }

    const { data: nullifier, error: errorNullifierHash } = await supabase
      .from("nullifier_hash")
      .select("nullifier")
      .eq("nullifier", nullifierHash)

    // Handle error if occurred during fetching nullifier.
    if (errorNullifierHash) {
      console.log(errorNullifierHash)
      res.status(500).end()
      return
    }

    // Check if nullifier is valid.
    if (!nullifier) {
      errorLog = "Wrong nullifier"
      console.log(errorLog)
      res.status(500).send(errorLog)
      return
    }

    // Check for duplicate nullifier usage.
    if (nullifier.length > 0) {
      errorLog = "You are using the same nullifier twice"
      console.log(errorLog)
      res.status(500).send(errorLog)
      return
    }

    // Verify the proof using Semaphore protocol.
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

    // Handle unverified proof.
    if (!isVerified) {
      const errorLog = "The proof was not verified successfully"
      console.error(errorLog)
      res.status(500).send(errorLog)
      return
    }

    // Insert nullifier into the database.
    const { error: errorNullifier } = await supabase
      .from("nullifier_hash")
      .insert([{ nullifier: nullifierHash }])

    // Handle error if occurred during inserting nullifier.
    if (errorNullifier) {
      console.error(errorNullifier)
      res.status(500).end()
      return
    }

    // Insert feedback into the database.
    const { data: dataFeedback, error: errorFeedback } = await supabase
      .from("feedback")
      .insert([{ signal: feedback }])
      .select()
      .order("created_at", { ascending: false })

    // Handle error if occurred during inserting feedback.
    if (errorFeedback) {
      console.error(errorFeedback)
      res.status(500).end()
      return
    }

    // Check if feedback data is valid.
    if (!dataFeedback) {
      const errorLog = "Wrong dataFeedback"
      console.error(errorLog)
      res.status(500).send(errorLog)
      return
    }

    // Return the inserted feedback data
    res.status(200).send(dataFeedback)
  } catch (error) {
    // Handle any errors that occur during the process
    console.error(error)
    res.status(500).end()
  }
}
