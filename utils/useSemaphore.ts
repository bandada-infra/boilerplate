import { Group } from "@semaphore-protocol/group"

export async function getRoot(members: string[]) {
  const group = new Group(members)
  return group.root
}
