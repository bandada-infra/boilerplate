import { Identity } from "@semaphore-protocol/identity"
import { useRouter } from "next/router"
import React, { useEffect, useState } from "react"
import Stepper from "@/components/stepper"
import Divider from "@/components/divider"
import shortenString from "@/utils/shortenString"

export default function Home() {
  const router = useRouter()

  const [_identity, setIdentity] = useState<Identity>()

  const localStorageTag = process.env.NEXT_PUBLIC_LOCAL_STORAGE_TAG!

  useEffect(() => {
    const identityString = localStorage.getItem(localStorageTag)

    if (identityString) {
      const identity = new Identity(identityString)

      setIdentity(identity)

      console.log(
        "Your Semaphore identity was retrieved from the browser cache 👌🏽"
      )
    } else {
      console.log("Create your Semaphore identity 👆🏽")
    }
  }, [localStorageTag])

  const createIdentity = async () => {
    const identity = new Identity()

    setIdentity(identity)

    localStorage.setItem(localStorageTag, identity.toString())

    console.log("Your new Semaphore identity was just created 🎉")
  }

  const renderIdentity = () => {
    return (
      <div className="lg:w-2/5 md:w-2/4 w-full">
        <div className="flex justify-between items-center mb-3">
          <div className="text-2xl font-semibold text-slate-700">Identity</div>
          <div>
            <button
              className="flex justify-center items-center w-auto space-x-1 verify-btn text-lg font-medium rounded-md bg-gradient-to-r text-slate-700"
              onClick={createIdentity}
            >
              <span>New</span>
            </button>
          </div>
        </div>

        {_identity && (
          <div className="flex justify-center items-center">
            <div className="overflow-auto border-2 p-4 border-slate-300 space-y-3">
              <div className="flex space-x-2">
                <div>Private Key:</div>
                <div>{_identity.privateKey.toString()}</div>
              </div>
              <div className="flex space-x-2">
                <div>Public Key:</div>
                <div>
                  [{shortenString(_identity.publicKey[0].toString(), [8, 8])},{" "}
                  {shortenString(_identity.publicKey[1].toString(), [8, 8])}]
                </div>
              </div>
              <div className="flex space-x-2">
                <div>Commitment:</div>
                <div>{_identity.commitment.toString()}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div>
      <div>
        <div className="flex justify-center items-center">
          <h1 className="text-3xl font-semibold text-slate-700">Identities</h1>
        </div>
        <div className="flex justify-center items-center mt-10">
          <span className="lg:w-2/5 md:w-2/4 w-full">
            <span>
              The identity of a user in the Semaphore protocol. A{" "}
              <a
                href="https://docs.semaphore.pse.dev/guides/identities"
                target="_blank"
              >
                Semaphore identity
              </a>{" "}
              consists of an{" "}
              <a
                href="https://github.com/privacy-scaling-explorations/zk-kit/tree/main/packages/eddsa-poseidon"
                target="_blank"
              >
                EdDSA
              </a>{" "}
              public/private key pair and a commitment, used as the public
              identifier of the identity.
              <Divider />
            </span>
          </span>
        </div>
        <div className="flex justify-center items-center mt-5">
          {_identity ? (
            renderIdentity()
          ) : (
            <button
              className="flex justify-center items-center w-auto space-x-3 verify-btn text-lg font-medium rounded-md px-5 py-3 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-slate-100"
              onClick={createIdentity}
            >
              Create identity
            </button>
          )}
        </div>
        <div className="flex justify-center items-center mt-10">
          <div className="lg:w-2/5 md:w-2/4 w-full">
            <Stepper
              step={1}
              onNextClick={_identity && (() => router.push("/groups"))}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
