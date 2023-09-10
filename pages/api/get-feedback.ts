import type { NextApiRequest, NextApiResponse } from "next"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const signals = [
    "32745724963520398971896023680259182095152230382943781773533222368139271995392",
    "32745724963520397364957979421268906553190138041781179251330228585346436694016",
    "32745724963507154588535241082408165243587154520773793776458464589590718054400"
  ]

  try {
    res.status(200).json(signals)
  } catch (error) {
    console.error(error)

    res.status(500).end()
  }
}
