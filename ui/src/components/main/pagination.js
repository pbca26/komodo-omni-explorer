import React, { Component } from 'react';
import PaginationRender from './pagination.render';

export default class TablePaginationRenderer extends Component {
  constructor(props) {
    super();
    this.state = {
      page: props.page,
    };
    this.getSafePage = this.getSafePage.bind(this);
    this.changePage = this.changePage.bind(this);
    this.applyPage = this.applyPage.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      page: nextProps.page,
    });
  }

  getSafePage(page) {
    if (isNaN(page)) {
      page = this.props.page;
    }

    return Math.min(Math.max(page, 0), this.props.pages - 1);
  }

  changePage(page) {
    page = this.getSafePage(page);
    this.setState({
      page,
    });

    if (this.props.page !== page) {
      this.props.onPageChange(page);
    }
  }

  applyPage(e) {
    const page = this.state.page;

    e && e.preventDefault();
    this.changePage(page === '' ? this.props.page : page);
  }

  renderPageNav(pageSizeOptions) {
    let _items = [];

    for (let i = 0; i < pageSizeOptions.length; i++) {
      _items.push(
        <option
          key={ i }
          value={ pageSizeOptions[i] }>
          { pageSizeOptions[i] } { this.props.rowsText }
        </option>
      );
    }

    return _items;
  }

  render() {
    return PaginationRender.call(this);
  }
}