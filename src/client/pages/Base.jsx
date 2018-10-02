import React from 'react';
import {Route, Link, NavLink, Prompt} from 'react-router-dom';
import {Image, Navbar, Nav, NavItem, NavDropdown, MenuItem, Grid, Row, Col} from 'react-bootstrap';

import EceLogo from '../assets/logo/ecelogo.png';

function NavListItem (props){
	return (
		<Route path={props.to} exact={props.exact} children={(route)=>(
			<li className={route.match ? props.activeClassName : ''}>
		  	  <Link to={props.to}>{props.children}</Link>
		  	</li>
		)}/>
	)
}

export default class Base extends React.Component {
	constructor(props, context){
		super()
		console.log('Base Component Created', context);
	}
	render(){
		return (
			<div>
				<Navbar fluid inverse staticTop collapseOnSelect>
				  <Navbar.Header>
				    <Navbar.Brand>
				      <a href="/#/">
				      	<Image width={30} height={30} src={EceLogo}/>
				      </a>
				    </Navbar.Brand>
				    <Navbar.Brand>
				      <a href="/#/">ThingsJS</a>
				    </Navbar.Brand>
				    <Navbar.Toggle />
				  </Navbar.Header>
				  <Navbar.Collapse>
				    <Nav pullRight>
				      <NavItem eventKey={1} href="https://dependablesystemslab.github.io/ThingsJS">
				        <i className="fa fa-book"></i> API Docs
				      </NavItem>
				      <NavItem eventKey={2} href="https://github.com/DependableSystemsLab/ThingsJS">
				        <i className="fab fa-github"></i> Source
				      </NavItem>
				    </Nav>
				  </Navbar.Collapse>
				</Navbar>
				
				<Grid fluid>
					<Row>
						<Col xs={12} sm={3} md={2}>
						  <ul className="nav nav-pills nav-stacked">
						  	<NavListItem to="/" activeClassName="active" exact>
							  Home
							</NavListItem>
						  	<NavListItem to="/schedule" activeClassName="active">
							  Schedule
							</NavListItem>
							<NavListItem to="/applications" activeClassName="active">
							  Applications
							</NavListItem>
							<NavListItem to="/files" activeClassName="active">
							  Files
							</NavListItem>
						  </ul>

					  	</Col>
					  	<Col xs={12} sm={9} md={10}>
					  	  {this.props.children}
					  	</Col>
					</Row>
				</Grid>
				<Grid fluid>
					<Row>
						<Col xs={12} md={4}>
						</Col>
						<Col xs={12} md={4}>
						</Col>
						<Col xs={12} md={4}>
							<p className="text-right">University of British Columbia</p>
							<p className="text-right">Electrical and Computer Engineering</p>
						</Col>
					</Row>
				</Grid>
			</div>
		)
	}
}