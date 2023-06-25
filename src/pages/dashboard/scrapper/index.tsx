import { val } from 'cheerio/lib/api/attributes'
import { useEffect, useState } from 'react'
import { ScrapeResult } from 'types'
import DashboardLayout from '~/layouts/Dashboard'

const Scrapper = () => {
    const [scrapeData, setScrapeData] = useState<ScrapeResult[]>()

    useEffect(() => {
        fetch('http://localhost:3000/api/data/')
            .then((res) => res.json())
            .then((value) => {
                const data: ScrapeResult[] = value?.result
                setScrapeData(data)
                console.log(data)
            })
            .catch((err) => console.error(err))
    }, [])
    return (
        <DashboardLayout>
            <div className="relative overflow-x-auto overflow-y-auto">
                <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
                    <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">
                                Kementrian
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Judul
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Jenis
                            </th>
                            <th scope="col" className="px-6 py-3">
                                HPS
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Akhir Pendaftaran
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {scrapeData == undefined && (
                            <tr>
                                <td
                                    colSpan={5}
                                    className="text-center text-lg text-white"
                                >
                                    Loading ....
                                </td>
                            </tr>
                        )}
                        {scrapeData != undefined &&
                            scrapeData.map((value) => (
                                <tr
                                    key={value.no}
                                    className="border-b bg-white dark:border-gray-700 dark:bg-gray-800"
                                >
                                    <td className="px-6 py-4">{value.from}</td>
                                    <td className="px-6 py-4">{value.title}</td>
                                    <td className="px-6 py-4">{value.type}</td>
                                    <td className="px-6 py-4">{value.hps}</td>
                                    <td className="px-6 py-4">
                                        {value.lasDate}
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>
        </DashboardLayout>
    )
}

export default Scrapper
