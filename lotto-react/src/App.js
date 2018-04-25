import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import web3 from './web3';
import lottery from './lottery';

class App extends Component {
  
  // initialises 5 different properties of state
  state = {
    manager: '',
    players: [],
    balance: '',
    value: '',
    message: ''
  };
  
  // as soon as the component gets rendered for the first time, this code runs, getting some 
  // properties and setting them on the state
  async componentDidMount() {
    const manager = await lottery.methods.manager().call();
    const players = await lottery.methods.getPlayers().call();
    const balance = await web3.eth.getBalance(lottery.options.address);
    
    this.setState({ manager, players, balance });
  } 
  
  // event handler for submitting ether
  onSubmit = async event => {
    event.preventDefault();
    // gets the active accounts
    const accounts = await web3.eth.getAccounts();
    // sets a waiting message
    this.setState({ message: 'Waiting on transaction success...' });
    // calls a function on the contract
    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei(this.state.value, 'ether')
    });
    
    this.setState({ message: 'You have been entered!' });
  };
  
  // event handler for clicking pick winner
  onClick = async () => {
    // gets active accounts
    const accounts = await web3.eth.getAccounts();
    // sets a waiting message
    this.setState({ message: 'Waiting on transaction success...' });
    // calls a function on the contract
    await lottery.methods.pickWinner().send({
      from: accounts[0]  
    });
    
    this.setState({ message: 'A winner has been picked!' });
  };
  
  // reads different properties from state and displays them on the screen
  render() {
    return (
      <div>
        <h2>Lottery Contract</h2>
        <p>
          This contract is managed by {this.state.manager}. 
          There are currently {this.state.players.length} people entered, 
          competing to win {web3.utils.fromWei(this.state.balance, 'ether')} ether!
        </p>
        
        <hr />
        
        <form onSubmit={this.onSubmit}>
          <h4>Want to try your luck?</h4>
          <div>
            <label>Amount of ether to enter</label>
            <input 
              value={this.state.value}
              onChange={event => this.setState({ value: event.target.value })}
            />
          </div>
          <button>Enter</button>
        </form>
        
        <hr />
        
        <h4>Ready to pick a winner?</h4>
        <button onClick={this.onClick}>Pick a winner!</button>
        
        <hr />  
        
        <h1>{this.state.message}</h1>
     
      </div>
    );
  }
}

export default App;
