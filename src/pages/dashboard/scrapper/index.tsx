import { type NextPage, type GetServerSideProps } from 'next'
import { useEffect, useMemo, useState } from 'react'
import { type LPSEProject, type ScrapperPageProps } from 'types'
import DashboardLayout from '~/layouts/Dashboard'
import { MRT_ColumnDef, MaterialReactTable } from 'material-react-table'
import axios, { AxiosResponse } from 'axios'
import { Project, ProjectPayload } from '@prisma/client'
import dayjs from 'dayjs'
import { LoadingButton } from '@mui/lab'
import { Refresh } from '@mui/icons-material'

type ProjectItemView = {
  owner: string
  title: string
  type: string
  hps: string
  deadlineAt: string
}

const Scrapper: NextPage<ScrapperPageProps> = ({ host }) => {
  const [projectList, setProjectList] = useState<ProjectItemView[]>([])
  const [isLoading, setLoading] = useState(true)
  const [isFetchLPSELoading, setFetchLPSELoading] = useState(false)

  const fetchLPSEProject = () => {
    setFetchLPSELoading(true)
    fetch(`${host}/api/data/`)
      .then((res) => res.json())
      .then((value) => {
        const data: LPSEProject[] = value?.result
        axios
          .post(`${host}/api/project`, data)
          .then((res) => {})
          .catch((err) => console.error(err))
      })
      .catch((err) => console.error(err))
      .finally(() => setFetchLPSELoading(false))
  }

  const columns = useMemo<MRT_ColumnDef<ProjectItemView>[]>(
    () => [
      {
        accessorKey: 'owner',
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
        accessorKey: 'deadlineAt',
        header: 'Akhir Pendaftaran',
      },
    ],
    []
  )

  useEffect(() => {
    setLoading(true)
    axios
      .get(`${host}/api/project`)
      .then((res: AxiosResponse) => {
        if (!res.data.error) {
          const data: Project[] = res.data.data
          const list = data.map<ProjectItemView>(
            ({ owner, title, type, hps, deadlineAt }) => ({
              owner,
              title,
              type,
              hps: `Rp ${hps.toLocaleString('id-ID')}`,
              deadlineAt: dayjs(deadlineAt).format('DD MMMM YYYY'),
            })
          )
          console.log(list)
          setProjectList(list)
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  return (
    <DashboardLayout>
      <div>
        <LoadingButton
          loading={isFetchLPSELoading}
          variant="outlined"
          onClick={fetchLPSEProject}
          loadingPosition="start"
          startIcon={<Refresh />}>
          Fetch LPSE Project
        </LoadingButton>
      </div>
      <div className="relative overflow-x-auto overflow-y-auto">
        <MaterialReactTable
          columns={columns}
          data={projectList}
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
      scrapeData: [],
    },
  }
}

export default Scrapper
