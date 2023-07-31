import { type NextApiRequest, type NextApiResponse } from 'next'
import { z } from 'zod'
import { prisma } from '~/server/db'
import '~/utils/bigint'

const deleteProjectByID = async (req: NextApiRequest, res: NextApiResponse) => {
    const dataSchema = z.object({
        id: z.string().nonempty(),
    })
    try {
        const { id: projectID } = await dataSchema.parse(req.query)
        const result = await prisma.project.update({
            where: {
                id: projectID,
            },
            data: {
                isHidden: true,
            },
        })
        res.status(200).json({
            error: false,
            data: result,
            detail: 'Data Successfully deleted',
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
    res.json({})
}
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    try {
        switch (req.method) {
            case 'DELETE':
                await deleteProjectByID(req, res)
                break
        }
    } catch (err) {}
}
