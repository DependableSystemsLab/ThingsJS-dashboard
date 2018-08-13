import React from 'react';
import {NavLink, Prompt} from 'react-router-dom';
import {Image, Navbar, Nav, NavItem, NavDropdown, MenuItem, Grid, Row, Col} from 'react-bootstrap';

import EceLogo from '../assets/logo/ecelogo.png';

export default class Base extends React.Component {
	constructor(props){
		super()
		console.log(this.context);
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
				      <NavItem eventKey={1} href="/docs">
				        <i className="fa fa-book"></i> API Docs
				      </NavItem>
				      <NavItem eventKey={2} href="https://github.com/karthikp-ubc/ThingsJS">
				        <i className="fa fa-github"></i> Source
				      </NavItem>
				    </Nav>
				  </Navbar.Collapse>
				</Navbar>
				
				<Grid fluid>
					<Row>
						<Col xs={12} sm={3} md={2}>
					  	  <Nav bsStyle="pills" stacked activeHref="/#/" onSelect={()=>{}}>
						    <NavItem eventKey={1} href="/#/">
						      Home
						    </NavItem>
						    <NavItem eventKey={2} href="/#/schedule" title="Schedule">
						      Schedule
						    </NavItem>
						    <NavItem eventKey={3} href="/#/applications" title="Applications">
						      Applications
						    </NavItem>
						    <NavItem eventKey={4} href="/#/files" title="Files">
						      Files
						    </NavItem>
						  </Nav>
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