import { val } from 'cheerio/lib/api/attributes'
import { useEffect, useState } from 'react'
import { ScrapeResult } from 'types'
import DashboardLayout from '~/layouts/Dashboard'

const Dashboard = () => {
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
            <div className="relative overflow-x-auto">Dashboard</div>
        </DashboardLayout>
    )
}

export default Dashboard
