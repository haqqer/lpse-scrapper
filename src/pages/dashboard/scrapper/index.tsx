import { Refresh } from '@mui/icons-material'
import { LoadingButton } from '@mui/lab'
import { Box, Link } from '@mui/material'
import { Project, ProjectPayload, Sources } from '@prisma/client'
import axios, { AxiosResponse } from 'axios'
import dayjs from 'dayjs'
import { MRT_ColumnDef, MaterialReactTable } from 'material-react-table'
import { type NextPage, type GetServerSideProps } from 'next'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'react-hot-toast'
import { type LPSEProject, type ScrapperPageProps } from 'types'
import DashboardLayout from '~/layouts/Dashboard'

type ProjectItemView = {
  owner: string
  ownerUrl: string
  title: string
  url: string
  type: string
  hps: number
  deadlineAt: string
}

const Scrapper: NextPage<ScrapperPageProps> = ({ host }) => {
  const [projectList, setProjectList] = useState<ProjectItemView[]>([])
  const [updatedIndexes, setUpdatedIndexes] = useState<string[]>([])
  const [isLoading, setLoading] = useState(true)
  const [isFetchLPSELoading, setFetchLPSELoading] = useState(false)

  const columns = useMemo<MRT_ColumnDef<ProjectItemView>[]>(
    () => [
      {
        accessorKey: 'owner',
        header: 'Kementrian',
        Cell: ({ cell }) => (
          <Box>
            <Link target="_blank" href={cell.row.getValue<string>('ownerUrl')}>
              {cell.getValue<string>()}
            </Link>
          </Box>
        ),
        filterSelectOptions: [
          ...new Set(
            projectList
              .map((project) => project.owner)
              .sort((a, b) => a.localeCompare(b))
          ),
        ],
        filterVariant: 'select',
      },
      {
        accessorKey: 'title',
        header: 'Judul',
        Cell: ({ cell }) => (
          <Box>
            <Link target="_blank" href={cell.row.getValue<string>('url')}>
              {cell.getValue<string>()}
            </Link>
          </Box>
        ),
      },
      {
        accessorKey: 'type',
        header: 'Jenis',
        filterSelectOptions: [
          ...new Set(
            projectList
              .map((project) => project.type)
              .sort((a, b) => a.localeCompare(b))
          ),
        ],
        filterVariant: 'select',
      },
      {
        accessorKey: 'hps',
        header: 'HPS',
        filterVariant: 'range',
        Cell: ({ cell }) => (
          <Box>{`Rp ${cell.getValue<number>().toLocaleString('id-ID')}`}</Box>
        ),
      },
      {
        accessorKey: 'deadlineAt',
        header: 'Akhir Pendaftaran',
      },
      {
        accessorKey: 'url',
        header: 'URL',
      },
      {
        accessorKey: 'ownerUrl',
        header: 'Owner URL',
      },
    ],
    [projectList]
  )

  const fetchLPSEProject = () => {
    setFetchLPSELoading(true)
    fetch(`${host}/api/data/`)
      .then((res) => res.json())
      .then((value) => {
        const data: LPSEProject[] = value?.result
        axios
          .post(`${host}/api/project`, data)
          .then((res) => {
            const data: Project[] = res.data.data
            setUpdatedIndexes(data.map((project) => project.id))
            if (data.length > 0) {
              toast.success(`${data.length} new project`)
            } else {
              toast.success('No new project')
            }
          })
          .catch((err) => toast.error(err))
      })
      .catch((err) => toast.error(err))
      .finally(() => setFetchLPSELoading(false))
  }

  useEffect(() => {
    setLoading(true)
    axios
      .get(`${host}/api/project`)
      .then(async (res: AxiosResponse) => {
        if (!res.data.error) {
          const sourcesResponse = await axios.get(`${host}/api/sources`)
          const sources = sourcesResponse.data.result as Array<Sources>

          const data: Project[] = res.data.data
          const list = data.map<ProjectItemView>(
            ({ owner, title, type, hps, deadlineAt, url }) => ({
              owner,
              ownerUrl: sources.filter((s) => s.from === owner)[0]!.url,
              title,
              url,
              type,
              hps: Number(hps),
              deadlineAt: dayjs(deadlineAt).format('DD MMMM YYYY'),
            })
          )
          setProjectList(list)
        }
      })
      .catch((err) => toast.error(err))
      .finally(() => setLoading(false))
  }, [updatedIndexes])

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
          initialState={{
            columnVisibility: {
              url: false,
              ownerUrl: false,
            },
          }}
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
