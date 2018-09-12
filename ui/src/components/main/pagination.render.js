import React from 'react';
import classnames from 'classnames';

const defaultButton = props =>
  <button
    type="button"
    className="-btn"
    { ...props }>
    { props.children }
  </button>

const PaginationRender = function() {
  const {
    // Computed
    pages,
    // Props
    page,
    showPageSizeOptions,
    pageSizeOptions,
    pageSize,
    showPageJump,
    canPrevious,
    canNext,
    onPageSizeChange,
    className,
    PreviousComponent = defaultButton,
    NextComponent = defaultButton,
  } = this.props;

  return (
    <div
      className={ classnames(className, '-pagination') }
      style={ this.props.paginationStyle }>
      <div className="-previous">
        <PreviousComponent
          onClick={
            e => {
              if (!canPrevious) return;
              this.changePage(page - 1);
            }
          }
          disabled={ !canPrevious }>
          { this.props.previousText }
        </PreviousComponent>
      </div>
      <div className="-center">
        <span className="-pageInfo">
          { this.props.pageText }{ ' ' }
          { showPageJump
            ?
            <div className="-pageJump">
              <input
                type={ this.state.page === '' ? 'text' : 'number' }
                onChange={
                  e => {
                    const val = e.target.value;
                    this.changePage(val - 1);
                  }
                }
                value={ this.state.page === '' ? '' : this.state.page + 1 }
                onBlur={ this.applyPage }
                onKeyPress={
                  e => {
                    if (e.which === 13 ||
                        e.keyCode === 13) {
                      this.applyPage();
                    }
                  }
                } />
            </div>
            :
            <span className="-currentPage">
              { page + 1 }
            </span>
          }{ ' ' }
          { this.props.ofText }{ ' ' }
          <span className="-totalPages">{ pages || 1 }</span>
        </span>
        { showPageSizeOptions &&
          <span className="select-wrap -pageSizeOptions">
            <select
              onChange={ e => onPageSizeChange(Number(e.target.value)) }
              value={ pageSize }>
              { this.renderPageNav(pageSizeOptions) }
            </select>
          </span>
        }
      </div>
      <div className="-next">
        <NextComponent
          onClick={
            e => {
              if (!canNext) return;
              this.changePage(page + 1);
            }
          }
          disabled={ !canNext }>
          { this.props.nextText }
        </NextComponent>
      </div>
    </div>
  )
};

export default PaginationRender;