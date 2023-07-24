import { type NextApiRequest, type NextApiResponse } from 'next'
import { type LPSEProject } from 'types'
import { Redis } from "@upstash/redis"

const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL || '',
    token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
  })

const getData = async (req: NextApiRequest, res: NextApiResponse) => {
    const status: number = await redis.get('status') || 0
    if (status == 1)  {
        res.json({ status: status })
        return
    }
    const result: LPSEProject[] = await redis.get('lpse') || []

    res.json({ result: result })
}
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    req.method === 'POST'
        ? console.log('POST')
        : req.method === 'PUT'
        ? console.log('PUT')
        : req.method === 'DELETE'
        ? console.log('DELETE')
        : req.method === 'GET'
        ? await getData(req, res)
        : res.status(404).send('')
}
