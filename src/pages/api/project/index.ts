import axios, { type AxiosResponse } from 'axios'
import * as cheerio from 'cheerio'
import { type NextApiRequest, type NextApiResponse } from 'next'
import { type LPSEProject } from 'types'
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
        res.status(200).json({
            error: false,
            data: projectList,
        })
    } catch (err) {
        if (err instanceof Error) {
            res.status(500).json({
                error: true,
                message: err.message,
            })
        }
        res.status(500).json({
            error: true,
            message: 'Unknown Error',
        })
    }
}

const dataSchema = z.object({
    title: z.string(),
    owner: z.string(),
    hps: z.number(),
    type: z.string(),
    deadlineAt: z.coerce.date(),
})

const addProject = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const data = await dataSchema.parse(req.body)
        const projectList = await prisma.project.create({
            data,
        })
        res.status(200).json({
            error: false,
            data: projectList,
        })
    } catch (err) {
        if (err instanceof z.ZodError) {
            res.status(400).json({
                error: true,
                message: 'Validation Error',
                detail: err.issues,
            })
        }
        if (err instanceof Error) {
            res.status(500).json({
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
    try {
        switch (req.method) {
            case 'GET':
                await getProjectList(req, res)
                break
            case 'POST':
                await addProject(req, res)
                break
        }
    } catch (err) {}
}
