import React from 'react';
import {
  Link,
  IndexLink,
  browserHistory,
  hashHistory,
} from 'react-router';

class Navigation extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showNavigation: false,
    };
  }

  componentWillMount() {
    browserHistory.listen(location => {
      // hide navigation in mobile when changing route
      this.setState({
        showNavigation: false,
      });
    });
  }

  toggleNavigation() {
    this.setState({
      showNavigation: !this.state.showNavigation,
    });
  }

  render() {
      return (
        <div
          role="navigation"
          className="nav navbar navbar-default navbar-fixed-top">
          <div className="container-fluid">
            <div className="navbar-header">
              <button
                type="button"
                className="navbar-toggle"
                onClick={ ()=> this.toggleNavigation() }>
                <span className="sr-only">Toggle navigation</span>
                <span className="icon-bar"></span>
                <span className="icon-bar"></span>
                <span className="icon-bar"></span>
              </button>
              <IndexLink
                to="/"
                className="navbar-brand">
                Atomic Explorer
              </IndexLink>
            </div>
            <div
              id="navbar-collapse"
              className={ !this.state.showNavigation ? 'collapse navbar-collapse' : 'navbar-collapse' }>
              <ul className="nav navbar-nav">
                <li>
                  <IndexLink
                    to="/"
                    className="navbar-link pointer"
                    activeClassName="active">
                    <span className="fa fa-search"></span>
                    <span className="menu-text">Explorer</span>
                  </IndexLink>
                </li>
                <li>
                  <Link
                    to="/interest"
                    className="navbar-link pointer"
                    activeClassName="active">
                    <span className="fa fa-money"></span>
                    <span className="menu-text">KMD Interest</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/interest-calc"
                    className="navbar-link pointer"
                    activeClassName="active">
                    <span className="fa fa-calculator"></span>
                    <span className="menu-text">Interest Calc</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/summary"
                    className="navbar-link pointer"
                    activeClassName="active">
                    <span className="fa fa-share-alt"></span>
                    <span className="menu-text">Explorers list</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to='/prices'
                    className="navbar-link pointer"
                    activeClassName="active">
                    <span className="fa fa-usd"></span>
                    <span className="menu-text">DEX prices</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/books"
                    className="navbar-link pointer"
                    activeClassName="active">
                    <span className="fa fa-line-chart"></span>
                    <span className="menu-text">DEX books</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/charts"
                    className="navbar-link pointer"
                    activeClassName="active">
                    <span className="fa fa-area-chart"></span>
                    <span className="menu-text">DEX charts</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/coins"
                    className="navbar-link pointer"
                    activeClassName="active">
                    <span className="fa fa-th"></span>
                    <span className="menu-text">DEX coins</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/trades"
                    className="navbar-link pointer"
                    activeClassName="active">
                    <span className="fa fa-list-alt"></span>
                    <span className="menu-text">DEX trades</span>
                  </Link>
                </li>
                <li>
                  <a
                    href="https://github.com/pbca26/komodo-omni-explorer"
                    className="navbar-link"
                    target="_blank">
                    <span className="fa fa-info-circle"></span>
                    <span className="menu-text">API</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      );
    }
}

export default Navigation;