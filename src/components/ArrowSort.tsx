export const ArrowSort = (props: { isAscend?: boolean }) => {
    return (
        <div>
          {props.isAscend && (
            <svg className="w-[16px] h-[16px] text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 14">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13V1m0 0L1 5m4-4 4 4" />
            </svg>
          )}
          {!props.isAscend && (
            <svg className="w-[16px] h-[16px] text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 14">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 1v12m0 0 4-4m-4 4L1 9" />
            </svg>
          )}
        </div>
    )
}
