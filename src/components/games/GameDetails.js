import React, {PureComponent} from 'react'
import {connect} from 'react-redux'
import {Redirect} from 'react-router-dom'
import {getGames, joinGame, updateGame} from '../../actions/games'
import {getUsers} from '../../actions/users'
import {userId} from '../../jwt'
import Paper from 'material-ui/Paper'
import Board from './Board'
import './GameDetails.css'

class GameDetails extends PureComponent {

  componentWillMount() {
    if (this.props.authenticated) {
      if (this.props.game === null) this.props.getGames()
      if (this.props.users === null) this.props.getUsers()
    }
  }

  joinGame = () => this.props.joinGame(this.props.game.id)

  makeMove = (toRow, toCell) => {
    // console.log(toRow, toCell)
    const {game, updateGame} = this.props
    // console.log(game.board)
    let newRow = toRow
    const board = game.board.map((row, rowIndex) => row.map((cell, cellIndex) => {
      if (rowIndex === toRow && cellIndex === toCell) {
        // console.log('I am a new row', newRow)
        // console.log('I am a new row+1', newRow+1)
        // console.log('I am newcell in a newRow on a board', game.board[newRow][toCell])
        // // console.log('I am the cell below the changed cell', game.board[newRow+1][toCell])
        // console.log(game.board[newRow+1] !== undefined && game.board[newRow+1][toCell] !== null && newRow+1 < 7);

        const nextRowExists = game.board[newRow+1] !== undefined
        // console.log(nextRowExists, 'next row exists');
        let cellBelowNotEmpty;
        if (nextRowExists) {
          cellBelowNotEmpty = game.board[newRow+1][toCell] !== null
        }
        // console.log(cellBelowNotEmpty);
        // console.log(!nextRowExists || cellBelowNotEmpty, 'end turn?')
        
        // const isBottomRow = newRow+1 < 7
        
        if (!nextRowExists || cellBelowNotEmpty) {

        // if (game.board[1+newRow][toCell] !== null) {
          // console.log('hi?');
          
          return game.turn
        }
        else this.makeMove(newRow+1, toCell)
      }
        // if (rowIndex === newRow && cellIndex === toCell && newRow + 1 !== null) return game.turn
        // if (rowIndex === newRow && cellIndex ==== toCell && newRow + 1 === null) return makeMove(newRow+1, toCell)
        // originalCode: if (rowIndex === toRow && cellIndex === toCell) return game.turn
        else return cell
      })
    )
    updateGame(game.id, board)
  }



  render() {
    const {game, users, authenticated, userId} = this.props

    if (!authenticated) return (
			<Redirect to="/login" />
		)

    if (game === null || users === null) return 'Loading...'
    if (!game) return 'Not found'

    const player = game.players.find(p => p.userId === userId)

    const winner = game.players
      .filter(p => p.symbol === game.winner)
      .map(p => p.userId)[0]

    return (<Paper className="outer-paper">
      <h1>Game #{game.id}</h1>

      <p>Status: {game.status}</p>

      {
        game.status === 'started' &&
        player && player.symbol === game.turn &&
        <div>It's your turn!</div>
      }

      {
        game.status === 'pending' &&
        game.players.map(p => p.userId).indexOf(userId) === -1 &&
        <button onClick={this.joinGame}>Join Game</button>
      }

      {
        winner &&
        <p>Winner: {users[winner].firstName}</p>
      }

      <hr />

      {
        game.status !== 'pending' &&
        <Board board={game.board} makeMove={this.makeMove} />
      }
    </Paper>)
  }
}

const mapStateToProps = (state, props) => ({
  authenticated: state.currentUser !== null,
  userId: state.currentUser && userId(state.currentUser.jwt),
  game: state.games && state.games[props.match.params.id],
  users: state.users
})

const mapDispatchToProps = {
  getGames, getUsers, joinGame, updateGame
}

export default connect(mapStateToProps, mapDispatchToProps)(GameDetails)
