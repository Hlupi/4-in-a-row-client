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
    const {game, updateGame} = this.props
    let newRow = toRow
    // this function takes the coordinates of the move made by the current player and 
    // returns if it's a valid move it returns a new board and passes the turn
    const board = game.board.map((row, rowIndex) => row.map((cell, cellIndex) => {
      // maps over the current board and current rows
      if (rowIndex === toRow && cellIndex === toCell) {
        // checks if the clicked cell is empty
        const nextRowExists = game.board[newRow+1] !== undefined
        let cellBelowNotEmpty;
        if (nextRowExists) {
          cellBelowNotEmpty = game.board[newRow+1][toCell] !== null
        }
        if (!nextRowExists || cellBelowNotEmpty) {
          // checks if the row beneath is full, if so returns the value and gameturn
          return game.turn
        }
        else this.makeMove(newRow+1, toCell)
          // if the row beneath is empty, this returns the function with an incremented row to 
          // imitate gravity
      }
        else return cell
        // if the clicked cell is full already, it just returns the cell
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

      <p>Status: <b>{game.status}</b></p>

      {
        game.status === 'started' &&
        player && player.symbol === game.turn &&
        <div className={`turn-${player.symbol}`}>It's your turn! You are </div>
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
        <div className="board">
        <Board board={game.board} makeMove={this.makeMove}/>
        </div>
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
