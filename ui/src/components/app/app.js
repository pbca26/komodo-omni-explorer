import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import * as actionCreators from '../../actions/actionCreators';
import Main from '../main/main';

function mapStateToProps(state, ownProps) {
  return {
    Main: state.root.Main,
    path: ownProps.location.pathname,
    input: ownProps.params.input,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(actionCreators, dispatch);
}

const App = withRouter(connect(mapStateToProps, mapDispatchToProps)(Main));

export default App;
