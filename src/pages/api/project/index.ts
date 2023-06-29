import axios, { type AxiosResponse } from 'axios'
import * as cheerio from 'cheerio'
import { type NextApiRequest, type NextApiResponse } from 'next'
import { type LPSEItem } from 'types'
import { prisma } from '~/server/db'
import https from 'https'
import http from 'http'
import { AnyZodObject, Schema, z } from 'zod'
import { NextResponse } from 'next/server'

const httpsAgent = new https.Agent({
    rejectUnauthorized: false,
})

const httpAgent = new http.Agent({})

const getProjectList = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const projectList = await prisma.project.findMany()
        res.json({
            error: false,
            data: projectList,
        })
    } catch (err) {
        if (err instanceof Error) {
            res.json({
                error: true,
                message: err.message,
            })
        }
    }
}

const dataSchema = z.object({
    title: z.string(),
    owner: z.string(),
    hps: z.number(),
    deadlineAt: z.date(),
})

const addProject = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const { title, owner, hps, deadlineAt } = await dataSchema.parse(
            req.body
        )
        const projectList = await prisma.project.create({
            data: {
                title,
                owner,
                hps,
                deadlineAt,
            },
        })
        res.json({
            error: false,
            data: projectList,
        })
    } catch (err) {
        if (err instanceof z.ZodError) {
            res.json({
                error: true,
                message: 'Validation Error',
                detail: err.issues,
            })
        }
        if (err instanceof Error) {
            res.json({
                error: true,
                message: err.message,
            })
        }
    }
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    switch (req.method) {
        case 'GET':
            await getProjectList(req, res)
            break
        case 'POST':
            await addProject(req, res)
            break
        default:
            res.status(404).send('')
    }
}
