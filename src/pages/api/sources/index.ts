import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '~/server/db'
import { ZodError, z } from 'zod'
import { Sources } from '@prisma/client'

const getData = async (req: NextApiRequest, res: NextApiResponse) => {
    const sources = await prisma.sources.findMany()
    res.json({ result: sources })
}
const postData = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const sourceValidation = z.object({
            from: z.string().nonempty().min(3),
            url: z.string().url(),
        })

        const sources: Sources[] = req.body?.data
        if (sources.length == 0) {
            res.status(400).json({ success: false, error: 'data cannot emtpy' })
            return
        }

        for (const source of sources) {
            const validData = sourceValidation.parse(source)
            await prisma.sources.create({
                data: {
                    from: validData.from,
                    url: validData.url,
                },
            })
        }
        res.status(201).json({ success: true, result: sources })
    } catch (error) {
        if (error instanceof ZodError) {
            res.status(400).json({ success: false, error: error })
        } else {
            res.status(500).json({ success: false, error: error })
        }
    }
}
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    req.method === 'POST'
        ? postData(req, res)
        : req.method === 'PUT'
        ? console.log('PUT')
        : req.method === 'DELETE'
        ? console.log('DELETE')
        : req.method === 'GET'
        ? getData(req, res)
        : res.status(404).send('')
}
