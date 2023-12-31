import { Prisma } from '@prisma/client'
import dayjs from 'dayjs'
import id from 'dayjs/locale/id'
import { type NextApiRequest, type NextApiResponse } from 'next'
import { z } from 'zod'
import { prisma } from '~/server/db'
import '~/utils/bigint'

dayjs.locale(id)
const getProjectList = async (req: NextApiRequest, res: NextApiResponse) => {
    let filterBuilder: Prisma.ProjectFindManyArgs = {
        take: 10,
        orderBy: {
            createdAt: 'desc',
        },
        where: {
            deadlineAt: {
                gte: dayjs(Date.now()).startOf('day').toISOString(),
            },
            isHidden: false,
        },
    }
    if (req.query?.limit) {
        filterBuilder.take = Number(req.query?.limit) || 10
    }
    if (req.query?.offset) {
        filterBuilder.skip = Number(req.query?.offset) || 0
    }
    if (req.query?.orderBy) {
        console.log(req.query?.orderBy)
        const orderBy: string = String(req.query?.orderBy) || 'createdAt'
        let sort = 'asc'
        if (req.query?.sort == 'desc') {
            sort = 'desc'
        }
        filterBuilder.orderBy = {
            [orderBy]: sort,
        }
    }
    if (req.query?.search) {
        filterBuilder.where!.title = {
            contains: String(req.query?.search),
            mode: 'insensitive',
        }
    }

    if (req.query.ignoreDeadline == 'true') {
        delete filterBuilder.where?.deadlineAt
    }

    try {
        // const count = await prisma.project.count()
        const projectList = await prisma.project.findMany(filterBuilder)
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
