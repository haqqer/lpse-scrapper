import { Sources } from "@prisma/client"
import { NextApiRequest } from "next"

export type ScrapeResult = {
    no: number
    title: string
    type: string
    hps: string
    lasDate: string
    from: string
}

export type ListPageProps = {
    host: string
    sources: Sources[]
}
export type ScrapperPageProps = {
    host: string
    scrapeData: ScrapeResult[]
}