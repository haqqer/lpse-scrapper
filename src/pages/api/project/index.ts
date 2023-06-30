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
        const fetchPromises: PrismaPromise<any>[] = []
        lpseProjectList.forEach(async (lpseProject) => {
            const promise = prisma.project.findFirst({
                where: {
                    url: {
                        equals: lpseProject.url,
                    },
                },
            })
            fetchPromises.push(promise)
        })
        const addedIndexList: number[] = []
        const results = await Promise.allSettled(fetchPromises)
        const writePromises: PrismaPromise<any>[] = []
        results
            .filter((result) => result.status == 'fulfilled')
            .map((result, resultIndex) => {
                const { value } =
                    result as PromiseFulfilledResult<AxiosResponse>

                // if data does not exist on database
                if (value === null) {
                    addedIndexList.push(resultIndex)
                    const lpseProject = lpseProjectList[resultIndex]!
                    const promise = prisma.project.create({
                        data: {
                            title: lpseProject.title,
                            url: lpseProject.url,
                            owner: lpseProject.owner,
                            hps: lpseProject.hps,
                            type: lpseProject.type,
                            deadlineAt: lpseProject.deadlineAt,
                        },
                    })
                    writePromises.push(promise)
                }
            })
        const writeResults: PromiseSettledResult<AxiosResponse>[] =
            await Promise.allSettled(writePromises)
        const writeSuccessResults = writeResults.filter(
            (res) => res.status === 'fulfilled'
        ) as PromiseFulfilledResult<AxiosResponse>[]
        res.status(200).json({
            error: false,
            data: writeSuccessResults,
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
