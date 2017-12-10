import React from 'react';
import Store from '../../store';
//import {} from '../../actions/actionCreators';

class Overview extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  componentDidMount() {
  }

  componentWillMount() {
  }

  render() {
    return (
      <div className="col-md-12">
         <div className="panel panel-default">
            <div className="panel-heading"><strong>Latest Transactions</strong></div>
            <div id="recent-table_wrapper" className="dataTables_wrapper form-inline dt-bootstrap no-footer">
               <div className="row">
                  <div className="col-xs-6">
                     <div className="dataTables_length" id="recent-table_length">
                        <label>
                           Show
                           <select name="recent-table_length" className="form-control input-sm">
                              <option value="10">10</option>
                              <option value="25">25</option>
                              <option value="50">50</option>
                              <option value="100">100</option>
                           </select>
                           entries
                        </label>
                     </div>
                  </div>
                  <div className="col-xs-6"></div>
               </div>
               <table id="recent-table" className="table table-bordered table-striped dataTable no-footer dtr-inline" role="grid" style={{ width: '963px' }}>
                  <thead>
                     <tr role="row">
                        <th className="text-center sorting_disabled" rowspan="1" colspan="1" style={{ width: '39px' }}>Block</th>
                        <th className="hidden-xs text-center sorting_disabled" rowspan="1" colspan="1" style={{ width: '462px' }}>Hash</th>
                        <th className="hidden-xs text-center sorting_disabled" rowspan="1" colspan="1" style={{ width: '71px' }}>Recipients</th>
                        <th className="text-center sorting_disabled" rowspan="1" colspan="1" style={{ width: '102px' }}>Amount (KMD)</th>
                        <th className="text-center sorting_disabled" rowspan="1" colspan="1" style={{ width: '103px' }}>Timestamp</th>
                     </tr>
                  </thead>
                  <tbody className="text-center">
                     <tr role="row" className="odd">
                        <td><a href="/block/017481bbbdd21088c84cbb95ada45777df07b82cb2e856dd7550b9ba36e38a81">614847</a></td>
                        <td><a href="/tx/92183f8d9e2fcf29d944b68cb11646f754f3bc8fccd0d82968ed7502f2fe7d06">92183f8d9e2fcf29d944b68cb11646f754f3bc8fccd0d82968ed7502f2fe7d06</a></td>
                        <td>3</td>
                        <td>5.65064277</td>
                        <td>Sat, 09 Dec 2017 15:48:55 GMT</td>
                     </tr>
                     <tr role="row" className="even">
                        <td><a href="/block/017481bbbdd21088c84cbb95ada45777df07b82cb2e856dd7550b9ba36e38a81">614847</a></td>
                        <td><a href="/tx/353038496e2f954883714c4737b6a2a11752b3c8a5e1f33d97b11c460dc97928">353038496e2f954883714c4737b6a2a11752b3c8a5e1f33d97b11c460dc97928</a></td>
                        <td>3</td>
                        <td>2.99995000</td>
                        <td>Sat, 09 Dec 2017 15:48:55 GMT</td>
                     </tr>
                     <tr role="row" className="odd">
                        <td><a href="/block/017481bbbdd21088c84cbb95ada45777df07b82cb2e856dd7550b9ba36e38a81">614847</a></td>
                        <td><a href="/tx/65b51354a521ad82b34b3f13e383e4af7e17229f39ff39c6fc6ff9195439e41c">65b51354a521ad82b34b3f13e383e4af7e17229f39ff39c6fc6ff9195439e41c</a></td>
                        <td>1</td>
                        <td>3.00010000</td>
                        <td>Sat, 09 Dec 2017 15:48:55 GMT</td>
                     </tr>
                     <tr role="row" className="even">
                        <td><a href="/block/040d0e2c8bc4e363a594005df212db5dacb8cfa8730267a2b760e6d9bec85f44">614846</a></td>
                        <td><a href="/tx/c9706e72eaaecbf675e8660f715f3174959fd18a04c29da48c6174b76210dda3">c9706e72eaaecbf675e8660f715f3174959fd18a04c29da48c6174b76210dda3</a></td>
                        <td>1</td>
                        <td>2.89824194</td>
                        <td>Sat, 09 Dec 2017 15:46:54 GMT</td>
                     </tr>
                     <tr role="row" className="odd">
                        <td><a href="/block/040d0e2c8bc4e363a594005df212db5dacb8cfa8730267a2b760e6d9bec85f44">614846</a></td>
                        <td><a href="/tx/63ab7dd8bb5e366f4a2bb83c217a08ac2d89ca1b38bc1603876fc24af34fd7dc">63ab7dd8bb5e366f4a2bb83c217a08ac2d89ca1b38bc1603876fc24af34fd7dc</a></td>
                        <td>2</td>
                        <td>10.00783353</td>
                        <td>Sat, 09 Dec 2017 15:46:54 GMT</td>
                     </tr>
                     <tr role="row" className="even">
                        <td><a href="/block/040d0e2c8bc4e363a594005df212db5dacb8cfa8730267a2b760e6d9bec85f44">614846</a></td>
                        <td><a href="/tx/cc4697aae38dce9ac1ee2af98c7e4848c54b7974ec9fc98ba52a6e197155a63c">cc4697aae38dce9ac1ee2af98c7e4848c54b7974ec9fc98ba52a6e197155a63c</a></td>
                        <td>1</td>
                        <td>3.00014520</td>
                        <td>Sat, 09 Dec 2017 15:46:54 GMT</td>
                     </tr>
                     <tr role="row" className="odd">
                        <td><a href="/block/01861f13c8b9219a0c2015af1c9e6cd148846105bb34c82919e9cb58d09d58e9">614845</a></td>
                        <td><a href="/tx/4d21896e0d730422bbb6ba12352fa2d13bbb8c4f5128fed1f008eabdc37673ae">4d21896e0d730422bbb6ba12352fa2d13bbb8c4f5128fed1f008eabdc37673ae</a></td>
                        <td>1</td>
                        <td>2.57622617</td>
                        <td>Sat, 09 Dec 2017 15:45:49 GMT</td>
                     </tr>
                     <tr role="row" className="even">
                        <td><a href="/block/01861f13c8b9219a0c2015af1c9e6cd148846105bb34c82919e9cb58d09d58e9">614845</a></td>
                        <td><a href="/tx/be43fa26ce9b82fa39397a48eb0714707828dd1f8f60e223e07f307311024bc9">be43fa26ce9b82fa39397a48eb0714707828dd1f8f60e223e07f307311024bc9</a></td>
                        <td>2</td>
                        <td>3.99970000</td>
                        <td>Sat, 09 Dec 2017 15:45:49 GMT</td>
                     </tr>
                     <tr role="row" className="odd">
                        <td><a href="/block/01861f13c8b9219a0c2015af1c9e6cd148846105bb34c82919e9cb58d09d58e9">614845</a></td>
                        <td><a href="/tx/2b67cc3f47b113e22ac2e816fefeca567288da126ebf6b90a0831ba5c9b9240c">2b67cc3f47b113e22ac2e816fefeca567288da126ebf6b90a0831ba5c9b9240c</a></td>
                        <td>1</td>
                        <td>3.00020000</td>
                        <td>Sat, 09 Dec 2017 15:45:49 GMT</td>
                     </tr>
                     <tr role="row" className="even">
                        <td><a href="/block/006f9f5c94e3d8d16de6e8b6f0b48e4a4050da76c2e93314d570047cc1ad9c4c">614844</a></td>
                        <td><a href="/tx/b4fad5429c8b4622cab071a22a8477e759b454725e3eb3625c86e9ca67cc0de7">b4fad5429c8b4622cab071a22a8477e759b454725e3eb3625c86e9ca67cc0de7</a></td>
                        <td>1</td>
                        <td>0.00494000</td>
                        <td>Sat, 09 Dec 2017 15:44:47 GMT</td>
                     </tr>
                  </tbody>
               </table>
               <div className="row">
                  <div className="col-xs-6">
                     <div className="dataTables_info" id="recent-table_info" role="status" aria-live="polite">Showing 1 to 10 of 1,000 entries</div>
                  </div>
                  <div className="col-xs-6">
                     <div className="dataTables_paginate paging_simple_numbers" id="recent-table_paginate">
                        <ul className="pagination">
                           <li className="paginate_button previous disabled" tabIndex="0" id="recent-table_previous"><a href="#">Previous</a></li>
                           <li className="paginate_button active" tabIndex="0"><a href="#">1</a></li>
                           <li className="paginate_button " tabIndex="0"><a href="#">2</a></li>
                           <li className="paginate_button " tabIndex="0"><a href="#">3</a></li>
                           <li className="paginate_button " tabIndex="0"><a href="#">4</a></li>
                           <li className="paginate_button " tabIndex="0"><a href="#">5</a></li>
                           <li className="paginate_button disabled" tabIndex="0" id="recent-table_ellipsis"><a href="#">…</a></li>
                           <li className="paginate_button " tabIndex="0"><a href="#">100</a></li>
                           <li className="paginate_button next" tabIndex="0" id="recent-table_next"><a href="#">Next</a></li>
                        </ul>
                     </div>
                  </div>
               </div>
            </div>
         </div>
         <div className="footer-padding"></div>
      </div>
    );
  }
}

export default Overview;