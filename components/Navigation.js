import Link from 'next/link'
import { useRouter } from 'next/router'

import { useEffect, useState } from 'react'

const Navigation = function ({ total }) {
  const router = useRouter()
  let { id } = router.query
  id = parseInt(id)

  const [prevUrl, setPrevUrl] = useState("/" + total)
  const [nextUrl, setNextUrl] = useState("/2")

  useEffect(() => {
    let n = `/${id + 1}`
    if (id >= total) {
      n = `/1`
    }

    let p = `/${id - 1}`
    if (id <= 1) {
      p = `/${total}`
    }

    setPrevUrl(p)
    setNextUrl(n)
  }, [id, total])
  
  return (
    <nav>
      <Link href={prevUrl}>
        <a>&#8592;</a>
      </Link>
      <span>{id}/{total}</span>
      <Link href={nextUrl}>
        <a>&#8594;</a>
      </Link>
    </nav>
  )
}

export default Navigation;