import { useAuth } from '@redwoodjs/auth'
import { navigate, Redirect } from '@redwoodjs/router'
import { useMutation } from '@redwoodjs/web'
import toast from 'react-hot-toast'
import { checkTournamentPermissions } from 'src/helpers/tournamentHelper'
import { TOURNAMENT_BY_URL } from 'src/pages/ViewTournamentPage/ViewTournamentPage'
import MatchDetails from '../MatchDetails/MatchDetails'
import TournamentNotStarted from '../TournamentNotStarted/TournamentNotStarted'

export const ADVANCE_ROUND = gql`
  mutation advanceRound($id: Int!, $roundNumber: Int!) {
    advanceRound: advanceRound(id: $id, roundNumber: $roundNumber) {
      id
      round {
        roundNumber
      }
    }
  }
`

export const END_TOURNAMENT = gql`
  mutation endTournament($id: Int!) {
    endTournament: endTournament(id: $id) {
      id
      winners {
        player {
          nickname
        }
      }
    }
  }
`

const TournamentRoundsTab = ({ tournament, roundNumber }) => {
  const { hasRole, currentUser } = useAuth()

  if ((!roundNumber || roundNumber === '') && tournament.round.length) {
    return (
      <Redirect
        to={`/tournament/${tournament?.tournamentUrl}/rounds/${
          tournament?.round[tournament.round.length - 1].roundNumber
        }`}
      />
    )
  }

  const [
    advanceRound,
    { loading: loadingAdvanceRound, error: errorAdvanceRound },
  ] = useMutation(ADVANCE_ROUND, {
    onCompleted: (data) => {
      const newRound =
        data.advanceRound?.round[data.advanceRound?.round?.length - 1]
          ?.roundNumber
      toast.success(`Tournament has advanced to round ${newRound}`)
      navigate(`/tournament/${tournament?.tournamentUrl}/rounds/${newRound}`)
    },
    refetchQueries: [
      {
        query: TOURNAMENT_BY_URL,
        variables: { url: tournament.tournamentUrl },
      },
    ],
  })

  const [
    endTournament,
    { loading: loadingEndTournament, error: errorEndTournament },
  ] = useMutation(END_TOURNAMENT, {
    onCompleted: (data) => {
      toast.success(`Tournament has ended!`)
      navigate(`/tournament/${tournament?.tournamentUrl}/leaderboard`)
    },
    refetchQueries: [
      {
        query: TOURNAMENT_BY_URL,
        variables: { url: tournament.tournamentUrl },
      },
    ],
  })

  if (!tournament.dateStarted) {
    return <TournamentNotStarted tournament={tournament} />
  }

  const grabRound = () => {
    let round = {}

    tournament.round.map((rnd) => {
      if (rnd.roundNumber === roundNumber) {
        round = { ...rnd }
      }
    })

    return round
  }

  const renderRound = () => {
    let round = grabRound()
    let matches = []

    if (round?.matches) {
      round.matches.map((match, index) => {
        matches.push(
          <MatchDetails match={match} index={index} tournament={tournament} />
        )
      })
    }

    return matches
  }

  const checkScoresSubmitted = () => {
    let round = grabRound()
    let scoresSubmitted = true

    round.matches.forEach((match) => {
      match.players.forEach((player) => {
        if (player.score !== 0 && !player.score >= 1 && !player.bye) {
          scoresSubmitted = false
        }
      })
    })

    return scoresSubmitted
  }

  return (
    <div className="w-full">
      <div className="flex sm:w-full border-b border-gray-500 overflow-x-auto">
        {tournament.round?.map((round) => {
          return (
            <div
              key={round.id}
              onClick={() =>
                navigate(
                  `/tournament/${tournament?.tournamentUrl}/rounds/${round.roundNumber}`
                )
              }
              className={
                'py-4 px-8 border-gray-100 cursor-pointer hover:bg-gray-100 sm:hover:bg-blue-500 text-gray-900 text-sm w-36 text-center sm:w-auto' +
                (round.roundNumber === roundNumber ? ' bg-gray-200' : '')
              }
            >
              Round {round.roundNumber}
            </div>
          )
        })}
      </div>
      <div className="w-full overflow-x-auto">
        <div className="grid grid-cols-12 gap-y-4 my-4 w-max sm:w-full">
          <div className="text-gray-500 text-xs bg-gray-200 col-span-12 grid grid-cols-12 px-2">
            <div className="py-4 col-span-1 text-center">Match #</div>
            <div className="py-4 col-span-11 text-center">Result</div>
          </div>
          {renderRound()}
        </div>
      </div>

      {tournament.round.length === grabRound().roundNumber &&
        checkScoresSubmitted() &&
        checkTournamentPermissions({ hasRole, currentUser, tournament }) &&
        !tournament.dateEnded && (
          <div className="grid w-full grid-cols-2 gap-4">
            <button
              disabled={
                !checkScoresSubmitted() ||
                loadingAdvanceRound ||
                loadingEndTournament
              }
              onClick={() =>
                endTournament({ variables: { id: tournament.id } })
              }
              className="uppercase my-8 w-full justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-grredeen-400 disabled:bg-red-400n"
            >
              End Tournament
            </button>
            <button
              disabled={
                !checkScoresSubmitted() ||
                loadingAdvanceRound ||
                loadingEndTournament
              }
              onClick={() => {
                advanceRound({
                  variables: {
                    id: tournament.id,
                    roundNumber: grabRound().roundNumber + 1,
                  },
                })
              }}
              className="uppercase my-8 w-full justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-400 disabled:bg-red-400n"
            >
              Advance to next round
            </button>
          </div>
        )}
    </div>
  )
}

export default TournamentRoundsTab