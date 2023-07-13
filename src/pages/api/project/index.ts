import { PrismaPromise } from '@prisma/client'
import axios, { type AxiosResponse } from 'axios'
import * as cheerio from 'cheerio'
import dayjs from 'dayjs'
import http from 'http'
import https from 'https'
import { type NextApiRequest, type NextApiResponse } from 'next'
import { z } from 'zod'
import { prisma } from '~/server/db'
import '~/utils/bigint'

const httpsAgent = new https.Agent({
    rejectUnauthorized: false,
})

const httpAgent = new http.Agent({})

const getProjectList = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const projectList = await prisma.project.findMany({
            take: Number(process.env.DEFAULT_LIMIT_PRISMA) || 100,
            orderBy: [
                {
                    deadlineAt: 'asc',
                },
            ],
            where: {
                deadlineAt: {
                    gte: dayjs(Date.now()).startOf('day').toISOString(),
                },
            },
        })
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

const addBulkLPSEProject = async (
    req: NextApiRequest,
    res: NextApiResponse
) => {
    const dataSchema = z.array(
        z.object({
            title: z.string(),
            url: z.string(),
            owner: z.string(),
            hps: z.number(),
            type: z.string(),
            deadlineAt: z.coerce.date(),
        })
    )

    try {
        const lpseProjectList = await dataSchema.parse(req.body)
        const projectList = await prisma.project.findMany({
            where: {
                url: {
                    in: lpseProjectList.map((project) => project.url),
                },
            },
        })
        const existProjectIds = projectList.map((project) => project.url)
        const notExistProjectList = lpseProjectList.filter(
            (project) => !existProjectIds.includes(project.url)
        )

        const response = await prisma.project.createMany({
            data: notExistProjectList,
        })
        res.status(200).json({
            error: false,
            data: notExistProjectList,
            message: 'Data Successfully Added',
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
                await addBulkLPSEProject(req, res)
                break
        }
    } catch (err) {}
}
