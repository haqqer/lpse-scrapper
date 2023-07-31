import { type Project } from '@prisma/client'
import axios, { type AxiosResponse } from 'axios'
import dayjs from 'dayjs'
import 'dayjs/locale/id'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import { type NextPage, type GetServerSideProps } from 'next'
import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { type LPSEProject, type ScrapperPageProps } from 'types'
import { LoadingSpinner } from '~/components/Loading'
import DashboardLayout from '~/layouts/Dashboard'

dayjs.extend(utc)
dayjs.extend(timezone)

dayjs.tz.setDefault('Asia/Jakarta')

type ProjectItemView = {
  id: string
  owner: string
  ownerUrl: string
  title: string
  url: string
  type: string
  hps: number
  deadlineAt: string
  createdAt: string
}

const Scrapper: NextPage<ScrapperPageProps> = ({ host }) => {
  const [projectList, setProjectList] = useState<ProjectItemView[]>([])
  const [updatedIndexes, setUpdatedIndexes] = useState<string[]>([])
  const [isLoading, setLoading] = useState(true)
  const [isFetchLPSELoading, setFetchLPSELoading] = useState(false)
  const [isHitScrapper, setHitScrapper] = useState(false)
  const [refresh, setRefresh] = useState(false)

  const [isAscend, setIsAscend] = useState(true)
  const [orderBy, setOrderBy] = useState('')
  const [search, setSearch] = useState('')
  const [limit, setLimit] = useState(25)
  const [offset, setOffset] = useState(0)

  const columns = [
    {
      key: 'owner',
      header: 'Kementrian',
    },
    {
      key: 'title',
      header: 'Judul',
    },
    {
      key: 'type',
      header: 'Jenis',
    },
    {
      key: 'hps',
      header: 'HPS',
    },
    {
      key: 'deadlineAt',
      header: 'Akhir Pendaftaran',
    },
    {
      key: 'url',
      header: 'URL',
    },
    {
      key: 'ownerUrl',
      header: 'Owner URL',
    },
    {
      key: 'createdAt',
      header: 'Tanggal Masuk',
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

  const navPage = (forward: boolean) => {
    if (forward) {
      setOffset(offset + limit)
    }
    if (!forward && offset > 0) {
      setOffset(offset - limit)
    }
  }

  const deleteLPSEProject = (id: string) => {
    setHitScrapper(true)
    fetch(`${host}/api/project/${id}`, {
      method: 'DELETE',
    })
      .then((res) => res.json())
      .then((value) => {
        const project = value.data as ProjectItemView
        toast.success(`Successfully delete ${project.owner} - ${project.title}`)
      })
      .catch((err) => toast.error(err))
      .finally(() => {
        setHitScrapper(false)
        setRefresh(true)
      })
  }

  useEffect(() => {
    setLoading(true)
    if (updatedIndexes.length > 0) {
      setSearch('')
      setOrderBy('')
      setIsAscend(false)
      setLimit(25)
    }
    let sort = 'asc'
    if (!isAscend) {
      sort = 'desc'
    }
    axios
      .get(
        `${host}/api/project?limit=${limit}&offset=${offset}&orderBy=${orderBy}&sort=${sort}&search=${search}`
      )
      .then(async (res: AxiosResponse) => {
        if (!res.data.error) {
          const data: Project[] = res.data.data
          const list = data.map<ProjectItemView>(
            ({ id, owner, title, type, hps, deadlineAt, url, createdAt }) => ({
              id,
              owner,
              ownerUrl: String(
                url.match(
                  /^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/g
                )
              ),
              title,
              url,
              type,
              hps: Number(hps),
              deadlineAt: dayjs.tz(deadlineAt).format('DD MMMM YYYY hh:mm'),
              createdAt: dayjs.tz(createdAt).format('DD MMMM YYYY hh:mm'),
            })
          )
          setProjectList(list)
        }
      })
      .catch((err) => toast.error(err))
      .finally(() => {
        setLoading(false)
        setRefresh(false)
      })
  }, [updatedIndexes, search, orderBy, isAscend, limit, offset, refresh])

  return (
    <DashboardLayout>
      <div className="my-2 grid grid-cols-2 gap-4">
        <div className="flex gap-2">
          <div>
            <button
              onClick={fetchLPSEProject}
              className="rounded-lg bg-orange-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-orange-800 focus:outline-none focus:ring-4 focus:ring-orange-300 dark:bg-orange-600 dark:hover:bg-orange-700 dark:focus:ring-orange-800">
              Fetch LPSE Project
            </button>
          </div>
          <div>
            <button
              onClick={hitScrapper}
              className="rounded-lg bg-green-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-300 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800">
              Hit Scrapper
            </button>
          </div>
        </div>
        <div className="flex justify-end gap-2"></div>
      </div>
      <div className="my-2 grid grid-cols-2 gap-4">
        <div className="flex gap-2">
          <select
            onChange={(e) => setLimit(Number(e.target.value))}
            className="block rounded-lg border border-gray-300 bg-gray-50 p-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500">
            <option value={25} defaultChecked>
              25
            </option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={150}>150</option>
          </select>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => navPage(false)}
              className="flex items-center justify-between gap-2 rounded-lg border border-gray-300 bg-gray-50 p-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500">
              <svg
                className="h-[16px] w-[16px] text-gray-800 dark:text-white"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 8 14">
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 1 1.3 6.326a.91.91 0 0 0 0 1.348L7 13"
                />
              </svg>
              <span>Prev</span>
            </button>
            <button
              onClick={() => navPage(true)}
              className="flex items-center justify-between gap-2 rounded-lg border border-gray-300 bg-gray-50 p-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500">
              <span>Next</span>
              <svg
                className="h-[16px] w-[16px] text-gray-800 dark:text-white"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 8 14">
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="m1 13 5.7-5.326a.909.909 0 0 0 0-1.348L1 1"
                />
              </svg>
            </button>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <input
            onChange={(e) => {
              setTimeout(() => {
                setSearch(e.target.value)
              }, 1000)
            }}
            type="text"
            className="block rounded-lg border border-gray-300 bg-gray-50 p-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
          />
          <button
            onClick={() => setSearch('')}
            className="rounded-lg bg-blue-700 px-3 py-2 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
            Clear
          </button>
        </div>
      </div>
      <div className="relative my-4 overflow-x-auto overflow-y-auto">
        <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
          <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              {columns.map((value, idx) => (
                <th key={idx} scope="col" className="px-6 py-3">
                  <a
                    href="#"
                    onClick={() => {
                      setOrderBy(value.key)
                      setIsAscend(!isAscend)
                    }}>
                    {value.header}
                  </a>
                </th>
              ))}
              <th className="px-6 py-3">Delete</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={8}>
                  <div className="flex items-center justify-center py-8">
                    <LoadingSpinner size={50} />
                  </div>
                </td>
              </tr>
            )}
            {projectList.length > 0 &&
              projectList.map((value, idx) => (
                <tr
                  key={idx}
                  className="border-b bg-white dark:border-gray-700 dark:bg-gray-800">
                  <td className="px-6 py-4">
                    <a
                      href={value.ownerUrl}
                      target="_blank"
                      className="hover:underline">
                      {value.owner}
                    </a>
                  </td>
                  <td className="px-6 py-4">
                    <a
                      href={value.url}
                      target="_blank"
                      className="hover:underline">
                      {value.title}
                    </a>
                  </td>
                  <td className="px-6 py-4">{value.type}</td>
                  <td className="px-6 py-4">{`Rp ${value.hps.toLocaleString(
                    'id-ID'
                  )}`}</td>
                  <td className="px-6 py-4">{value.deadlineAt}</td>
                  <td className="px-6 py-4">
                    <a
                      href={value.url}
                      target="_blank"
                      className="hover:underline">
                      {value.url}
                    </a>
                  </td>
                  <td className="px-6 py-4">{value.ownerUrl}</td>
                  <td className="px-6 py-4">{value.createdAt}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => deleteLPSEProject(value.id)}
                      className="w-full rounded-lg bg-red-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-red-800 focus:outline-none focus:ring-4 focus:ring-red-300 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800">
                      Delete
                    </button>
                  </td>
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
