import React, { Component} from 'react';
import {connect} from 'react-redux';
import { HashRouter as Router, Route, NavLink, browserHistory, hashHistory, Redirect } from 'react-router-dom';
import {hot} from 'react-hot-loader';

import Base from './pages/Base.jsx';
import Home from './pages/Home.jsx';
import Files from './pages/Files.jsx';
import Applications from './pages/Applications.jsx';
import Schedule from './pages/Schedule.jsx';

import './App.css';

class App extends Component{
  constructor(props){
    super();
    console.log("App Component", props);
    this.dash = props.dashboard;
  }

  render(){
    return(
    	<Router history={browserHistory} basename='/'>
    		<Base>
    			<Route path='/' exact render={()=><Home dash={this.dash}></Home>}/>
                <Route path='/files' render={()=><Files dash={this.dash}></Files>}/>
    			<Route path='/applications' render={()=><Applications dash={this.dash}></Applications>}/>
                <Route path='/schedule' render={()=><Schedule></Schedule>}/>
    		</Base>
    	</Router>
    );
  }
}

const mapStateToProps = (state)=>{
	return {
		sample: state.sample
	}
}
const mapDispatchToProps = (dispatch)=>{
	return {

	}
}

export default hot(module)(connect(mapStateToProps, mapDispatchToProps)(App));
