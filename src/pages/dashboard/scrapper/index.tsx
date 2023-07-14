import { Refresh } from '@mui/icons-material'
import { LoadingButton } from '@mui/lab'
import { type Project } from '@prisma/client'
import axios, { type AxiosResponse } from 'axios'
import dayjs from 'dayjs'
import { type NextPage, type GetServerSideProps } from 'next'
import { useEffect, useState } from 'react'
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
  const [isHitScrapper, setHitScrapper] = useState(false)

  const [isAscend, setIsAscend] = useState(true)
  const [orderBy, setOrderBy] = useState("")
  const [search, setSearch] = useState("")

  const columns = [
    {
      key: "owner",
      header: "Kementrian"
    },
    {
      key: "title",
      header: "Judul"
    },
    {
      key: "type",
      header: "Jenis"
    },
    {
      key: "hps",
      header: "HPS"
    },
    {
      key: "deadlineAt",
      header: "Akhir Pendaftaran"
    },
    {
      key: "url",
      header: "URL"
    },
    {
      key: "ownerUrl",
      header: "Owner URL"
    },
  ]

  const fetchLPSEProject = () => {
    setFetchLPSELoading(true)
    fetch(`${host}/api/data/`)
      .then((res) => res.json())
      .then((value) => {
        if (value?.status) {
          toast.success(`Still scrapping ...`)
        } else {
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
        }
      })
      .catch((err) => toast.error(err))
      .finally(() => setFetchLPSELoading(false))
  }
  const hitScrapper = () => {
    setHitScrapper(true)
    fetch(`${host}/api/scrapper/`)
      .then((res) => res.json())
      .then((value) => {
        toast.success(value?.status)
      })
      .catch((err) => toast.error(err))
      .finally(() => setHitScrapper(false))
  }

  useEffect(() => {
    setLoading(true)
    let sort = "asc"
    if (!isAscend) {
      sort = "desc"
    }
    axios
      .get(`${host}/api/project?orderBy=${orderBy}&sort=${sort}&search=${search}`)
      .then(async (res: AxiosResponse) => {
        if (!res.data.error) {
          const data: Project[] = res.data.data
          const list = data.map<ProjectItemView>(
            ({ owner, title, type, hps, deadlineAt, url }) => ({
              owner,
              ownerUrl: String(url.match(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/g)),
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
  }, [
    updatedIndexes,
    search,
    orderBy,
    isAscend
  ])

  return (
    <DashboardLayout>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex gap-2">
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
          <div>
            <LoadingButton
              loading={isHitScrapper}
              variant="outlined"
              onClick={hitScrapper}
              loadingPosition="start"
              startIcon={<Refresh />}>
              Hit Trigger
            </LoadingButton>
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <input onChange={(e) => {
            setTimeout(() => {
              setSearch(e.target.value)
            }, 1000)
          }} type="text" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"/>
          <button 
            onClick={() => setSearch("")}
            className="rounded-lg bg-blue-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >Clear</button>
        </div>
      </div>
      <div className="my-4 relative overflow-x-auto overflow-y-auto">
        <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
          <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              {columns.map((value, idx) => (
                <th key={idx} scope="col" className="px-6 py-3">
                  <a href="#" onClick={() => {
                      setOrderBy(value.key)
                      setIsAscend(!isAscend)
                    }}>
                    {value.header}
                  </a>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {projectList != undefined &&
              projectList.map((value, idx) => (
                <tr
                  key={idx}
                  className="border-b bg-white dark:border-gray-700 dark:bg-gray-800">
                  <td className="px-6 py-4">
                    <a href={value.ownerUrl} target='_blank'>
                      {value.owner}
                    </a>
                  </td>
                  <td className="px-6 py-4">
                  <a href={value.url} target='_blank'>
                      {value.title}
                    </a>
                  </td>
                  <td className="px-6 py-4">{value.type}</td>
                  <td className="px-6 py-4">{`Rp ${value.hps.toLocaleString('id-ID')}`}</td>
                  <td className="px-6 py-4">{value.deadlineAt}</td>
                  <td className="px-6 py-4">
                    <a href={value.url} target='_blank'>
                      {value.url}
                    </a>
                  </td>
                  <td className="px-6 py-4">{value.ownerUrl}</td>
                </tr>
              ))}
          </tbody>
        </table>        
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
