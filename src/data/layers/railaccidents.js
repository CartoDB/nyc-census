export default {
  name: 'Census 2010 Participation: Postal Codes',

  visible: true,

  cartocss: `
  #layer {
    polygon-fill: ramp([participation], (#eff3ff, #c6dbef, #9ecae1, #6baed6, #4292c6, #2171b5, #084594), quantiles);
  }
  #layer::outline {
    line-width: 1;
    line-color: #FFFFFF;
    line-opacity: 0.5;
  }
  `,

  query: `
    SELECT * FROM zip_code_040114
  `,

  options: {
    featureClickColumns: ['zipcode', 'po_name', 'cartodb_id', 'population', 'county', 'participation', 'borough_participation']
  }
};
