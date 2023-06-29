import { type NextPage, type GetServerSideProps } from 'next'
import { useEffect, useMemo, useState } from 'react'
import { type LPSEItem, type ScrapperPageProps } from 'types'
import DashboardLayout from '~/layouts/Dashboard'
import { MRT_ColumnDef, MaterialReactTable } from 'material-react-table';

const Scrapper: NextPage<ScrapperPageProps> = ({ host }) => {
    const [scrapeData, setScrapeData] = useState<LPSEItem[]>([])
    const [isLoading, setLoading] = useState(true)

    const columns = useMemo<MRT_ColumnDef<LPSEItem>[]>(
        () => [
            {
                accessorKey: 'from',
                header: 'Kementrian',
            },
            {
                accessorKey: 'title',
                header: 'Judul',
            },
            {
                accessorKey: 'type',
                header: 'Jenis',
            },
            {
                accessorKey: 'hps',
                header: 'HPS',
            },
            {
                accessorKey: 'lastDate',
                header: 'Akhir Pendaftaran',
            },
        ],
        [],
    );

    useEffect(() => {
        setLoading(true)
        fetch(`${host}/api/data/`)
            .then((res) => res.json())
            .then((value) => {
                const data: LPSEItem[] = value?.result
                data.map(scrape => scrape as LPSEItem)
                setScrapeData(data)
            })
            .catch((err) => console.error(err))
            .finally(() => setLoading(false))
    }, [])

    return (
        <DashboardLayout>
            <div className="relative overflow-x-auto overflow-y-auto">
                <MaterialReactTable
                    columns={columns}
                    data={scrapeData}
                    enablePagination={false}
                    enableRowVirtualization
                    state={{ isLoading }}
                />
            </div>
        </DashboardLayout>
    )
}

export const getServerSideProps: GetServerSideProps<
    ScrapperPageProps
> = async () => {
    const host = process.env.NEXTAUTH_URL
    return {
        props: {
            host: host || '',
            scrapeData: []
        },
    }
}


export default Scrapper
