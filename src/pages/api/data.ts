import axios, { type AxiosResponse } from 'axios'
import * as cheerio from 'cheerio'
import dayjs from 'dayjs'
import http from 'http'
import https from 'https'
import { type NextApiRequest, type NextApiResponse } from 'next'
import { type LPSEProject } from 'types'
import { prisma } from '~/server/db'
import { Redis } from "@upstash/redis"


// const httpsAgent = new https.Agent({
//     rejectUnauthorized: false,
// })

// const httpAgent = new http.Agent({})

const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL || '',
    token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
  })

const getData = async (req: NextApiRequest, res: NextApiResponse) => {
    // const urls = await prisma.sources.findMany()
    // const result: LPSEProject[] = []
    const promises: Promise<AxiosResponse>[] = []
    let index = 0
    const status: number = await redis.get('status') || 0
    if (status == 1)  {
        res.json({ status: status })
        return
    }
    const result: LPSEProject[] = await redis.get('lpse') || []
    // for (const value of urls) {
    //     const res = axios.get(value.url, {
    //         httpsAgent: httpsAgent,
    //         httpAgent: httpAgent,
    //     })
    //     promises.push(res)
    // }
    // const results = await Promise.allSettled(promises)
    // results
    //     .map((result, index) => ({
    //         result,
    //         source: urls[index],
    //     }))
    //     .filter((obj) => obj.result.status == 'fulfilled')
    //     .map((obj) => {
    //         try {
    //             const { value } =
    //                 obj.result as PromiseFulfilledResult<AxiosResponse>
    //             const $ = cheerio.load(value.data)

    //             const dataLainnya = $('.Jasa_Lainnya')
    //             const dataNonKonstruksi = $(
    //                 '.Jasa_Konsultansi_Badan_Usaha_Non_Konstruksi'
    //             )

    //             dataLainnya.each((idx, el) => {
    //                 index = index + 1
    //                 const title = $(el).children('td').find('a').text()
    //                 const domain = new URL(obj.source!.url ?? '').hostname
    //                 const url = `https://${domain}${$(el)
    //                     .children('td')
    //                     .find('a')
    //                     .attr('href')}`
    //                 const hps = $(el).find('td.table-hps').text()
    //                 const lastDate = $(el).find('td.center').text()
    //                 const data: LPSEProject = {
    //                     owner: obj.source!.from || '',
    //                     type: 'Jasa Lainnya',
    //                     hps: Number(hps.split(',')[0]!.replace(/[^0-9]+/g, '')),
    //                     deadlineAt: dayjs(lastDate).toISOString(),
    //                     title: title,
    //                     url,
    //                 }
    //                 result.push(data)
    //             })
    //             dataNonKonstruksi.each((idx, el) => {
    //                 index = index + 1
    //                 const title = $(el).children('td').find('a').text()
    //                 const domain = new URL(obj.source!.url ?? '').hostname
    //                 const url = `https://${domain}${$(el)
    //                     .children('td')
    //                     .find('a')
    //                     .attr('href')}`
    //                 const hps = $(el).find('td.table-hps').text()
    //                 const lastDate = $(el).find('td.center').text()
    //                 const data: LPSEProject = {
    //                     owner: obj.source!.from || '',
    //                     type: 'Jasa Konsultasi Badan Usaha non Konstruksi',
    //                     hps: Number(hps.split(',')[0]!.replace(/[^0-9]+/g, '')),
    //                     deadlineAt: dayjs(lastDate).toISOString(),
    //                     title: title,
    //                     url,
    //                 }
    //                 result.push(data)
    //             })
    //         } catch (err) {
    //             console.log(err)
    //         }
    //     })

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
