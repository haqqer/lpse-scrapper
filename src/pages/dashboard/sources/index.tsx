import { Sources } from '@prisma/client'
import { type GetServerSideProps, type NextPage } from 'next'
import { useEffect, useState } from 'react'
import { type ListPageProps } from 'types'
import DashboardLayout from '~/layouts/Dashboard'
import * as XLSX from 'xlsx'
import { useRouter } from 'next/router'
import { toast } from 'react-hot-toast'

const Sources: NextPage<ListPageProps> = ({ host, sources }) => {
  const router = useRouter()
  // const [sources, setSources] = useState<Sources[]>()
  const [uploadSources, setUploadSources] = useState<Sources[]>()
  const [showModal, setShowModal] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [buttonName, setButtonName] = useState('Tambah')

  const [from, setFrom] = useState<string>('')
  const [url, setUrl] = useState<string>('')

  const [selectedFile, setSelectedFile] = useState<File>()

  const sendData = async (data: Sources[]): Promise<any> => {
    try {
      const result = await fetch(`${host}/api/sources`, {
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: data,
        }),
        method: 'POST',
      })
      const parsed = await result.json()
      return parsed
    } catch (error) {
      return error
    }
  }

  useEffect(() => {
    // fetch(`${host}/api/sources`)
    //     .then((res) => res.json())
    //     .then((value) => {
    //         const data: Sources[] = value?.result
    //         setSources(data)
    //         console.log(data)
    //     })
    //     .catch((err) => console.error(err))
  }, [])
  return (
    <DashboardLayout>
      <div className="relative overflow-x-auto overflow-y-auto">
        <div className="flex justify-end pb-3">
          <div className="p-4">
            <button
              onClick={() => {
                setButtonName('Upload')
                setShowUploadModal(true)
              }}
              className="block rounded-lg bg-green-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-300 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
              type="button">
              Upload
            </button>
          </div>
          <div className="p-4">
            <button
              onClick={() => {
                setButtonName('Tambah')
                setShowModal(true)
              }}
              className="block rounded-lg bg-blue-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              type="button">
              Tambah
            </button>
          </div>
        </div>
        {/* Modal Create Form*/}
        {showModal && (
          <div>
            <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden outline-none focus:outline-none">
              <div className="relative max-h-full w-full max-w-md">
                {/* Modal content */}
                <div className="relative rounded-lg bg-white shadow dark:bg-gray-700">
                  <button
                    onClick={() => setShowModal(false)}
                    type="button"
                    className="absolute right-2.5 top-3 ml-auto inline-flex items-center rounded-lg bg-transparent p-1.5 text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-white"
                    data-modal-hide="authentication-modal">
                    <svg
                      aria-hidden="true"
                      className="h-5 w-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg">
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="sr-only">Close modal</span>
                  </button>
                  <div className="px-6 py-6 lg:px-8">
                    <h3 className="mb-4 text-xl font-medium text-gray-900 dark:text-white">
                      Tambah Sumber LPSE
                    </h3>
                    <div className="space-y-6">
                      <div>
                        <label
                          htmlFor="from"
                          className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                          Instansi
                        </label>
                        <input
                          value={from}
                          onChange={(e) => setFrom(e.target.value)}
                          type="text"
                          name="from"
                          id="from"
                          className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-500 dark:bg-gray-600 dark:text-white dark:placeholder-gray-400"
                          placeholder="Instansi / Kementrian / Pemda"
                          required
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="url"
                          className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                          URL
                        </label>
                        <input
                          value={url}
                          onChange={(e) => setUrl(e.target.value)}
                          type="url"
                          name="url"
                          id="url"
                          className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-500 dark:bg-gray-600 dark:text-white dark:placeholder-gray-400"
                          placeholder="URL"
                          required
                        />
                      </div>
                      {buttonName == 'Tambah' && (
                        <button
                          onClick={async () => {
                            const data: Sources[] = [
                              {
                                id: '',
                                from: from,
                                url: url,
                                createdAt: new Date(),
                                updatedAt: new Date(),
                              },
                            ]
                            const result = await sendData(data)
                            if (result.success) {
                              setShowModal(false)
                              toast.success('Success to add data!')
                            }
                            if (!result.success) {
                              setShowModal(false)
                              console.log(result.error)
                              toast.error('Error add data')
                            }
                            router.replace(router.asPath)
                          }}
                          className="w-full rounded-lg bg-blue-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                          {buttonName}
                        </button>
                      )}
                      {buttonName == 'Edit' && (
                        <button
                          onClick={async () => {
                            const data: Sources[] = [
                              {
                                id: '',
                                from: from,
                                url: url,
                                createdAt: new Date(),
                                updatedAt: new Date(),
                              },
                            ]
                            const result = await sendData(data)
                            if (result) {
                              setShowModal(false)
                              toast.success('Success edit data')
                            }
                            router.replace(router.asPath)
                          }}
                          className="w-full rounded-lg bg-blue-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                          {buttonName}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="fixed inset-0 z-40 bg-black opacity-25"></div>
          </div>
        )}
        {/* Modal Upload Form*/}
        {showUploadModal && (
          <div>
            <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden outline-none focus:outline-none">
              <div className="relative max-h-full w-full max-w-md">
                {/* Modal content */}
                <div className="relative rounded-lg bg-white shadow dark:bg-gray-700">
                  <button
                    onClick={() => setShowUploadModal(false)}
                    type="button"
                    className="absolute right-2.5 top-3 ml-auto inline-flex items-center rounded-lg bg-transparent p-1.5 text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-white"
                    data-modal-hide="authentication-modal">
                    <svg
                      aria-hidden="true"
                      className="h-5 w-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg">
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="sr-only">Close modal</span>
                  </button>
                  <div className="px-6 py-6 lg:px-8">
                    <h3 className="mb-4 text-xl font-medium text-gray-900 dark:text-white">
                      Upload Excel
                    </h3>
                    <div className="space-y-6">
                      <div>
                        <label
                          htmlFor="file"
                          className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                          Berkas Dokumen
                        </label>
                        <input
                          onChange={async ({ target }) => {
                            if (target.files) {
                              const file = target.files[0]
                              setSelectedFile(file)
                              const data = await file?.arrayBuffer()
                              /* data is an ArrayBuffer */
                              const wb = XLSX.read(data)
                              const sheetName = wb.SheetNames[0] || 'Sheet1'
                              const sheets = wb.Sheets[sheetName] || wb.Sheets
                              const parsed: Sources[] =
                                XLSX.utils.sheet_to_json(sheets, {
                                  header: ['from', 'url'],
                                })
                              parsed.shift()
                              setUploadSources(parsed)
                            }
                          }}
                          type="file"
                          name="file"
                          id="file"
                          className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-500 dark:bg-gray-600 dark:text-white dark:placeholder-gray-400"
                          placeholder="Atribut"
                          required
                        />
                      </div>
                      <div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
                            <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
                              <tr>
                                <th scope="col" className="px-6 py-3">
                                  Instansi
                                </th>
                                <th scope="col" className="px-6 py-3">
                                  URL
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {uploadSources != undefined &&
                                uploadSources.map((value, idx) => (
                                  <tr
                                    key={idx}
                                    className="border-b bg-white dark:border-gray-700 dark:bg-gray-800">
                                    <td className="px-6 py-4">{value.from}</td>
                                    <td className="px-6 py-4">{value.url}</td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                      {buttonName == 'Upload' && (
                        <button
                          onClick={async () => {
                            const result = await sendData(uploadSources || [])
                            if (result.success) {
                              setShowUploadModal(false)
                              setFrom('')
                              setUrl('')
                              toast.success('Success to add data!')
                            }
                            if (!result.success) {
                              setShowUploadModal(false)
                              console.log(result.error)
                              toast.error('Error add data')
                            }
                            router.replace(router.asPath)
                          }}
                          className="w-full rounded-lg bg-blue-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                          {buttonName}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="fixed inset-0 z-40 bg-black opacity-25"></div>
          </div>
        )}
        <table className="w-full text-left text-sm text-slate-300 ">
          <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">
                Instansi
              </th>
              <th scope="col" className="px-6 py-3">
                URL
              </th>
              <th scope="col" className="px-6 py-3">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {sources == undefined && (
              <tr>
                <td colSpan={5} className="text-white">
                  Loading ....
                </td>
              </tr>
            )}
            {sources != undefined &&
              sources.map((value) => (
                <tr
                  key={value.id}
                  className="border-b bg-white dark:border-gray-700 dark:bg-gray-800">
                  <td className="px-6 py-4">{value.from}</td>
                  <td className="px-6 py-4">{value.url}</td>
                  <td className="flex px-6 py-4">
                    <div className="flex p-2">
                      <button
                        onClick={() => {}}
                        className="w-full rounded-lg bg-blue-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-blue-800">
                        Edit
                      </button>
                    </div>
                    <div className="flex p-2">
                      <button
                        onClick={() => {}}
                        className="w-full rounded-lg bg-orange-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-orange-800 focus:outline-none focus:ring-4 focus:ring-orange-300 dark:bg-orange-600 dark:hover:bg-orange-700 dark:focus:ring-orange-800">
                        Hapus
                      </button>
                    </div>
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
  ListPageProps
> = async () => {
  const host = process.env.NEXTAUTH_URL
  // let result: Sources[] = []

  const res = await fetch(`${host}/api/sources`)
  const data = await res.json()
  const result: Sources[] = data.result
  return {
    props: {
      host: host || '',
      sources: result,
    },
  }
}

export default Sources
