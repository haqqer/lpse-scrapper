import { useEffect, useState } from 'react'
import { type LPSEProject } from 'types'
import DashboardLayout from '~/layouts/Dashboard'

const Dashboard = () => {
    const [scrapeData, setScrapeData] = useState<LPSEProject[]>()

    useEffect(() => {
        // fetch('http://localhost:3000/api/data/')
        //     .then((res) => res.json())
        //     .then((value) => {
        //         const data: ScrapeResult[] = value?.result
        //         setScrapeData(data)
        //         console.log(data)
        //     })
        //     .catch((err) => console.error(err))
    }, [])
    return (
        <DashboardLayout>
            <div className="relative overflow-x-auto">Dashboard</div>
        </DashboardLayout>
    )
}

export default Dashboard
