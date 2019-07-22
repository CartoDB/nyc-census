import React from 'react';
import { Component } from 'react';
import { connect } from 'react-redux';
import HeaderToggle from './header/HeaderToggle'
import HeaderLink from './header/HeaderLink'
import Avatar from './Avatar'

class Header extends Component {

  constructor(props) {
    super(props);
      this.state = {
        ...props
      }

  }

  render() {
    return(
      <header className="as-toolbar">
        <HeaderToggle />
      <div className="as-toolbar__group">
      <div className="as-toolbar__item">
        <img src="https://www1.nyc.gov/assets/census/images/content/header/logo.png" style={{width: "88px"}} alt="CARTO" />
      </div>
        <nav className="as-toolbar__actions">
          <ul>
            <HeaderLink name='Census 2020 Home' link='/' />
            <HeaderLink name='FAQ' link='/' />
            <HeaderLink name="What's At Stake?" link='/' />
            <HeaderLink name="Get Involved" link='/' />
          </ul>
        </nav>
      </div>

      <div className="as-toolbar__item as-body">
        <i className="as-icon-settings as-subheader as-m--0"></i>
      </div>

    </header>
    );
  }
}


const mapStateToProps = state => ({
  client: state.client,
  map: state.map,
  layers: state.layers,
  viewport: state.viewport,
  boundingbox: state.boundingbox
});

const mapDispatchToProps = dispatch => ({
  setNeighbourhoods: selected => dispatch(setNeighbourhoods(selected)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Header);
