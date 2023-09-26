import { Identity } from "@semaphore-protocol/identity"
import { useRouter } from "next/router"
import React, { useCallback, useEffect, useState } from "react"
import { getMembersGroup } from "@/utils/bandadaApi"
import Stepper from "@/components/stepper"
import Divider from "@/components/divider"

export default function GroupsPage() {
  const router = useRouter()

  const [_identity, setIdentity] = useState<Identity>()
  const [_isGroupMember, setIsGroupMember] = useState<boolean>(false)
  const [_loading, setLoading] = useState<boolean>(false)
  const [_users, setUsers] = useState<string[]>([])

  const localStorageTag = process.env.NEXT_PUBLIC_LOCAL_STORAGE_TAG!

  const groupId = process.env.NEXT_PUBLIC_BANDADA_GROUP_ID!

  const getUsers = useCallback(async () => {
    const users = await getMembersGroup(groupId)
    setUsers(users!.reverse())
    return users
  }, [groupId])

  useEffect(() => {
    const identityString = localStorage.getItem(localStorageTag)

    if (!identityString) {
      router.push("/")
      return
    }

    const identity = new Identity(identityString)

    setIdentity(identity)

    async function isMember() {
      const users = await getUsers()
      const answer = users?.includes(identity!.commitment.toString())
      setIsGroupMember(answer || false)
    }

    isMember()
  }, [router, getUsers, localStorageTag])

  const joinCredentialGroup = async () => {
    setLoading(true)

    const commitment = _identity?.commitment.toString()

    try {
      const response = await fetch("api/join-credential", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groupId,
          commitment
        })
      })

      if (response.status === 200) {
        setIsGroupMember(true)
        const users = await getMembersGroup(groupId)
        setUsers(users!.reverse())
      } else {
        alert(await response.json)
      }
    } catch (error) {
      console.log(error)

      alert("Some error occurred, please try again!")
    } finally {
      setLoading(false)
    }

    setLoading(false)
    setIsGroupMember(true)
    getUsers()
  }

  const joinGroup = async () => {
    setLoading(true)

    const commitment = _identity?.commitment.toString()

    try {
      const response = await fetch("api/join-api-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groupId,
          commitment
        })
      })

      if (response.status === 200) {
        setIsGroupMember(true)
        const users = await getMembersGroup(groupId)
        setUsers(users!.reverse())
      } else {
        alert(await response.json)
      }
    } catch (error) {
      console.log(error)

      alert("Some error occurred, please try again!")
    } finally {
      setLoading(false)
    }
  }

  const renderGroup = () => {
    return (
      <div className="lg:w-2/5 md:w-2/4 w-full">
        <div className="flex justify-between items-center mb-10">
          <div className="text-2xl font-semibold text-slate-700">
            Feedback users ({_users?.length})
          </div>
          <div>
            <button
              className="flex justify-center items-center w-auto space-x-1 verify-btn text-lg font-medium rounded-md bg-gradient-to-r text-slate-700"
              onClick={getUsers}
            >
              <span>Refresh</span>
            </button>
          </div>
        </div>

        <div className="flex justify-center items-center my-3">
          <button
            className="flex justify-center items-center w-full space-x-3 disabled:cursor-not-allowed disabled:opacity-50 verify-btn text-lg font-medium rounded-md px-5 py-3 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-slate-100"
            onClick={joinGroup}
            disabled={_loading || _isGroupMember}
          >
            {_loading && <div className="loader"></div>}
            <span>Join group</span>
          </button>
        </div>

        {_users ? (
          <div className="grid-rows-1 place-content-center">
            <div className="space-y-3">
              {_users?.map((user, i) => (
                <div
                  key={i}
                  className="overflow-auto border-2 p-3 border-slate-300 space-y-3"
                >
                  {user}
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
          <h1 className="text-3xl font-semibold text-slate-700">Groups</h1>
        </div>
        <div className="flex justify-center items-center mt-10">
          <span className="lg:w-2/5 md:w-2/4 w-full">
            <span>
              Bandada groups are binary Incremental Merkle Trees in which each
              leaf contains an identity commitment for a user. Groups can be
              abstracted to represent events, polls, or organizations.
            </span>
            <Divider />
          </span>
        </div>
        <div className="flex justify-center items-center mt-10">
          {renderGroup()}
        </div>
        <div className="flex justify-center items-center mt-10">
          <div className="lg:w-2/5 md:w-2/4 w-full">
            <Stepper
              step={2}
              onPrevClick={() => router.push("/")}
              onNextClick={
                _identity && Boolean(_isGroupMember)
                  ? () => router.push("/proofs")
                  : undefined
              }
            />
          </div>
        </div>
      </div>
    </div>
  )
}
