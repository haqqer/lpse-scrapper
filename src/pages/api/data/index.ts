import axios, { type AxiosResponse } from 'axios'
import * as cheerio from 'cheerio'
import { type NextApiRequest, type NextApiResponse } from 'next'
import { type ScrapeResult } from 'types'
import { prisma } from '~/server/db'
import https from 'https'
import http from 'http'


const httpsAgent = new https.Agent({
    rejectUnauthorized: false
});

const httpAgent = new http.Agent({
    
});

const getData = async (req: NextApiRequest, res: NextApiResponse) => {
    const urls = await prisma.sources.findMany()
    const result: ScrapeResult[] = []
    const promises: Promise<AxiosResponse>[] = [];
    let index = 0
    for (const value of urls) {
        console.log(value.url)
        const res = axios.get(value.url, { httpsAgent: httpsAgent, httpAgent: httpAgent })
        promises.push(res)
    }
    const results = await Promise.all(promises)
    results.map((res, resIndex) => {
        const $ = cheerio.load(res.data)

        const dataLainnya = $('.Jasa_Lainnya')
        const dataNonKonstruksi = $(
            '.Jasa_Konsultansi_Badan_Usaha_Non_Konstruksi'
        )

        dataLainnya.each((idx, el) => {
            index = index + 1
            const title = $(el).children('td').find('a').text()
            const hps = $(el).find('td.table-hps').text()
            const lastDate = $(el).find('td.center').text()
            const data: ScrapeResult = {
                no: index,
                from: urls[resIndex]?.from || "",
                type: 'Jasa Lainnya',
                hps: hps,
                lasDate: lastDate,
                title: title,
            }
            result.push(data)
        })
        dataNonKonstruksi.each((idx, el) => {
            index = index + 1
            const title = $(el).children('td').find('a').text()
            const hps = $(el).find('td.table-hps').text()
            const lastDate = $(el).find('td.center').text()
            const data: ScrapeResult = {
                no: index,
                from: urls[resIndex]?.from || "",
                type: 'Jasa Konsultasi Badan Usaha non Konstruksi',
                hps: hps,
                lasDate: lastDate,
                title: title,
            }
            result.push(data)
        })

        console.log('')
    })
    
    // for (const value of urls) {
    //     console.log(value.url)
    //     const data = await axios.get(value.url)
    //     const $ = cheerio.load(data.data)

    //     const dataLainnya = $('.Jasa_Lainnya')
    //     const dataNonKonstruksi = $(
    //         '.Jasa_Konsultansi_Badan_Usaha_Non_Konstruksi'
    //     )

    //     dataLainnya.each((idx, el) => {
    //         index = index + 1
    //         const title = $(el).children('td').find('a').text()
    //         const hps = $(el).find('td.table-hps').text()
    //         const lastDate = $(el).find('td.center').text()
    //         const data: ScrapeResult = {
    //             no: index,
    //             from: value.from,
    //             type: 'Jasa Lainnya',
    //             hps: hps,
    //             lasDate: lastDate,
    //             title: title,
    //         }
    //         result.push(data)
    //     })
    //     dataNonKonstruksi.each((idx, el) => {
    //         index = index + 1
    //         const title = $(el).children('td').find('a').text()
    //         const hps = $(el).find('td.table-hps').text()
    //         const lastDate = $(el).find('td.center').text()
    //         const data: ScrapeResult = {
    //             no: index,
    //             from: value.from,
    //             type: 'Jasa Konsultasi Badan Usaha non Konstruksi',
    //             hps: hps,
    //             lasDate: lastDate,
    //             title: title,
    //         }
    //         result.push(data)
    //     })

    //     console.log('')
    // }
    console.log(result)
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
