import { useRouter } from "next/router"
import React, { useEffect, useState } from "react"
import { getMembersGroup, getGroup } from "@/utils/bandadaApi"
import Stepper from "@/components/stepper"
import { Identity, Group, generateProof } from "@semaphore-protocol/core"
import {
  encodeBytes32String,
  toBigInt,
  decodeBytes32String,
  toBeHex
} from "ethers"
import Divider from "@/components/divider"

// Component for managing feedback proofs.
export default function ProofsPage() {
  const router = useRouter()

  // State variables.
  const [_identity, setIdentity] = useState<Identity>()
  const [_loading, setLoading] = useState<boolean>(false)
  const [_renderInfoLoading, setRenderInfoLoading] = useState<boolean>(false)
  const [_feedback, setFeedback] = useState<string[]>([])

  // Environment variables.
  const localStorageTag = process.env.NEXT_PUBLIC_LOCAL_STORAGE_TAG!
  const groupId = process.env.NEXT_PUBLIC_BANDADA_GROUP_ID!

  // Effect to load user identity from local storage.
  useEffect(() => {
    // Load identity from local storage or redirect to home.
    const identityString = localStorage.getItem(localStorageTag)

    if (!identityString) {
      router.push("/")
      return
    }

    const identity = new Identity(identityString)

    setIdentity(identity)
  }, [router, localStorageTag])

  // Effect to fetch feedback on component mount.
  useEffect(() => {
    getFeedback()
  }, [])

  // Function to send feedback.
  const sendFeedback = async () => {
    if (!_identity) {
      return
    }

    // Prompt user for feedback.
    // The feedback can be whatever message you'd like.
    const feedback = prompt("Please enter your feedback:")

    // Fetch group members and generate proof.
    const users = await getMembersGroup(groupId)

    if (feedback && users) {
      setLoading(true)

      try {
        // Get the Bandada group details.
        const bandadaGroup = await getGroup(groupId)

        if (bandadaGroup === null) {
          alert("The Bandada group does not exist.")
          return
        }

        const semaphoreGroup = new Group(users)

        const message = toBigInt(encodeBytes32String(feedback)).toString()

        const proof = await generateProof(
          _identity,
          semaphoreGroup,
          message,
          groupId
        )

        // Send feedback to the server.
        const response = await fetch("api/send-feedback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            merkleTreeDepth: proof.merkleTreeDepth,
            merkleTreeRoot: proof.merkleTreeRoot,
            feedback: message,
            nullifierHash: proof.nullifier,
            points: proof.points
          })
        })

        // Handle response.
        if (response.status === 200) {
          const data = await response.json()

          console.log(data[0].message)

          if (data) setFeedback([data[0].message, ..._feedback])

          console.log(`Your feedback was posted 🎉`)
        } else {
          const text = await response.text()
          console.log(text)
          alert(text)
        }
      } catch (error) {
        console.error(error)

        alert("Some error occurred, please try again!")
      } finally {
        setLoading(false)
      }
    }
  }

  // Function to fetch feedback from the server.
  const getFeedback = async () => {
    setRenderInfoLoading(true)
    try {
      const response = await fetch("api/get-feedback", {
        method: "GET",
        headers: { "Content-Type": "application/json" }
      })

      const messages = await response.json()

      if (response.status === 200) {
        setFeedback(messages.map((message: any) => message.message))

        console.log("Feedback retrieved from the database")
      } else {
        alert("Some error occurred, please try again!")
      }
    } catch (error) {
      console.error(error)

      alert("Some error occurred, please try again!")
    } finally {
      setRenderInfoLoading(false)
    }
  }

  // Function to render feedback UI.
  const renderFeedback = () => {
    return (
      <div className="lg:w-2/5 md:w-2/4 w-full">
        {/* Feedback display and interaction */}
        <div className="flex justify-between items-center mb-10">
          <div className="text-2xl font-semibold text-slate-700">
            Feedback ({_feedback?.length})
          </div>
          <div>
            <button
              className="flex justify-center items-center w-auto space-x-1 verify-btn text-lg font-medium rounded-md bg-gradient-to-r text-slate-700"
              onClick={getFeedback}
            >
              <span>Refresh</span>
            </button>
          </div>
        </div>

        <div className="flex justify-center items-center my-3">
          <button
            className="flex justify-center items-center w-full space-x-3 disabled:cursor-not-allowed disabled:opacity-50 verify-btn text-lg font-medium rounded-md px-5 py-3 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-slate-100"
            onClick={sendFeedback}
            disabled={_loading || _renderInfoLoading}
          >
            {_loading && <div className="loader"></div>}
            <span>Send Feedback</span>
          </button>
        </div>

        {_renderInfoLoading && (
          <div className="flex justify-center items-center mt-20 gap-2">
            <div className="loader-app"></div>
            <div>Fetching feedback</div>
          </div>
        )}

        {_feedback ? (
          <div className="grid-rows-1 place-content-center">
            <div className="space-y-3">
              {_feedback?.map((feedback, i) => (
                <div
                  key={i}
                  className="overflow-auto border-2 p-3 border-slate-300 space-y-3"
                >
                  {decodeBytes32String(toBeHex(feedback))}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex justify-center items-center mt-20">
            <div className="loader-app"></div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div>
      <div>
        <div className="flex justify-center items-center">
          <h1 className="text-3xl font-semibold text-slate-700">Proofs</h1>
        </div>
        <div className="flex justify-center items-center mt-10">
          <span className="lg:w-2/5 md:w-2/4 w-full">
            <span>
              Members can anonymously{" "}
              <a
                className="space-x-1 text-blue-700 hover:underline"
                href="https://docs.semaphore.pse.dev/guides/proofs"
                target="_blank"
                rel="noreferrer noopener nofollow"
              >
                prove
              </a>{" "}
              that they are part of a group and send their anonymous messages.
              Messages could be votes, leaks, reviews, or feedback.
            </span>
            <Divider />
          </span>
        </div>
        <div className="flex justify-center items-center mt-5">
          {renderFeedback()}
        </div>
        <div className="flex justify-center items-center mt-10">
          <div className="lg:w-2/5 md:w-2/4 w-full">
            <Stepper step={3} onPrevClick={() => router.push("/groups")} />
          </div>
        </div>
      </div>
    </div>
  )
}
