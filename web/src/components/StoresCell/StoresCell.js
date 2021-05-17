import { Link, routes } from '@redwoodjs/router'

import Stores from 'src/components/Stores'

export const QUERY = gql`
  query STORES {
    stores {
      id
      name
      ownerId
      email
      phone
      lat
      lng
      street1
      street2
      city
      country
      state
      zip
      distributor
      approved
      approvedOn
    }
  }
`

export const Loading = () => <div>Loading...</div>

export const Empty = () => {
  return (
    <div className="rw-text-center">
      {'No stores yet. '}
      <Link to={routes.newStore()} className="rw-link">
        {'Create one?'}
      </Link>
    </div>
  )
}

export const Success = ({ stores }) => {
  return <Stores stores={stores} />
}
