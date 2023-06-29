import { Sources } from '@prisma/client'
import { NextApiRequest } from 'next'

export type LPSEProject = {
    title: string
    type: string
    hps: number
    owner: string
    deadlineAt: string
    url: string
}

export type ListPageProps = {
    host: string
    sources: Sources[]
}
export type ScrapperPageProps = {
    host: string
    scrapeData: ScrapeResult[]
}
