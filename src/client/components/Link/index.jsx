import React from 'react';
import styles from './styles.css';

export default class Link extends React.Component {
	link (url){
		open(url);
	}

	render(){
		return (
			<a href="#" onClick={ ()=>{this.link(this.props.to)} } className={styles.link}>
				{this.props.children}
			</a>
		)
	}
}