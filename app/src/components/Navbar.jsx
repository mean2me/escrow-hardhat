import { useContext } from 'react'
import { Context } from './State'
import styles from './Navbar.module.css'

export const Navbar = () => {
  const ctx = useContext(Context)

  return (
    <div className={styles.navbar}>
      <span className={styles.address}>
        <span className={styles.label}>Connected Account:</span>
        {ctx.account}
      </span>
    </div>
  )
}
