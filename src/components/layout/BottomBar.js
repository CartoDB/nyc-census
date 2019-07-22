import React, { Component } from 'react';
import { render } from 'react-dom';
import { connect } from 'react-redux';
import { setNeighbourhoods } from '../../actions/actions';
import carto, { filter, source, style, layer  } from '@carto/carto.js';
import '@carto/airship-style';
import Formula from '../widgets/Formula'
import axios from 'axios';

import C from '../../data/C'


const { SQL_API_URL, API_KEY, USERNAME } = C;

const SQL_CLIENT = axios.create({
        method: 'get',
        url: SQL_API_URL,
        params: {
            api_key: 'b93d8a3b37e53fc20361c5ce5369b2c7b594bd44'
        }
    });

class BottomBar extends Component {

  constructor(props) {
    super(props);
      this.state = {
        ...props
      }
    this.getDataFromGeocode = this.getDataFromGeocode.bind(this);
    this.addressChange = this.addressChange.bind(this);
    // this.onSubmit = this.onSubmit.bind(this);
  }

  

  state = {
    size: null,
    running: false,
    address: null,
    point: null,
    name: null,
    value: '',
    data: null,
    clickData: null,
    id: null
  };

  addressChange(e) {
    this.setState({ address: e.target.value })
  }

  onSubmit = (e) => {
    e.preventDefault();
    this.setState({ running: true })

    const { address, name } = this.state;

    const query = `WITH a AS (SELECT (cdb_geocode_street_point('${address}', 'USA')).geometry as the_geom)
    SELECT ST_X(the_geom), ST_Y(the_geom) FROM a`

    SQL_CLIENT.request({
        params: {
            q: query
        },
    })
    .then((result) => {
      console.log(result)
      this.props.map.flyTo([result.data.rows[0].st_y, result.data.rows[0].st_x], 16);
      this.setState({ point: `POINT(${result.data.rows[0].st_x} ${result.data.rows[0].st_y})` })
      this.setState({ id: result.data.rows[0].cartodb_id})
      this.setState({ running: false })
      this.getDataFromGeocode()
    })
    .catch((error) => {
      console.log(query)
      this.setState({ running: false })
    })

  }

  // set data as a state and overwrite if it is a click or a query

  getDataFromGeocode() {
    const query = `SELECT * FROM zip_code_040114 z WHERE
    ST_Intersects(z.the_geom, ST_SetSRID('${this.state.point}'::geometry, 4326))`

    console.log(this.state.point)

    SQL_CLIENT.request({
        params: {
            q: query
        },
    })
    .then((result) => {
      console.log(result)
      this.setState({ data: result.data.rows[0] })
      console.log(this.state.data)
    })
    .catch((error) => {
      console.log(query)
    })
  }

  
   

  render() {

    const background = `as-map-footer ${this.props.background}`
    const { running } = this.state;

    this.props.layers.railaccidents.layer.on('featureClicked', e => {
      this.setState({ data: e.data })
      console.log(e.data)
    });

    let censusData


    if (!this.state.data) {
      censusData = null
    } else {
      const { county, po_name, population, zipcode } = this.state.data

      censusData = <div className="as-p--16">
      <h2 className="as-display"><b>Postal Code: </b>{zipcode}</h2>
      <h4 className="as-subheader as-font--medium">{po_name}</h4>
      <h4 className="as-subheader as-font--medium">{county} County</h4>
      <h4 className="as-subheader as-font--medium">{population.toLocaleString('en-US')} Population (2010)</h4>
      <br />
      <a href="https://www1.nyc.gov/site/census/get-involved/join-the-get-counted-team.page" target="_blank" className="as-btn as-btn--primary as-btn--l">Get Involved Today!</a>
      </div>
    }

    let participationData
    if (!this.state.data) {
      participationData = null
    } else {
      const { participation, zipcode, borough_participation, county } = this.state.data
      let color
      if (borough_participation > participation) {
        color = 'as-display as-color--error'
      } else {
        color = 'as-display as-color--success'
      }
      const subCounty = participation - borough_participation
      const subCity = 75.5 - borough_participation

      if (borough_participation > participation) {
        color = 'as-display as-color--error'
      } else {
        color = 'as-display as-color--success'
      }

      participationData = <div className="as-p--16">
      <h2 className={color}><b>{participation}%</b> Participation in {zipcode}</h2>
      <h3 className="as-title">{borough_participation.toLocaleString('en-US', {maximumFractionDigits: 2})}% Participation in {county}</h3>
      <p className="as-body as-font--medium">{subCounty.toLocaleString('en-US', {maximumFractionDigits: 2})}% Difference</p>
      <h3 className="as-title">75.5% Participation in New York City </h3>
      <p className="as-body as-font--medium">{subCity.toLocaleString('en-US', {maximumFractionDigits: 2})}% Difference</p>


      </div>
    }
  

    return (
      <footer className={background} data-name={this.props.name}>
          <div className="as-box as-box--border">
          <div className="as-p--16">
          <h4 className="as-subheader">Click on an area to see Census 2020 Statistics in that area or enter an address below to move the map</h4>
            <form onSubmit={this.onSubmit}>
              <p>
                <span className="as-caption">Address</span>
                <input className="as-input" type="text" placeholder="123 Main Street, New York, NY, 10001" onChange={this.addressChange}/>
              </p>
              <p>
                <button
                  type="submit"
                  className="as-btn as-btn--secondary">
                  {running === true ? <span className="as-loading as-loading--s"> <svg viewBox="0 0 50 50"> <circle cx="25" cy="25" r="20" fill="none" /> </svg> </span> : 'Submit'}
                </button>
              </p>
            </form>
          </div>
          </div>
          
          <div className="as-box as-box--border">
            {censusData}
          </div>
          <div className="as-box as-box--border">
            {participationData}
          </div>
      </footer>
    )
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

export default connect(mapStateToProps, mapDispatchToProps)(BottomBar);
